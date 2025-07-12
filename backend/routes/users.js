import express from "express"
import { getProfile, updateProfile, uploadProfileImage } from "../controllers/users.js"
import { protect } from "../middleware/auth.js"
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

// Routes
router.get("/profile", protect, getProfile)
router.patch("/update-profile", protect, updateProfile)
router.post("/upload-profile-image", protect, upload.single("profileImage"), uploadProfileImage)

export default router
