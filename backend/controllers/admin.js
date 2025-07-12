import User from "../models/User.js"
import Course from "../models/Course.js"
import Enrollment from "../models/Enrollment.js"
import Payment from "../models/Payment.js"
import asyncHandler from "express-async-handler"
import mongoose from "mongoose"

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getUsers = asyncHandler(async (req, res) => {
  // Build query
  const query = {}

  // Filter by role
  if (req.query.role) {
    query.role = req.query.role
  }

  // Search by name or email
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { email: { $regex: req.query.search, $options: "i" } },
    ]
  }

  // Pagination
  const page = Number.parseInt(req.query.page, 10) || 1
  const limit = Number.parseInt(req.query.limit, 10) || 10
  const startIndex = (page - 1) * limit

  // Execute query
  const users = await User.find(query).select("-password").skip(startIndex).limit(limit).sort("-createdAt")

  // Get total count
  const total = await User.countDocuments(query)

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    pagination: {
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
    data: users,
  })
})

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password")

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    })
  }

  // Get additional user data
  const enrollments = await Enrollment.countDocuments({ studentId: user._id })
  const coursesCreated = await Course.countDocuments({ teacherIds: user._id })
  const payments = await Payment.find({ studentId: user._id })
  const totalSpent = payments.reduce((sum, payment) => sum + payment.amount, 0)

  res.status(200).json({
    success: true,
    data: {
      user,
      stats: {
        enrollments,
        coursesCreated,
        totalSpent,
      },
    },
  })
})

// @desc    Update user role
// @route   PATCH /api/admin/users/:id/role
// @access  Private (Admin)
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body

  // Validate role
  if (!["student", "teacher", "admin"].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Invalid role",
    })
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password")

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    })
  }

  res.status(200).json({
    success: true,
    data: user,
  })
})

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    })
  }

  // Prevent deleting self
  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: "Cannot delete your own account",
    })
  }

  await user.remove()

  res.status(200).json({
    success: true,
    data: {},
  })
})

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics/dashboard
// @access  Private (Admin)
export const getDashboardAnalytics = asyncHandler(async (req, res) => {
  // Get total counts
  const totalUsers = await User.countDocuments()
  const totalCourses = await Course.countDocuments()
  const totalEnrollments = await Enrollment.countDocuments()

  // Get users by role
  const usersByRole = await User.aggregate([
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
      },
    },
  ])

  // Format users by role
  const usersByRoleFormatted = {}
  usersByRole.forEach((item) => {
    usersByRoleFormatted[item._id] = item.count
  })

  // Get total revenue
  const payments = await Payment.find({ status: "captured" })
  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0)

  // Get revenue by month (last 6 months)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const revenueByMonth = await Payment.aggregate([
    {
      $match: {
        status: "captured",
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
        revenue: { $sum: "$amount" },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
  ])

  // Format revenue by month
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const revenueByMonthFormatted = revenueByMonth.map((item) => ({
    month: months[item._id.month - 1],
    year: item._id.year,
    revenue: item.revenue,
  }))

  // Get enrollments by month (last 6 months)
  const enrollmentsByMonth = await Enrollment.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
        enrollments: { $sum: 1 },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
  ])

  // Format enrollments by month
  const enrollmentsByMonthFormatted = enrollmentsByMonth.map((item) => ({
    month: months[item._id.month - 1],
    year: item._id.year,
    enrollments: item.enrollments,
  }))

  // Get top courses by enrollment
  const topCoursesByEnrollment = await Course.aggregate([
    {
      $project: {
        title: 1,
        enrollmentCount: { $size: "$enrolledStudentIds" },
      },
    },
    {
      $sort: { enrollmentCount: -1 },
    },
    {
      $limit: 5,
    },
  ])

  // Get top courses by revenue
  const topCoursesByRevenue = await Payment.aggregate([
    {
      $match: { status: "captured" },
    },
    {
      $group: {
        _id: "$courseId",
        revenue: { $sum: "$amount" },
      },
    },
    {
      $sort: { revenue: -1 },
    },
    {
      $limit: 5,
    },
    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "_id",
        as: "course",
      },
    },
    {
      $unwind: "$course",
    },
    {
      $project: {
        _id: 1,
        title: "$course.title",
        revenue: 1,
      },
    },
  ])

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalRevenue,
      usersByRole: usersByRoleFormatted,
      revenueByMonth: revenueByMonthFormatted,
      enrollmentsByMonth: enrollmentsByMonthFormatted,
      topCourses: {
        byEnrollment: topCoursesByEnrollment,
        byRevenue: topCoursesByRevenue,
      },
    },
  })
})

