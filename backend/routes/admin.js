import express from "express"
import {
  getUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getDashboardAnalytics,
  getCourseAnalytics,
  getUserAnalytics,
  getRevenueAnalytics,
  getSystemLogs,
} from "../controllers/admin.js"
import { protect, authorize } from "../middleware/auth.js"

const router = express.Router()

// Protect all routes and restrict to admin only
router.use(protect)
router.use(authorize("admin"))

// User management routes
router.get("/users", getUsers)
router.get("/users/:id", getUserById)
router.patch("/users/:id/role", updateUserRole)
router.delete("/users/:id", deleteUser)

// Analytics routes
router.get("/analytics/dashboard", getDashboardAnalytics)
router.get("/analytics/courses", getCourseAnalytics)
router.get("/analytics/users", getUserAnalytics)
router.get("/analytics/revenue", getRevenueAnalytics)

// System logs
router.get("/logs", getSystemLogs)

export default router
