import User from "../models/user.model.js";
import createError from "../utils/createError.js";
import bcrypt from "bcrypt";
import validator  from 'validator';
import { roles } from "../utils/roles.js";

import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv'
dotenv.config()

// SETTING UP OAUTH2.0 WITH PROFILE AND EMAIL 
// SCOPES SET UP IN THE GOOGLE CLIENT SETTINGS
// MUST BE IN THIS FORMAT TO WORK ,GITHUB: https://github.com/MomenSherif/react-oauth/issues/12
const client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'postmessage', // MUST BE SET UP THIS WAY TO WORK WITH THE REACT-GOOGLE-OAUTH2 LIBRARY
);


export const register = async (req, res, next) => {
  try {

    if(req.session.isAuth)
    {
    console.log("user already logged in, Logout to log back in")
    return next(createError(400, `${req.session.user.email} is already logged in, Logout first to register with another email`));
    } 

    const userInput = req.body

    if (!validator.equals(userInput.password, userInput.confirmPassword)) {
      return next(createError(400, "passwords do not match"))
    }
    //console.log(userInput)
    // NO NEED FOR THE CONFIRMED PASSWORD TO BE SAVED TO DATABASE
    // SO IT IS REMOVED FROM THE BODY AND IS NOT VALIDATED AGAINST THE SCHEMA
    delete userInput.confirmPassword
    
    //console.log(userInput)

    // COMPARING PASSWORDS BEFORE ATTEMPTING TO VALIDATE USER INPUT AGAINST SCHEMA
    
    const proposedNewUser = new User({
      ...userInput
    });
    
      try {
        // CATCHES REQUEST BODY VALIDATION ERRORS WITH SPECIFIC DETAILS IN ERROR MESSAGE
        const validatedUser =  proposedNewUser.validateSync()
        if(!!validatedUser) throw validatedUser;
        } catch (err) {
          console.log(err.message)
          return next(createError(400, err.message)); // SENDING A 400 CODE BACK AS THE USER IS RESPONSIBLE FOR THE ERROR
        }

      // THE ONLY WAY TO SET THE ADMIN ROLE IS WITH AN ADMIN EMAIL
      if(req.body.email === process.env.ADMIN_EMAIL)
      req.body.role = roles.admin  
      
      // VALIDATING USER INPUT BEFORE DATABASE INTERACTION 
      // HASHING PASSWORD BEFORE INTERACTING WITH DATABASE  
      

      const hash = bcrypt.hashSync(req.body.password, 5);
      const newUser = new User({
        ...req.body,
        password: hash
      });  

      try {
      // CATCHES REQUEST BODY DUPLICATE ERRORS WITH SPECIFIC DETAILS IN ERROR MESSAGE
        await newUser.save();
      } catch (err) {
        return next(createError(400, "could not register account")); 
        // SENDING A 400 CODE BACK AS THE USER IS RESPONSIBLE FOR THE ERROR
      }
      // ERRORS DUE TO THE CLIENT SHOULD NOT BE RETURNED WITH 500
    
    res.status(201).json({"successMessage":"User has been created succesfully."});
  } catch (err) {
    next(err);
  }
};



export const login = async (req, res, next) => {

  if(req.session.isAuth)
  {
   console.log("user already logged in, Logout to log back in")
   return next(createError(400, `${req.session.user.email} is already logged in, Logout first to Login with another email`));
  } 

    // PREVENTS LOGGING IN ANOTHER USER WITHOUT TERMINATING SESSION
    // YOU CAN STILL LOG OTHER USERS IN ON ANOTHER SESSION FROM INCOGNITO

  try {

    const user = await User.findOne({ email: req.body.email });
    if (!user) return next(createError(401, "Wrong password or username!"));

    const isCorrect = bcrypt.compareSync(req.body.password, user.password);
    if (!isCorrect)
      return next(createError(401, "Wrong password or username!"));

  
    const { password, ...info } = user._doc;

    // NOT SENDING PASSWORD BACK EVEN IF IT IS HASHED
    
    req.session.isAuth = true  // INITIALSING SESSION
    req.session.user = info  // STORING USER INFO IN SESSION
    res.status(200)
      .send(req.session.user);
  } catch (err) {
    next(err);
  }

};



