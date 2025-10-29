
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const ScheduleSession = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [date, setDate] = useState<Date>();
  
  const [sessionData, setSessionData] = useState({
    title: "",
    description: "",
    time: "",
    duration: "60",
    maxParticipants: "50"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSessionData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setSessionData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!sessionData.title || !date || !sessionData.time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    // Format date for display
    const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
    
    // In a real app, save to backend
    toast({
      title: "Session Scheduled",
      description: `Your session "${sessionData.title}" has been scheduled for ${formattedDate} at ${sessionData.time}.`,
    });
    
    // Navigate back to course
    navigate(`/course/${courseId}`);
  };

  return (
    <MobileLayout title="Schedule Live Session" showBackButton>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Session Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Session Title *</label>
                <Input 
                  name="title"
                  value={sessionData.title}
                  onChange={handleChange}
                  placeholder="e.g. Introduction to React Hooks"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea 
                  name="description"
                  value={sessionData.description}
                  onChange={handleChange}
                  placeholder="What will you cover in this session?"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Date *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => date < new Date() || date > new Date(2025, 11, 31)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Time *</label>
                <div className="relative">
                  <Input 
                    name="time"
                    type="time"
                    value={sessionData.time}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration (minutes)</label>
                  <Select 
                    value={sessionData.duration} 
                    onValueChange={(value) => handleSelectChange("duration", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                      <SelectItem value="120">120 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Participants</label>
                  <Input 
                    name="maxParticipants"
                    type="number"
                    min="1"
                    value={sessionData.maxParticipants}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Button 
          type="submit"
          className="w-full blue-gradient"
        >
          Schedule Session
        </Button>
      </form>
    </MobileLayout>
  );
};

export default ScheduleSession;
