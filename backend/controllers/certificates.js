import Course from "../models/Course.js"
import Certificate from "../models/Certificate.js"
import Progress from "../models/Progress.js"
import Enrollment from "../models/Enrollment.js"
import asyncHandler from "express-async-handler"
import { generateCertificate as generateCertificatePDF } from "../utils/pdfGenerator.js"

// @desc    Get certificate for a course
// @route   GET /api/certificate/:courseId
// @access  Private
export const getCertificate = asyncHandler(async (req, res) => {
  // Check if user is enrolled
  const enrollment = await Enrollment.findOne({
    studentId: req.user.id,
    courseId: req.params.courseId,
    status: "active",
  })

  if (!enrollment) {
    return res.status(403).json({
      success: false,
      message: "You must be enrolled in this course to access certificates",
    })
  }

  // Check if certificate exists
  const certificate = await Certificate.findOne({
    studentId: req.user.id,
    courseId: req.params.courseId,
  })

  if (!certificate) {
    return res.status(404).json({
      success: false,
      message: "Certificate not found. Complete the course to generate a certificate.",
    })
  }

  res.status(200).json({
    success: true,
    data: certificate,
  })
})

// @desc    Generate certificate for a course
// @route   POST /api/certificate/:courseId/generate
// @access  Private
export const generateCertificate = asyncHandler(async (req, res) => {
  // Check if user is enrolled
  const enrollment = await Enrollment.findOne({
    studentId: req.user.id,
    courseId: req.params.courseId,
    status: "active",
  })

  if (!enrollment) {
    return res.status(403).json({
      success: false,
      message: "You must be enrolled in this course to generate a certificate",
    })
  }

  // Check if course is completed
  const progress = await Progress.findOne({
    studentId: req.user.id,
    courseId: req.params.courseId,
  })

  if (!progress || progress.percentComplete < 100) {
    return res.status(400).json({
      success: false,
      message: "You must complete the course to generate a certificate",
    })
  }

  // Check if certificate already exists
  let certificate = await Certificate.findOne({
    studentId: req.user.id,
    courseId: req.params.courseId,
  })

  if (certificate) {
    return res.status(200).json({
      success: true,
      data: certificate,
      message: "Certificate already generated",
    })
  }

  // Get course and user details
  const course = await Course.findById(req.params.courseId)
  const user = req.user

  // Generate certificate
  const { certificateId, pdfUrl } = await generateCertificatePDF(
    user.name,
    course.title,
    new Date(),
    course._id,
    user._id,
  )

  // Create certificate record
  certificate = await Certificate.create({
    studentId: req.user.id,
    courseId: req.params.courseId,
    pdfUrl,
    certificateId,
  })

  res.status(201).json({
    success: true,
    data: certificate,
  })
})

// @desc    Verify certificate
// @route   GET /api/certificate/verify/:certificateId
// @access  Public
export const verifyCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findOne({
    certificateId: req.params.certificateId,
  })
    .populate("studentId", "name")
    .populate("courseId", "title")

  if (!certificate) {
    return res.status(404).json({
      success: false,
      message: "Certificate not found or invalid",
    })
  }

  res.status(200).json({
    success: true,
    data: {
      certificateId: certificate.certificateId,
      studentName: certificate.studentId.name,
      courseName: certificate.courseId.title,
      issuedDate: certificate.issuedDate,
    },
    message: "Certificate is valid",
  })
})
