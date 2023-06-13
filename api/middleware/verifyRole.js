import { roles } from "../utils/roles.js"
import createError from "../utils/createError.js"

export const verifyAdminRole = async (req, res, next) => {
    console.log("ROLE VERIFICATION")
    console.log(req.role)
    const confirmRole = Object.values(roles).includes(req.role)
    console.log(confirmRole)
    if(!confirmRole)
    return next(createError(404,"role does not exist"))

    if(req.role !== roles.admin )
    return next(createError(403,`You are not authorised for the ${roles.admin} role `))
    
    // WILL CHECK IF THE ROLE IS ADMIN,
    // ADMIN HAS BASE SELLER RIGHTS
     
    next()


}

export const verifySellerRole = async (req, res, next) => {
    console.log("ROLE VERIFICATION")
    console.log(req.role)
    const confirmRole = Object.values(roles).includes(req.role)
    console.log(confirmRole)
    if(!confirmRole)
    return next(createError(404,"role does not exist"))

    if(req.role === roles.user )
    return next(createError(403,`You are only authorised for the ${roles.user} role `))
    
    // WILL CHECK IF THE ROLE IS EITHER A SELLER OR ADMIN,
    // ADMIN HAS BASE SELLER RIGHTS
     
    next()


}

export const verifyUserRole = async (req, res, next) => {
    console.log("ROLE VERIFICATION")
    const confirmRole = Object.values(roles).includes(req.role)
    console.log(confirmRole)
    if(!confirmRole)
    return next(createError(404,"role does not exist"))

    if(req.role !== roles.user )
    return next(createError(403,`You are not authorised for the ${roles.user} role `))
    
    // WILL CHECK IF THE ROLE IS EITHER A SELLER OR ADMIN,
    // THE ONLY OTHER ROLE IS USER
    
     
    next()


}