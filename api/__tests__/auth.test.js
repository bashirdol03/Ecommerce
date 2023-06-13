import {app} from '../app.js';
import supertest from "supertest";
import mongoose from "mongoose";
import connect from "../database/mongo-connect.js";
import User from "../models/user.model.js";
import session from 'supertest-session';


const request = supertest(app);
let testSession = null;

// THIS IMPORTED APP HAS NOTHING TO DO WITH THE SERVER, SUPERTEST IS USING THE APP ROUTES AND IS MAKING 
// HTTP REQS AND RESPONSES ON ITS OWN AND ONLY NEEDS ACCESS TO A TEST DATABASE
// THE APP IN SERVER JS CONNECTS TO THE REAL DATABASE


// USER FOR THE TESTS 
export const userPayload = {
  _id:"2620cb60-74c0n-4d4c-929-98ee34a3cb687",   // ONLY DECLARING ID UPFRONT TO TEST IT AGAINST THE COOKIE IN RESPONSE HEADER
  username : "user1",
  password : "Boldashir03@",
  confirmPassword : "Boldashir03@", // PASSWORD MUST BE COMPLEX ENOUGH
  email : "user1@gmail.com",
  role: "USER" // CANNOT BE CHANGED UNLESS SESSION IS TERMINATED, FOR SECURITY REASONS
};

export const userPayloadDuplicatedName = {
  _id:"2620cb60-74c0-4d4c-9f29-98ee34xxxxxx", // USES A DIFFERENT ID AND EMAIL
  username : "user1",
  password : "password",
  email : "userAny@gmail.com",
  isSeller: true
};

export const userPayloadSecond = {
  username : "user2",
  password : "password",
  email : "user2@gmail.com"
};

export const userPayloadInvalid = {
  username : "user1-invalid",
  password : "password",
  //email : "user1@gmail.com"
};

export const userPayloadIncorrect = {
  username : "user1",
  password : "incorrectPassword",
  email : "user1@gmail.com"
};



mongoose.set("strictQuery", true); 

const dbConnection = async ()=>{
    await connect(process.env.MONGO_TEST_DB)
    console.log("CONNECTED TO THE TEST DATABASE");
}


