import Course from "../models/Course.js"
import Payment from "../models/Payment.js"
import Enrollment from "../models/Enrollment.js"
import asyncHandler from "express-async-handler"
import { createOrder as createRazorpayOrder, verifyPayment as verifyRazorpayPayment } from "../utils/razorpay.js"

// @desc    Create payment order
// @route   POST /api/payments/create-order
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const { courseId } = req.body

  // Check if course exists
  const course = await Course.findById(courseId)

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    })
  }

  // Check if user is already enrolled
  const existingEnrollment = await Enrollment.findOne({
    studentId: req.user.id,
    courseId,
    status: "active",
  })

  if (existingEnrollment) {
    return res.status(400).json({
      success: false,
      message: "You are already enrolled in this course",
    })
  }

  // Create receipt ID
  const receipt = `receipt_${Date.now()}`

  // Create Razorpay order
  const order = await createRazorpayOrder(course.price, receipt, {
    courseId,
    userId: req.user.id,
  })

  // Create payment record
  const payment = await Payment.create({
    studentId: req.user.id,
    courseId,
    razorpayOrderId: order.id,
    amount: course.price,
    receipt,
  })

  res.status(201).json({
    success: true,
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      paymentId: payment._id,
    },
  })
})

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body

  // Verify payment signature
  const isValid = verifyRazorpayPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature)

  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: "Payment verification failed",
    })
  }

  // Update payment record
  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId },
    {
      razorpayPaymentId,
      status: "captured",
      paymentDate: Date.now(),
    },
    { new: true },
  )

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: "Payment not found",
    })
  }

  // Create enrollment
  const enrollment = await Enrollment.create({
    studentId: payment.studentId,
    courseId: payment.courseId,
    paymentId: payment._id,
  })

  // Add student to course enrolled students
  await Course.findByIdAndUpdate(payment.courseId, { $addToSet: { enrolledStudentIds: payment.studentId } })

  res.status(200).json({
    success: true,
    data: {
      payment,
      enrollment,
    },
  })
})

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
export const getPaymentHistory = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ studentId: req.user.id })
    .populate("courseId", "title thumbnailUrl")
    .sort("-createdAt")

  res.status(200).json({
    success: true,
    count: payments.length,
    data: payments,
  })
})
