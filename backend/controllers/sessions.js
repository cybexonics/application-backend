import Course from "../models/Course.js"
import LiveSession from "../models/LiveSession.js"
import Enrollment from "../models/Enrollment.js"
import asyncHandler from "express-async-handler"
import { v4 as uuidv4 } from "uuid"
import jwt from "jsonwebtoken"

// @desc    Create live session
// @route   POST /api/courses/:id/sessions
// @access  Private (Teacher, Admin)
export const createSession = asyncHandler(async (req, res) => {
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
      message: "Not authorized to create sessions for this course",
    })
  }

  // Create session
  req.body.courseId = req.params.id
  req.body.roomId = uuidv4() // Generate unique room ID for WebRTC

  const session = await LiveSession.create(req.body)

  // Add session to course
  course.sessions.push(session._id)
  await course.save()

  res.status(201).json({
    success: true,
    data: session,
  })
})

// @desc    Get course sessions
// @route   GET /api/courses/:id/sessions
// @access  Private
export const getSessions = asyncHandler(async (req, res) => {
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
        message: "You must be enrolled in this course to access sessions",
      })
    }
  }

  // Get sessions
  const sessions = await LiveSession.find({ courseId: req.params.id }).sort("dateTime")

  res.status(200).json({
    success: true,
    count: sessions.length,
    data: sessions,
  })
})

// @desc    Get single session
// @route   GET /api/sessions/:sessionId
// @access  Private
export const getSession = asyncHandler(async (req, res) => {
  const session = await LiveSession.findById(req.params.sessionId)

  if (!session) {
    return res.status(404).json({
      success: false,
      message: "Session not found",
    })
  }

  const course = await Course.findById(session.courseId)

  // Check if user is enrolled or is course teacher/admin
  const isTeacher = req.user.role === "admin" || course.teacherIds.includes(req.user.id)

  if (!isTeacher) {
    const enrollment = await Enrollment.findOne({
      studentId: req.user.id,
      courseId: session.courseId,
      status: "active",
    })

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to access sessions",
      })
    }
  }

  res.status(200).json({
    success: true,
    data: session,
  })
})

// @desc    Update session
// @route   PUT /api/sessions/:sessionId
// @access  Private (Teacher, Admin)
export const updateSession = asyncHandler(async (req, res) => {
  const session = await LiveSession.findById(req.params.sessionId)

  if (!session) {
    return res.status(404).json({
      success: false,
      message: "Session not found",
    })
  }

  const course = await Course.findById(session.courseId)

  // Check if user is course teacher or admin
  if (req.user.role !== "admin" && !course.teacherIds.includes(req.user.id)) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to update this session",
    })
  }

  // Update session
  const updatedSession = await LiveSession.findByIdAndUpdate(req.params.sessionId, req.body, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    data: updatedSession,
  })
})

// @desc    Delete session
// @route   DELETE /api/sessions/:sessionId
// @access  Private (Teacher, Admin)
export const deleteSession = asyncHandler(async (req, res) => {
  const session = await LiveSession.findById(req.params.sessionId)

  if (!session) {
    return res.status(404).json({
      success: false,
      message: "Session not found",
    })
  }

  const course = await Course.findById(session.courseId)

  // Check if user is course teacher or admin
  if (req.user.role !== "admin" && !course.teacherIds.includes(req.user.id)) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to delete this session",
    })
  }

  await session.remove()

  // Remove session from course
  course.sessions = course.sessions.filter((id) => id.toString() !== req.params.sessionId)
  await course.save()

  res.status(200).json({
    success: true,
    data: {},
  })
})

// @desc    Get join token for session
// @route   GET /api/sessions/:sessionId/join-token
// @access  Private
export const getJoinToken = asyncHandler(async (req, res) => {
  const session = await LiveSession.findById(req.params.sessionId)

  if (!session) {
    return res.status(404).json({
      success: false,
      message: "Session not found",
    })
  }

  const course = await Course.findById(session.courseId)

  // Check if user is enrolled or is course teacher/admin
  const isTeacher = req.user.role === "admin" || course.teacherIds.includes(req.user.id)
  const role = isTeacher ? "teacher" : "student"

  if (!isTeacher) {
    const enrollment = await Enrollment.findOne({
      studentId: req.user.id,
      courseId: session.courseId,
      status: "active",
    })

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to join sessions",
      })
    }
  }

  // Check if session is live or upcoming
  if (session.status === "completed" || session.status === "cancelled") {
    return res.status(400).json({
      success: false,
      message: "This session is no longer available",
    })
  }

  // Generate join token
  const token = jwt.sign(
    {
      userId: req.user.id,
      userName: req.user.name,
      roomId: session.roomId,
      sessionId: session._id,
      role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "2h" },
  )

  res.status(200).json({
    success: true,
    token,
    roomId: session.roomId,
    role,
  })
})
