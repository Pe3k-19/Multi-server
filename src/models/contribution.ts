import { Schema, model } from "mongoose";

export interface ContributorDocument {
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
}

export interface ContributionDocument {
  shelter_id: number | null;
  value: number;
  contributors: ContributorDocument[];
  created_at: Date;
  updated_at: Date;
}

const contributorSchema = new Schema<ContributorDocument>(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: null },
  },
  { _id: false },
);

const contributionSchema = new Schema<ContributionDocument>(
  {
    shelter_id: { type: Number, default: null },
    value: { type: Number, required: true },
    contributors: { type: [contributorSchema], required: true },
  },
  {
    collection: "contributions",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

export const Contribution = model<ContributionDocument>(
  "Contribution",
  contributionSchema,
);
