import mongoose from "mongoose"

const liveSessionSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
    },
    title: {
      type: String,
      required: [true, "Session title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    dateTime: {
      type: Date,
      required: [true, "Session date and time is required"],
    },
    duration: {
      type: Number, // in minutes
      required: [true, "Session duration is required"],
    },
    roomId: {
      type: String,
      required: [true, "Room ID is required for WebRTC"],
    },
    status: {
      type: String,
      enum: ["upcoming", "live", "completed", "cancelled"],
      default: "upcoming",
    },
    recordingUrl: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

const LiveSession = mongoose.model("LiveSession", liveSessionSchema)

export default LiveSession
