import app from '../app.js'
import supertest from "supertest";
import mongoose from "mongoose";
import connect from "../database/mongo-connect.js";
import jwt from "jsonwebtoken";
import Gig from "../models/gig.model.js";


const request = supertest(app);

// THIS IMPORTED APP HAS NOTHING TO DO WITH THE SERVER, SUPERTEST IS USING THE APP ROUTES AND IS MAKING 
// HTTP REQS AND RESPONSES ON ITS OWN AND ONLY NEEDS ACCESS TO A TEST DATABASE
// THE APP IN SERVER JS CONNECTS TO THE REAL DATABASE


// USER FOR THE TESTS 
export const userPayload = {
  userId: "0690719a-927e-4608-9ff8-66b9ab959ffb",
  isSeller: true
};

// THIS REPRESENTS ANOTHER USER IN THE SYSTEM
export const userPayloadInvalid = {
    userId: "5aa1f911-4efc-4fdf-be25-e3e9e7ab2ef0",
    isSeller: false
  };

// GIGS FOR THE TESTS

// GIG WITH THE CORRECT SCHEMA
export const gigPayload = {
  _id: "3b7d7ad4-ae21-48e2-ad58-02044b2107f5",
  userId: userPayload.userId,
  title: "TITLE",
  description: "DESCRIPTION",
  category: "CATEGORY", 
  price: 0 // THIS IS SET BY DEFAULT IN THE MODEL
}

// GIG WITH AN INCORRECT SCHEMA
export const gigPayloadInvalidSchema = {
    _id: "0d976fcc-9752-4045-9d84-db21912f319c",
    userId: userPayload.userId,
    description: "DESCRIPTION",
    category: "CATEGORY",  
}

// GIG WITH A DUPLICATE ID
export const gigPayloadDuplicateId = { 
  _id: "3b7d7ad4-ae21-48e2-ad58-02044b2107f5",
  userId: userPayload.userId,
  title: "DUPLICATE TITLE",
  description: "DUPLICATE DESCRIPTION",
  category: "DUPLICATE CATEGORY",  
}

// SECOND GIG TO BE CREATED
export const gigPayloadSecondGig = {
  _id: "5ea3cf80-edcb-4a37-8df1-26af654a5704",
  userId: userPayloadInvalid.userId,
  title: "SECOND TITLE",
  description: "SECOND DESCRIPTION",
  category: "SECOND CATEGORY",  
}

// GIG WITH SOME UPDATED FIELDS
export const gigPayloadUpdated = {
/*  _id: `${uuidv4()}`,
  userId: userPayload.userId, NO NEED TO GIVE THESE VALUES   */
  title: "UPDATED TITLE",
  description: "UPDATED DESCRIPTION",
  category: "UPDATED CATEGORY", 
  price: 100
}
mongoose.set("strictQuery", true); 

const dbConnection = async ()=>{
    await connect(process.env.MONGO_TEST_DB)
    console.log("CONNECTED TO THE TEST DATABASE");
}


