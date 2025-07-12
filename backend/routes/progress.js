import express from "express"
import { getProgress, updateProgress } from "../controllers/progress.js"
import { protect } from "../middleware/auth.js"

const router = express.Router()

// Routes
router.get("/:courseId", protect, getProgress)
router.post("/update", protect, updateProgress)

export default router
