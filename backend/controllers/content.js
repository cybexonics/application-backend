import Course from "../models/Course.js"
import Content from "../models/Content.js"
import Enrollment from "../models/Enrollment.js"
import asyncHandler from "express-async-handler"
import { uploadToCloudinary } from "../utils/cloudinary.js"

// @desc    Add content to course
// @route   POST /api/courses/:id/content
// @access  Private (Teacher, Admin)
export const addContent = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    })
  }

  // Check if user is course teacher or admin
  if (req.user.role !== "admin" && !course.teacherIds.includes(req.user.id)) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to add content to this course",
    })
  }

  // Create content
  req.body.courseId = req.params.id
  const content = await Content.create(req.body)

  // Add content to course
  course.content.push(content._id)
  await course.save()

  res.status(201).json({
    success: true,
    data: content,
  })
})

// @desc    Get course content
// @route   GET /api/courses/:id/content
// @access  Private
export const getContent = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    })
  }

  // Check if user is enrolled or is course teacher/admin
  const isTeacher = req.user.role === "admin" || course.teacherIds.includes(req.user.id)

  if (!isTeacher) {
    const enrollment = await Enrollment.findOne({
      studentId: req.user.id,
      courseId: req.params.id,
      status: "active",
    })

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to access content",
      })
    }
  }

  // Get content
  const content = await Content.find({ courseId: req.params.id }).sort("order")

  res.status(200).json({
    success: true,
    count: content.length,
    data: content,
  })
})

// @desc    Update content
// @route   PUT /api/courses/:id/content/:contentId
// @access  Private (Teacher, Admin)
export const updateContent = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    })
  }

  // Check if user is course teacher or admin
  if (req.user.role !== "admin" && !course.teacherIds.includes(req.user.id)) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to update content for this course",
    })
  }

  // Update content
  const content = await Content.findByIdAndUpdate(req.params.contentId, req.body, {
    new: true,
    runValidators: true,
  })

  if (!content) {
    return res.status(404).json({
      success: false,
      message: "Content not found",
    })
  }

  res.status(200).json({
    success: true,
    data: content,
  })
})

// @desc    Delete content
// @route   DELETE /api/courses/:id/content/:contentId
// @access  Private (Teacher, Admin)
export const deleteContent = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    })
  }

  // Check if user is course teacher or admin
  if (req.user.role !== "admin" && !course.teacherIds.includes(req.user.id)) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to delete content for this course",
    })
  }

  // Delete content
  const content = await Content.findById(req.params.contentId)

  if (!content) {
    return res.status(404).json({
      success: false,
      message: "Content not found",
    })
  }

  await content.remove()

  // Remove content from course
  course.content = course.content.filter((id) => id.toString() !== req.params.contentId)
  await course.save()

  res.status(200).json({
    success: true,
    data: {},
  })
})

// @desc    Upload content file (video or PDF)
// @route   POST /api/courses/:id/content/upload
// @access  Private (Teacher, Admin)
export const uploadContentFile = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    })
  }

  // Check if user is course teacher or admin
  if (req.user.role !== "admin" && !course.teacherIds.includes(req.user.id)) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to upload content for this course",
    })
  }

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
    const result = await uploadToCloudinary(fileStr, "course-content")

    res.status(200).json({
      success: true,
      url: result.url,
      message: "File uploaded successfully",
    })
  } catch (error) {
    console.error("Content file upload error:", error)
    res.status(500).json({
      success: false,
      message: "Error uploading content file",
    })
  }
})