describe.skip("gigs", () => {

    // ONE BIG DESCRIBE FOR ALL CRUD OPERATIONS FOR THE GIG CONTROLLERS

  beforeAll(async () => {
    // CONNECT TO TEST DATABASE
    dbConnection()
    // CLEAR GIGS IF YOU HAVE ALREADY CREATED A GIG WITH THE SAME _ID IN A PREVIOUS TEST
    await Gig.deleteMany({})
   
  });

   // CLOSING CONNECTION TO DATABSE AND CLEARING DATABASE AFTER FINISHING ALL TESTS

  afterAll(async () => {
    await Gig.deleteMany({}); // CLEARING THE TEST DATABASE COLLECTION AFTER TESTING// IT SHOULD BE EMPTY AS THE TEST ENDS WITH A DELETE
    await mongoose.disconnect();
    await mongoose.connection.close();
  });




  describe("create a gig route", () => {
   // TESTS FOR CREATING A GIG CONTROLLER STARTS HERE

   // THIS ROUTE IS PROTECTED BY THE JWT MIDDLEWARE FOR BOTH AUTHENTICATION AND PASSING ON THE DETAILS FOR ROLE AUTHORISATION) 

   describe("given the user is not logged in(Authenticated)", () => {
    // USER IS NOT AUTHENTICATED TESTS STARTS HERE

    // TESTING THE JWT verifyToken MIDDLEWARE

        describe("given the user has no accessToken", () => {
    
            it("should return a 401 return the message : You are not authenticated!", async () => {
            
            // A CUSTOM ERROR MESSAGE SHOWS WHETHER THE ERROR IS IN THE JWT MIDDLEWARE OR ACTUAL CONTROLLER
        

            // user credentials in token to be passed on by jwt middleware , 
            //the controller function checks the credentials in the token 
    
            //const token = null
            //const {body, statusCode} =  await request.post(`/api/gigs/`).set("Cookie",`accessToken=${token}`).send(gigPayload)
      
            const {body, statusCode} =  await request.post(`/api/gigs/`).send(gigPayload)
            // SAME RESULT AS THE LINE ABOVE

            expect(statusCode).toBe(401)
            expect(body.errorMessage).toBe("You are not authenticated!")
    
            }, 70000);
    
            // END OF IT BLOCK
    
          }); // END OF DESCRIBE BLOCK


          describe("given the user has an accessToken but its not valid", () => {
    
            it("should return a 403 statusCode return the message : Token is not valid!", async () => {
            
            // A CUSTOM ERROR MESSAGE SHOWS WHETHER THE ERROR IS IN THE JWT MIDDLEWARE OR ACTUAL CONTROLLER
        

            // user credentials in token to be passed on by jwt middleware , 
            //the controller function checks the credentials in the token 
    
            const token = jwt.sign(
                {
                    // WHAT IS IN HERE ONLY MATTERS TO THE CONTROLLER, THE MIDDLEWARE SIMPLY PASSES IT ON THROUGH THE 
                    // REQUEST PARAMETER OF THE CONTROLLER, CONTROLLER THEN USES THE VALUES AS NEEDED
                    id: userPayload.userId,
                    isSeller: !userPayload.isSeller,
                },
                "A STRING THAT IS NOT THE JWT SECRET process.env.JWT_KEY"
                );

            const {body, statusCode} =  await request.post(`/api/gigs/`).set("Cookie",`accessToken=${token}`).send(gigPayload)
      
            // const {body, statusCode} =  await request.post(`/api/gigs/`).send(gigPayload)
            // SAME RESULT AS THE LINE ABOVE

            expect(statusCode).toBe(403)
            expect(body.errorMessage).toBe("Token is not valid!")
    
            }, 70000);
    
            // END OF IT BLOCK
    
          }); // END OF DESCRIBE BLOCK



    });  // USER IS NOT AUTHENTICATED TESTS ENDS HERE


   
// AFTER SUCCESFULLY PASSING MIDDLEWARE CHECKS NOW THIS IS TESTING ALL CONTROLLER FUNCTIONS AND ROLE AUTHORISATION

   describe("given the user is logged in(Authenticated) ", () => {

// USER IS AUTHENTICATED STARTS HERE

    describe("given the user is not permitted(Authorised) to create a gig", () => {

      it("should return a 403 with the message : Only sellers can create a gig! ", async () => {

        // user credentials in token to be passed on by jwt middleware , 
        //the controller function checks the credentials in the token 

        const token = jwt.sign(
            {
                id: userPayload.userId,
                isSeller: !userPayload.isSeller, // USER IS NOT PERMITTED
            },
            process.env.JWT_KEY
            );

        const {body, statusCode} =  await request.post(`/api/gigs/`).set("Cookie",`accessToken=${token}`).send(gigPayload)
        
        expect(statusCode).toBe(403)
        expect(body.errorMessage).toBe("Only sellers can create a gig!")

        }, 70000);

         // END OF IT BLOCK
    
    }); // END OF DESCRIBE BLOCK



    describe("given the user is permitted(Authorised) to create a gig", () => {
     
        // USER IS PERMITTED/AUTHORISED BLOCK STARTS

      describe("given the user tries to create a gig not matching the correct schema" , () => { 

        it("should return a 400 status code with a specific error message", async () => {
  
          // user credentials in token to be passed on by jwt middleware , 
          //the controller function checks the credentials in the token 
  
          const token = jwt.sign(
              {
                  id: userPayload.userId,
                  isSeller: userPayload.isSeller, // USER IS PERMITTED
              },
              process.env.JWT_KEY
              );

          // POST REQUEST IS SENDING AN OBJECT WITH AN INVALID SCHEMA WHICH WILL RESULT IN A SERVER ERROR, OBJECT IS MISSING A REQUIRED FIELD    
  
          const {body, statusCode} =  await request.post(`/api/gigs/`).set("Cookie",`accessToken=${token}`).send(gigPayloadInvalidSchema)
          
          expect(statusCode).toBe(400)
          expect(typeof body.errorMessage).toBe("string") 
          // WE CANNOT TELL WHAT THE ERROR MESSAGE WILL BE BUT IT WILL BE SENT
  
          }, 70000);
  
           // END OF IT BLOCK
      
      }); // END OF DESCRIBE BLOCK


      // TEST CREATING A GIG BEFORE TESTING DUPLICATION


      describe("given the user creates a gig succesfully ", () => {  

        it("should return a 201 status code and the gig the user created ", async () => {

            // user credentials in token to be passed on by jwt middleware , 
            //the controller function checks the credentials in the token 
        
            const token = jwt.sign(
                {
                    id: userPayload.userId,
                    isSeller: userPayload.isSeller, // USER IS PERMITTED
                },
                process.env.JWT_KEY
                );
        
            // POST REQUEST IS SENDING AN OBJECT WITH AN VALID SCHEMA
        
            const {body, statusCode} =  await request.post(`/api/gigs/`).set("Cookie",`accessToken=${token}`).send(gigPayload)
            
            expect(statusCode).toBe(201)
            expect(body.title).toBe("TITLE")
            

        }, 70000);
            
            // END OF IT BLOCK

        }); // END OF DESCRIBE BLOCK  


        describe("given the user creates a second gig succesfully ", () => {  

          // WILL BE USED TO TEST UPDATING THE WRONG GIG

          it("should return a 201 status code and the gig the user created ", async () => {
  
              // user credentials in token to be passed on by jwt middleware , 
              //the controller function checks the credentials in the token 
          
              const token = jwt.sign(
                  {
                      id: userPayload.userId,
                      isSeller: userPayload.isSeller, // USER IS PERMITTED
                  },
                  process.env.JWT_KEY
                  );
          
              // POST REQUEST IS SENDING AN OBJECT WITH AN VALID SCHEMA

          
              const {body, statusCode} =  await request.post(`/api/gigs/`).set("Cookie",`accessToken=${token}`).send(gigPayloadSecondGig)
              
              expect(statusCode).toBe(201)
              expect(body.title).toBe("SECOND TITLE")
              
  
          }, 70000);
              
              // END OF IT BLOCK
  
          }); // END OF DESCRIBE BLOCK


      describe("given the user tries to create a duplicate gig " , () => { 

        it("should return a 409 status code with a specific error message", async () => {
  
          // user credentials in token to be passed on by jwt middleware , 
          //the controller function checks the credentials in the token 
  
          const token = jwt.sign(
              {
                  id: userPayload.userId,
                  isSeller: userPayload.isSeller, // USER IS PERMITTED
              },
              process.env.JWT_KEY
              );

          // POST REQUEST IS SENDING AN OBJECT WITH A VALID SCHEMA, BUT HAS A DUPLICATED ID
  
          const {body, statusCode} =  await request.post(`/api/gigs/`).set("Cookie",`accessToken=${token}`).send(gigPayloadDuplicateId)
          
          expect(statusCode).toBe(409)
          expect(typeof body.errorMessage).toBe("string") 
          // WE CANNOT TELL WHAT THE ERROR MESSAGE WILL BE BUT IT WILL BE SENT
  
          }, 70000);
  
           // END OF IT BLOCK
      
      }); // END OF DESCRIBE BLOCK


        


}) // USER IS PERMITTED/ AUTHORISED BLOCK ENDS HERE

 





}); // USER IS AUTHENTICATED ENDS HERE







}) // TESTS FOR THE CREATING A GIG CONTROLLER ENDS HERE





  describe("getting a single gig route", ()=> {

       
        describe("given the gig to get does not exist ", () => {

          // CHECKS TO SEE IF THE GIG EXISTS

          it("should return a 404 with the message : That gig does not exist! ", async () => {

          const {body, statusCode} =  await request.get(`/api/gigs/single/${gigPayloadInvalidSchema._id}`)
          
          // CONTROLLER WILL CHECK TO SEE IF THE GIG EXISTS

          expect(statusCode).toBe(404)
          expect(body.errorMessage).toBe("That gig does not exist!")

          }, 70000);

              // END OF IT BLOCK
      
      }); // END OF DESCRIBE BLOCK 



      describe("given the gig to get does exist ", () => {

        // CHECKS TO SEE IF THE GIG EXISTS

        it("should return a 201 with the gig sent back! ", async () => {

        const {body, statusCode} =  await request.get(`/api/gigs/single/${gigPayload._id}`)
        
        // CONTROLLER WILL CHECK TO SEE IF THE GIG EXISTS

        expect(statusCode).toBe(200)
        expect(body.title).toBe("TITLE") // THE TITLE OF OF THE MAIN GIG

        }, 70000);

            // END OF IT BLOCK
    
    }); // END OF DESCRIBE BLOCK WHICH CHECKS IF GIG TO UPDATE EXISTS




})


describe("getting multiple gigs route", ()=> {

              
    describe("given the user specfies a query parameter or leaves it empty and there are no matching results", () => {


      it("should return a 200 statusCode and send an empty array", async () => {

      const {body, statusCode} =  await request.get(`/api/gigs/?search=nonExistentGig`)
      
      // CONTROLLER WILL CHECK TO SEE IF THE GIG EXISTS

      expect(statusCode).toBe(200)
      expect(body.length).toEqual(0) // EMPTY ARRAY IS RETURNED, SO ITS LENGTH MUST BE ZERO,

      }, 70000);

          // END OF IT BLOCK

  }); // END OF DESCRIBE BLOCK  


  describe("given the user specfies a query parameter or leaves it empty and there are matching results ", () => {


    it("should return a 200 statusCode and send a non-empty array from db query", async () => {

    const {body, statusCode} =  await request.get(`/api/gigs/`)
    
    // CONTROLLER WILL CHECK TO SEE IF THE GIG EXISTS

    expect(statusCode).toBe(200)
    expect(body.length).toBeGreaterThan(0) // EMPTY ARRAY IS NOT RETURNED, SO IT MUST HAVE ATLEAST 1 RESULT. 

    }, 70000);

        // END OF IT BLOCK

}); // END OF DESCRIBE BLOCK 


})

 



   
  describe("updating a gig route", () => {
    // TESTS FOR UPDATING A GIG CONTROLLER STARTS HERE
 
    // THIS ROUTE IS PROTECTED BY THE JWT MIDDLEWARE FOR BOTH AUTHENTICATION AND PASSING ON THE DETAILS FOR ROLE AUTHORISATION) 
    
    // AUTHENTICATION MIDDLEWARE TESTING

    describe("given the user is not logged in(NOT Authenticated)", () => {
     // USER IS NOT AUTHENTICATED TESTS STARTS HERE
 
     // TESTING THE JWT verifyToken MIDDLEWARE
 
         describe("given the user has no accessToken", () => {
     
             it("should return a 401 return the message : You are not authenticated!", async () => {
             
             // A CUSTOM ERROR MESSAGE SHOWS WHETHER THE ERROR IS IN THE JWT MIDDLEWARE OR ACTUAL CONTROLLER
         
 
             // user credentials in token to be passed on by jwt middleware , 
             //the controller function checks the credentials in the token 
     
             //const token = null
             // const {body, statusCode} =  await request.delete(`/api/gigs/${gigPayload._id}`).set("Cookie",`accessToken=${token}`)
       
             const {body, statusCode} =  await request.put(`/api/gigs/${gigPayload._id}`).send(gigPayloadUpdated)
       
             // SAME RESULT AS THE LINE ABOVE
 
             expect(statusCode).toBe(401)
             expect(body.errorMessage).toBe("You are not authenticated!")
     
             }, 70000);
     
             // END OF IT BLOCK
     
           }); // END OF DESCRIBE BLOCK
 
 
           describe("given the user has an accessToken but its not valid", () => {
     
             it("should return a 403 statusCode return the message : Token is not valid!", async () => {
             
             // A CUSTOM ERROR MESSAGE SHOWS WHETHER THE ERROR IS IN THE JWT MIDDLEWARE OR ACTUAL CONTROLLER
         
 
             // user credentials in token to be passed on by jwt middleware , 
             //the controller function checks the credentials in the token 
     
             const token = jwt.sign(
                 {
                     // WHAT IS IN HERE ONLY MATTERS TO THE CONTROLLER, THE MIDDLEWARE SIMPLY PASSES IT ON THROUGH THE 
                     // REQUEST PARAMETER OF THE CONTROLLER, CONTROLLER THEN USES THE VALUES AS NEEDED
                     id: userPayload.userId,
                     isSeller: !userPayload.isSeller,
                 },
                 "A STRING THAT IS NOT THE JWT SECRET process.env.JWT_KEY"
                 );
 
             const {body, statusCode} =  await request.put(`/api/gigs/${gigPayload._id}`).set("Cookie",`accessToken=${token}`).send(gigPayloadUpdated)
       
             // const {body, statusCode} =  await request.post(`/api/gigs/`).send(gigPayload)
             // SAME RESULT AS THE LINE ABOVE
 
             expect(statusCode).toBe(403)
             expect(body.errorMessage).toBe("Token is not valid!")
     
             }, 70000);
     
             // END OF IT BLOCK
     
           }); // END OF DESCRIBE BLOCK
 
 
 
 
 
     });  // USER IS NOT AUTHENTICATED TESTS ENDS HERE
 
    
    // AFTER SUCCESFULLY PASSING MIDDLEWARE CHECKS NOW THIS IS TESTING ALL CONTROLLER FUNCTIONS AND ROLE AUTHORISATION
 
    describe("given the user is logged in(Authenticated) ", () => {
 
    // USER IS AUTHENTICATED STARTS HERE

     
                // CHECKS TO SEE IF THE GIG EXISTS
                describe("given the gig to update does not exist ", () => {

                    it("should return a 404 with the message : That gig does not exist! ", async () => {

                    // user credentials in token to be passed on by jwt middleware , 
                    //the controller function checks the credentials in the token 
                    
                    // DOES NOT VERIFY CREDENTIALS INSIDE THE TOKEN BEFORE FINDING AN EXISTING GIG , BUT IT PASSES THE MIDDLEWARE TEST

                    const token = jwt.sign(
                        {
                            id: userPayloadInvalid.userId, // THE USERS ID IS DIFFERENT TO THE ID OF THE GIG TO BE DELETED
                            isSeller: userPayload.isSeller, // THIS IS NOT CHECKED FIRST WHEN UPDATING A GIG
                        },
                        process.env.JWT_KEY
                        );
                    
                    // ATTEMPTING TO DELETE A NON-EXISTENT GIG

                    const {body, statusCode} =  await request.put(`/api/gigs/${gigPayloadInvalidSchema._id}`).set("Cookie",`accessToken=${token}`).send(gigPayloadUpdated)
                    
                    // CONTROLLER WILL CHECK TO SEE IF THE GIG EXISTS

                    expect(statusCode).toBe(404)
                    expect(body.errorMessage).toBe("That gig does not exist!")

                    }, 70000);

                        // END OF IT BLOCK
                
                }); // END OF DESCRIBE BLOCK WHICH CHECKS IF GIG TO UPDATE EXISTS


                
            
                describe("given the user is not permitted(Authorised) to update the gig", () => {
            
                  it("should return a 403 with the message : You can only update your gigs! ", async () => {
            
                    // user credentials in token to be passed on by jwt middleware , 
                    //the controller function checks the credentials in the token 
            
                    const token = jwt.sign(
                        {
                            id: userPayloadInvalid.userId, // THE USERS ID IS DIFFERENT TO THE ID OF THE GIG TO BE DELETED
                            isSeller: userPayload.isSeller, // THIS IS NOw CHECKED WHEN UPDATING AN EXISTING GIG
                        },
                        process.env.JWT_KEY
                        );
                    
                    // ATTEMPTING TO UPDATE AN EXISTING GIG IN THE DATABASE


                    const {body, statusCode} =  await request.put(`/api/gigs/${gigPayloadSecondGig._id}`).set("Cookie",`accessToken=${token}`).send(gigPayloadUpdated)
                    
                    // CONTROLLER WILL CHECK IF THE REQUESTER USERS ID MATCHES THE ID OF THE CREATOR OF THE GIG

                    expect(statusCode).toBe(403)
                    expect(body.errorMessage).toBe("You can only update your gigs!")
            
                    }, 70000);
            
                      // END OF IT BLOCK
                
                }); // END OF DESCRIBE BLOCK
 


                describe("given the user is permitted and successfully updates the gig with the correct body information", ()=> {
          
                  it("should return a 200 statusCode with the updated gig sent back!(title will be confirmed) ", async () => {
            
                    // user credentials in token to be passed on by jwt middleware , 
                    //the controller function checks the credentials in the token 
            
                    const token = jwt.sign(
                        {
                            id: userPayload.userId, // THE USERS ID IS THE SAME AS THE ID OF THE CREATOR OF THE GIG TO BE DELETED
                            isSeller: userPayload.isSeller, // THIS IS NOT CHECKED WHEN DELETING A GIG
                        },
                        process.env.JWT_KEY
                        );
                  
                  // ATTEMPTING TO DELETE THE ONE SUCCESFULLY CREATED GIG IN THE DATABASE
          
                    const {body, statusCode} =  await request.put(`/api/gigs/${gigPayload._id}`).set("Cookie",`accessToken=${token}`).send(gigPayloadUpdated)
                    
                  // CONTROLLER WILL CHECK IF THE REQUESTER USERS ID MATCHES THE ID OF THE CREATOR OF THE GIG
          
                    expect(statusCode).toBe(200)
                    expect(body.title).toBe("UPDATED TITLE")
            
                    }, 70000);
            
                    // END OF IT BLOCK

              }); // END OF DESCRIBE BLOCK     
             


      
    }); // USER IS AUTHENTICATED ENDS HERE  
 

 
 }) // TESTS FOR THE UPDATING A GIG CONTROLLER ENDS HERE




 describe("deleting a gig route", () => {
  // TESTS FOR DELETING A GIG CONTROLLER STARTS HERE

  // THIS ROUTE IS PROTECTED BY THE JWT MIDDLEWARE FOR BOTH AUTHENTICATION AND PASSING ON THE DETAILS FOR ROLE AUTHORISATION) 
  
  // AUTHENTICATION MIDDLEWARE TESTING

  describe("given the user is not logged in(NOT Authenticated)", () => {
   // USER IS NOT AUTHENTICATED TESTS STARTS HERE

   // TESTING THE JWT verifyToken MIDDLEWARE

       describe("given the user has no accessToken", () => {
   
           it("should return a 401 return the message : You are not authenticated!", async () => {
           
           // A CUSTOM ERROR MESSAGE SHOWS WHETHER THE ERROR IS IN THE JWT MIDDLEWARE OR ACTUAL CONTROLLER
       

           // user credentials in token to be passed on by jwt middleware , 
           //the controller function checks the credentials in the token 
   
           //const token = null
           // const {body, statusCode} =  await request.delete(`/api/gigs/${gigPayload._id}`).set("Cookie",`accessToken=${token}`)
     
           const {body, statusCode} =  await request.delete(`/api/gigs/${gigPayload._id}`)
     
           // SAME RESULT AS THE LINE ABOVE

           expect(statusCode).toBe(401)
           expect(body.errorMessage).toBe("You are not authenticated!")
   
           }, 70000);
   
           // END OF IT BLOCK
   
         }); // END OF DESCRIBE BLOCK


         describe("given the user has an accessToken but its not valid", () => {
   
           it("should return a 403 statusCode return the message : Token is not valid!", async () => {
           
           // A CUSTOM ERROR MESSAGE SHOWS WHETHER THE ERROR IS IN THE JWT MIDDLEWARE OR ACTUAL CONTROLLER
       

           // user credentials in token to be passed on by jwt middleware , 
           //the controller function checks the credentials in the token 
   
           const token = jwt.sign(
               {
                   // WHAT IS IN HERE ONLY MATTERS TO THE CONTROLLER, THE MIDDLEWARE SIMPLY PASSES IT ON THROUGH THE 
                   // REQUEST PARAMETER OF THE CONTROLLER, CONTROLLER THEN USES THE VALUES AS NEEDED
                   id: userPayload.userId,
                   isSeller: !userPayload.isSeller,
               },
               "A STRING THAT IS NOT THE JWT SECRET process.env.JWT_KEY"
               );

           const {body, statusCode} =  await request.delete(`/api/gigs/${gigPayload._id}`).set("Cookie",`accessToken=${token}`)
     
           // const {body, statusCode} =  await request.post(`/api/gigs/`).send(gigPayload)
           // SAME RESULT AS THE LINE ABOVE

           expect(statusCode).toBe(403)
           expect(body.errorMessage).toBe("Token is not valid!")
   
           }, 70000);
   
           // END OF IT BLOCK
   
         }); // END OF DESCRIBE BLOCK





   });  // USER IS NOT AUTHENTICATED TESTS ENDS HERE

  
  // AFTER SUCCESFULLY PASSING MIDDLEWARE CHECKS NOW THIS IS TESTING ALL CONTROLLER FUNCTIONS AND ROLE AUTHORISATION

  describe("given the user is logged in(Authenticated) ", () => {

  // USER IS AUTHENTICATED STARTS HERE

   
   // CHECKS TO SEE IF THE GIG EXISTS
   describe("given the gig to delete does not exist ", () => {

      it("should return a 404 with the message : That gig does not exist! ", async () => {

      // user credentials in token to be passed on by jwt middleware , 
      //the controller function checks the credentials in the token 
      
      // DOES NOT VERIFY CREDENTIALS INSIDE THE TOKEN BEFORE FINDING AN EXISTING GIG , BUT IT PASSES THE MIDDLEWARE TEST

      const token = jwt.sign(
          {
              id: " A DIFFERENT USER ID TO THE CREATOR OF THE GIG userPayload.userId", // THE USERS ID IS DIFFERENT TO THE ID OF THE GIG TO BE DELETED
              isSeller: userPayload.isSeller, // THIS IS NOT CHECKED WHEN DELETING A GIG
          },
          process.env.JWT_KEY
          );
      
      // ATTEMPTING TO DELETE A NON-EXISTENT GIG

      const {body, statusCode} =  await request.delete(`/api/gigs/${gigPayloadInvalidSchema._id}`).set("Cookie",`accessToken=${token}`)
      
      // CONTROLLER WILL CHECK TO SEE IF THE GIG EXISTS

      expect(statusCode).toBe(404)
      expect(body.errorMessage).toBe("That gig does not exist!")

      }, 70000);

          // END OF IT BLOCK
  
   }); // END OF DESCRIBE BLOCK WHICH CHECKS IF GIG TO DELETE EXISTS




   describe("given the user is not permitted(Authorised) to delete the gig", () => {

     it("should return a 403 with the message : You can only delete your gigs! ", async () => {

       // user credentials in token to be passed on by jwt middleware , 
       //the controller function checks the credentials in the token 

       const token = jwt.sign(
           {
               id: " A DIFFERENT USER ID TO THE CREATOR OF THE GIG userPayload.userId", // THE USERS ID IS DIFFERENT TO THE ID OF THE GIG TO BE DELETED
               isSeller: userPayload.isSeller, // THIS IS NOT CHECKED WHEN DELETING A GIG
           },
           process.env.JWT_KEY
           );
      
      // ATTEMPTING TO DELETE AN EXISTING GIG IN THE DATABASE

       const {body, statusCode} =  await request.delete(`/api/gigs/${gigPayload._id}`).set("Cookie",`accessToken=${token}`)
       
      // CONTROLLER WILL CHECK IF THE REQUESTER USERS ID MATCHES THE ID OF THE CREATOR OF THE GIG

       expect(statusCode).toBe(403)
       expect(body.errorMessage).toBe("You can only delete your gigs!")

       }, 70000);

        // END OF IT BLOCK
   
   }); // END OF DESCRIBE BLOCK



   describe("given the user is permitted(Authorised) to delete the gig", () => {

      it("should return a 204 statusCode with the message : Gig has been deleted! ", async () => {

        // user credentials in token to be passed on by jwt middleware , 
        //the controller function checks the credentials in the token 

        const token = jwt.sign(
            {
                id: userPayload.userId, // THE USERS ID IS THE SAME AS THE ID OF THE CREATOR OF THE GIG TO BE DELETED
                isSeller: userPayload.isSeller, // THIS IS NOT CHECKED WHEN DELETING A GIG
            },
            process.env.JWT_KEY
            );
       
       // ATTEMPTING TO DELETE THE ONE SUCCESFULLY CREATED GIG IN THE DATABASE

        const {body, statusCode} =  await request.delete(`/api/gigs/${gigPayload._id}`).set("Cookie",`accessToken=${token}`)
        
       // CONTROLLER WILL CHECK IF THE REQUESTER USERS ID MATCHES THE ID OF THE CREATOR OF THE GIG

        expect(statusCode).toBe(200)
        expect(body.successMessage).toBe("Gig has been deleted!")

        }, 70000);

         // END OF IT BLOCK
    
    }); // END OF DESCRIBE BLOCK       




}); // USER IS AUTHENTICATED ENDS HERE



}) // TESTS FOR THE DELETING A GIG CONTROLLER ENDS HERE





}); // THE BIG DESCRIBE FOR ALL GIG RELATED TESTS ENDS BELOW

