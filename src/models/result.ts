import { Schema, model } from "mongoose";

export interface ResultDocument {
  contributors: number;
  contribution: number;
}

const resultSchema = new Schema<ResultDocument>(
  {
    contributors: { type: Number, required: true },
    contribution: { type: Number, required: true },
  },
  { collection: "results" },
);

export const Result = model<ResultDocument>("Result", resultSchema);
