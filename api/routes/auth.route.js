import express from "express";
import { register, login, logout, loginWithGoogle } from "../controllers/auth.controller.js";



const router = express.Router();

router.post("/register", register)
router.post("/login", login)
router.post("/loginWithGoogle", loginWithGoogle)
router.post("/logout", logout)


export default router; 