import express from "express";
import { deleteUser, getUser, getUsers, updateUser, getLoggedInUser } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { verifyAdminRole } from "../middleware/verifyRole.js";

const router = express.Router();

router.delete("/:id", authMiddleware, deleteUser);
router.put("/:id", authMiddleware, updateUser)
router.get("/:id", getUser);
router.get("/current/user", authMiddleware, getLoggedInUser);
router.get("/", authMiddleware, verifyAdminRole, getUsers);

export default router;

