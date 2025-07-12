import express from "express"
import { register, login, logout, getMe, forgotPassword, resetPassword } from "../controllers/auth.js"
import { protect } from "../middleware/auth.js"

const router = express.Router()

// Routes
router.post("/signup", register)
router.post("/login", login)
router.get("/logout", logout)
router.get("/me", protect, getMe)
router.post("/forgot-password", forgotPassword)
router.put("/reset-password/:resetToken", resetPassword)

export default router
