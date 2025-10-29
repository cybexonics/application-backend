
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowRight, Calendar, FileText, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  // Get course details from location state or use default values
  const courseDetails = location.state?.courseDetails || {
    title: "Your Course",
    price: 2500,
    image: "https://placehold.co/400x225",
  };
  
  const [paymentInfo, setPaymentInfo] = useState({
    transactionId: `TXN${Math.floor(Math.random() * 10000000)}`,
    paymentMethod: "Credit Card",
    orderDate: new Date().toISOString(),
  });

  useEffect(() => {
    // In a real app, this would verify the payment status from backend
    console.log("Verifying payment for course:", courseId);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Payment Confirmed",
        description: "Your course purchase has been successfully processed.",
      });
    }, 1000);
  }, [courseId, toast]);

  const handleViewCourse = () => {
    navigate(`/course/${courseId}`, { state: { purchased: true } });
  };

  const handleViewCertificate = () => {
    navigate(`/certificate/${courseId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <MobileLayout title="Processing Payment" showBackButton>
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
            <h1 className="text-xl font-bold">Processing Payment</h1>
            <p className="text-gray-600 mt-1">Please wait while we confirm your purchase</p>
          </div>
          
          <Card>
            <CardContent className="p-4 space-y-4">
              <h2 className="font-semibold">Order Summary</h2>
              <div className="flex items-center gap-3">
                <Skeleton className="w-14 h-14 rounded-md" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-4/5 mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div>
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
              <div className="border-t border-gray-200 pt-3 space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Payment Success" showBackButton>
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-6 animate-fade-in">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-green-700">Payment Successful!</h1>
          <p className="text-gray-600 mt-1">
            Your order has been confirmed
          </p>
        </div>

        <Card className="card-shadow animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src={courseDetails.thumbnailUrl} 
                alt={courseDetails.title}
                className="w-14 h-14 rounded-md object-cover"
              />
              <div className="flex-1">
                <h3 className="font-medium">{courseDetails.title}</h3>
                <p className="text-gray-600 text-sm">Full access</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">₹{courseDetails.price}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Order Date</span>
                <span>{formatDate(paymentInfo.orderDate)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Transaction ID</span>
                <span>{paymentInfo.transactionId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment Method</span>
                <span>{paymentInfo.paymentMethod}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <Button 
            className="w-full blue-gradient"
            onClick={handleViewCourse}
          >
            Start Learning Now
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleViewCertificate}
          >
            View Certificate
          </Button>
        </div>

        <Card className="animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">What's Included</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Video className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">48 Video Lessons</p>
                  <p className="text-sm text-gray-600">Full HD quality with downloadable options</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Course Materials</p>
                  <p className="text-sm text-gray-600">PDF documents, code samples, and exercises</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Live Sessions</p>
                  <p className="text-sm text-gray-600">Join scheduled live sessions with your instructor</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Lifetime Access</p>
                  <p className="text-sm text-gray-600">Access course content forever, including updates</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
};

export default PaymentSuccess;
