import express from "express"
import { createOrder, verifyPayment, getPaymentHistory } from "../controllers/payments.js"
import { protect } from "../middleware/auth.js"

const router = express.Router()

// Routes
router.post("/create-order", protect, createOrder)
router.post("/verify", protect, verifyPayment)
router.get("/history", protect, getPaymentHistory)

export default router
