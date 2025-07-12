import mongoose from "mongoose"

const certificateSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student ID is required"],
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
    },
    pdfUrl: {
      type: String,
      required: [true, "Certificate PDF URL is required"],
    },
    issuedDate: {
      type: Date,
      default: Date.now,
    },
    certificateId: {
      type: String,
      required: [true, "Certificate ID is required"],
      unique: true,
    },
  },
  {
    timestamps: true,
  },
)

const Certificate = mongoose.model("Certificate", certificateSchema)

export default Certificate
