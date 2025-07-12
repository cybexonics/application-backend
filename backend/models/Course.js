import mongoose from "mongoose"

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      maxlength: [100, "Course title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Course price is required"],
      min: [0, "Price cannot be negative"],
    },
    thumbnailUrl: {
      type: String,
      required: [true, "Course thumbnail is required"],
    },
    teacherIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Course must have at least one teacher"],
      },
    ],
    content: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Content",
      },
    ],
    sessions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LiveSession",
      },
    ],
    enrolledStudentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    category: {
      type: String,
      required: [true, "Course category is required"],
      trim: true,
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    duration: {
      type: Number, // in minutes
      required: [true, "Course duration is required"],
    },  
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Virtual for total enrolled students count
courseSchema.virtual("enrollmentCount").get(function () {
  return this.enrolledStudentIds.length
})

// Virtual for total content items count
courseSchema.virtual("contentCount").get(function () {
  return this.content.length
})

const Course = mongoose.model("Course", courseSchema)

export default Course
