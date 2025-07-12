
import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Play, Calendar, Eye, ArrowRight, Check } from "lucide-react";
import CourseDetailsSkeleton from "../components/CourseDetailsSkeleton";
import { usePermissions } from "../hooks/usePermissions";
import { useAuth } from "@/context/AuthContext";

const CourseDetails = () => {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const { user } = useAuth()

  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchased, setIsPurchased] = useState(false);
  const [activeContent, setActiveContent] = useState<any>(null);
  const [viewingContent, setViewingContent] = useState(false);

  useEffect(() => {
  const fetchCourse = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`https://learn-x-swart.vercel.app/api/courses/${courseId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch course data");
      }

      const result = await response.json();

      console.log(user)

      setCourse(result?.data);
      setIsPurchased(result?.data?.enrolledStudentIds.find(i=>i === user._id))
    } catch (error) {
      console.error("Error fetching course:", error);
      toast({
        title: "Error loading course",
        description: "There was a problem loading the course details.",
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  fetchCourse();
}, [courseId, location.state]);

  const handlePurchase = () => {
    // Navigate to payment page
    navigate(`/payment/${courseId}`, {
      state: { courseDetails: course }
    });
  };

  const openContentViewer = (lesson: any) => {
    if (!isPurchased) {
      toast({
        title: "Purchase Required",
        description: "Please purchase this course to access the content.",
      });
      return;
    }

    setActiveContent(lesson);
    setViewingContent(true);
  };

  const closeContentViewer = () => {
    setViewingContent(false);
    setActiveContent(null);
  };

  const markAsCompleted = (lessonId: string) => {
    setCourse((prevCourse: any) => ({
      ...prevCourse,
      lessons: prevCourse.lessons.map((lesson: any) =>
        lesson.id === lessonId
          ? { ...lesson, completed: true }
          : lesson
      ),
      completedLessons: prevCourse.completedLessons + 1,
      overallProgress: Math.round((prevCourse.completedLessons + 1) / prevCourse.lessons.length * 100)
    }));

    toast({
      title: "Progress Updated",
      description: "Lesson marked as completed!",
    });
  };

  if (isLoading) {
    return (
      <MobileLayout showBackButton>
        <CourseDetailsSkeleton />
      </MobileLayout>
    );
  }

  // Content viewer overlay
  if (viewingContent && activeContent) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col z-50">
        <div className="bg-white p-4 flex items-center justify-between">
          <h3 className="font-medium truncate">{activeContent.title}</h3>
          <Button variant="ghost" size="sm" onClick={closeContentViewer}>
            Close
          </Button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center bg-gray-100 overflow-auto">
          {activeContent.type === "video" ? (
            <div className="w-full">
              <img
                src={activeContent.content}
                alt="Video placeholder"
                className="w-full aspect-video"
              />
              <div className="bg-black p-3 text-white flex items-center justify-center">
                Video Player Controls (Placeholder)
              </div>
            </div>
          ) : (
            <img
              src={activeContent.thumbnailUrl}
              alt="PDF document"
              className="w-full max-w-lg"
            />
          )}
        </div>

        <div className="bg-white p-4 flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            className="text-sm"
            onClick={() => markAsCompleted(activeContent.id)}
            disabled={activeContent.completed}
          >
            {activeContent.completed ? "Completed" : "Mark as Complete"}
          </Button>
          <div className="text-sm">
            {activeContent.duration} • {activeContent.type}
          </div>
        </div>
      </div>
    );
  }

  return (
    <MobileLayout title={course?.title} showBackButton>
      <div className="space-y-6">
        {/* Course Image */}
        <div className="rounded-lg overflow-hidden">
          <img
            src={course?.thumbnailUrl}
            alt={course?.title}
            className="w-full h-48 object-cover"
          />
        </div>

        {/* Course Info */}
        <div>
          <h1 className="text-xl font-bold">{course?.title}</h1>
          <p className="text-gray-600">Instructor: {course?.teacherIds[0]?.name}</p>

          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center">
              <span className="text-yellow-500">★</span>
              <span className="ml-1">{course?.rating}</span>
            </div>
            <div className="text-sm text-gray-500">
              {course?.contentCount} lessons • {course?.duration} days
            </div>
          </div>

          {isPurchased && (
            <div className="mt-3 bg-blue-50 rounded-lg p-3">
              <h3 className="text-sm font-medium text-blue-700 mb-1">Your Progress</h3>
              <Progress value={course?.overallProgress} className="h-2" />
              <div className="flex justify-between mt-1 text-xs text-gray-600">
                <span>{course?.completedLessons}/{course?.lessons.length} lessons completed</span>
                <span>{course?.overallProgress}%</span>
              </div>
            </div>
          )}
        </div>

        {!isPurchased ? (
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-lg font-semibold">₹{course?.price}</p>
            <p className="text-sm text-gray-600 mb-3">Purchase this course to access all content and live sessions</p>
            <Button
              className="w-full blue-gradient"
              onClick={handlePurchase}
            >
              Purchase Course
            </Button>
            <div className="text-xs text-center mt-2 text-gray-500">
              <Link to="/terms" className="text-blue-500">Terms & Conditions</Link> apply
            </div>
          </div>
        ) : ""}

         <div>
          <h2 className="text-lg font-semibold mb-2">About This Course</h2>
          <p className="text-gray-700">{course?.description}</p>
        </div>

        
          <Tabs defaultValue="content">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content">Course Content</TabsTrigger>
              <TabsTrigger value="live">Live Sessions</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-4">
              <div className="space-y-3">
                {course?.content.map((lesson: any) => (
                  <Card key={lesson.id} className={`card-shadow ${lesson.completed ? 'border-l-4 border-l-green-500' : ''}`}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0
                            ${lesson.completed ? 'bg-green-100' : 'bg-blue-100'}`}
                          onClick={() => openContentViewer(lesson)}
                        >
                          {lesson.completed ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Play className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1" onClick={() => openContentViewer(lesson)}>
                          <p className="font-medium">{lesson.title}</p>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{lesson.duration}</span>
                            <span>{lesson.type}</span>
                          </div>
                        </div>
                        {isPurchased && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openContentViewer(lesson)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="live" className="mt-4">
              <div className="space-y-3">
                {course?.liveSessions ? course?.liveSessions?.map((session: any) => (
                  <Card key={session.id} className="card-shadow">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-100 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Calendar className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{session.title}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(session.date).toLocaleDateString()}, {session.time}
                            </p>
                          </div>
                        </div>

                        {session.status === 'upcoming' ? (
                          <Link to={`/live-session/${session.id}`}>
                            <Button size="sm" variant="outline" className="text-blue-600 border-blue-600">
                              Join
                            </Button>
                          </Link>
                        ) : (
                          <div className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                            {session.status}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )) : "No Live Session"}
              </div>

              {hasPermission('schedule:session') && (
                <div className="mt-4">
                  <Link to={`/schedule-session/${courseId}`}>
                    <Button className="w-full" variant="outline">
                      Schedule New Session
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>
          </Tabs>
        

        {/* Course Description */}

        {/* Teacher Actions */}
        {hasPermission('edit:course') && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Teacher Actions</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                Edit Course
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Add Content
              </Button>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default CourseDetails;
