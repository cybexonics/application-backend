import React, { useState, useEffect } from "react";
import MobileNavbar from "./MobileNavbar";
import { ArrowLeft, Bell, Search, X, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  bgColor?: string; // Optional background color
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  title,
  showBackButton = false,
  bgColor = "bg-gradient-to-r from-white-600 to-white-800",
}) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: "1", message: "New session: React Hooks", time: "2025-05-17 10:00 AM" },
    { id: "2", message: "Assignment due: Web Dev", time: "2025-05-16 5:00 PM" },
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const mockData = [
          {
            id: Math.random().toString(36).substr(2, 9),
            message: "New session: Advanced React",
            time: new Date().toLocaleString(),
          },
        ];
        setNotifications((prev) => [...mockData, ...prev.slice(0, 4)]);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 30000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white shadow-sm w-full">
        <div className={`text-black py-3 px-4 flex items-center justify-between pt-safe`}>
          <div className="flex items-center">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-lg md:text-xl font-medium truncate flex-1 text-center">
              {title || "EduApp"}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/courses")}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsNotificationOpen(true)}
              className="relative"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/profile")}
              aria-label="Profile"
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 py-4 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer Navbar */}
      <footer className="fixed bottom-0 w-full max-w-screen-xl mx-auto bg-white shadow-t-md z-10">
        <MobileNavbar />
      </footer>

      {/* Notification Panel */}
      {isNotificationOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-80 bg-white shadow-lg z-30 pt-safe transition-transform duration-300 transform translate-x-0">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsNotificationOpen(false)}
              aria-label="Close notifications"
            >
              <X className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
          <div className="p-4 space-y-3 overflow-y-auto h-full">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <Card key={notification.id} className="card-shadow hover:bg-gray-50 transition-colors">
                  <CardContent className="p-3">
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center">No notifications</p>
            )}
          </div>
        </div>
      )}

      {/* Overlay for Notification Panel on Mobile */}
      {isNotificationOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsNotificationOpen(false)}
        />
      )}
    </div>
  );
};

export default MobileLayout;
