import User from "../models/user.model.js";
import createError from "../utils/createError.js";



// CRUD AND TESTING COMPLETE

export const getLoggedInUser = async (req, res, next) => {
  try {
        
        try {
          const user = await User.findById(req.userId);
          const { password, ...info } = user._doc;
          res.status(200).send(info);
        } catch (error) {
          return next(createError(400, error.message));
        }
     
    
  } catch (err) {
    next(err)
  }
  
};

export const getUser = async (req, res, next) => {
  try {

    const user = await User.findById(req.params.id);
    if (!user) return next(createError(404, "That user does not exist!"));

    const { password, ...info } = user._doc;
  
    res.status(200).send(info);
  } catch (err) {
    next(err)
  }
  
};

export const getUsers = async (req, res, next) => {

  try {

        // SETTING UP PAGINATION 
        const page = req.query.page || 0
        const limit = 20

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

      
      try {

        const users = await User.find(filters).sort({ [q.sort]: -1 }).skip(page * limit).limit(limit);
        res.status(200).json(users);
        
      } catch (error) {
        return next(createError(400,error.message));
        
      }
        


        // IF THERE ARE NO USERS IT WILL RETURN AN EMPTY ARRAY, ANY ERRORS ARE FROM THE SERVER

    
  } catch (err) {
    next(err);
  }
};


export const updateUser = async (req, res, next) => {

  try {

    const user = await User.findById(req.params.id);
    if (!user) return next(createError(404, "That user does not exist!"));

    if (req.userId !== user._id) {
      return next(createError(403, "You can only update your user details!"));
    }
  
    const updatedUser = await User.findByIdAndUpdate(req.params.id,
    {
        ...req.body,
        _id: req.userId,
        isSeller: req.isSeller,
        isAdmin: false,
        email: user.email     // Cannot update these details , username can be updated but still must be unique
    },
    {
      new : true,
    }
    );

    const { password, ...info } = updatedUser._doc;
  
    res.status(200).send(info);
      
  } catch (err) {
    next(err);
  }
  
};

export const deleteUser = async (req, res, next) => {

  try {

    const user = await User.findById(req.params.id);
    if (!user) return next(createError(404, "That user does not exist!"));

    if (req.userId !== user._id) {
      return next(createError(403, "You can only delete your user details!"));
    }
  
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({"successMessage":"User has been deleted!"});
      
  } catch (err) {
    next(err);
  }
  
};


