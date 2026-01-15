import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    // Deprecated: price and image are now derived from variants/images arrays
    // We keep them for backward compatibility or as defaults
    price: { type: Number, required: true },
    image: { type: String },

    description: String,

    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },

    // Multiple images
    images: [{ type: String }],

    // Variants for weight/size variability
    // If variants exist, the product price is usually the lowest variant price or a specific one
    variants: [
      {
        weight: { type: String, required: true },
        price: { type: Number, required: true },
        available: { type: Boolean, default: true },
      },
    ],

    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", schema);
