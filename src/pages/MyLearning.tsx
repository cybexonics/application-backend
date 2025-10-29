
import { useState, useEffect } from "react";
import MobileLayout from "../components/MobileLayout";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { mockEnrolledCourses } from "../data/mockData";
import { Book, CalendarClock, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const MyLearning = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("courses");

    useEffect(() => {
  const fetchEnrolledCourses = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("eduApp_token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await fetch(process.env.API_BASE_URL+"/api/courses/enrolled", {
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
      setEnrolledCourses(data?.data);
      setUpcomingSessions(
        data?.data.flatMap((course: any) => course.upcomingLiveSessions || [])
      );
    } catch (error) {
      console.error("Error loading enrolled courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchEnrolledCourses();
}, []);


  if (isLoading) {
    return (
      <MobileLayout title="My Learning">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="My Learning">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex rounded-lg overflow-hidden border border-gray-200">
          <button
            className={`flex-1 py-3 px-4 text-center text-sm font-medium ${activeTab === "courses" ? "bg-blue-600 text-white" : "bg-white text-gray-600"}`}
            onClick={() => setActiveTab("courses")}
          >
            My Courses
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center text-sm font-medium ${activeTab === "sessions" ? "bg-blue-600 text-white" : "bg-white text-gray-600"}`}
            onClick={() => setActiveTab("sessions")}
          >
            Live Sessions
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center text-sm font-medium ${activeTab === "certificates" ? "bg-blue-600 text-white" : "bg-white text-gray-600"}`}
            onClick={() => setActiveTab("certificates")}
          >
            Certificates
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === "courses" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">My Enrolled Courses</h2>
            {enrolledCourses.length > 0 ? (
              <>
                {enrolledCourses.map((course, index) => (
                  <Card key={index} className="overflow-hidden">
                    <Link to={`/course/${course.id}`}>
                      <div className="relative h-32 bg-blue-100">
                        {course.image ? (
                          <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="h-12 w-12 text-blue-500" />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                          <h3 className="text-white font-medium">{course.title}</h3>
                        </div>
                      </div>
                    </Link>
                    <CardContent className="p-4">
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2 bg-gray-200" />
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <Link to={`/course/${course.id}`}>
                          <Button variant="outline" size="sm" className="text-xs h-8">
                            Continue Learning
                          </Button>
                        </Link>
                        <span className="text-xs text-gray-500">
                          Last accessed: {new Date().toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <div className="text-center">
                  <Link to="/courses">
                    <Button className="blue-gradient">Browse More Courses</Button>
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-10 bg-blue-50 rounded-lg">
                <Book className="mx-auto h-12 w-12 text-blue-400 mb-3" />
                <p className="text-gray-600 mb-3">You haven't enrolled in any courses yet.</p>
                <Link to="/courses">
                  <Button className="blue-gradient">Browse Courses</Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === "sessions" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Upcoming Live Sessions</h2>
            {upcomingSessions.length > 0 ? (
              <>
                {upcomingSessions.map((session, index) => (
                  <Card key={index} className="card-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          <div className="bg-blue-100 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0">
                            <CalendarClock className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{session.title}</h3>
                            <p className="text-gray-500 text-sm">{session.course}</p>
                            <p className="text-sm mt-1">
                              {new Date(session.date).toLocaleDateString()}, {session.time}
                            </p>
                          </div>
                        </div>
                        <Link to={`/live-session/${session.id}`}>
                          <Button variant="outline" className="text-blue-600 border-blue-600 text-xs h-8">
                            Join
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <div className="text-center py-10 bg-blue-50 rounded-lg">
                <CalendarClock className="mx-auto h-12 w-12 text-blue-400 mb-3" />
                <p className="text-gray-600">No upcoming live sessions scheduled.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "certificates" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">My Certificates</h2>
            <div className="text-center py-10 bg-blue-50 rounded-lg">
              <div className="mx-auto h-12 w-12 text-blue-400 mb-3 border-2 border-blue-400 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-award"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
              </div>
              <p className="text-gray-600 mb-1">Complete a course to earn your certificate!</p>
              <p className="text-xs text-gray-500 mb-3">Certificates will appear here once you complete a course.</p>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default MyLearning;
