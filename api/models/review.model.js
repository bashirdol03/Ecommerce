import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';
const { Schema } = mongoose;


const ReviewSchema = new Schema(
  {
    _id: {
      type: String,
      default: uuidv4
    },
    gigId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    star: {
      type: Number,
      required: true,
      enum:[1,2,3,4,5]
    },
    desc: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Review", ReviewSchema);
