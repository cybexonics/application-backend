import express from "express"
import { addContent, getContent, updateContent, deleteContent, uploadContentFile } from "../controllers/content.js"
import { protect, authorize } from "../middleware/auth.js"
import multer from "multer"

const router = express.Router()

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf", "video/mp4", "video/webm"]
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Only PDF and video files are allowed"), false)
    }
  },
})

// Routes
router.post("/:id/content", protect, authorize("teacher", "admin"), addContent)
router.get("/:id/content", protect, getContent)
router.put("/:id/content/:contentId", protect, authorize("teacher", "admin"), updateContent)
router.delete("/:id/content/:contentId", protect, authorize("teacher", "admin"), deleteContent)
router.post(
  "/:id/content/upload",
  protect,
  authorize("teacher", "admin"),
  upload.single("contentFile"),
  uploadContentFile,
)

export default router
