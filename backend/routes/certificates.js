import express from "express"
import { getCertificate, generateCertificate, verifyCertificate } from "../controllers/certificates.js"
import { protect } from "../middleware/auth.js"

const router = express.Router()

// Routes
router.get("/:courseId", protect, getCertificate)
router.post("/:courseId/generate", protect, generateCertificate)
router.get("/verify/:certificateId", verifyCertificate)

export default router
