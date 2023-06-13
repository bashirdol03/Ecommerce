import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getOrders, createOrder, updateOrder, deleteOrder } from "../controllers/order.controller.js";
import { verifySellerRole , verifyUserRole } from "../middleware/verifyRole.js";


const router = express.Router();


router.get("/", authMiddleware, getOrders);
router.post("/:id", authMiddleware, verifyUserRole, createOrder);
router.put("/:id", authMiddleware, verifySellerRole, updateOrder);
router.delete("/:id", authMiddleware, verifySellerRole, deleteOrder);
export default router;
