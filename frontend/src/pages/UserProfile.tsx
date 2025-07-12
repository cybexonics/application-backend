
import React, { useState, useEffect } from "react";
import MobileLayout from "../components/MobileLayout";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import ProfileSettings from "../components/ProfileSettings";
import { Camera } from "lucide-react";

const UserProfile = () => {
  const { user, logout, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

 useEffect(() => {
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("eduApp_token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await fetch("https://learn-x-swart.vercel.app/api/user/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch enrolled courses");
      }

      const data = await response.json();
      console.log(data?.data)
    } catch (error) {
      console.error("Error loading enrolled courses:", error);
    }
  };

  fetchProfile();
}, [user,updateUserProfile]);


  const handleLogout = () => {
    logout();
  };

  const handleProfilePictureChange = () => {
    // In a real app, this would open a file picker
    // For now, just cycle through some placeholder images
    const images = [
      `https://placehold.co/100x100?text=${user?.name?.charAt(0) || 'U'}`,
      `https://placehold.co/100x100/blue/white?text=${user?.name?.charAt(0) || 'U'}`,
      `https://placehold.co/100x100/green/white?text=${user?.name?.charAt(0) || 'U'}`
    ];

    const currentImage = user?.profilePicture || images[0];
    const currentIndex = images.findIndex(img => img === currentImage);
    const nextIndex = (currentIndex + 1) % images.length;

    updateUserProfile({ profilePicture: images[nextIndex] });

    toast({
      title: "Profile Picture Updated",
      description: "Your profile picture has been updated successfully.",
    });
  };

  return (
    <MobileLayout title="My Profile">
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-blue-200">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                  <span className="text-3xl font-bold text-blue-600">
                    {user?.name?.charAt(0) || "U"}
                  </span>
                </div>
              )}
            </div>
            <button
              className="absolute bottom-0 right-0 bg-blue-500 text-white p-1.5 rounded-full"
              onClick={handleProfilePictureChange}
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <h1 className="text-xl font-bold mt-3">{user?.name}</h1>
          <p className="text-gray-500 text-sm">
            {user?.role === 'teacher' ? 'Teacher' : 'Student'}
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium capitalize">{user?.role}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">May 1, 2023</p>
                </div>
              </CardContent>
            </Card>

            {/* Additional Options */}
            <Card>
              <CardContent className="p-0">
                <Link to="/my-learning" className="block px-4 py-3 hover:bg-gray-50">
                  <p className="text-sm font-medium">My Learning</p>
                </Link>
                <Separator />
                <Link to="/certificate" className="block px-4 py-3 hover:bg-gray-50">
                  <p className="text-sm font-medium">Certificates</p>
                </Link>
                <Separator />
                <Link to="/help" className="block px-4 py-3 hover:bg-gray-50">
                  <p className="text-sm font-medium">Help & Support</p>
                </Link>
                <Separator />
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50"
                >
                  <p className="text-sm font-medium">Sign Out</p>
                </button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <ProfileSettings />
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
};

export default UserProfile;
