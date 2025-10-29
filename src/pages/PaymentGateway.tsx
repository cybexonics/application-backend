
import React, { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Check, CreditCard } from "lucide-react";

const PaymentGateway = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const location = useLocation();
  const { toast } = useToast();
  const [paymentStep, setPaymentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const courseDetails = location.state?.courseDetails || {
    title: "Course Purchase",
    price: 2500,
    image: "https://placehold.co/400x225"
  };

  const handlePayment = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setPaymentStep(2);
      setIsProcessing(false);
    }, 2000);
  };

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    
    // Simulate payment confirmation
    setTimeout(() => {
      toast({
        title: "Payment Successful",
        description: "Your course purchase was successful!",
      });
      navigate(`/payment-success/${courseId}`, { 
        state: { courseDetails } 
      });
    }, 2000);
  };

  return (
    <MobileLayout title="Payment" showBackButton>
      <div className="space-y-6">
        <Progress value={paymentStep === 1 ? 50 : 75} className="h-1.5" />
        
        <Card className="card-shadow">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src={courseDetails.thumbnailUrl} 
                alt={courseDetails.title}
                className="w-14 h-14 rounded-md object-cover"
              />
              <div>
                <h3 className="font-medium">{courseDetails.title}</h3>
                <p className="text-lg font-semibold">₹{courseDetails.price}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {paymentStep === 1 ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Payment Details</h2>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Card Number</label>
                <Input 
                  placeholder="1234 5678 9012 3456"
                  className="mt-1"
                  maxLength={16}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600">Expiry Date</label>
                  <Input 
                    placeholder="MM/YY"
                    className="mt-1"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">CVV</label>
                  <Input 
                    type="password"
                    placeholder="123"
                    className="mt-1"
                    maxLength={3}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-600">Cardholder Name</label>
                <Input 
                  placeholder="John Doe"
                  className="mt-1"
                />
              </div>
            </div>
            
            <Button 
              className="w-full blue-gradient mt-4"
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Pay ₹" + courseDetails.price}
            </Button>
            
            <p className="text-xs text-center text-gray-500">
              Your payment information is secure and encrypted
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Confirm Payment</h2>
            
            <Card className="border-dashed border-green-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span>•••• •••• •••• 3456</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{courseDetails.price}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-gray-600">Tax</span>
                <span>₹0</span>
              </div>
              <div className="flex justify-between items-center mt-2 font-semibold">
                <span>Total</span>
                <span>₹{courseDetails.price}</span>
              </div>
            </div>
            
            <Button 
              className="w-full blue-gradient mt-4"
              onClick={handleConfirmPayment}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Confirm Payment"}
            </Button>
          </div>
        )}
        
        <div className="flex justify-center mt-4">
          <img 
            src="https://placehold.co/200x30?text=Razorpay+Secured" 
            alt="Razorpay Secured" 
            className="h-5 opacity-70"
          />
        </div>
      </div>
    </MobileLayout>
  );
};

export default PaymentGateway;
