import mongoose from "mongoose"

const contentSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
    },
    type: {
      type: String,
      enum: ["video", "pdf", "text", "quiz"],
      required: [true, "Content type is required"],
    },
    title: {
      type: String,
      required: [true, "Content title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    url: {
      type: String,
      required: function () {
        return this.type === "video" || this.type === "pdf"
      },
    },
    content: {
      type: String,
      required: function () {
        return this.type === "text"
      },
    },
    duration: {
      type: Number, // in minutes
      required: function () {
        return this.type === "video"
      },
    },
    order: {
      type: Number,
      required: [true, "Content order is required"],
    },
    isPublished: {
      type: Boolean,
      default: true,
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

const Content = mongoose.model("Content", contentSchema)

export default Content
