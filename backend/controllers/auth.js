import User from "../models/User.js"
import asyncHandler from "express-async-handler"
import { sendTokenResponse } from "../utils/jwtToken.js"
import crypto from "crypto"
import nodemailer from "nodemailer"

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role = "student", ...rest } = req.body

  // Check if user already exists
  const userExists = await User.findOne({ email })
  if (userExists) {
    return res.status(400).json({
      success: false,
      message: "User already exists",
    })
  }

  // Construct base user data
  let newUserData = {
    name,
    email,
    password,
    role,
    profile: {}, // placeholder for role-specific fields
  }

  // Assign role-based profile fields dynamically
  if (role === "teacher") {
    newUserData.profile = {...rest }
  } else if (role === "student") {
    newUserData.profile = {...rest }
  } else if (role === "admin") {
    newUserData.profile = { ...rest }
  }

  // Create user in DB
  const user = await User.create(newUserData)

  // Send token response
  sendTokenResponse(user, 201, res)
})

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // Validate email & password
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email and password",
    })
  }

  // Check for user
  const user = await User.findOne({ email }).select("+password")

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    })
  }

  // Check if password matches
  const isMatch = await user.comparePassword(password)

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    })
  }

  // Send token response
  sendTokenResponse(user, 200, res)
})

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  })

  res.status(200).json({
    success: true,
    message: "User logged out successfully",
  })
})

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)

  res.status(200).json({
    success: true,
    data: user,
  })
})

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email })

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    })
  }

  // Get reset token
  const resetToken = crypto.randomBytes(20).toString("hex")

  // Hash token and set to resetPasswordToken field
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")

  // Set expire
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000 // 10 minutes

  await user.save({ validateBeforeSave: false })

  // Create reset URL
  const resetUrl = `${req.protocol}://${req.get("host")}/api/auth/reset-password/${resetToken}`

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    // Send email
    await transporter.sendMail({
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: user.email,
      subject: "Password reset token",
      text: message,
    })

    res.status(200).json({
      success: true,
      message: "Email sent",
    })
  } catch (error) {
    console.error("Email send error:", error)

    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save({ validateBeforeSave: false })

    return res.status(500).json({
      success: false,
      message: "Email could not be sent",
    })
  }
})

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  // Get hashed token
  const resetPasswordToken = crypto.createHash("sha256").update(req.params.resetToken).digest("hex")

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  })

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid token",
    })
  }

  // Set new password
  user.password = req.body.password
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined

  await user.save()

  sendTokenResponse(user, 200, res)
})
