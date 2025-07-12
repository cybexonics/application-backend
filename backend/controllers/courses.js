import Course from "../models/Course.js"
import User from "../models/User.js"
import Enrollment from "../models/Enrollment.js"
import Progress from "../models/Progress.js"
import Review from "../models/Review.js"
import Payment from "../models/Payment.js"
import asyncHandler from "express-async-handler"
import { uploadToCloudinary } from "../utils/cloudinary.js"
import mongoose from "mongoose"

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = asyncHandler(async (req, res) => {
  // Build query
  const query = {}

  // Filter by category
  if (req.query.category) {
    query.category = req.query.category
  }

  // Filter by level
  if (req.query.level) {
    query.level = req.query.level
  }

  // Filter by price range
  if (req.query.minPrice && req.query.maxPrice) {
    query.price = {
      $gte: Number.parseInt(req.query.minPrice),
      $lte: Number.parseInt(req.query.maxPrice),
    }
  } else if (req.query.minPrice) {
    query.price = { $gte: Number.parseInt(req.query.minPrice) }
  } else if (req.query.maxPrice) {
    query.price = { $lte: Number.parseInt(req.query.maxPrice) }
  }

  // Filter by published status (default to published for public users)
  if (req.user && req.user.role === "teacher") {
    if (req.query.isPublished) {
      query.isPublished = req.query.isPublished === "true"
    }

    // Filter by teacher
    if (req.query.teacher === "me") {
      query.teacherIds = req.user._id
    }
  }
  // Search by title or description
  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: "i" } },
      { description: { $regex: req.query.search, $options: "i" } },
    ]
  }

  // Pagination
  const page = Number.parseInt(req.query.page, 10) || 1
  const limit = Number.parseInt(req.query.limit, 10) || 10
  const startIndex = (page - 1) * limit



  // Execute query
  const courses = await Course.find(query)
    .populate("teacherIds", "name profileImage")
    .skip(startIndex)
    .limit(limit)
    .sort(req.query.sort || "-createdAt")

  // Get total count
  const total = await Course.countDocuments(query)

  res.status(200).json({
    success: true,
    count: courses.length,
    total,
    pagination: {
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
    data: courses,
  })
})

// @desc    Get enrolled courses
// @route   GET /api/courses/enrolled
// @access  Private
export const getEnrolledCourses = asyncHandler(async (req, res) => {
  // Get enrollments for the user
  const enrollments = await Enrollment.find({
    studentId: req.user.id,
    status: "active",
  }).sort("-enrollmentDate")

  // Get course IDs from enrollments
  const courseIds = enrollments.map((enrollment) => enrollment.courseId)

  // Get courses
  const courses = await Course.find({
    _id: { $in: courseIds },
  }).populate("teacherIds", "name profileImage")

  // Get progress for each course
  const progressData = await Progress.find({
    studentId: req.user.id,
    courseId: { $in: courseIds },
  })

  // Map progress to courses
  const coursesWithProgress = courses.map((course) => {
    const enrollment = enrollments.find((e) => e.courseId.toString() === course._id.toString())
    const progress = progressData.find((p) => p.courseId.toString() === course._id.toString())

    return {
      ...course.toObject(),
      enrollmentDate: enrollment ? enrollment.enrollmentDate : null,
      progress: progress ? progress.percentComplete : 0,
    }
  })

  // Pagination
  const page = Number.parseInt(req.query.page, 10) || 1
  const limit = Number.parseInt(req.query.limit, 10) || 10
  const startIndex = (page - 1) * limit
  const endIndex = page * limit

  // Slice the array for pagination
  const paginatedCourses = coursesWithProgress.slice(startIndex, endIndex)

  res.status(200).json({
    success: true,
    count: paginatedCourses.length,
    total: coursesWithProgress.length,
    pagination: {
      page,
      limit,
      pages: Math.ceil(coursesWithProgress.length / limit),
    },
    data: paginatedCourses,
  })
})

