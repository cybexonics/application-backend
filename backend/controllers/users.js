import User from "../models/User.js"
import asyncHandler from "express-async-handler"
import { uploadToCloudinary } from "../utils/cloudinary.js"

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)

  res.status(200).json({
    success: true,
    data: user,
  })
})

// @desc    Update user profile
// @route   PATCH /api/user/update-profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body

  // Build update object
  const updateFields = {}
  if (name) updateFields.name = name
  if (phone) updateFields.phone = phone

  // Update user
  const user = await User.findByIdAndUpdate(req.user.id, updateFields, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    data: user,
  })
})

// @desc    Upload profile image
// @route   POST /api/user/upload-profile-image
// @access  Private
export const uploadProfileImage = asyncHandler(async (req, res) => {
  // Check if file exists
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Please upload a file",
    })
  }

  try {
    // Convert buffer to base64
    const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`

    // Upload to Cloudinary
    const result = await uploadToCloudinary(fileStr, "profile-images")

    // Update user profile image
    const user = await User.findByIdAndUpdate(req.user.id, { profileImage: result.url }, { new: true })

    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error("Profile image upload error:", error)
    res.status(500).json({
      success: false,
      message: "Error uploading profile image",
    })
  }
})
