import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';
const { Schema } = mongoose;

const OrderSchema = new Schema(
  { 
    _id: {
    type: String,
    default: uuidv4
    },
    gigId: {
      type: String,
      required: true,
    },
    img: {
      type: String,
      required: false,
    },
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    sellerId: {
      type: String,
      required: true,
    },
    buyerId: {
      type: String,
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Order", OrderSchema);