// @desc    Get teaching courses
// @route   GET /api/courses/teaching
// @access  Private (Teacher, Admin)
export const getTeachingCourses = asyncHandler(async (req, res) => {
  // Build query
  const query = {
    teacherIds: req.user.id,
  }

  // Filter by published status
  if (req.query.isPublished) {
    query.isPublished = req.query.isPublished === "true"
  }

  // Pagination
  const page = Number.parseInt(req.query.page, 10) || 1
  const limit = Number.parseInt(req.query.limit, 10) || 10
  const startIndex = (page - 1) * limit

  // Execute query
  const courses = await Course.find(query).skip(startIndex).limit(limit).sort(req.query.sort || "-createdAt")

  // Get total count
  const total = await Course.countDocuments(query)

  // Get enrollment counts and revenue for each course
  const coursesWithStats = await Promise.all(
    courses.map(async (course) => {
      // Get enrollment count
      const enrollmentCount = course.enrolledStudentIds.length

      // Get revenue
      const payments = await Payment.find({
        courseId: course._id,
        status: "captured",
      })
      const revenue = payments.reduce((sum, payment) => sum + payment.amount, 0)

      return {
        ...course.toObject(),
        enrollmentCount,
        revenue,
      }
    }),
  )

  res.status(200).json({
    success: true,
    count: coursesWithStats.length,
    total,
    pagination: {
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
    data: coursesWithStats,
  })
})

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
export const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate("teacherIds", "name profileImage")
    .populate("content", "title type duration order")

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    })
  }

  // Get reviews
  const reviews = await Review.find({ courseId: req.params.id })
    .populate("userId", "name profileImage")
    .sort("-createdAt")
    .limit(5)

  // Calculate average rating
  const avgRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  // Check if user is enrolled
  let isEnrolled = false
  let progress = null

  if (req.user) {
    const enrollment = await Enrollment.findOne({
      studentId: req.user.id,
      courseId: req.params.id,
      status: "active",
    })

    isEnrolled = !!enrollment

    if (isEnrolled) {
      progress = await Progress.findOne({
        studentId: req.user.id,
        courseId: req.params.id,
      })
    }
  }

  res.status(200).json({
    success: true,
    data: {
      ...course.toObject(),
      reviews,
      avgRating,
      reviewCount: reviews.length,
      isEnrolled,
      progress: progress ? progress.percentComplete : null,
    },
  })
})

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Teacher, Admin)
export const createCourse = asyncHandler(async (req, res) => {
  // Add current user as teacher
  req.body.teacherIds = [req.user.id]

  // Create course
  const course = await Course.create(req.body)

  res.status(201).json({
    success: true,
    data: course,
  })
})

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Teacher, Admin)
export const updateCourse = asyncHandler(async (req, res) => {
  let course = await Course.findById(req.params.id)

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
      message: "Not authorized to update this course",
    })
  }

  // Update course
  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    data: course,
  })
})

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Teacher, Admin)
export const deleteCourse = asyncHandler(async (req, res) => {
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
      message: "Not authorized to delete this course",
    })
  }

  await course.remove()

  res.status(200).json({
    success: true,
    data: {},
  })
})

// @desc    Upload course thumbnail
// @route   POST /api/courses/:id/upload-thumbnail
// @access  Private (Teacher, Admin)
export const uploadCourseThumbnail = asyncHandler(async (req, res) => {
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
      message: "Not authorized to update this course",
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
    const result = await uploadToCloudinary(fileStr, "course-thumbnails")

    // Update course thumbnail
    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, { thumbnailUrl: result.url }, { new: true })

    res.status(200).json({
      success: true,
      data: updatedCourse,
    })
  } catch (error) {
    console.error("Thumbnail upload error:", error)
    res.status(500).json({
      success: false,
      message: "Error uploading thumbnail",
    })
  }
})

// @desc    Get course reviews
// @route   GET /api/courses/:id/reviews
// @access  Public
export const getCourseReviews = asyncHandler(async (req, res) => {
  // Pagination
  const page = Number.parseInt(req.query.page, 10) || 1
  const limit = Number.parseInt(req.query.limit, 10) || 10
  const startIndex = (page - 1) * limit

  // Get reviews
  const reviews = await Review.find({ courseId: req.params.id })
    .populate("userId", "name profileImage")
    .skip(startIndex)
    .limit(limit)
    .sort("-createdAt")

  // Get total count
  const total = await Review.countDocuments({ courseId: req.params.id })

  // Calculate average rating
  const avgRating =
    total > 0
      ? (await Review.aggregate([
          { $match: { courseId: mongoose.Types.ObjectId(req.params.id) } },
          { $group: { _id: null, avgRating: { $avg: "$rating" } } },
        ]))[0]?.avgRating || 0
      : 0

  // Get rating distribution
  const ratingDistribution = await Review.aggregate([
    { $match: { courseId: mongoose.Types.ObjectId(req.params.id) } },
    { $group: { _id: "$rating", count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
  ])

  // Format rating distribution
  const formattedRatingDistribution = {}
  for (let i = 5; i >= 1; i--) {
    formattedRatingDistribution[i] = ratingDistribution.find((item) => item._id === i)?.count || 0
  }

  res.status(200).json({
    success: true,
    count: reviews.length,
    total,
    pagination: {
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
    avgRating,
    ratingDistribution: formattedRatingDistribution,
    data: reviews,
  })
})

// @desc    Add course review
// @route   POST /api/courses/:id/reviews
// @access  Private
export const addCourseReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body

  // Check if course exists
  const course = await Course.findById(req.params.id)

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    })
  }

  // Check if user is enrolled
  const enrollment = await Enrollment.findOne({
    studentId: req.user.id,
    courseId: req.params.id,
    status: "active",
  })

  if (!enrollment) {
    return res.status(403).json({
      success: false,
      message: "You must be enrolled in this course to review it",
    })
  }

  // Check if user already reviewed this course
  const existingReview = await Review.findOne({
    userId: req.user.id,
    courseId: req.params.id,
  })

  if (existingReview) {
    return res.status(400).json({
      success: false,
      message: "You have already reviewed this course",
    })
  }

  // Create review
  const review = await Review.create({
    userId: req.user.id,
    courseId: req.params.id,
    rating,
    comment,
  })

  // Populate user data
  await review.populate("userId", "name profileImage").execPopulate()

  res.status(201).json({
    success: true,
    data: review,
  })
})

