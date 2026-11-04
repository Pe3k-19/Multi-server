import { Schema, model } from "mongoose";

export interface ShelterItem {
  id: number;
  name: string;
}

export interface ShelterCatalogDocument {
  shelters: ShelterItem[];
}

const shelterItemSchema = new Schema<ShelterItem>(
  {
    id: { type: Number, required: true },
    name: { type: String, required: true },
  },
  { _id: false },
);

const shelterCatalogSchema = new Schema<ShelterCatalogDocument>(
  {
    shelters: { type: [shelterItemSchema], required: true },
  },
  { collection: "shelters" },
);

export const ShelterCatalog = model<ShelterCatalogDocument>(
  "ShelterCatalog",
  shelterCatalogSchema,
);
