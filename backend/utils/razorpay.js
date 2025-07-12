import Razorpay from "razorpay"
import crypto from "crypto"
import dotenv from "dotenv"

dotenv.config()


if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error("Razorpay key_id or key_secret is missing in environment variables.");
}
// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
export const createOrder = async (amount, receipt, notes = {}) => {
  try {
    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency: "INR",
      receipt,
      notes,
    }

    const order = await razorpay.orders.create(options)
    return order
  } catch (error) {
    console.error("Razorpay order creation error:", error)
    throw new Error("Error creating Razorpay order")
  }
}

// Verify Razorpay payment
export const verifyPayment = (razorpayOrderId, razorpayPaymentId, signature) => {
  try {
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex")

    return generatedSignature === signature
  } catch (error) {
    console.error("Razorpay payment verification error:", error)
    throw new Error("Error verifying Razorpay payment")
  }
}

export default razorpay