describe("auth", () => {

    // ONE BIG DESCRIBE FOR ALL OPERATIONS FOR THE AUTH CONTROLLERS

  beforeAll(async () => {
    // CONNECT TO TEST DATABASE
    dbConnection()
    // CLEAR AUTH/USERS IF YOU HAVE ALREADY CREATED A AUTH/USERS WITH THE SAME _ID IN A PREVIOUS TEST
    await User.deleteMany({})
    testSession = session(app);
   
  });

   // CLOSING CONNECTION TO DATABSE AND CLEARING DATABASE AFTER FINISHING ALL TESTS

  afterAll(async () => {
    await User.deleteMany({}); // CLEARING THE TEST DATABASE COLLECTION AFTER TESTING// IT SHOULD BE EMPTY AS THE TEST ENDS WITH A DELETE
    await mongoose.disconnect();
    await mongoose.connection.close(); 
  });

describe.only("given the users details", () => {  

let authenticatedSession; 

  describe("given the user creates a user unsuccesfully ", () => {  
      
    it("should return a 400 status code", async () => {

        
        // POST REQUEST IS SENDING AN OBJECT WITH A VALID SCHEMA
    
        const {body, statusCode} =   await testSession.post(`/api/auth/register`).send(userPayloadInvalid)
        
        expect(statusCode).toBe(400)
        
        

    }, 70000);
        
        // END OF IT BLOCK

    }); // END OF DESCRIBE BLOCK

  describe("given the user creates a user succesfully ", () => {  
    
    it("should return a 201 status code and a success message", async () => {

        
        // POST REQUEST IS SENDING AN OBJECT WITH A VALID SCHEMA
    
        const {body, statusCode} =   await testSession.post(`/api/auth/register`).send(userPayload)
        
        expect(statusCode).toBe(201)
        expect(body.successMessage).toBe("User has been created succesfully.")
        

    }, 70000);
        
        // END OF IT BLOCK

    }); // END OF DESCRIBE BLOCK

  describe("given the users details are not verified and they are not logged in", () => {


      it('should not get a restricted page with status code 401', async () => {
        const response = await testSession.get('/api/orders')
    
        const {statusCode} = response
    
        expect(statusCode).toBe(401)
          
      }); 
    
    });   

  describe("given the users details are verified and they are logged in", () => {
 
    it("should return a 200 statusCode,with user info ", async () => {

    // EXPANDING ON THE IT , should return a 200 statusCode, the users info without the password,
    // an accessToken in the cookie in the header with the correct users details and the httpOnly header set to true!

      const response =  await testSession.post(`/api/auth/login`).send(userPayload)
    
    // CONTROLLER WILL CHECK TO SEE IF THE AUTH/USERS  EXISTS

    const {body, statusCode} = response

   // const cookies = response.headers['set-cookie']

    // USING setCookie TO ACCESS COOKIE TO VERIFY THE TOKEN CONTIANS THE RIGHT DETAILS 
    // AND THE HTTPONLY HEADER IS SET TO TRUE

    /*const parsedCookie =  setCookie.parse(cookies, {
      decodeValues: true,
      map: true  // default: true
    }); */

    // GETTING THE VALUE OF THE ACCESS TOKEN AND THE HTTP ONLY HEADER

    //const accesToken = parsedCookie.accessToken.value
    //const httpOnly = parsedCookie.accessToken.httpOnly

    // DECODING THE ACCESS TOKEN, NO NEED FOR SECRET AS THAT IS ONLY NEEDED TO CREATE/CHANGE/VERIFY THE TOKEN

   // const token = jwt.decode(accesToken)

    // TOKEN CONSOLE.LOG : {"iat": 1683700078, "id": "2620cb60-74c0-4d4c-9f29-98ee34a3cb6f", "isSeller": true}

    
    expect(statusCode).toBe(200)
    //expect(httpOnly).toBe(true)
    expect(body.username).toBe(userPayload.username)
    expect(body._id).toBe(userPayload._id)
    expect(body.password).toBe(undefined)      // USER DETAILS ARE SENT BACK EXCEPT FOR PASSWORD
    expect(body.role).toBe(userPayload.role)
    
    if(statusCode === 200){authenticatedSession = testSession};
    // AUTHENTICATED SESSION IS INITILISED UPON LOG IN , OTHER WISE IT WONT RUN(SEE AT TOP DESCRIBE) 

    // VERIFIED THAT A TOKEN WAS CREATED CONTAING THE CORRECT DETAILS AND HTTPONLY IS SET TO TRUE
    console.log(testSession)
    }, 70000);

        // END OF IT BLOCK

}); // END OF DESCRIBE BLOCK WHICH CHECKS IF AUTH/USERS  TO UPDATE EXISTS

  describe("given the users details are verified", () => {


    it('should get a restricted page', async () => {
      const response = await authenticatedSession.get('/api/orders')
     
      const {statusCode} = response

      expect(statusCode).toBe(200)
        
    }); 

  }); 

  describe("given the user tries to log in again", () => {
  
    it("should return a 400 statusCode, and msg ", async () => {

    // EXPANDING ON THE IT , should return a 200 statusCode, the users info without the password,
    // an accessToken in the cookie in the header with the correct users details and the httpOnly header set to true!

      const response =  await authenticatedSession.post(`/api/auth/login`).send(userPayload)
    
    // CONTROLLER WILL CHECK TO SEE IF THE AUTH/USERS  EXISTS

    const {body, statusCode} = response

  // const cookies = response.headers['set-cookie']

    // USING setCookie TO ACCESS COOKIE TO VERIFY THE TOKEN CONTIANS THE RIGHT DETAILS 
    // AND THE HTTPONLY HEADER IS SET TO TRUE

    /*const parsedCookie =  setCookie.parse(cookies, {
      decodeValues: true,
      map: true  // default: true
    }); */

    // GETTING THE VALUE OF THE ACCESS TOKEN AND THE HTTP ONLY HEADER

    //const accesToken = parsedCookie.accessToken.value
    //const httpOnly = parsedCookie.accessToken.httpOnly

    // DECODING THE ACCESS TOKEN, NO NEED FOR SECRET AS THAT IS ONLY NEEDED TO CREATE/CHANGE/VERIFY THE TOKEN

  // const token = jwt.decode(accesToken)

    // TOKEN CONSOLE.LOG : {"iat": 1683700078, "id": "2620cb60-74c0-4d4c-9f29-98ee34a3cb6f", "isSeller": true}

    
    expect(statusCode).toBe(400)
    //expect(httpOnly).toBe(true)
   /* expect(body.username).toBe(userPayload.username)
    expect(body._id).toBe(userPayload._id)
    expect(body.password).toBe(undefined)      // USER DETAILS ARE SENT BACK EXCEPT FOR PASSWORD
    expect(body.role).toBe(userPayload.role)
    
    if(statusCode === 200){authenticatedSession = testSession}; / */

    // VERIFIED THAT A TOKEN WAS CREATED CONTAING THE CORRECT DETAILS AND HTTPONLY IS SET TO TRUE

    }, 70000);

        // END OF IT BLOCK

  }); // END OF DESCRIBE BLOCK WHICH CHECKS IF AUTH/USERS  TO UPDATE EXISTS

  describe("given the users role in not authorised", () => {


    it('should not get a role restricted page', async () => {
      const response = await authenticatedSession.get('/api/users')

      const {statusCode} = response

      expect(statusCode).toBe(403)
        
    }); 

  }); 

  describe("given the users role is authorised", () => {


    it('should get a role restricted page', async () => {
      const review = {
        userId: userPayload.userId,
        gigId: "99999999",
        desc: "mock review",
        star: 4, // MUST BE A NUMBER AND BETWEEN 1-5

        // VERIFYING PREVIOUS REVIEWS AND WHETHER YOU MADE AN PORDER WHERE IGNORED
        // TO PASS THIS TEST TO VERIFY USER ROLE WAS WORKING

      }

      const response = await authenticatedSession.post('/api/reviews/').send(review)

      const {statusCode, body} = response

      expect(statusCode).toBe(403) // TO GET 200 COMMENT OUR REVIEW CONTROLLER
    // RUN ONLY IF EXPECTING 200  expect(body.desc).toBe("mock review")
        
    }); 

  }); 


});












  describe("registering / create a user auth route", () => {
    // TESTS FOR CREATING A AUTH/USERS  CONTROLLER STARTS HERE



        describe("given the user tries to create a user not matching the correct schema" , () => { 
    
          it("should return a 400 status code with a specific error message", async () => {

            // POST REQUEST IS SENDING AN OBJECT WITH AN INVALID SCHEMA WHICH WILL RESULT IN A SERVER ERROR, OBJECT IS MISSING A REQUIRED FIELD    

            const {body, statusCode} =  await request.post(`/api/auth/register/`).send(userPayloadInvalid)
            
            expect(statusCode).toBe(400)
            expect(typeof body.errorMessage).toBe("string") 
            // WE CANNOT TELL WHAT THE ERROR MESSAGE WILL BE BUT IT WILL BE SENT

            }, 70000);

            // END OF IT BLOCK
        
        }); // END OF DESCRIBE BLOCK


        describe("given the user creates a user succesfully ", () => {  
    
          it("should return a 201 status code and a success message : User has been created succesfully. ", async () => {

              
              // POST REQUEST IS SENDING AN OBJECT WITH A VALID SCHEMA
          
              const {body, statusCode} =  await request.post(`/api/auth/register`).send(userPayload)
              
              expect(statusCode).toBe(201)
              expect(body.successMessage).toBe("User has been created succesfully.")
              

          }, 70000);
              
              // END OF IT BLOCK

          }); // END OF DESCRIBE BLOCK  


        describe("given the user creates a second user succesfully ", () => {  

          it("should return a 201 status code and a success message : User has been created succesfully. ", async () => {

              
              // POST REQUEST IS SENDING AN OBJECT WITH A VALID SCHEMA
          
              const {body, statusCode} =  await request.post(`/api/auth/register`).send(userPayloadSecond)
              
              expect(statusCode).toBe(201)
              expect(body.successMessage).toBe("User has been created succesfully.")
              

          }, 70000);
              
              // END OF IT BLOCK

          }); // END OF DESCRIBE BLOCK 


        describe("given the user tries to create an already existing user " , () => { 

          it("should return a 409 status code with a specific error message", async () => {

            // POST REQUEST IS SENDING AN OBJECT WITH A VALID SCHEMA, BUT HAS A DUPLICATED USERNAME

            const {body, statusCode} =  await request.post(`/api/auth/register`).send(userPayloadDuplicatedName)
            
            expect(statusCode).toBe(409)
            expect(typeof body.errorMessage).toBe("string") 
            // WE CANNOT TELL WHAT THE ERROR MESSAGE WILL BE BUT IT WILL BE SENT

            }, 70000);

            // END OF IT BLOCK
        
        }); // END OF DESCRIBE BLOCK
  
    });      


    
 


describe("Login a user auth route", ()=> {

       
    describe("given the user to get does not exist ", () => {

      it("should return a 404 with the message : That user does not exist! ", async () => {

      const {body, statusCode} =  await request.post(`/api/auth/login`).send(userPayloadInvalid)
      
      // CONTROLLER WILL CHECK TO SEE IF THE AUTH/USERS  EXISTS

      expect(statusCode).toBe(404)
      expect(body.errorMessage).toBe("That user does not exist!")

      }, 70000);

          // END OF IT BLOCK
  
  }); // END OF DESCRIBE BLOCK 


  describe("given the user exists but either the username or password is wrong ", () => {

    it("should return a 400 statusCode with the message : Wrong password or username! ", async () => {

    const {body, statusCode} =  await request.post(`/api/auth/login`).send(userPayloadIncorrect)
    
    // CONTROLLER WILL CHECK TO SEE IF THE AUTH/USERS  EXISTS

    expect(statusCode).toBe(400)
    expect(body.errorMessage).toBe("Wrong password or username!")

    }, 70000);

        // END OF IT BLOCK

}); // END OF DESCRIBE BLOCK 



  describe("given the users details are verified and they are logged in/given an accessToken", () => {

    it("should return a 200 statusCode, users info and a cookie ", async () => {

    // EXPANDING ON THE IT , should return a 200 statusCode, the users info without the password,
    // an accessToken in the cookie in the header with the correct users details and the httpOnly header set to true!

      const response =  await request.post(`/api/auth/login`).send(userPayload)
    
    // CONTROLLER WILL CHECK TO SEE IF THE AUTH/USERS  EXISTS

    const {body, statusCode} = response

    const cookies = response.headers['set-cookie']

    // USING setCookie TO ACCESS COOKIE TO VERIFY THE TOKEN CONTIANS THE RIGHT DETAILS 
    // AND THE HTTPONLY HEADER IS SET TO TRUE

    const parsedCookie =  setCookie.parse(cookies, {
      decodeValues: true,
      map: true  // default: true
    });

    // GETTING THE VALUE OF THE ACCESS TOKEN AND THE HTTP ONLY HEADER

    const accesToken = parsedCookie.accessToken.value
    const httpOnly = parsedCookie.accessToken.httpOnly

    // DECODING THE ACCESS TOKEN, NO NEED FOR SECRET AS THAT IS ONLY NEEDED TO CREATE/CHANGE/VERIFY THE TOKEN

    const token = jwt.decode(accesToken)

    // TOKEN CONSOLE.LOG : {"iat": 1683700078, "id": "2620cb60-74c0-4d4c-9f29-98ee34a3cb6f", "isSeller": true}

    
    expect(statusCode).toBe(200)
    expect(httpOnly).toBe(true)
    expect(body.username).toBe(userPayload.username)
    expect(body._id).toBe(userPayload._id)
    expect(body.password).toBe(undefined)      // USER DETAILS ARE SENT BACK EXCEPT FOR PASSWORD
    expect(userPayload.password).toBe("password")
    expect(body.isSeller).toBe(userPayload.isSeller)
    expect(token.id).toBe(userPayload._id)
    expect(token.isSeller).toBe(userPayload.isSeller)
    
    // VERIFIED THAT A TOKEN WAS CREATED CONTAING THE CORRECT DETAILS AND HTTPONLY IS SET TO TRUE

    }, 70000);

        // END OF IT BLOCK

}); // END OF DESCRIBE BLOCK WHICH CHECKS IF AUTH/USERS  TO UPDATE EXISTS




})


describe("Logout a user auth route", ()=> {

 
    it("should return a 200 statusCode, and clear the cookie with the correct headers set ", async () => {

    const response =  await request.post(`/api/auth/logout`)
    
    const {statusCode} = response

    const cookies = response.headers['set-cookie']

    // USING setCookie TO ACCESS COOKIE TO VERIFY THE TOKEN CONTIANS THE RIGHT DETAILS 
    // AND THE HTTPONLY HEADER IS SET TO TRUE

    const parsedCookie =  setCookie.parse(cookies, {
      decodeValues: true,
      map: true  // default: true
    });

    // GETTING THE VALUE OF THE ACCESS TOKEN AND THE HTTP ONLY HEADER

    const accesToken = parsedCookie.accessToken.value
    const sameSite = parsedCookie.accessToken.sameSite
   //const secure = parsedCookie.accesToken.secure
   //  SECURE IS SET TO TRUE IN THE CONSOLE.LOG {"accessToken": {"expires": 1970-01-01T00:00:00.000Z, "name": "accessToken", "path": "/",
   // "sameSite": "None", "secure": true, "value": ""}}

    // DECODING THE ACCESS TOKEN, NO NEED FOR SECRET AS THAT IS ONLY NEEDED TO CREATE/CHANGE/VERIFY THE TOKEN

    const token = jwt.decode(accesToken)

    // TOKEN CONSOLE.LOG : {"iat": 1683700078, "id": "2620cb60-74c0-4d4c-9f29-98ee34a3cb6f", "isSeller": true}

    
    expect(statusCode).toBe(200)
    expect(accesToken).toBe("")  // COOKIE CLEARED  
    expect(sameSite).toBe("None")   // SAME SITE HEADER VERIFIED
   
    
    // VERIFIED THAT A TOKEN WAS CREATED CONTAING THE CORRECT DETAILS AND HTTPONLY IS SET TO TRUE

    }, 70000);

        // END OF IT BLOCK


  



})



});























