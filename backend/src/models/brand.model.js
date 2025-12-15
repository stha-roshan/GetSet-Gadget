import mongoose from "mongoose";
const { Schema } = mongoose;

const brandSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    description: {
      type: String,
      trim: true,
    },

    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Brand = mongoose.model("Brand", brandSchema)

export { Brand }
