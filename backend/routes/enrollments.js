import express from "express"
import { getEnrollments, enrollCourse, cancelEnrollment } from "../controllers/enrollments.js"
import { protect } from "../middleware/auth.js"

const router = express.Router()

// Routes
router.get("/", protect, getEnrollments)
router.post("/:courseId", protect, enrollCourse)
router.delete("/:enrollmentId", protect, cancelEnrollment)

export default router
