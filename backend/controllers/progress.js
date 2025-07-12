import Content from "../models/Content.js"
import Progress from "../models/Progress.js"
import Enrollment from "../models/Enrollment.js"
import asyncHandler from "express-async-handler"

// @desc    Get user progress for a course
// @route   GET /api/progress/:courseId
// @access  Private
export const getProgress = asyncHandler(async (req, res) => {
  // Check if user is enrolled
  const enrollment = await Enrollment.findOne({
    studentId: req.user.id,
    courseId: req.params.courseId,
    status: "active",
  })

  if (!enrollment) {
    return res.status(403).json({
      success: false,
      message: "You must be enrolled in this course to track progress",
    })
  }

  // Get progress
  let progress = await Progress.findOne({
    studentId: req.user.id,
    courseId: req.params.courseId,
  })

  // If no progress record exists, create one
  if (!progress) {
    progress = await Progress.create({
      studentId: req.user.id,
      courseId: req.params.courseId,
    })
  }

  // Get course content for context
  const content = await Content.find({ courseId: req.params.courseId }).select("_id title type order").sort("order")

  res.status(200).json({
    success: true,
    data: {
      progress,
      content,
      completedContent: progress.completedContentIds.map((id) => id.toString()),
    },
  })
})

// @desc    Update progress
// @route   POST /api/progress/update
// @access  Private
export const updateProgress = asyncHandler(async (req, res) => {
  const { courseId, contentId, completed } = req.body

  // Check if user is enrolled
  const enrollment = await Enrollment.findOne({
    studentId: req.user.id,
    courseId,
    status: "active",
  })

  if (!enrollment) {
    return res.status(403).json({
      success: false,
      message: "You must be enrolled in this course to update progress",
    })
  }

  // Check if content exists and belongs to the course
  const content = await Content.findOne({
    _id: contentId,
    courseId,
  })

  if (!content) {
    return res.status(404).json({
      success: false,
      message: "Content not found",
    })
  }

  // Get progress
  let progress = await Progress.findOne({
    studentId: req.user.id,
    courseId,
  })

  // If no progress record exists, create one
  if (!progress) {
    progress = await Progress.create({
      studentId: req.user.id,
      courseId,
    })
  }

  // Update completed content
  if (completed) {
    // Add content to completed list if not already there
    if (!progress.completedContentIds.includes(contentId)) {
      progress.completedContentIds.push(contentId)
    }
  } else {
    // Remove content from completed list
    progress.completedContentIds = progress.completedContentIds.filter((id) => id.toString() !== contentId)
  }

  // Calculate percentage complete
  const totalContent = await Content.countDocuments({ courseId })
  progress.percentComplete = (progress.completedContentIds.length / totalContent) * 100

  // Update last accessed time
  progress.lastAccessedAt = Date.now()

  await progress.save()

  res.status(200).json({
    success: true,
    data: progress,
  })
})