// @desc    Get course analytics
// @route   GET /api/admin/analytics/courses
// @access  Private (Admin)
export const getCourseAnalytics = asyncHandler(async (req, res) => {
  // Get courses by category
  const coursesByCategory = await Course.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ])

  // Get courses by level
  const coursesByLevel = await Course.aggregate([
    {
      $group: {
        _id: "$level",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ])

  // Get average course price
  const avgPrice = await Course.aggregate([
    {
      $group: {
        _id: null,
        avgPrice: { $avg: "$price" },
      },
    },
  ])

  // Get course creation by month (last 12 months)
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

  const courseCreationByMonth = await Course.aggregate([
    {
      $match: {
        createdAt: { $gte: twelveMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
  ])

  // Format course creation by month
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const courseCreationByMonthFormatted = courseCreationByMonth.map((item) => ({
    month: months[item._id.month - 1],
    year: item._id.year,
    count: item.count,
  }))

  res.status(200).json({
    success: true,
    data: {
      coursesByCategory,
      coursesByLevel,
      avgPrice: avgPrice.length > 0 ? avgPrice[0].avgPrice : 0,
      courseCreationByMonth: courseCreationByMonthFormatted,
    },
  })
})

// @desc    Get user analytics
// @route   GET /api/admin/analytics/users
// @access  Private (Admin)
export const getUserAnalytics = asyncHandler(async (req, res) => {
  // Get user registration by month (last 12 months)
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

  const userRegistrationByMonth = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: twelveMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
  ])

  // Format user registration by month
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const userRegistrationByMonthFormatted = userRegistrationByMonth.map((item) => ({
    month: months[item._id.month - 1],
    year: item._id.year,
    count: item.count,
  }))

  // Get user registration by role (last 12 months)
  const userRegistrationByRole = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: twelveMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
          role: "$role",
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
  ])

  // Format user registration by role
  const userRegistrationByRoleFormatted = []
  userRegistrationByRole.forEach((item) => {
    userRegistrationByRoleFormatted.push({
      month: months[item._id.month - 1],
      year: item._id.year,
      role: item._id.role,
      count: item.count,
    })
  })

  // Get top students by enrollment
  const topStudentsByEnrollment = await Enrollment.aggregate([
    {
      $group: {
        _id: "$studentId",
        enrollmentCount: { $sum: 1 },
      },
    },
    {
      $sort: { enrollmentCount: -1 },
    },
    {
      $limit: 5,
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $project: {
        _id: 1,
        name: "$user.name",
        email: "$user.email",
        enrollmentCount: 1,
      },
    },
  ])

  // Get top teachers by course count
  const topTeachersByCourseCount = await Course.aggregate([
    {
      $unwind: "$teacherIds",
    },
    {
      $group: {
        _id: "$teacherIds",
        courseCount: { $sum: 1 },
      },
    },
    {
      $sort: { courseCount: -1 },
    },
    {
      $limit: 5,
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $project: {
        _id: 1,
        name: "$user.name",
        email: "$user.email",
        courseCount: 1,
      },
    },
  ])

  res.status(200).json({
    success: true,
    data: {
      userRegistrationByMonth: userRegistrationByMonthFormatted,
      userRegistrationByRole: userRegistrationByRoleFormatted,
      topStudentsByEnrollment,
      topTeachersByCourseCount,
    },
  })
})

// @desc    Get revenue analytics
// @route   GET /api/admin/analytics/revenue
// @access  Private (Admin)
export const getRevenueAnalytics = asyncHandler(async (req, res) => {
  // Get revenue by month (last 12 months)
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

  const revenueByMonth = await Payment.aggregate([
    {
      $match: {
        status: "captured",
        createdAt: { $gte: twelveMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
        revenue: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
  ])

  // Format revenue by month
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const revenueByMonthFormatted = revenueByMonth.map((item) => ({
    month: months[item._id.month - 1],
    year: item._id.year,
    revenue: item.revenue,
    count: item.count,
  }))

  // Get revenue by category
  const revenueByCourse = await Payment.aggregate([
    {
      $match: { status: "captured" },
    },
    {
      $group: {
        _id: "$courseId",
        revenue: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { revenue: -1 },
    },
    {
      $limit: 10,
    },
    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "_id",
        as: "course",
      },
    },
    {
      $unwind: "$course",
    },
    {
      $project: {
        _id: 1,
        title: "$course.title",
        category: "$course.category",
        revenue: 1,
        count: 1,
      },
    },
  ])

  // Group revenue by category
  const revenueByCategory = []
  const categoryMap = {}

  revenueByCourse.forEach((item) => {
    if (!categoryMap[item.category]) {
      categoryMap[item.category] = {
        category: item.category,
        revenue: 0,
        count: 0,
      }
      revenueByCategory.push(categoryMap[item.category])
    }

    categoryMap[item.category].revenue += item.revenue
    categoryMap[item.category].count += item.count
  })

  // Sort by revenue
  revenueByCategory.sort((a, b) => b.revenue - a.revenue)

  res.status(200).json({
    success: true,
    data: {
      revenueByMonth: revenueByMonthFormatted,
      revenueByCategory,
      topCoursesByRevenue: revenueByCourse,
    },
  })
})

// @desc    Get system logs
// @route   GET /api/admin/logs
// @access  Private (Admin)
export const getSystemLogs = asyncHandler(async (req, res) => {
  // This is a placeholder for system logs
  // In a real implementation, you would fetch logs from a logging service or database

  const logs = [
    {
      timestamp: new Date(),
      level: "info",
      message: "System started",
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      level: "warning",
      message: "High CPU usage detected",
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      level: "error",
      message: "Database connection error",
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      level: "info",
      message: "New user registered",
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 20),
      level: "info",
      message: "Payment processed successfully",
    },
  ]

  res.status(200).json({
    success: true,
    data: logs,
  })
})
