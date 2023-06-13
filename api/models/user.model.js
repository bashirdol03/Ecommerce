import mongoose from "mongoose";
import emailSchemaType from 'mongoose-type-email'
import {isValidPassword} from 'mongoose-custom-validators';
import { v4 as uuidv4 } from 'uuid';
import { roles } from "../utils/roles.js";

const { Schema } = mongoose;

// VALIDATING USER INPUT BE

const userSchema = new Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  username: {
    type: String,
    required: true,
    unique: false
  },
  password: {
    type: String,
    required: true,
    // VALIDATING USER INPUTTED PASSWORD BEFORE HASHING , 
    // THEN HASHING AND INTERACTING WITH DATABASE
    validate: {
      validator: isValidPassword,
      message: 'Password must have at least: 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.'
    }
  },
  email: {
    type: emailSchemaType,
    unique: true,
    required: true
  },
  role : {
    type: String,
    enum : [roles.admin ,roles.seller ,roles.user],
    default : roles.user
  },
  img: {
    type: String,
    required: false,
    default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"
  },
  country: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    required: false,
  },
  desc: {
    type: String,
    required: false,
  },
  googleId: {
    type: String,
    required: false,
  },
},{
  timestamps:true
});

export default mongoose.model("User", userSchema)