import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';
const { Schema } = mongoose;

const GigSchema = new Schema(
  {
    _id: {
      type: String,
      default: uuidv4
    },
    userId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0
    },
    coverImage: {
      type: String,
      required: true,
      default: "https://www.bedfordcentre.com/plugins/noveldesign-store-directory/images/default-shop.jpg"
    },
    images: {
      type: [String],
      required: false,
    },
    shortTitle: {
      type: String,
      required: true,
      default: "no short tilte"
    },
    shortDesc: {
      type: String,
      required: true,
      default: "empty description"
    },
    deliveryTime: {
      type: Number,
      required: true,
      default: 5
    },
    revisionNumber: {
      type: Number,
      required: true,
      default: 3

    },
    features: {
      type: [String],
      required: false,
    },
    sales: {
      type: Number,
      default: 0,
    },
    totalStars: {
      type: Number,
      default: 0,
    },
    starNumber: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Gig", GigSchema);
