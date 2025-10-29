
import React, { useEffect, useState } from "react";
import MobileLayout from "../components/MobileLayout";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar, Clock, Users, Edit, Trash2, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import ScheduleSkeleton from "../components/ScheduleSkeleton";

interface LiveSession {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  date: string;
  time: string;
  duration: string;
  studentsEnrolled: number;
  status: "upcoming" | "completed" | "cancelled";
}

const TeacherSchedule = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    // Fetch live sessions data - would be replaced by an API call
    const timeoutId = setTimeout(() => {
      const mockSessions: LiveSession[] = [
        {
          id: "session1",
          title: "Introduction to React Hooks",
          courseId: "course1",
          courseName: "React Masterclass",
          date: "2023-06-10",
          time: "14:00-15:30",
          duration: "1.5 hours",
          studentsEnrolled: 15,
          status: "upcoming"
        },
        {
          id: "session2",
          title: "Advanced State Management",
          courseId: "course1",
          courseName: "React Masterclass",
          date: "2023-06-15",
          time: "14:00-16:00",
          duration: "2 hours",
          studentsEnrolled: 12,
          status: "upcoming"
        },
        {
          id: "session3",
          title: "Introduction to JavaScript",
          courseId: "course2",
          courseName: "Web Development Fundamentals",
          date: "2023-05-20",
          time: "10:00-11:30",
          duration: "1.5 hours",
          studentsEnrolled: 25,
          status: "completed"
        },
        {
          id: "session4",
          title: "CSS Grid and Flexbox",
          courseId: "course2",
          courseName: "Web Development Fundamentals",
          date: "2023-05-25",
          time: "10:00-11:30",
          duration: "1.5 hours",
          studentsEnrolled: 23,
          status: "completed"
        },
        {
          id: "session5",
          title: "Responsive Design Principles",
          courseId: "course2",
          courseName: "Web Development Fundamentals",
          date: "2023-06-20",
          time: "10:00-11:30",
          duration: "1.5 hours",
          studentsEnrolled: 18,
          status: "upcoming"
        }
      ];
      
      setLiveSessions(mockSessions);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  const handleDeleteSession = (sessionId: string) => {
    // In a real app, this would make an API call to delete the session
    setLiveSessions(liveSessions.filter(session => session.id !== sessionId));
    toast({
      title: "Session Cancelled",
      description: "The live session has been cancelled successfully."
    });
  };

  const handleEditSession = (sessionId: string, courseId: string) => {
    navigate(`/schedule-session/${courseId}`, { 
      state: { sessionId, isEdit: true }
    });
  };

  const filteredSessions = liveSessions.filter(session => {
    if (activeTab === "upcoming") return session.status === "upcoming";
    if (activeTab === "past") return session.status === "completed";
    return true; // "all" tab
  });

  if (isLoading) {
    return (
      <MobileLayout title="My Schedule">
        <ScheduleSkeleton />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="My Schedule">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Live Sessions</h2>
          <Link to="/add-course">
            <Button className="blue-gradient flex items-center gap-1">
              <Plus className="h-4 w-4" />
              New Course
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-4">
            {filteredSessions.length > 0 ? (
              <div className="space-y-3">
                {filteredSessions.map((session) => (
                  <Card key={session.id} className="card-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-3">
                        <div>
                          <h3 className="font-medium text-blue-700">{session.title}</h3>
                          <p className="text-sm text-gray-600">{session.courseName}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                            <span>{new Date(session.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-blue-600" />
                            <span>{session.time} ({session.duration})</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-blue-600" />
                            <span>{session.studentsEnrolled} students enrolled</span>
                          </div>
                          <div className="flex items-center">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              session.status === "upcoming" 
                                ? "bg-blue-100 text-blue-700" 
                                : "bg-gray-100 text-gray-700"
                            }`}>
                              {session.status === "upcoming" ? "Upcoming" : "Completed"}
                            </span>
                          </div>
                        </div>
                        
                        {session.status === "upcoming" && (
                          <div className="flex justify-between mt-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => handleEditSession(session.id, session.courseId)}
                            >
                              <Edit className="h-3.5 w-3.5" />
                              Edit
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleDeleteSession(session.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Cancel
                            </Button>
                            
                            <Link to={`/live-session/${session.id}`}>
                              <Button 
                                className="blue-gradient flex items-center gap-1"
                                size="sm"
                              >
                                Start Session
                              </Button>
                            </Link>
                          </div>
                        )}
                        
                        {session.status === "completed" && (
                          <div className="flex justify-between mt-2">
                            <Link to={`/course/${session.courseId}`}>
                              <Button 
                                variant="outline"
                                size="sm"
                              >
                                Course Details
                              </Button>
                            </Link>
                            
                            <Button 
                              className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                              size="sm"
                            >
                              View Recording
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No {activeTab} sessions found</p>
                <Link to="/schedule-session/new">
                  <Button className="blue-gradient">
                    Schedule a New Session
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="fixed bottom-20 right-4">
          <Link to="/schedule-session/new">
            <Button className="rounded-full w-14 h-14 shadow-lg blue-gradient">
              <Plus className="h-6 w-6" />
            </Button>
          </Link>
        </div>
      </div>
    </MobileLayout>
  );
};

export default TeacherSchedule;
