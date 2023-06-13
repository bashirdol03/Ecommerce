import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createReview,
  getReviews,
  deleteReview,
  updateReview
} from "../controllers/review.controller.js";
import { verifyUserRole } from "../middleware/verifyRole.js";


const router = express.Router();

router.post("/", authMiddleware, verifyUserRole ,createReview )
router.get("/:id", getReviews )
router.put("/", authMiddleware, verifyUserRole , updateReview)
router.delete("/:id", authMiddleware, verifyUserRole  ,deleteReview)




export default router;
