import createError from "../utils/createError.js";
import Order from "../models/order.model.js";
import Gig from "../models/gig.model.js";

export const createOrder = async (req, res, next) => {

  try {

        const gig = await Gig.findById(req.params.id);
      
        const newOrder = new Order({
          gigId: gig._id,
          img: gig.coverImage,
          title: gig.title,
          buyerId: req.userId,
          sellerId: gig.userId,
          price: gig.price,
          
        });  // ONLY WAY TO MAKE AN ORDER IS WITH THE LOGGGED IN USERS ID
        // FROM THE SESSSION DATA, NOT FROM THE CLIENT
        // 


        try {
          // CATCHES REQUEST BODY VALIDATION ERRORS WITH SPECIFIC DETAILS IN ERROR MESSAGE
          const validatedOrder = newOrder.validateSync()
          if(!!validatedOrder) throw validatedOrder;
          } catch (err) {
            return next(createError(400, err.message)); // SENDING A 400 CODE BACK AS THE USER IS RESPONSIBLE FOR THE ERROR
          }

        await newOrder.save();

        res.status(200).json(newOrder);
    
    } catch (err) {
      next(err)
    }
  
};

export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      ...(req.role !== "USER" ? { sellerId: req.userId } : { buyerId: req.userId })
    });

    res.status(200).send(orders);
  } catch (err) {
    next(err);
  }
};

export const updateOrder = async (req, res, next) => {
  try {
    
    const order = await Order.findById(req.params.id)
    if (!order) return next(createError(404, "That order does not exist!"));
     
    if(req.userId !== order.sellerId)
    return next(createError(403, "You can only update your order!"));

    try {
        
      const updatedOrder = await Order.findOneAndUpdate(
        {
          _id: order._id,
        },
        {
          $set: {
            isCompleted: true,
          },
          new: true
        }
      );
  
      res.status(200).send(updatedOrder);
    } catch (err) {
      return next(createError(400, err.message));
    }  

  } catch (err) {
    next(err);
  }
};

export const deleteOrder = async (req, res, next) => {

  try {

    const order = await Order.findById(req.params.id);
    if (!order) return next(createError(404, "That order does not exist!"));

    if (req.userId !== order.sellerId) {
      return next(createError(403, "You can only delete your orders!"));
    }
      
      try {
        await Order.findByIdAndDelete(req.params.id, 
        {
          _id: order._id,
          isCompleted: false
        })
      } catch (err) {
        return next(createError(400, err.message));
      }   

      res.status(200).json({"successMessage":"Order has been deleted!"});
      
  } catch (err) {
    next(err);
  }
  
};