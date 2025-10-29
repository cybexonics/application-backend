
import { useState, useEffect } from "react";
import MobileLayout from "../components/MobileLayout";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockTeacherCourses } from "../data/mockData";

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [students, setStudents] = useState({ total: 0, active: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data loading
    const timeoutId = setTimeout(() => {
      setTeacherCourses(mockTeacherCourses);
      const sessions = mockTeacherCourses.flatMap(course => course.upcomingLiveSessions || []);
      setUpcomingSessions(sessions);
      
      // Calculate total students from mock data
      const totalStudents = mockTeacherCourses.reduce((acc, course) => acc + course.enrolledCount, 0);
      const activeStudents = Math.floor(totalStudents * 0.75);
      setStudents({ total: totalStudents, active: activeStudents });
      
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, []);

  if (isLoading) {
    return (
      <MobileLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title={`Welcome, ${user?.name}`}>
      <div className="space-y-6">
        {/* Summary Cards */}
        <section className="flex gap-4 animate-fade-in">
          <Card className="flex-1 card-shadow bg-blue-500 text-white">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-blue-50">Total Students</p>
              <h2 className="text-2xl font-bold">{students.total}</h2>
            </CardContent>
          </Card>
          <Card className="flex-1 card-shadow bg-blue-700 text-white">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-blue-50">Active Students</p>
              <h2 className="text-2xl font-bold">{students.active}</h2>
            </CardContent>
          </Card>
          <Card className="flex-1 card-shadow bg-blue-900 text-white">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-blue-50">Courses</p>
              <h2 className="text-2xl font-bold">{teacherCourses.length}</h2>
            </CardContent>
          </Card>
        </section>
        
        {/* Upcoming Sessions */}
        <section className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Upcoming Sessions</h2>
            <Button variant="ghost" className="text-blue-600 text-xs h-8">
              View All
            </Button>
          </div>
          
          {upcomingSessions.length > 0 ? (
            <div className="space-y-3">
              {upcomingSessions.slice(0, 3).map((session, index) => (
                <Card key={index} className="card-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-blue-700">{session.title}</h3>
                        <p className="text-gray-500 text-sm">{session.course}</p>
                        <p className="text-sm mt-1">
                          {new Date(session.date).toLocaleDateString()}, {session.time}
                        </p>
                      </div>
                      <Button variant="outline" className="text-blue-600 border-blue-600 text-xs h-8">
                        Prepare
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No upcoming sessions scheduled.</p>
          )}
        </section>
        
        {/* My Courses */}
        <section className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">My Courses</h2>
            <Button variant="outline" className="blue-gradient text-xs h-8">
              Add Course
            </Button>
          </div>
          
          {teacherCourses.length > 0 ? (
            <div className="space-y-3">
              {teacherCourses.map((course, index) => (
                <Card key={index} className="card-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center">
                        <span className="text-xl text-blue-500">{course.shortName}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{course.title}</h3>
                        <p className="text-gray-500 text-xs">
                          {course.enrolledCount} students enrolled
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <Button variant="outline" className="text-xs h-7 px-2 py-0">
                            Edit
                          </Button>
                          <Button variant="outline" className="text-xs h-7 px-2 py-0">
                            Content
                          </Button>
                          <Button variant="outline" className="text-xs h-7 px-2 py-0">
                            Live
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-blue-50 rounded-lg">
              <p className="text-gray-600 mb-3">You haven't created any courses yet.</p>
              <Button className="blue-gradient">Create First Course</Button>
            </div>
          )}
        </section>
      </div>
    </MobileLayout>
  );
};

export default TeacherDashboard;
