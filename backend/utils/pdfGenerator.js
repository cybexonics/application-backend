import PDFDocument from "pdfkit"
import fs from "fs"
import path from "path"
import { uploadToCloudinary } from "./cloudinary.js"
import { v4 as uuidv4 } from "uuid"

// Generate certificate PDF
export const generateCertificate = async (studentName, courseName, completionDate, courseId, studentId) => {
  try {
    // Create a unique filename
    const certificateId = uuidv4()
    const fileName = `certificate-${certificateId}.pdf`
    const filePath = path.join("temp", fileName)

    // Ensure temp directory exists
    if (!fs.existsSync("temp")) {
      fs.mkdirSync("temp")
    }

    // Create PDF document
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 0,
    })

    // Pipe to file
    const stream = fs.createWriteStream(filePath)
    doc.pipe(stream)

    // Add certificate background
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#f5f5f5")
    doc.rect(10, 10, doc.page.width - 20, doc.page.height - 20).stroke("#333333")

    // Add certificate title
    doc
      .font("Helvetica-Bold")
      .fontSize(30)
      .fillColor("#333333")
      .text("CERTIFICATE OF COMPLETION", 0, 100, { align: "center" })

    // Add certificate content
    doc.font("Helvetica").fontSize(16).text("This is to certify that", 0, 160, { align: "center" })

    doc.font("Helvetica-Bold").fontSize(24).text(studentName, 0, 190, { align: "center" })

    doc.font("Helvetica").fontSize(16).text("has successfully completed the course", 0, 230, { align: "center" })

    doc.font("Helvetica-Bold").fontSize(24).text(courseName, 0, 260, { align: "center" })

    doc
      .font("Helvetica")
      .fontSize(14)
      .text(`Completed on: ${new Date(completionDate).toLocaleDateString()}`, 0, 310, { align: "center" })

    doc.font("Helvetica").fontSize(12).text(`Certificate ID: ${certificateId}`, 0, 340, { align: "center" })

    // Add signature
    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .text("Authorized Signature", doc.page.width - 200, 400)

    // Finalize PDF
    doc.end()

    // Wait for the stream to finish
    return new Promise((resolve, reject) => {
      stream.on("finish", async () => {
        try {
          // Upload to Cloudinary
          const result = await uploadToCloudinary(filePath, "certificates")

          // Delete temporary file
          fs.unlinkSync(filePath)

          resolve({
            certificateId,
            pdfUrl: result.url,
          })
        } catch (error) {
          reject(error)
        }
      })

      stream.on("error", reject)
    })
  } catch (error) {
    console.error("Certificate generation error:", error)
    throw new Error("Error generating certificate")
  }
}
