import express from "express"
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  uploadCourseThumbnail,
  getEnrolledCourses,
  getTeachingCourses,
  getCourseReviews,
  addCourseReview,
  updateCourseReview,
  deleteCourseReview,
  getRecommendedCourses,
  getPopularCourses,
  getRelatedCourses,
} from "../controllers/courses.js"
import { protect, authorize } from "../middleware/auth.js"
import multer from "multer"

const router = express.Router()

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed"), false)
    }
  },
})

// Public routes

// Protected routes
router.get("/enrolled", protect, getEnrolledCourses)
router.get("/teaching", protect, authorize("teacher", "admin"), getTeachingCourses)
router.get("/recommended", protect, getRecommendedCourses)

router.get("/", getCourses)
router.get("/popular", getPopularCourses)
router.get("/:id", getCourse)
router.get("/:id/related", getRelatedCourses)
router.get("/:id/reviews", getCourseReviews)

router.post("/", protect, authorize("teacher", "admin"), createCourse)
router.put("/:id", protect, authorize("teacher", "admin"), updateCourse)
router.delete("/:id", protect, authorize("teacher", "admin"), deleteCourse)
router.post(
  "/:id/upload-thumbnail",
  protect,
  authorize("teacher", "admin"),
  upload.single("thumbnail"),
  uploadCourseThumbnail,
)

// Review routes
router.post("/:id/reviews", protect, addCourseReview)
router.put("/:id/reviews/:reviewId", protect, updateCourseReview)
router.delete("/:id/reviews/:reviewId", protect, deleteCourseReview)

export default router
