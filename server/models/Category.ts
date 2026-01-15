import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    icon: { type: String }, // URL or icon name
  },
  { timestamps: true }
);

export const Category = mongoose.model("Category", schema);
