import express from "express";
import {
  createGig,
  getGig,
  getGigs,
  updateGig,
  deleteGig

} from "../controllers/gig.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { verifySellerRole } from "../middleware/verifyRole.js";



const router = express.Router();



router.post("/", authMiddleware, verifySellerRole,createGig);
router.delete("/:id", authMiddleware, verifySellerRole, deleteGig);
router.put("/:id", authMiddleware, verifySellerRole, updateGig);
router.get("/single/:id", getGig);
router.get("/", getGigs);

export default router;