// @desc    Update course review
// @route   PUT /api/courses/:id/reviews/:reviewId
// @access  Private
export const updateCourseReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body

  // Check if review exists
  const review = await Review.findById(req.params.reviewId)

  if (!review) {
    return res.status(404).json({
      success: false,
      message: "Review not found",
    })
  }

  // Check if user owns the review
  if (review.userId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to update this review",
    })
  }

  // Update review
  review.rating = rating || review.rating
  review.comment = comment || review.comment
  await review.save()

  // Populate user data
  await review.populate("userId", "name profileImage").execPopulate()

  res.status(200).json({
    success: true,
    data: review,
  })
})

// @desc    Delete course review
// @route   DELETE /api/courses/:id/reviews/:reviewId
// @access  Private
export const deleteCourseReview = asyncHandler(async (req, res) => {
  // Check if review exists
  const review = await Review.findById(req.params.reviewId)

  if (!review) {
    return res.status(404).json({
      success: false,
      message: "Review not found",
    })
  }

  // Check if user owns the review or is admin
  if (review.userId.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Not authorized to delete this review",
    })
  }

  await review.remove()

  res.status(200).json({
    success: true,
    data: {},
  })
})

// @desc    Get recommended courses
// @route   GET /api/courses/recommended
// @access  Private
export const getRecommendedCourses = asyncHandler(async (req, res) => {
  // Get user enrollments
  const enrollments = await Enrollment.find({
    studentId: req.user.id,
    status: "active",
  })

  // Get enrolled course IDs
  const enrolledCourseIds = enrollments.map((enrollment) => enrollment.courseId)

  // Get enrolled courses
  const enrolledCourses = await Course.find({
    _id: { $in: enrolledCourseIds },
  })

  // Extract categories and levels from enrolled courses
  const categories = [...new Set(enrolledCourses.map((course) => course.category))]
  const levels = [...new Set(enrolledCourses.map((course) => course.level))]

  // Build query for recommended courses
  const query = {
    _id: { $nin: enrolledCourseIds }, // Exclude enrolled courses
    isPublished: true,
    $or: [
      { category: { $in: categories } }, // Same categories
      { level: { $in: levels } }, // Same levels
    ],
  }

  // Get recommended courses
  const recommendedCourses = await Course.find(query)
    .populate("teacherIds", "name profileImage")
    .limit(10)
    .sort("-createdAt")

  res.status(200).json({
    success: true,
    count: recommendedCourses.length,
    data: recommendedCourses,
  })
})

// @desc    Get popular courses
// @route   GET /api/courses/popular
// @access  Public
export const getPopularCourses = asyncHandler(async (req, res) => {
  // Get courses with most enrollments
  const popularCourses = await Course.aggregate([
    { $match: { isPublished: true } },
    { $project: { title: 1, description: 1, price: 1, thumbnailUrl: 1, category: 1, level: 1, enrollmentCount: { $size: "$enrolledStudentIds" } } },
    { $sort: { enrollmentCount: -1 } },
    { $limit: 10 },
  ])

  // Populate teacher data
  const coursesWithTeachers = await Course.populate(popularCourses, {
    path: "teacherIds",
    select: "name profileImage",
  })

  res.status(200).json({
    success: true,
    count: coursesWithTeachers.length,
    data: coursesWithTeachers,
  })
})

// @desc    Get related courses
// @route   GET /api/courses/:id/related
// @access  Public
export const getRelatedCourses = asyncHandler(async (req, res) => {
  // Get the course
  const course = await Course.findById(req.params.id)

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    })
  }

  // Get related courses (same category or level)
  const relatedCourses = await Course.find({
    _id: { $ne: req.params.id }, // Exclude current course
    isPublished: true,
    $or: [
      { category: course.category },
      { level: course.level },
    ],
  })
    .populate("teacherIds", "name profileImage")
    .limit(6)
    .sort("-createdAt")

  res.status(200).json({
    success: true,
    count: relatedCourses.length,
    data: relatedCourses,
  })
})
