
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react"
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import TermsConditions from "./pages/TermsConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import UserProfile from "./pages/UserProfile";
import CourseListing from "./pages/CourseListing";
import CourseDetails from "./pages/CourseDetails";
import LiveSession from "./pages/LiveSession";
import AddCourse from "./pages/AddCourse";
import ScheduleSession from "./pages/ScheduleSession";
import HelpSupport from "./pages/HelpSupport";
import MyLearning from "./pages/MyLearning";
import Certificate from "./pages/Certificate";
import PaymentGateway from "./pages/PaymentGateway";
import PaymentSuccess from "./pages/PaymentSuccess";
import TeacherSchedule from "./pages/TeacherSchedule";
import SplashScreen from "./pages/SplashScreen"

const queryClient = new QueryClient();

const App = () => {
return(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/terms" element={<TermsConditions />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses"
              element={
                <ProtectedRoute>
                  <CourseListing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-learning"
              element={
                <ProtectedRoute>
                  <MyLearning />
                </ProtectedRoute>
              }
            />
            <Route
              path="/course/:courseId"
              element={
                <ProtectedRoute>
                  <CourseDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/certificate/:courseId"
              element={
                <ProtectedRoute>
                  <Certificate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/certificate"
              element={
                <ProtectedRoute>
                  <Certificate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/live-session/:sessionId"
              element={
                <ProtectedRoute>
                  <LiveSession />
                </ProtectedRoute>
              }
            />
            <Route
              path="/help"
              element={
                <ProtectedRoute>
                  <HelpSupport />
                </ProtectedRoute>
              }
            />

            {/* Payment Routes */}
            <Route
              path="/payment/:courseId"
              element={
                <ProtectedRoute>
                  <PaymentGateway />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment-success/:courseId"
              element={
                <ProtectedRoute>
                  <PaymentSuccess />
                </ProtectedRoute>
              }
            />

            {/* Teacher-only Routes */}
            <Route
              path="/add-course"
              element={
                <ProtectedRoute requiredRole="teacher">
                  <AddCourse />
                </ProtectedRoute>
              }
            />
            <Route
              path="/schedule-session/:courseId"
              element={
                <ProtectedRoute requiredRole="teacher">
                  <ScheduleSession />
                </ProtectedRoute>
              }
            />
            <Route
              path="/schedule"
              element={
                <ProtectedRoute requiredRole="teacher">
                  <TeacherSchedule />
                </ProtectedRoute>
              }
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  )
};

export default App;
