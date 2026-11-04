import { Router } from "express";
import { Contribution } from "../models/contribution.js";
import { Result } from "../models/result.js";
import { ShelterCatalog } from "../models/shelter.js";

type ApiMessage = {
  type: "ERROR" | "SUCCESS";
  message: string;
  path?: string;
};

type ContributorInput = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const sheltersRouter = Router();

sheltersRouter.get("/results", async (_req, res) => {
  try {
    const results = await Result.findOne().lean();

    res.json({
      contributors: results?.contributors ?? 0,
      contribution: results?.contribution ?? 0,
    });
  } catch {
    res.status(500).json(errorBody("Something went wrong"));
  }
});

sheltersRouter.post("/contribute", async (req, res) => {
  try {
    const parsed = parseContribution(req.body);

    if (!parsed.ok) {
      res.status(400).json({ messages: parsed.messages });
      return;
    }

    if (parsed.shelterId !== null) {
      const catalog = await ShelterCatalog.findOne().lean();
      const shelterExists = catalog?.shelters.some(
        (shelter) => shelter.id === parsed.shelterId,
      );

      if (!shelterExists) {
        res.status(404).json({
          messages: [
            { type: "ERROR", message: "Útulok sa nenašiel", path: "" },
          ],
        });
        return;
      }
    }

    await Contribution.create({
      shelter_id: parsed.shelterId,
      value: parsed.value,
      contributors: parsed.contributors,
    });

    await Result.updateOne(
      {},
      {
        $inc: {
          contributors: 1,
          contribution: parsed.value,
        },
      },
      { upsert: true },
    );

    res.json({
      messages: [
        {
          type: "SUCCESS",
          message: "Príspevok bol úspešne zaznamenaný",
        },
      ],
    });
  } catch {
    res.status(500).json(errorBody("Something went wrong"));
  }
});

sheltersRouter.get("/shelters", async (req, res) => {
  try {
    const search = normalize(readSearch(req.query.search));
    const catalog = await ShelterCatalog.findOne().lean();
    const shelters = [...(catalog?.shelters ?? [])].sort(
      (left, right) => left.id - right.id,
    );
    const visible = search
      ? shelters.filter((shelter) => normalize(shelter.name).includes(search))
      : shelters;

    res.json({
      shelters: visible.map((shelter) => ({
        id: shelter.id,
        name: shelter.name,
      })),
    });
  } catch {
    res.status(500).json(errorBody("Something went wrong"));
  }
});

function readSearch(value: unknown): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" ? raw.trim() : "";
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

function errorBody(message: string): { messages: ApiMessage[] } {
  return { messages: [{ type: "ERROR", message }] };
}

function parseContribution(body: unknown):
  | {
      ok: true;
      contributors: ContributorInput[];
      shelterId: number | null;
      value: number;
    }
  | { ok: false; messages: ApiMessage[] } {
  const messages: ApiMessage[] = [];
  const record = isRecord(body) ? body : {};

  const contributors = parseContributors(record.contributors, messages);
  const value = parseValue(record.value, messages);
  const shelterId = parseShelterId(record.shelterID, messages);

  if (messages.length > 0 || !contributors || value === undefined || shelterId === undefined) {
    return { ok: false, messages };
  }

  return { ok: true, contributors, shelterId, value };
}

function parseContributors(
  value: unknown,
  messages: ApiMessage[],
): ContributorInput[] | undefined {
  if (!Array.isArray(value) || value.length === 0) {
    messages.push({
      type: "ERROR",
      message: "joi.body.contributors",
      path: "body.contributors",
    });
    return undefined;
  }

  const contributors: ContributorInput[] = [];

  value.forEach((item, index) => {
    if (!isRecord(item)) {
      messages.push({
        type: "ERROR",
        message: `joi.body.contributors.${index}`,
        path: `body.contributors.${index}`,
      });
      return;
    }

    const firstName = readRequiredString(
      item.firstName,
      `body.contributors.${index}.firstName`,
      messages,
    );
    const lastName = readRequiredString(
      item.lastName,
      `body.contributors.${index}.lastName`,
      messages,
    );
    const email = readEmail(item.email, `body.contributors.${index}.email`, messages);
    const phone = readPhone(item.phone, `body.contributors.${index}.phone`, messages);

    if (firstName && lastName && email && phone !== undefined) {
      contributors.push({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
      });
    }
  });

  return messages.length === 0 ? contributors : undefined;
}

function parseValue(value: unknown, messages: ApiMessage[]): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    messages.push({
      type: "ERROR",
      message: "joi.body.value",
      path: "body.value",
    });
    return undefined;
  }

  return value;
}

function parseShelterId(
  value: unknown,
  messages: ApiMessage[],
): number | null | undefined {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "number" || !Number.isFinite(value)) {
    messages.push({
      type: "ERROR",
      message: "joi.body.shelterID",
      path: "body.shelterID",
    });
    return undefined;
  }

  return value;
}

function readRequiredString(
  value: unknown,
  path: string,
  messages: ApiMessage[],
): string | undefined {
  if (typeof value !== "string" || value.trim().length === 0) {
    messages.push({
      type: "ERROR",
      message: `joi.${path}`,
      path,
    });
    return undefined;
  }

  return value.trim();
}

function readEmail(
  value: unknown,
  path: string,
  messages: ApiMessage[],
): string | undefined {
  if (typeof value !== "string" || !emailPattern.test(value.trim())) {
    messages.push({
      type: "ERROR",
      message: `joi.${path}`,
      path,
    });
    return undefined;
  }

  return value.trim();
}

function readPhone(
  value: unknown,
  path: string,
  messages: ApiMessage[],
): string | null | undefined {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    messages.push({
      type: "ERROR",
      message: `joi.${path}`,
      path,
    });
    return undefined;
  }

  const phone = value.trim();
  return phone.length === 0 ? null : phone;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