export const loginWithGoogle = async (req, res, next) => {

  if(req.session.isAuth)
    {console.log("user already logged in, Logout to log back in")
    return next(createError(400, `${req.session.user.email} is already logged in, Logout first to Login with another email`));
   } 

    // PREVENTS LOGGING IN ANOTHER USER WITHOUT TERMINATING SESSION
    // YOU CAN STILL LOG OTHER USERS IN ON ANOTHER SESSION FROM INCOGNITO
      
    try {
      
      // SENT BY THE GOOGLE OAUTH2 LIBRARY ON CLIENT SIDE, 
      // NO VULNERABILITY AS IF IT NOT CORRECT FOR ANY REASON
      // IT IS HANDLED BY THE 'client'/OAUTH2CLIENT AND ERROR IS PASSSED
      // USER INPUT PASSED DIRECTLY TO GOOGLE OAUTH2.0 VERIFICATION
      // CLIENT USER DOES NOT SEND THIS DIRECTLY , THE GOOGLE OAUTH2.0 LIBRARY
      // SENDS IT SECURELY AFTER VERIFYING A GOOGLE USER ,ALSO XSS/SQL HAS ALREADY BEEN PREVENTED 
      const { tokens } = await client.getToken(req.body.code); // exchange code for tokens
      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.CLIENT_ID
        // AUDIENCE NOT MANDATORY TO WORK, HOWEVER STILL USING TO  
        // FOLLOW GOOGLE BEST PRACTICES FOR VERIFYING JWT TOKEN
      })
      // DETAILS FROM EMAIL AND PROFILE SCOPES
      const googleId = ticket.payload.sub // FROM GOOGLE DOCS LINK : https://developers.google.com/identity/sign-in/web/backend-auth
      const name = ticket.payload.name
      const firstName = ticket.payload.given_name
      const lastName = ticket.payload.family_name
      const gmail = ticket.payload.email
      const picture = ticket.payload.picture
      const passwordunHashed = `${ticket.payload.at_hash}+${gmail}`
      const hash = bcrypt.hashSync(passwordunHashed, 5)
      // AT HASH VALUE FROM TICKET CHANGES ON EACH LOGIN SO IT IS JUST 
      // USED TO SATISFY USER SCHEMA, NO OTHE PURPOSE
      // EMAIL/GMAIL @ SPECIAL CHARACTER SATISFIES PASSWORD COMPLEXITY

      const newUser = {
        username: name,
        email: gmail,
        img: picture,
        password: hash,
        googleId: googleId
      }

      // CAN ONLY USE PASSWORD BELOW FROM CONSOLE TO LOGIN IF A USER HAS NOT LOGGED
      // AFTER AND GOTTEN A NEW PASSWORD ASSIGNED TO THEIR USEDOCUMENT IN THE DB
      // console.log("HASHED PASSWORD BELOW")
      // console.log(passwordunHashed)

      // NO NEED FOR VALIDATION AS DETAILS ABOVE ARE CONSISTENT FOR EVERY GMAIL
      // ACCOUNT AND THEY MATCH THE USER SCHEMA

        try {
            // UPSERT USER DETAILS COMBINING REGISTRATION AND LOGIN LOGIC IN ONE STEP 
            const user = await User.findOneAndUpdate({googleId: googleId}, // Query parameter
            {...newUser}, // Replacement document
            {upsert:true, // IF A USER DOES NOT EXIST IT WILL CREATE IT 
            // WITH THE ABOVE DETAILS 
              new: true // WILL RETURN THE USER WITH LATEST GMAIL DETAILS,
              // IF THEY CHANGED THEIR PICTURE OR LAST NAME WE WILL HAVE THE
              // LATEST VERSION FROM THEIR GOOGLE PROVIDED DATA
            })
            
           // AS THE BELOW IS DEPENDENT ON THE ABOVE IT MUST BE IN ITS OWN 
           // TRYCATCH TO SEPERATE THE LOGIC AND ERROR HANDLING 

            if(user){
            const { password, ...info } = user._doc;
            // SAME LOGIC AS BEFORE, USER WILL BE TREATED LIKE A NORMAL ACCOUNT TRYING TO LOGIN 
            req.session.isAuth = true  // INITIALSING SESSION
            req.session.user = info  // STORING USER INFO IN SESSION  
            res.status(200)
              .send(req.session.user);
            }  
                  
        } catch (err) {
          console.log(err);
          console.log("mongoose error")
          return next(err)
          // EVEN IF YOU NEED MULTIPLE TRY-CATCH BLOCKS, SIMPLY PASS THE ERROR OBJECT 
          // TO NEXT/ERROR-HANDLING MIDDLEWARE, CREATEERROR IS ONLY FOR CUSTOM MESSAGE/STATUS-CODE
        } 


    } catch (err) {
      console.log("non-mongoose errors")
      next(err);
    }
  
};  



export const logout = async (req, res) => {
  if(req.session.isAuth){
  // console.log(req.session.cookie)
  req.session.cookie.maxAge = -1  // EXPRING COOKIE BEFORE DESTROYING SESSION
  // SETTING EXPIRY DATE FOR COOKIE STOPS MALICIOUS USER FROM USING SESSION
  // IF A USER FORGOT TO LOG OUT, IF NO EXPIRY IS SET UP COOKIE STAYS FOREVER AND 
  // IS THEREFORE VULNERABLE, SO THIS SIMPLY EXPIRES THE COOKIE AS IT WOULD NOT 
  // HAPPEN UPON SESSION.DESTROY AND IT WOULD ONLY EXPIRE UPON THE EXPIRY TIME,
  // AS WE HAVE SET THE COOKIE TO EXPIRE, THE BROWSER WILL NOT SEND IT AT ALL, 
  // REGARDLESS OF SESSION EXISTENCE OR NOT, IT CAN KEEP IT OR DESTROY IT DOESNTMATTER,
  // ITS USELES AS ITS EXPIRED AND WE LET THE BROWSER KNOW THAT
//  console.log(req.session.cookie)
  req.session.destroy();
  res.status(200)
    .json({"successMessage":"User has been logged out."});
  }
  else{
    res.status(401).json({"errorMessage":"You must be logged in to Logout"})
  } 
};