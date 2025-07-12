import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import path from "path"; // Keep path for static serving even if direct path is used

// Import routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import courseRoutes from "./routes/courses.js";
import contentRoutes from "./routes/content.js";
import sessionRoutes from "./routes/sessions.js";
import paymentRoutes from "./routes/payments.js";
import enrollmentRoutes from "./routes/enrollments.js";
import progressRoutes from "./routes/progress.js";
import certificateRoutes from "./routes/certificates.js";
import adminRoutes from "./routes/admin.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
// For Vercel, it's often better to explicitly set the path for Socket.IO
// if you plan to have a separate Socket.IO client.
// However, if your client will connect to the same base URL, this is fine.
const io = new Server(server, {
  cors: {
    origin:"*", // Use environment variable for client URL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  },
  // Optionally, specify a path for Socket.IO if needed for deployment
  // path: "/socket.io/",
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration - more secure
app.use(
  cors({
    origin:"*", // Use environment variable for client URL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(helmet());
app.use(morgan("dev"));

// Serve static files
// For Vercel, `path.join(process.cwd(), "public")` might not work as expected
// depending on your project structure. Vercel automatically serves a 'public' directory.
// If your 'public' directory is at the root, you might not even need this line for Vercel to serve it.
// If you have a specific path within your build output, you'd adjust this.
// For a typical Vercel setup where 'public' is a top-level directory, this might be redundant or require adjustment.
// Let's assume for a standard setup, you're serving the 'public' directory from the root.
// If your 'public' folder is at the root of your project, Vercel will handle static files automatically.
// If not, you might need:
// app.use(express.static(path.resolve(__dirname, 'public'))); // Note: __dirname is not available in ES Modules directly without a workaround.
// For ES Modules and Vercel, the easiest is to rely on Vercel's static file serving, or if you must:
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));


// Database connection
mongoose
  .connect(process.env.MONGODB_URI, {
    // These options are deprecated and no longer needed in Mongoose 6.0+
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/courses", contentRoutes); // Consider if content and sessions should be nested under a course ID
app.use("/api/courses", sessionRoutes); // e.g., /api/courses/:courseId/content, /api/courses/:courseId/sessions
app.use("/api/payments", paymentRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/certificate", certificateRoutes);
app.use("/api/admin", adminRoutes);

// API documentation route (assuming index.html is in the public folder)
app.get("/api-docs", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Admin panel route (example - assuming admin UI is a static file in public)
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html")); // Or your admin index file
});


// Live Broadcasting Session Management
const sessions = new Map(); // Store sessions in memory (consider Redis for production for scalability)

// Socket.IO WebRTC signaling for broadcasting
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-broadcast", (roomId, userId, userType) => {
    // Basic validation for roomId, userId, userType
    if (!roomId || !userId || !["instructor", "student"].includes(userType)) {
      console.warn("Invalid join-broadcast parameters:", { roomId, userId, userType });
      socket.emit("error", "Invalid join parameters.");
      return;
    }

    socket.join(roomId);
    console.log(`User ${userId} (${userType}) joined room ${roomId}`);

    let session = sessions.get(roomId);

    // Initialize room if it doesn't exist
    if (!session) {
      session = {
        instructor: null,
        students: new Map(),
        messages: [],
        isLive: false,
        startTime: null,
        // Add a timestamp for session creation to aid in cleanup
        createdAt: new Date(),
      };
      sessions.set(roomId, session);
      console.log(`New session created for room ${roomId}`);
    }

    // Handle instructor joining
    if (userType === "instructor") {
      // If an instructor is already active in this room, deny access or handle re-connection
      if (session.instructor && session.instructor.active && session.instructor.socketId !== socket.id) {
        socket.emit("error", "Another instructor is already active in this session.");
        socket.leave(roomId);
        return;
      }
      session.instructor = {
        id: userId,
        socketId: socket.id,
        active: true,
      };
      session.isLive = true;
      session.startTime = session.startTime || new Date(); // Set start time only once
      io.to(roomId).emit("broadcast-started", {
        instructorId: userId,
        startTime: session.startTime,
      });
      console.log(`Instructor ${userId} started broadcast in room ${roomId}`);
    }
    // Handle student joining
    else {
      session.students.set(userId, {
        socketId: socket.id,
        active: true,
        joinedAt: new Date(),
      });

      // Notify instructor about new student
      if (session.instructor && session.instructor.active) {
        io.to(session.instructor.socketId).emit("student-joined", {
          roomId,
          userId,
          totalStudents: session.students.size,
        });
      }

      // Send session history to the new student
      socket.emit("session-info", {
        isLive: session.isLive,
        startTime: session.startTime,
        messages: session.messages,
        totalStudents: session.students.size,
        instructorActive: session.instructor?.active || false,
      });
      console.log(`Student ${userId} joined room ${roomId}`);
    }

    // Broadcast updated participant count
    io.to(roomId).emit("participants-updated", {
      count: session.students.size + (session.instructor?.active ? 1 : 0),
    });

    // Handle WebRTC signaling
    socket.on("broadcast-signal", (signalData) => {
      // Signal data should include who it's from and who it's for, if possible
      const { targetId, signal } = signalData;

      if (userType === "instructor") {
        // Instructor's signal to a specific student or all students
        if (targetId) {
          const studentSocketId = Array.from(session.students.values()).find(s => s.id === targetId)?.socketId;
          if (studentSocketId) {
            io.to(studentSocketId).emit("instructor-signal", {
              instructorId: userId,
              signal,
            });
          }
        } else {
          // Broadcast to all students (offer/answer from instructor)
          socket.to(roomId).emit("instructor-signal", {
            instructorId: userId,
            signal,
          });
        }
      } else {
        // Student's signal to instructor only
        if (session.instructor && session.instructor.active) {
          io.to(session.instructor.socketId).emit("student-signal", {
            studentId: userId,
            signal,
            fromSocketId: socket.id, // Include student's socket ID for direct response
          });
        }
      }
    });

    // Handle chat messages
    socket.on("broadcast-message", (message) => {
      // Basic message validation
      if (!message || !message.text) {
        socket.emit("error", "Message text is required.");
        return;
      }

      const formattedMessage = {
        id: Date.now().toString(),
        userId,
        name: message.name || (userType === "instructor" ? "Instructor" : "Student"), // Allow custom name from client
        text: message.text,
        timestamp: new Date().toISOString(), // Use ISO string for consistent formatting
        userType,
      };

      // Store message in session history
      session.messages.push(formattedMessage);
      if (session.messages.length > 100) {
        session.messages.shift(); // Keep only last 100 messages
      }

      // Broadcast message to all participants
      io.to(roomId).emit("new-message", formattedMessage);
      console.log(`Message in room ${roomId} from ${userId}: ${message.text}`);
    });

    // Handle instructor actions
    socket.on("instructor-action", (action) => {
      if (userType === "instructor" && session.instructor?.id === userId) {
        switch (action.type) {
          case "mute-all-students": // More specific action name
            io.to(roomId).emit("instructor-command", {
              command: "mute-all",
            });
            console.log(`Instructor ${userId} muted all in room ${roomId}`);
            break;
          case "end-session":
            session.isLive = false;
            session.endTime = new Date(); // Record end time
            io.to(roomId).emit("session-ended", {
              endTime: session.endTime,
              roomId: roomId, // Send roomId back for client context
            });
            // Clear instructor and students for this session immediately on end
            session.instructor = null;
            session.students.clear();
            console.log(`Instructor ${userId} ended session in room ${roomId}`);
            // Consider persistent storage for session summary here
            break;
          case "toggle-recording":
            io.to(roomId).emit("recording-status", {
              isRecording: action.isRecording,
            });
            console.log(`Instructor ${userId} toggled recording to ${action.isRecording} in room ${roomId}`);
            break;
          default:
            console.warn(`Unknown instructor action type: ${action.type}`);
        }
      } else {
        socket.emit("error", "Unauthorized action.");
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      if (!sessions.has(roomId)) return; // Session might have been cleaned up already

      const currentSession = sessions.get(roomId);

      if (userType === "instructor" && currentSession.instructor?.id === userId) {
        // Instructor disconnected
        currentSession.instructor.active = false; // Mark as inactive
        io.to(roomId).emit("instructor-disconnected", { instructorId: userId });
        console.log(`Instructor ${userId} disconnected from room ${roomId}`);
        // Consider if a session should automatically end if instructor disconnects
        // For now, it stays "live" but without an active instructor.
      } else if (currentSession.students.has(userId)) {
        // Student disconnected
        currentSession.students.delete(userId);
        console.log(`Student ${userId} disconnected from room ${roomId}`);

        // Notify instructor
        if (currentSession.instructor && currentSession.instructor.active) {
          io.to(currentSession.instructor.socketId).emit("student-left", {
            roomId,
            userId,
            totalStudents: currentSession.students.size,
          });
        }
      }

      // Broadcast updated participant count
      io.to(roomId).emit("participants-updated", {
        count: currentSession.students.size + (currentSession.instructor?.active ? 1 : 0),
      });

      // Session cleanup logic:
      // If the instructor is inactive and no students are present, clean up the session after a delay.
      // This prevents ghost sessions and allows for brief instructor reconnections.
      if (currentSession.students.size === 0 && (!currentSession.instructor || !currentSession.instructor.active)) {
        console.log(`Initiating cleanup for room ${roomId} due to inactivity...`);
        setTimeout(() => {
          // Double-check conditions before deleting
          if (
            sessions.has(roomId) &&
            sessions.get(roomId).students.size === 0 &&
            (!sessions.get(roomId).instructor || !sessions.get(roomId).instructor.active)
          ) {
            sessions.delete(roomId);
            console.log(`Session ${roomId} cleaned up due to extended inactivity.`);
          }
        }, 60 * 1000); // 1 minute delay for cleanup
      }
    });
  });
});

// API endpoint to get active sessions
app.get("/api/live-sessions", (req, res) => {
  const activeSessions = [];

  sessions.forEach((session, roomId) => {
    // Only include sessions that are marked as live AND have an active instructor
    // or are still in a state where an instructor might rejoin soon.
    // For a more robust system, "live" might mean "broadcast is active," regardless of current instructor presence.
    if (session.isLive && session.instructor?.active) {
      activeSessions.push({
        id: roomId,
        startTime: session.startTime,
        participants: session.students.size + (session.instructor?.active ? 1 : 0),
        instructorId: session.instructor.id,
        // Add more relevant session info if needed
      });
    }
  });

  res.json({
    success: true,
    sessions: activeSessions,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log full stack trace in development
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined, // Only send error message in dev
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`Admin Panel: http://localhost:${PORT}/admin`);
});

// For Vercel, you typically don't export `handler` or `default server`.
// Vercel's build process detects your `server.listen` call for Node.js projects
// and automatically wraps your application as a serverless function if needed,
// or runs it as a long-running process in their infrastructure (though "serverless" is the default paradigm).
// You just need to ensure your `listen` call is at the top level for Vercel to pick it up.
// Therefore, remove the `export const handler = serverless(app)` and `export default server`.
