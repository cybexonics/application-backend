import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom"; // Assuming react-router-dom is used for sessionId
// These imports are assumed from shadcn/ui and should be available in your project.
// If not, you might need to create minimal mock components for development.
import MobileLayout from "../components/MobileLayout"; // Path might vary
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast"; // For shadcn/ui toast
import { Camera, CameraOff, Mic, MicOff, MessageSquare, Users, Monitor, PhoneOff } from "lucide-react";
import { Video, AlertCircle, UserPlus } from "lucide-react";
import io, { Socket } from "socket.io-client";

// Define Message interface
interface Message {
  id: string;
  name: string;
  text: string;
  userType: "instructor" | "student";
}

// Configuration for Socket.IO server URL
// IMPORTANT: Replace with your actual backend URL when deployed
// For local development, this will be the address of your Node.js server
const API_URL = "http://localhost:5000";

const LiveSession = () => {
  const { sessionId } = useParams<{ sessionId: string }>(); // Specify type for useParams
  const [sessionData, setSessionData] = useState<any>(null); // Use a more specific type if possible
  const [isLoading, setIsLoading] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]); // Use Message type
  const [activeTab, setActiveTab] = useState("chat");
  const [isRecording, setIsRecording] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [isInstructor, setIsInstructor] = useState(false);
  const [isLive, setIsLive] = useState(false);
  // Instructor-specific: list of connected student IDs
  const [connectedStudents, setConnectedStudents] = useState<string[]>([]);

  // Refs for video elements and WebRTC objects
  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null); // Instructor's stream
  // Map to store peer connections (key: peerId, value: RTCPeerConnection)
  // For instructor: peerId is studentId
  // For student: peerId is "instructor"
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localVideoRef = useRef<HTMLVideoElement | null>(null); // For local preview (instructor or student if they send video)
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null); // For remote stream (student receives instructor's stream)

  // Mock user ID - in a real app, this would come from authentication (e.g., Firebase Auth UID)
  // For demonstration, generating a random one
  const userId = useRef("user-" + Math.random().toString(36).substring(2, 9));

  // --- WebRTC Helper: Create a new RTCPeerConnection ---
  const createPeerConnection = useCallback((peerId: string): RTCPeerConnection => {
    const configuration: RTCConfiguration = {
      // Public STUN server for NAT traversal (helps peers find each other)
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };

    const peerConnection = new RTCPeerConnection(configuration);

    peerConnectionsRef.current.set(peerId, peerConnection);

    // 1. Handle ICE candidates (network information)
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`Sending ICE candidate to ${peerId} from ${userId.current}`);
        // Send ICE candidate to the signaling server (Socket.IO)
        socketRef.current?.emit("broadcast-signal", {
          type: "candidate",
          candidate: event.candidate,
          targetId: peerId,    // Who this candidate is for
          senderId: userId.current, // Who sent this candidate
          sessionId: sessionId, // Ensure session context is passed
        });
      }
    };

    // 2. Handle connection state changes for debugging
    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state with ${peerId}:`, peerConnection.connectionState);
      if (peerConnection.connectionState === "disconnected" || peerConnection.connectionState === "failed") {
        console.log(`Peer ${peerId} disconnected or failed.`);
        // Cleanup peer connection
        peerConnection.close();
        peerConnectionsRef.current.delete(peerId);
        // If instructor, update connected students list on disconnect
        if (isInstructor && peerId !== "instructor") {
          setConnectedStudents((prev) => prev.filter((id) => id !== peerId));
        }
      }
    };

    // 3. Handle incoming tracks (for students to receive instructor's stream)
    // This event fires when a remote peer adds a track to the connection
    if (!isInstructor) {
      peerConnection.ontrack = (event) => {
        console.log("Received remote stream track:", event.track.kind, event.streams[0]);
        if (remoteVideoRef.current && event.streams[0]) {
          // Set the remote video element's srcObject to the incoming stream
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };
    }

    return peerConnection;
  }, [sessionId, isInstructor]); // Dependencies for useCallback

  // --- WebRTC Setup for Instructor (Broadcaster) ---
  const setupInstructorWebRTC = useCallback(async () => {
    try {
      // Get local video and audio stream
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;

      // Display local stream in the local video element
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setIsCameraOn(true);
      setIsMicOn(true);

      // Socket.IO listener for when a student joins
      socketRef.current?.on("student-joined", async (data: { userId: string }) => {
        const studentId = data.userId;
        console.log(`Instructor: Student ${studentId} joined. Setting up peer connection.`);

        // Create a new RTCPeerConnection for each joining student
        let peerConnection = peerConnectionsRef.current.get(studentId);
        if (!peerConnection) {
          peerConnection = createPeerConnection(studentId);
        }

        // Add instructor's local stream tracks to this new peer connection
        // This makes the instructor's stream available to the student
        stream.getTracks().forEach((track) => {
          peerConnection?.addTrack(track, stream);
        });

        // Create and send an SDP Offer to the student
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        console.log(`Instructor: Sending offer to ${studentId}`);
        socketRef.current?.emit("broadcast-signal", {
          type: "offer",
          sdp: peerConnection.localDescription,
          targetId: studentId,
          senderId: userId.current,
          sessionId: sessionId,
        });

        // Update connected students list for UI
        setConnectedStudents((prev) => [...new Set([...prev, studentId])]); // Use Set to avoid duplicates
      });

      // Socket.IO listener for receiving signals (answers, candidates) from students
      socketRef.current?.on("student-signal", async (data: any) => {
        const { studentId, signal } = data;
        console.log(`Instructor: Received signal from student ${studentId}:`, signal.type);

        const peerConnection = peerConnectionsRef.current.get(studentId);
        if (!peerConnection) {
          console.warn(`Instructor: No peer connection found for student ${studentId}.`);
          return;
        }

        if (signal.type === "answer") {
          // Set the student's SDP Answer as the remote description
          await peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        } else if (signal.type === "candidate") {
          // Add ICE candidate received from the student
          if (peerConnection.remoteDescription) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
          } else {
            console.warn(`Instructor: Remote description not set for ${studentId}, cannot add ICE candidate yet.`);
          }
        }
      });

      // Socket.IO listener for when a student leaves
      socketRef.current?.on("student-left", (data: { userId: string }) => {
        const studentId = data.userId;
        console.log(`Instructor: Student ${studentId} left.`);
        if (peerConnectionsRef.current.has(studentId)) {
          peerConnectionsRef.current.get(studentId)?.close();
          peerConnectionsRef.current.delete(studentId);
        }
        setConnectedStudents((prev) => prev.filter((id) => id !== studentId));
      });

    } catch (error) {
      console.error("Error setting up instructor WebRTC:", error);
      toast({
        title: "Media Access Error",
        description: "Could not access camera or microphone. Please check permissions.",
        variant: "destructive",
      });
      setIsCameraOn(false);
      setIsMicOn(false);
    }
  }, [createPeerConnection, sessionId]); // Dependencies for useCallback

  // --- WebRTC Setup for Student (Viewer) ---
  const setupStudentWebRTC = useCallback(async () => {
    try {
      // Students establish one peer connection to receive the instructor's broadcast
      let peerConnection = peerConnectionsRef.current.get("instructor");
      if (!peerConnection) {
        peerConnection = createPeerConnection("instructor");
      }

      // Students do NOT get their own media stream initially in a pure broadcast.
      // They just wait to receive the instructor's stream via `ontrack`.

      // Socket.IO listener for receiving signals (offers, candidates) from the instructor
      socketRef.current?.on("instructor-signal", async (data: any) => {
        const { signal } = data;
        console.log("Student: Received instructor signal:", signal.type);

        // Ensure peerConnection is valid
        if (!peerConnection) {
          console.error("Student: Peer connection to instructor not established.");
          return;
        }

        if (signal.type === "offer") {
          // Set the instructor's SDP Offer as the remote description
          await peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));

          // Create and send an SDP Answer back to the instructor
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);

          console.log("Student: Sending answer to instructor");
          socketRef.current?.emit("broadcast-signal", {
            type: "answer",
            sdp: peerConnection.localDescription,
            targetId: "instructor", // Target the instructor's ID
            senderId: userId.current, // Identify who sent the answer
            sessionId: sessionId,
          });
        } else if (signal.type === "candidate") {
          // Add ICE candidate received from the instructor
          if (peerConnection.remoteDescription) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
          } else {
            console.warn("Student: Remote description not set, cannot add ICE candidate yet.");
          }
        }
      });

      // Socket.IO listener for instructor disconnection
      socketRef.current?.on("instructor-disconnected", () => {
        toast({
          title: "Instructor Disconnected",
          description: "The instructor has left the broadcast.",
          variant: "destructive",
        });

        // Clear remote video and cleanup peer connection
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
        if (peerConnectionsRef.current.has("instructor")) {
          peerConnectionsRef.current.get("instructor")?.close();
          peerConnectionsRef.current.delete("instructor");
        }
        setIsLive(false); // Mark session as not live
      });

      // Instructor commands (e.g., mute all)
      socketRef.current?.on("instructor-command", (data: any) => {
        if (data.command === "mute-all") {
          // If a student *was* sending audio (e.g., for Q&A, not typical broadcast), mute it.
          // In a pure broadcast, students don't send audio, so this might not be relevant.
          if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack && audioTrack.enabled) {
              audioTrack.enabled = false;
              setIsMicOn(false);
              toast({
                title: "Muted",
                description: "The instructor has muted your microphone.",
              });
            }
          }
        }
      });
    } catch (error) {
      console.error("Error setting up student WebRTC:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to the broadcast.",
        variant: "destructive",
      });
    }
  }, [createPeerConnection, sessionId]); // Dependencies for useCallback

  // --- Initial Load and Connection Management ---
  useEffect(() => {
    const fetchSessionDataAndConnect = async () => {
      try {
        // --- Mock Session Data (replace with actual API fetch) ---
        const mockData = {
          id: sessionId,
          title: "Live Coding Session",
          course: "Web Development Bootcamp",
          instructor: "Jane Smith",
          date: new Date().toISOString().split("T")[0],
            time: "14:00-15:30",
            description: "Learn how to build a real-time application with WebRTC and Socket.IO",
            participants: 0,
        };
        setSessionData(mockData);

        // --- Mock User Role (replace with actual authentication check) ---
        // For testing, you can set localStorage.setItem("userRole", "instructor");
        // or localStorage.setItem("userRole", "student"); in your browser console.
        const rawRole = localStorage.getItem("userRole");

        const userRole = JSON.parse(rawRole);
        console.log("Raw role from localStorage:", userRole, "Type:", typeof userRole);

        const normalizedRole = String(userRole).trim().toLowerCase();
        const teacher = "teacher"; // already normalized

        console.log("Normalized role:", `"${normalizedRole}"`, "===", `"${teacher}"`);

        console.log("Normalized role:", normalizedRole,"===",teacher);
        if (normalizedRole === teacher) {
          setIsInstructor(true);
          console.log("Is user instructor (teacher):", true);
        } else {
          console.log("User is a teacher");
        }

        // --- Initialize Socket.IO Connection ---
        socketRef.current = io(API_URL);

        socketRef.current.on("connect", () => {
          console.log("Socket connected:", socketRef.current?.id);
          // Join the broadcast room on successful connection
          socketRef.current?.emit("join-broadcast", sessionId, userId.current, userRole);
        });

        socketRef.current.on("disconnect", () => {
          console.log("Socket disconnected");
          toast({
            title: "Disconnected",
            description: "You have been disconnected from the session.",
            variant: "destructive",
          });
          setIsLive(false); // Mark as not live if disconnected
          // Clear video streams and peer connections on unexpected disconnect
          localStreamRef.current?.getTracks().forEach(track => track.stop());
          if (localVideoRef.current) localVideoRef.current.srcObject = null;
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
          peerConnectionsRef.current.forEach(pc => pc.close());
          peerConnectionsRef.current.clear();
          setIsCameraOn(false);
          setIsMicOn(false);
        });

        // --- Socket.IO Event Handlers ---
        socketRef.current.on("session-info", (info: any) => {
          setIsLive(info.isLive);
          setMessages(info.messages || []);
          // Count includes instructor if live
          setParticipantCount(info.totalStudents + (info.isLive && isUserInstructor ? 1 : 0));
          if (isUserInstructor) {
            setConnectedStudents(info.studentIds || []);
          }

          // If session is already live when user joins, set up WebRTC immediately
          if (info.isLive) {
            if (isUserInstructor) {
              setupInstructorWebRTC();
            } else {
              setupStudentWebRTC();
            }
          }
        });

        socketRef.current.on("broadcast-started", (data: any) => {
          console.log("Broadcast started event received:", data);
          setIsLive(true);
          toast({
            title: "Broadcast Started",
            description: "The instructor has started the broadcast.",
          });
          // Students initiate WebRTC setup when broadcast starts
          if (!isUserInstructor) {
            setupStudentWebRTC();
          }
        });

        socketRef.current.on("new-message", (message: Message) => {
          setMessages((prev) => [...prev, message]);
        });

        socketRef.current.on("participants-updated", (data: any) => {
          setParticipantCount(data.count);
          if (isUserInstructor) {
            setConnectedStudents(data.studentIds || []);
          }
        });

        socketRef.current.on("recording-status", (data: any) => {
          setIsRecording(data.isRecording);
        });

        socketRef.current.on("session-ended", (data: any) => {
          setIsLive(false);
          toast({
            title: "Session Ended",
            description: "The broadcast has ended.",
          });
          // Cleanup WebRTC connections and streams
          localStreamRef.current?.getTracks().forEach((track) => track.stop());
          peerConnectionsRef.current.forEach((pc) => pc.close());
          peerConnectionsRef.current.clear();
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
          }
          if (localVideoRef.current) { // Also clear local video if it was displaying
            localVideoRef.current.srcObject = null;
          }
          setIsCameraOn(false);
          setIsMicOn(false);
          setConnectedStudents([]);
        });

      } catch (error) {
        console.error("Error during initial connection setup:", error);
        toast({
          title: "Setup Error",
          description: "Failed to initialize session resources.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionDataAndConnect();

    // --- Cleanup on component unmount ---
    return () => {
      console.log("Cleaning up LiveSession component...");
      localStreamRef.current?.getTracks().forEach((track) => track.stop()); // Stop media tracks
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      peerConnectionsRef.current.forEach((pc) => pc.close()); // Close all peer connections
      peerConnectionsRef.current.clear();
      socketRef.current?.disconnect(); // Disconnect Socket.IO
    };
  }, [sessionId, setupInstructorWebRTC, setupStudentWebRTC]); // Add useCallback dependencies

  // --- Controls: Toggle Camera ---
  const toggleCamera = async () => {
    if (!localStreamRef.current) {
      // If no stream exists, try to get it (e.g., first time instructor turns on camera)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: isMicOn });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setIsCameraOn(true);
        // Add tracks to all existing peer connections if instructor
        if (isInstructor) {
          peerConnectionsRef.current.forEach((pc) => {
            stream.getTracks().forEach(track => pc.addTrack(track, stream));
            // Renegotiate if tracks were added after initial offer/answer
            pc.createOffer().then(offer => pc.setLocalDescription(offer))
            .then(() => {
              socketRef.current?.emit("broadcast-signal", {
                type: "offer",
                sdp: pc.localDescription,
                targetId: Array.from(peerConnectionsRef.current.keys()).find(id => peerConnectionsRef.current.get(id) === pc),
                                      senderId: userId.current,
                                      sessionId: sessionId,
              });
            });
          });
        }
      } catch (error) {
        console.error("Error accessing media devices for camera toggle:", error);
        toast({
          title: "Media Error",
          description: "Could not access camera. Please check permissions.",
          variant: "destructive",
        });
        return;
      }
    }

    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsCameraOn(videoTrack.enabled);

      // Inform connected peers about track state change (if instructor)
      if (isInstructor) {
        peerConnectionsRef.current.forEach((pc) => {
          const sender = pc.getSenders().find(s => s.track === videoTrack);
          if (sender) {
            sender.track!.enabled = videoTrack.enabled; // Toggle sender's track enabled state
          }
        });
      }
    } else {
      console.warn("No video track found in local stream.");
    }
  };

  // --- Controls: Toggle Microphone ---
  const toggleMic = async () => {
    if (!localStreamRef.current) {
      // If no stream exists, try to get it (e.g., first time instructor turns on mic)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: isCameraOn, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setIsMicOn(true);
        // Add tracks to all existing peer connections if instructor
        if (isInstructor) {
          peerConnectionsRef.current.forEach((pc) => {
            stream.getTracks().forEach(track => pc.addTrack(track, stream));
            pc.createOffer().then(offer => pc.setLocalDescription(offer))
            .then(() => {
              socketRef.current?.emit("broadcast-signal", {
                type: "offer",
                sdp: pc.localDescription,
                targetId: Array.from(peerConnectionsRef.current.keys()).find(id => peerConnectionsRef.current.get(id) === pc),
                                      senderId: userId.current,
                                      sessionId: sessionId,
              });
            });
          });
        }
      } catch (error) {
        console.error("Error accessing media devices for mic toggle:", error);
        toast({
          title: "Media Error",
          description: "Could not access microphone. Please check permissions.",
          variant: "destructive",
        });
        return;
      }
    }

    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);

      // Inform connected peers about track state change (if instructor)
      if (isInstructor) {
        peerConnectionsRef.current.forEach((pc) => {
          const sender = pc.getSenders().find(s => s.track === audioTrack);
          if (sender) {
            sender.track!.enabled = audioTrack.enabled; // Toggle sender's track enabled state
          }
        });
      }
    } else {
      console.warn("No audio track found in local stream.");
    }
  };

  // --- Controls: End Call / Leave Session ---
  const endCall = () => {
    // 1. Stop all local media tracks
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null; // Clear the ref
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    // 2. Close all peer connections
    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // 3. Notify server
    if (isInstructor) {
      socketRef.current?.emit("instructor-action", {
        type: "end-session",
        sessionId: sessionId,
      });
    } else {
      socketRef.current?.emit("leave-broadcast", sessionId, userId.current);
    }

    // 4. Disconnect socket
    socketRef.current?.disconnect();

    // 5. Reset component state
    setIsCameraOn(false);
    setIsMicOn(false);
    setIsLive(false);
    setConnectedStudents([]);
    setMessages([]);

    toast({
      title: "Session Ended",
      description: `You've left the broadcast.`,
    });
  };

  // --- Instructor-Only Controls: Toggle Recording ---
  const toggleRecording = () => {
    if (!isInstructor) return; // Only instructor can control recording

    const newRecordingState = !isRecording;
    setIsRecording(newRecordingState);

    socketRef.current?.emit("instructor-action", {
      type: "toggle-recording",
      sessionId: sessionId,
      isRecording: newRecordingState,
    });

    toast({
      title: newRecordingState ? "Recording Started" : "Recording Stopped",
      description: newRecordingState ? "Session is now being recorded." : "Recording has been stopped.",
    });
  };

  // --- Instructor-Only Controls: Mute All Participants ---
  const muteAllParticipants = () => {
    if (!isInstructor) return; // Only instructor can mute all

    socketRef.current?.emit("instructor-action", {
      type: "mute-all",
      sessionId: sessionId,
    });

    toast({
      title: "All Participants Muted",
      description: "You have muted all participants.",
    });
  };

  // --- Chat: Send Message ---
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Send message to Socket.IO server
    socketRef.current?.emit("broadcast-message", {
      sessionId: sessionId,
      userId: userId.current,
      name: isInstructor ? "Instructor" : `Student ${userId.current.substring(5, 9)}`, // Use a short ID for display
                            text: newMessage,
                            userType: isInstructor ? "instructor" : "student",
    });

    setNewMessage(""); // Clear input field
  };

  if (isLoading) {
    return (
      <MobileLayout title="Live Broadcast" showBackButton>
      <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title={sessionData?.title || "Live Broadcast"} showBackButton>
    <div className="space-y-4 font-inter"> {/* Applying Inter font */}
    {/* Session Info Card */}
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
    <div className="p-4">
    <h2 className="font-semibold text-lg text-blue-700">{sessionData?.title}</h2>
    <p className="text-sm text-gray-500 mt-1">
    {sessionData?.course} • {new Date(sessionData?.date).toLocaleDateString()}, {sessionData?.time}
    <br />
    Instructor: {sessionData?.instructor}
    </p>
    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{sessionData?.description}</p>
    <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
    <p className="text-sm text-gray-500 flex items-center">
    <Users className="h-4 w-4 mr-1 text-gray-400" /> {participantCount} participants
    </p>
    {isRecording && (
      <p className="text-sm text-red-500 flex items-center animate-pulse">
      <Video className="h-4 w-4 mr-1" /> Recording
      </p>
    )}
    {!isLive && (
      <p className="text-sm text-amber-500 flex items-center">
      <AlertCircle className="h-4 w-4 mr-1" /> Waiting for instructor
      </p>
    )}
    </div>
    </div>
    </div>

    {/* Video Section */}
    <div className="relative rounded-xl overflow-hidden bg-gray-900 h-64 shadow-lg border border-gray-700">
    {isInstructor ? (
      // Instructor view: Shows their own video stream
      <video
      ref={localVideoRef}
      className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" // Mirror local video for natural feel
      autoPlay
      playsInline
      muted // Mute local preview to avoid self-echo
      />
    ) : (
      // Student view: Shows instructor's remote video stream
      <video
      ref={remoteVideoRef}
      className="absolute inset-0 w-full h-full object-cover"
      autoPlay
      playsInline
      />
    )}

    {/* Overlay for "Camera Off" or "Waiting for Instructor" */}
    {((!isCameraOn && isInstructor) || (!isLive && !isInstructor) || (!remoteVideoRef.current?.srcObject && !isInstructor && isLive)) && (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 bg-opacity-90 text-white">
      {!isLive && !isInstructor ? ( // Student waiting for instructor
        <>
        <Monitor className="h-16 w-16 mb-4 animate-bounce" />
        <p className="text-lg font-medium">Waiting for instructor to start broadcast...</p>
        </>
      ) : (!isCameraOn && isInstructor) ? ( // Instructor camera off
      <>
      <CameraOff className="h-16 w-16 mb-4" />
      <p className="text-lg font-medium">Your camera is off</p>
      </>
      ) : ( // Student connected but no stream yet (e.g., instructor hasn't started video)
      <>
      <Video className="h-16 w-16 mb-4 text-gray-400" />
      <p className="text-lg font-medium text-gray-300">Instructor's video will appear here</p>
      </>
      )}
      </div>
    )}

    {/* Controls Overlay */}
    <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4 z-20">
    {/* Camera and Mic controls for instructor (always visible) */}
    {isInstructor && (
      <>
      <button
      onClick={toggleMic}
      className={`rounded-full p-3 transition-all duration-200 ease-in-out shadow-lg
        ${isMicOn ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"}`}
        aria-label={isMicOn ? "Mute microphone" : "Unmute microphone"}
        >
        {isMicOn ? <Mic className="h-6 w-6 text-white" /> : <MicOff className="h-6 w-6 text-white" />}
        </button>
        <button
        onClick={toggleCamera}
        className={`rounded-full p-3 transition-all duration-200 ease-in-out shadow-lg
          ${isCameraOn ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"}`}
          aria-label={isCameraOn ? "Turn camera off" : "Turn camera on"}
          >
          {isCameraOn ? <Camera className="h-6 w-6 text-white" /> : <CameraOff className="h-6 w-6 text-white" />}
          </button>
          </>
    )}

    {/* End Call button for both roles */}
    <button
    onClick={endCall}
    className="rounded-full p-3 bg-red-700 hover:bg-red-800 transition-all duration-200 ease-in-out shadow-lg"
    aria-label="End call"
    >
    <PhoneOff className="h-6 w-6 text-white" />
    </button>

    {/* Instructor-only specific controls */}
    {isInstructor && (
      <>
      <button
      onClick={toggleRecording}
      className={`rounded-full p-3 transition-all duration-200 ease-in-out shadow-lg
        ${isRecording ? "bg-red-600 animate-pulse hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
        >
        <Video className="h-6 w-6 text-white" />
        </button>
        <button
        onClick={muteAllParticipants}
        className="rounded-full p-3 bg-blue-600 hover:bg-blue-700 transition-all duration-200 ease-in-out shadow-lg"
        aria-label="Mute all participants"
        >
        <MicOff className="h-6 w-6 text-white" />
        </button>
        </>
    )}
    </div>
    </div>

    {/* Chat and Participants Tabs */}
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
    <div className="flex border-b border-gray-200">
    <button
    className={`flex-1 py-3 flex items-center justify-center space-x-2 text-sm font-medium transition-all duration-200 ease-in-out
      ${activeTab === "chat" ? "bg-blue-600 text-white rounded-tl-xl" : "bg-white text-gray-700 hover:bg-gray-50"}`}
      onClick={() => setActiveTab("chat")}
      >
      <MessageSquare className="h-5 w-5" />
      <span>Chat</span>
      </button>
      <button
      className={`flex-1 py-3 flex items-center justify-center space-x-2 text-sm font-medium transition-all duration-200 ease-in-out
        ${activeTab === "participants" ? "bg-blue-600 text-white rounded-tr-xl" : "bg-white text-gray-700 hover:bg-gray-50"}`}
        onClick={() => setActiveTab("participants")}
        >
        <Users className="h-5 w-5" />
        <span>Participants ({participantCount})</span>
        </button>
        </div>
        <div className="p-4">
        {activeTab === "chat" ? (
          <>
          <div className="h-64 overflow-y-auto mb-4 border border-gray-200 p-3 rounded-lg bg-gray-50 flex flex-col-reverse">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-4">No messages yet. Be the first to say hello!</p>
          ) : (
            [...messages].reverse().map((msg, index) => ( // Reverse to show latest at bottom
            <div key={msg.id || index} className="mb-3 last:mb-0">
            <p
            className={`text-xs font-semibold ${msg.userType === "instructor" ? "text-blue-600" : "text-gray-700"}`}
            >
            {msg.name}
            </p>
            <p className="text-sm text-gray-800 leading-snug">{msg.text}</p>
            </div>
            ))
          )}
          </div>
          <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message here..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          aria-label="New message input"
          />
          <button
          type="submit"
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
          >
          Send
          </button>
          </form>
          </>
        ) : (
          <div className="h-64 overflow-y-auto border border-gray-200 p-3 rounded-lg bg-gray-50">
          {/* Instructor listing */}
          <div className="font-semibold text-gray-700 mb-3">Instructor</div>
          <div className="pl-2 mb-4">
          <div className="flex items-center">
          <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
          <span className="text-blue-600 font-bold text-sm">
          {sessionData?.instructor
            .split(" ")
            .map((n: string) => n[0])
            .join("")}
            </span>
            </div>
            <div>
            <p className="text-sm text-gray-800 font-medium">{sessionData?.instructor} <span className="text-xs text-gray-500">(Host)</span></p>
            </div>
            </div>
            </div>

            {/* Students listing */}
            <div className="font-semibold text-gray-700 mb-3">Students ({participantCount - (isLive && isInstructor ? 1 : 0)})</div>
            <div className="pl-2 space-y-3">
            {isInstructor ? ( // Instructor view shows individual student IDs
              connectedStudents.length > 0 ? (
                connectedStudents.map((studentId, i) => (
                  <div key={studentId} className="flex items-center">
                  <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-gray-600 font-bold text-sm">S{i + 1}</span>
                  </div>
                  <div>
                  <p className="text-sm text-gray-800 font-medium">Student {i + 1}</p>
                  <p className="text-xs text-gray-500 break-all">ID: {studentId}</p>
                  </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-500 py-4 text-center">
                <UserPlus className="h-6 w-6 mb-2" />
                <p className="text-sm">No students connected yet.</p>
                <p className="text-xs mt-1">Share the session ID to invite participants.</p>
                </div>
              )
            ) : ( // Student view shows themselves and a generic count
            <div className="flex items-center">
            <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center mr-3 flex-shrink-0">
            <span className="text-gray-600 font-bold text-sm">You</span>
            </div>
            <div>
            <p className="text-sm text-gray-800 font-medium">You</p>
            <p className="text-xs text-gray-500 break-all">ID: {userId.current}</p>
            </div>
            </div>
            )}
            </div>
            </div>
        )}
        </div>
        </div>
        </div>
        </MobileLayout>
  );
};

export default LiveSession;

