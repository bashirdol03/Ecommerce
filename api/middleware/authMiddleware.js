import createError from "../utils/createError.js";

export const authMiddleware = (req, res, next) => {
  const session = req.session;
  session.isAuth ? console.log("LOGGED IN") : console.log("NOT LOGGED IN")
  if (!session.isAuth) return next(createError(401,"You are not authenticated!"))
  console.log("MIDDLEWARE") 
  console.log(req.sessionID)
    const user = session.user
    req.userId = user._id;
    req.role = user.role
    req.username = user.username
  //  console.log(req.role)
  //  console.log(req.userId) // PASSING OVER USER DATA FROM SESSION
  //  console.log(`${req.username} is Authenticated`) 
  next()
 
};
