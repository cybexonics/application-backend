import React, { useState, useEffect } from "react";
import MobileLayout from "../components/MobileLayout";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "https://learn-x-swart.vercel.app/api";

const CourseListing = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState(["All"]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/courses`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }

        const data = await response.json();
        if (!data.success || !Array.isArray(data.data)) {
          throw new Error("Invalid response format");
        }
        console.log(data?.data)
        // Set courses
        const fetchedCourses = data.data.map((course) => ({
          ...course,
          purchased: user && course.enrolledStudentIds.includes(user.id),
        }));
        setCourses(fetchedCourses);

        // Generate unique categories
        const uniqueCategories = [
          "All",
          ...new Set(fetchedCourses.map((course) => course.category).filter(Boolean)),
        ];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast({
          title: "Error",
          description: "Failed to load courses. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  // Filter courses
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <MobileLayout title="Courses">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Courses">
      <div className="space-y-6">
        {/* Search Input */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Categories */}
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex space-x-2 pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={
                  selectedCategory === category
                    ? "blue-gradient text-white"
                    : "bg-white text-gray-700 whitespace-nowrap"
                }
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Course List */}
        <div className="space-y-4">
          {user?.role === "teacher" && (
            <div className="flex justify-end mb-4">
              <Link to="/add-course">
                <Button className="blue-gradient">Add New Course</Button>
              </Link>
            </div>
          )}

          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <Link to={`/course/${course.id}`} key={course.id}>
                <Card className="card-shadow overflow-hidden mt-5">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="h-32 w-full object-cover"
                  />
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium line-clamp-2 font-semibold">{course.title}</h3>
                        <p className="text-sm text-gray-500">
                          Instructor ID: {course.teacherIds[0].name}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm ml-1">{course.enrollmentCount} enrolled</span>
                        </div>
                        <div className="flex items-center mt-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm ml-1">{course.contentCount} content</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{course.price}</p>
                        {course.purchased && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 mt-1">
                            Purchased
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No courses found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default CourseListing;
