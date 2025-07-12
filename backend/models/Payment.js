import mongoose from "mongoose"

const paymentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student ID is required"],
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
    },
    razorpayOrderId: {
      type: String,
      required: [true, "Razorpay order ID is required"],
    },
    razorpayPaymentId: {
      type: String,
    },
    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["created", "authorized", "captured", "refunded", "failed"],
      default: "created",
    },
    paymentDate: {
      type: Date,
    },
    receipt: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

const Payment = mongoose.model("Payment", paymentSchema)

export default Payment
