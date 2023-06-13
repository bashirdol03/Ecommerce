import mongoose from "mongoose";

const connect = async (url) => {
    try {
      await mongoose.connect(url);
      console.log("Connected to mongoDB!");
    } catch (error) {
      console.log(error);
    }
  };

export default connect;