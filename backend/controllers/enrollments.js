import Course from "../models/Course.js"
import Enrollment from "../models/Enrollment.js"
import Progress from "../models/Progress.js"
import asyncHandler from "express-async-handler"

// @desc    Get user enrollments
// @route   GET /api/enrollments
// @access  Private
export const getEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ studentId: req.user.id, status: "active" })
    .populate("courseId", "title description thumbnailUrl")
    .sort("-enrollmentDate")

  res.status(200).json({
    success: true,
    count: enrollments.length,
    data: enrollments,
  })
})

// @desc    Enroll in course (after payment)
// @route   POST /api/enrollments/:courseId
// @access  Private
export const enrollCourse = asyncHandler(async (req, res) => {
  const { paymentId } = req.body

  // Check if course exists
  const course = await Course.findById(req.params.courseId)

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    })
  }

  // Check if already enrolled
  const existingEnrollment = await Enrollment.findOne({
    studentId: req.user.id,
    courseId: req.params.courseId,
    status: "active",
  })

  if (existingEnrollment) {
    return res.status(400).json({
      success: false,
      message: "You are already enrolled in this course",
    })
  }

  // Create enrollment
  const enrollment = await Enrollment.create({
    studentId: req.user.id,
    courseId: req.params.courseId,
    paymentId,
  })

  // Add student to course enrolled students
  await Course.findByIdAndUpdate(req.params.courseId, { $addToSet: { enrolledStudentIds: req.user.id } })

  // Create progress record
  await Progress.create({
    studentId: req.user.id,
    courseId: req.params.courseId,
  })

  res.status(201).json({
    success: true,
    data: enrollment,
  })
})

// @desc    Cancel enrollment
// @route   DELETE /api/enrollments/:enrollmentId
// @access  Private
export const cancelEnrollment = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.enrollmentId)

  if (!enrollment) {
    return res.status(404).json({
      success: false,
      message: "Enrollment not found",
    })
  }

  // Check if user owns the enrollment
  if (enrollment.studentId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to cancel this enrollment",
    })
  }

  // Update enrollment status
  enrollment.status = "cancelled"
  await enrollment.save()

  // Remove student from course enrolled students
  await Course.findByIdAndUpdate(enrollment.courseId, { $pull: { enrolledStudentIds: req.user.id } })

  res.status(200).json({
    success: true,
    data: {},
  })
})
