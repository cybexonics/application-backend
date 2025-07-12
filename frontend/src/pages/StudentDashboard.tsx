
import { useState, useEffect } from "react";
import MobileLayout from "../components/MobileLayout";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockEnrolledCourses } from "../data/mockData";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data loading
    const timeoutId = setTimeout(() => {
      setEnrolledCourses(mockEnrolledCourses);
      setUpcomingSessions(mockEnrolledCourses.flatMap(course => course.upcomingLiveSessions || []));
      setIsLoading(false);
    }, 500);
    console.log(user)
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
        <section className="animate-fade-in">
          <div className="blue-gradient rounded-xl p-4 shadow-lg">
            <h2 className="text-lg font-semibold text-white">Learning Progress</h2>
            <p className="text-blue-100 text-sm mt-1">Track your course progress</p>
            <div className="mt-3">
              <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: '35%' }}></div>
              </div>
              <div className="mt-2 flex justify-between text-xs text-blue-100">
                <span>3/8 courses completed</span>
                <span>35% complete</span>
              </div>
            </div>
          </div>
        </section>

        <section className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-lg font-semibold mb-3">Upcoming Live Sessions</h2>
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
                      <Link to={`/live-session/${session.id}`}>
                            <Button size="sm" variant="outline" className="text-blue-600 border-blue-600">
                              Join
                            </Button>
                          </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No upcoming sessions scheduled.</p>
          )}
        </section>

        <section className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-lg font-semibold mb-3">My Courses</h2>
          {enrolledCourses.length > 0 ? (
            <div className="space-y-3">
              {enrolledCourses.map((course, index) => (
                <Card key={index} className="card-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center">
                        <span className="text-xl text-blue-500">{course.shortName}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{course.title}</h3>
                        <p className="text-gray-500 text-xs">{course.instructor}</p>
                        <div className="mt-1 flex items-center">
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 ml-2">{course.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-blue-50 rounded-lg">
              <p className="text-gray-600 mb-3">You haven't enrolled in any courses yet.</p>
              <Button className="blue-gradient">Browse Courses</Button>
            </div>
          )}
        </section>
      </div>
    </MobileLayout>
  );
};

export default StudentDashboard;
