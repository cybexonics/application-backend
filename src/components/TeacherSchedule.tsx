
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Plus, X } from "lucide-react";

interface ScheduleItem {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  courseId: string;
}

interface TeacherScheduleProps {
  courses: {
    id: string;
    title: string;
  }[];
}

const TeacherSchedule: React.FC<TeacherScheduleProps> = ({ courses }) => {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [newSession, setNewSession] = useState({
    title: "",
    startTime: "10:00",
    endTime: "11:00",
    courseId: ""
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddSession = () => {
    if (!selectedDate || !newSession.title || !newSession.courseId) return;
    
    const newItem: ScheduleItem = {
      id: Math.random().toString(36).substring(2, 9),
      title: newSession.title,
      date: selectedDate,
      startTime: newSession.startTime,
      endTime: newSession.endTime,
      courseId: newSession.courseId
    };
    
    setScheduleItems([...scheduleItems, newItem]);
    setNewSession({
      title: "",
      startTime: "10:00",
      endTime: "11:00",
      courseId: ""
    });
    setIsDialogOpen(false);
  };

  const handleDeleteSession = (id: string) => {
    setScheduleItems(scheduleItems.filter(item => item.id !== id));
  };

  const getSessionsForSelectedDate = () => {
    if (!selectedDate) return [];
    
    return scheduleItems.filter(item => 
      format(item.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
    );
  };

  const getCourseTitleById = (id: string) => {
    const course = courses.find(c => c.id === id);
    return course ? course.title : 'Unknown Course';
  };

  return (
    <div className="space-y-4">
      <Card className="card-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Schedule Management</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="blue-gradient">
                  <Plus className="h-4 w-4 mr-1" /> New Session
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule New Live Session</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Session Title</label>
                    <Input 
                      value={newSession.title}
                      onChange={(e) => setNewSession({...newSession, title: e.target.value})}
                      placeholder="Enter session title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Course</label>
                    <Select 
                      value={newSession.courseId} 
                      onValueChange={(value) => setNewSession({...newSession, courseId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <div className="border rounded-md p-3">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        className="mx-auto"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Start Time</label>
                      <Input 
                        type="time" 
                        value={newSession.startTime}
                        onChange={(e) => setNewSession({...newSession, startTime: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">End Time</label>
                      <Input 
                        type="time" 
                        value={newSession.endTime}
                        onChange={(e) => setNewSession({...newSession, endTime: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button className="blue-gradient" onClick={handleAddSession}>Add Session</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border">
              <CardContent className="p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="mx-auto"
                />
              </CardContent>
            </Card>
            
            <div className="space-y-2">
              <h3 className="font-medium text-sm flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
              </h3>
              
              {getSessionsForSelectedDate().length > 0 ? (
                <div className="space-y-2">
                  {getSessionsForSelectedDate().map((session) => (
                    <Card key={session.id} className="bg-blue-50">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{session.title}</p>
                            <p className="text-sm text-gray-600">
                              {getCourseTitleById(session.courseId)}
                            </p>
                            <div className="flex items-center mt-1 text-sm text-gray-600">
                              <Clock className="h-3 w-3 mr-1" />
                              {session.startTime} - {session.endTime}
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-gray-500 h-8 w-8 p-0"
                            onClick={() => handleDeleteSession(session.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No sessions scheduled for this date</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherSchedule;
