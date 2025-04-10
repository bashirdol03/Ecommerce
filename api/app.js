import express from "express";

import userRoute from "./routes/user.route.js";
import gigRoute from "./routes/gig.route.js";
import orderRoute from "./routes/order.route.js";
import reviewRoute from "./routes/review.route.js";
import authRoute from "./routes/auth.route.js";


import cors from "cors";
import compression from 'compression';
import morgan from 'morgan'
import rateLimit from "express-rate-limit";
import { logger, errorLogger } from './config/logger.js'
import { securityLogger } from './config/securityLogger.js'
import helmet from 'helmet'
import mongoSanitise from 'express-mongo-sanitize'
import xss from 'xss-clean'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import dotenv from 'dotenv'

dotenv.config()

export const app = express();

app.set("trust proxy", true);

const isProduction = process.env.NODE_ENV === "production";
const frontendUri = process.env.FRONTEND_URL;
const prodDomain = process.env.PROD_DOMAIN;

// CORS HEADER
app.use(cors({
  origin: isProduction
    ? frontendUri 
    : "http://localhost:5000",
  credentials: true,
  exposedHeaders: ["set-cookie"]
}));

// SESSION SETUP AND PERSISTING SESSION DATA IN MONGO-DB
const url = process.env.MONGO
const sessionSecret = process.env.SESSION_SECRET

const sessionStore = MongoStore.create({
    mongoUrl: url,
    collectionName: "sessions",
    secret: sessionSecret,
    touchAfter: 24 * 60 * 60 // 24 HOURS, TIME IN SECONDS
});


app.use(session({
  name: "session",
  secret : sessionSecret,
  resave : false,
  saveUninitialized : false,
  store : sessionStore,
  // DONT SET ANY COOKIE OPTIONS HERE, STOPS SESSION DATA PERSISTING
  cookie : {secure :  isProduction , // SET TO FALSE TO RUN TESTS (HTTP SESSION COOKIE PERSISTENCE)
            // COMMENT OUT SAMESITE,DOMAIN AND PATH FOR TESTS 
            sameSite : isProduction ? "none" : "lax",
            domain: isProduction ? prodDomain : "localhost", // ALL LOCAL HOST SUBDOMAINS
            // path: '/api', // CAN USE IT FOR DIFFERENT VVERSIONS OF APP
            // COULD HAVE TWO APP.JS LIKE FILES WITH SLIGHT DIFFERENCES IN ROUTES
            // AND MIDDLEWARES
            // httpOnly : true,
            maxAge: 2 * 60 * 60 * 1000 // EXPIRES IN 2 HOURS , TIME IN MILLISECONDS
          } // MUST BE FALSE TO WORK AS IM USING HTTP CONNECTION
        
})) 


// ADDITIONAL HTTP HEADER SECURITY
app.use(helmet()) 

// PREVENTING CROSS-SITE-SCRIPTING BY INPUT SANITISATION
app.use(xss())

// PREVENTING NO-SQL INJECTION BY INPUT SANITISATION
app.use(mongoSanitise())

// LIMITING USER INPUT PAYLOAD
app.use(express.json({limit : "5mb"}));

app.use(compression());

//PREVENTING BRUTE FORCE LOGIN ATTEMPT
const rateLimiter = rateLimit({
  max: 150,
  windowMs: 15*60*1000,
  message: "Too many requests, try again in 15 minutes"
})

// LOGGING AND MONITORING ALL ROUTES
app.use(morgan('tiny')) // LOGGING ONLY TO CONSOLE

app.use("/api/auth", securityLogger, rateLimiter, authRoute); // NO ACCESS TO REQUEST BODY FOR THE AUTH ROUTE
app.use("/api/users", logger, userRoute);
app.use("/api/gigs", logger, gigRoute);
app.use("/api/orders", logger, orderRoute);
app.use("/api/reviews", logger, reviewRoute);

// ERROR HANDLING WITH CUSTOM ERROR DETAILS OR PASSING THE ERROR OBJECT 

app.use(errorLogger,(err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";
  console.log(errorMessage)

  return res.status(errorStatus).json({"errorMessage": errorMessage});
  
});




export default app;