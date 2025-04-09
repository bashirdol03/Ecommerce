import Gig from "../models/gig.model.js";
import Order from '../models/order.model.js'
import createError from "../utils/createError.js";

// CRUD AND TESTING COMPLETE

export const createGig = async (req, res, next) => {

  console.log(req.body)
  
  try {
        
        const newGig = new Gig({
          // ENSURES ONLY THE LOGGED IN USERS ID IS ATTRIBUTED TO THE GIG, AND THEY ARE NOT REQUIRED TO GIVE THEIR USER ID
          ...req.body,
          userId: req.userId, // Override the user id given by the user, there is already one generated
        });


       try {
        // CATCHES REQUEST BODY VALIDATION ERRORS WITH SPECIFIC DETAILS IN ERROR MESSAGE
        const validatedGig = newGig.validateSync()
        if(!!validatedGig) throw validatedGig;
        } catch (err) {
          return next(createError(400, err.message)); // SENDING A 400 CODE BACK AS THE USER IS RESPONSIBLE FOR THE ERROR
        }

        try {
        // CATCHES REQUEST BODY DUPLICATE ERRORS WITH SPECIFIC DETAILS IN ERROR MESSAGE
          const savedGig = await newGig.save()
          res.status(201).json(savedGig);
        } catch (err) {
          return next(createError(409, err.message)); // SENDING A 400 CODE BACK AS THE USER IS RESPONSIBLE FOR THE ERROR
        }
    
  } catch (err) {
    next(err)
  }

    

};  



export const getGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return next(createError(404, "That gig does not exist!"));
    res.status(200).json(gig);
  } catch (err) {
    next(err);
  }
};
  
  
  
export const getGigs = async (req, res, next) => {

  try {

        // SETTING UP PAGINATION 
        const page = req.query.page || 0
        const limit = 8

        const q = req.query;

        // CODE TO FILTER AND SEARCH A LIST OF GIGS

        const filters = {
          ...(q.userId && { userId: q.userId }),
          ...(q.cat && { cat: q.cat }),
          ...((q.min || q.max) && {
            price: {
              ...(q.min && { $gt: q.min }),
              ...(q.max && { $lt: q.max }),
            },
          }),
          ...(q.search && { title: { $regex: q.search, $options: "i" } }),
        };



        const gigs = await Gig.find(filters).sort({ [q.sort]: -1 }).skip(page * limit).limit(limit);
        res.status(200).json(gigs);
        // IF THERE ARE NO GIGS IT WILL RETURN AN EMPTY ARRAY, ANY ERRORS ARE FROM THE SERVER

    
  } catch (err) {
    next(err);
  }
};



export const updateGig = async (req, res, next) => {
  try {
    
    const gig = await Gig.findById(req.params.id);
    if(!gig) return next(createError(404, "That gig does not exist!"));

    if (gig.userId !== req.userId)
      return next(createError(403, "You can only update your gigs!"));

    // USING GIG DETAILS BELOW AS WE CANNOT TRUST THE CLIENT TO GIVE
    // CORRECT DETAILS FOR SENSITIVE DATA LIKE THE PRICE   
    

    const updatedGig = await Gig.findByIdAndUpdate(req.params.id, 
      {               // FIELDS NOT UPDATED WILL STAY THE SAME
        ...req.body,
        // THE USER CANNOT UPDATE THE FOLLOWING GIG DETAILS 
        _id: gig._id,
        userId: req.userId, // ENSURES ONLY THE LOGGED IN USERS ID IS ATTRIBUTED TO THE GIG, 
        sales: gig.sales,   // AND THEY ARE NOT REQUIRED TO GIVE THEIR USER ID
        totalStars: gig.totalStars,
        starNumber: gig.starNumber
      },
      {
        new : true,  // returns updated document
        runValidators: true 

      });

      // UPDATING ALL THE ORDERS WITH THE NEW UPDATED GIG DETAILS
      const updatedOrder = await Order.updateMany( {gigId : updatedGig._id},
        { 
          // THE USER CANNOT UPDATE THE FOLLOWING GIG DETAILS 
          img: updatedGig.coverImage,
          title: updatedGig.title,
          price: updatedGig.price,
        } )


    res.status(200).json(updatedGig);

    // IF THE USER TRIES TO UPDATE A NON-EXISTENT FIELD, NOTHING WILL HAPPEN, SO ANY ERRORS HERE ARE FROM THE SERVER
        
        

  } catch (err) {
    next(err);
  }
};



export const deleteGig = async (req, res, next) => {
  try {
    
    const gig = await Gig.findById(req.params.id);
    if(!gig) return next(createError(404, "That gig does not exist!"));

    if (gig.userId !== req.userId)
      return next(createError(403, "You can only delete your gigs!"));

    await Gig.findByIdAndDelete(req.params.id);
    await Order.deleteMany({gigId : gig._id});
    res.status(200).json({"successMessage":"Gig has been deleted!"});
  } catch (err) {
    next(err);
  }
};


