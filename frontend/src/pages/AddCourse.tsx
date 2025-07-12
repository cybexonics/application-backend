import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

const AddCourse = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [courseData, setCourseData] = useState({
    title: "",
    level: "",
    price: "",
    description: "",
    category: "",
    language: "",
    isCertificate: false,
    duration: "",
    learningObjectives: "",
    prerequisites: "",
    thumbnail: null,
    demoVideo: null,
  });

  useEffect(()=>{
  console.log(user)
  },[])
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked) => {
    setCourseData((prev) => ({ ...prev, isCertificate: checked }));
  };

  const handleSelectChange = (name, value) => {
    setCourseData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      // Validate file size (thumbnail: 5MB, video: 50MB)
      const maxSize = name === "thumbnail" ? 5 * 1024 * 1024 : 50 * 1024 * 1024;
      if (files[0].size > maxSize) {
        toast({
          title: "File Too Large",
          description: `${name === "thumbnail" ? "Thumbnail" : "Demo video"} must be under ${maxSize / (1024 * 1024)}MB.`,
          variant: "destructive",
        });
        return;
      }
      // Validate video duration (30 seconds)
      if (name === "demoVideo") {
        const video = document.createElement("video");
        video.src = URL.createObjectURL(files[0]);
        video.onloadedmetadata = () => {
          if (video.duration > 30) {
            toast({
              title: "Video Too Long",
              description: "Demo video must be 30 seconds or less.",
              variant: "destructive",
            });
            e.target.value = null;
          } else {
            setCourseData((prev) => ({ ...prev, [name]: files[0] }));
          }
          URL.revokeObjectURL(video.src);
        };
      } else {
        setCourseData((prev) => ({ ...prev, [name]: files[0] }));
      }
    }
  };

  const uploadToCloudinary = async (file, type) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default");
    formData.append("resource_type", type === "thumbnail" ? "image" : "video");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/djowkrpwk/${type === "thumbnail" ? "image" : "video"}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to upload ${type} to Cloudinary`);
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a course.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    const requiredFields = ["title", "level", "price", "description", "thumbnail", "language","duration"];
    for (const field of requiredFields) {
      if (!courseData[field]) {
        toast({
          title: "Missing Information",
          description: `Please provide ${field.replace(/([A-Z])/g, " $1").toLowerCase()}.`,
          variant: "destructive",
        });
        return;
      }
    }

    if (isNaN(courseData.price) || courseData.price < 0) {
      toast({
        title: "Invalid Price",
        description: "Price must be a valid number.",
        variant: "destructive",
      });
      return;
    }

    if (courseData.duration && (isNaN(courseData.duration) || courseData.duration <= 0)) {
      toast({
        title: "Invalid Duration",
        description: "Duration must be a positive number.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      let demoVideoUrl = "";
      const thumbnailUrl = await uploadToCloudinary(courseData.thumbnail, "thumbnail");
      if (courseData.demoVideo){
        demoVideoUrl = await uploadToCloudinary(courseData.demoVideo, "demoVideo");
      }
      // Prepare course data
      const coursePayload = {
        title: courseData.title,
        level: courseData.level,
        price: parseFloat(courseData.price),
        description: courseData.description,
        category: courseData.category || undefined,
        language: courseData.language || undefined,
        isCertificate: courseData.isCertificate,
        duration: courseData.duration ? parseFloat(courseData.duration) : undefined,
        learningObjectives: courseData.learningObjectives || undefined,
        prerequisites: courseData.prerequisites || undefined,
        thumbnailUrl: thumbnailUrl,
        demoVideo: demoVideoUrl || undefined,
      };

      // Send course data to backend
      const response = await fetch("https://learn-x-swart.vercel.app/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("eduApp_token")}`,
        },
        body: JSON.stringify(coursePayload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to create course");
      }

      toast({
        title: "Course Created",
        description: data.message || "Your course has been created successfully.",
      });
      navigate("/courses");
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to create course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <MobileLayout title="Add New Course" showBackButton>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Course Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Course Name *</label>
                <Input
                  name="title"
                  value={courseData.title}
                  onChange={handleChange}
                  placeholder="e.g. Complete Web Development"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  name="description"
                  value={courseData.description}
                  onChange={handleChange}
                  placeholder="Detail what students will learn in this course"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Input
                    name="category"
                    value={courseData.category}
                    onChange={handleChange}
                    placeholder="e.g. Web Development"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Level *</label>
                  <Select
                    value={courseData.level}
                    onValueChange={(value) => handleSelectChange("level", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price (₹) *</label>
                  <Input
                    name="price"
                    type="number"
                    min="0"
                    value={courseData.price}
                    onChange={handleChange}
                    placeholder="e.g. 1999"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Language*</label>
                  <Select
                    value={courseData.language}
                    onValueChange={(value) => handleSelectChange("language", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="hindi">Hindi</SelectItem>
                      <SelectItem value="marathi">Marathi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (days)*</label>
                <Input
                  name="duration"
                  type="number"
                  min="0"
                  step="1"
                  max="366"
                  value={courseData.duration}
                  onChange={handleChange}
                  placeholder="e.g. 10.5"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Checkbox
                    checked={courseData.isCertificate}
                    onCheckedChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  Certificate Provided
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Learning Objectives</label>
                <Textarea
                  name="learningObjectives"
                  value={courseData.learningObjectives}
                  onChange={handleChange}
                  placeholder="e.g. Learn React, Build REST APIs"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Prerequisites</label>
                <Textarea
                  name="prerequisites"
                  value={courseData.prerequisites}
                  onChange={handleChange}
                  placeholder="e.g. Basic HTML, JavaScript knowledge"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Course Thumbnail *</label>
                <Input
                  type="file"
                  name="thumbnail"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
                <p className="text-xs text-gray-500">Recommended size: 1280x720px, Max 5MB</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">30-Second Demo Video</label>
                <Input
                  type="file"
                  name="demoVideo"
                  accept="video/*"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-gray-500">Max 30 seconds, Max 50MB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full blue-gradient" disabled={isUploading}>
          {isUploading ? (
            <>
              <span className="animate-spin mr-2">⟳</span> Creating Course...
            </>
          ) : (
            "Create Course"
          )}
        </Button>
      </form>
    </MobileLayout>
  );
};

export default AddCourse;
