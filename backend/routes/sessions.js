import express from "express"
import {
  createSession,
  getSessions,
  getSession,
  updateSession,
  deleteSession,
  getJoinToken,
} from "../controllers/sessions.js"
import { protect, authorize } from "../middleware/auth.js"

const router = express.Router()

// Routes
router.post("/:id/sessions", protect, authorize("teacher", "admin"), createSession)
router.get("/:id/sessions", protect, getSessions)
router.get("/sessions/:sessionId", protect, getSession)
router.put("/sessions/:sessionId", protect, authorize("teacher", "admin"), updateSession)
router.delete("/sessions/:sessionId", protect, authorize("teacher", "admin"), deleteSession)
router.get("/sessions/:sessionId/join-token", protect, getJoinToken)

export default router
