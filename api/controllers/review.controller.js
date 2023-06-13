import createError from "../utils/createError.js";
import Review from "../models/review.model.js";
import Gig from "../models/gig.model.js";
import Order from "../models/order.model.js";

export const createReview = async (req, res, next) => {

  
  // Check if the user purchased the gig.
  const newReview = new Review({
    userId: req.userId,
    gigId: req.body.gigId,
    desc: req.body.desc,
    star: req.body.star,
  });

  try {
    
    
    try {
      // CATCHES REQUEST BODY VALIDATION ERRORS WITH SPECIFIC DETAILS IN ERROR MESSAGE
      const validatedReview = newReview.validateSync()
      if(!!validatedReview) throw validatedReview;
      } catch (err) {
        console.log(err.message)
        return next(createError(400, err.message)); // SENDING A 400 CODE BACK AS THE USER IS RESPONSIBLE FOR THE ERROR
      }
// COMMENT BELOW TO GET 200 FOR ININTAIL USER ROLE TEST
      const review = await Review.findOne({
        gigId: req.body.gigId,
        userId: req.userId,
      });

    if (review)
      return next(
        createError(403, "You have already created a review for this gig!")
      );

    // Check if the user purchased the gig.

    const userCompletedOrders = await Order.find({
      buyerId: req.userId,
      gigId: newReview.gigId,
      isCompleted: true
    })
    
    if(!userCompletedOrders.length) return next(
      createError(403, "You must have completed an order for this gig to make a review!")
    )

   
    //IGNORING ABOVE FOR TEST SETUP PURPOSES
    // COMMENT ABOVE TO RUN REVIEW/USER ROLE TEST
    const savedReview = await newReview.save();

    await Gig.findByIdAndUpdate(req.body.gigId, {
      $inc: { totalStars: req.body.star, starNumber: 1 },
    });
    res.status(201).send(savedReview);
  } catch (err) {
    next(err);
  }
};

export const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ gigId: req.params.id });
    res.status(200).send(reviews);
  } catch (err) {
    next(err);
  }
};


export const updateReview = async (req, res, next) => {
    
    
    
    if(req.userId !== req.body.userId)
    return next(createError(403, "You can only update your review!"));

    const review = await Review.findOne({
      userId: req.body.userId, 
      gigId: req.body.gigId

    });
    if (!review) return next(createError(404, "That review does not exist!"));
    



  try {

    const updatedReview = await Review.findByIdAndUpdate(review._id,
    {
        ...req.body,
        userId: req.userId,
        gigId: review.gigId,
    },                         // Cannot update these details 
    {
      new : true,
      runValidators: true 
    }
    );

    const gig = await Gig.findById(review.gigId)
    
    await Gig.findByIdAndUpdate(review.gigId, {
        totalStars: (gig.totalStars + (req.body.star - review.star)), 
        starNumber: gig.starNumber

    });
    
    res.status(200).json(updatedReview._doc);
      
  } catch (err) {
    next(err);
  }
  
};


export const deleteReview = async (req, res, next) => {

  try {
    

    const review = await Review.findById(req.params.id);
    if (!review) return next(createError(404, "That review does not exist!"));

    if (req.userId !== review.userId) {
      return next(createError(403, "You can only delete your review!"));
    }
  
   
    try {

          await Review.findByIdAndDelete(review._id);
      
          await Gig.findByIdAndUpdate(review.gigId, {
            $inc: { totalStars: -review.star, starNumber: -1},
          });
      
    } catch (error) {
      return next(createError(400, error.message));
    } 

    res.status(200).json({"successMessage":"Review has been deleted!"});
      
  } catch (err) {
    next(err);
  }
  
};


