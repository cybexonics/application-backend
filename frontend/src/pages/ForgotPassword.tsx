
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    // In a real implementation, this would call the auth provider's password reset method
    
    // Mock successful password reset email for demo
    setTimeout(() => {
      setIsSubmitting(false);
      setIsEmailSent(true);
      toast({
        title: "Email sent",
        description: "Check your inbox for password reset instructions",
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-blue-50">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-700 mb-2">Reset Password</h1>
          <p className="text-sm text-gray-600">
            {!isEmailSent 
              ? "Enter your email and we'll send you a link to reset your password" 
              : "Check your email for reset instructions"}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {!isEmailSent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full blue-gradient" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                    Sending...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="mx-auto w-16 h-16 flex items-center justify-center bg-green-100 text-green-600 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </div>
              <h3 className="font-medium text-lg mb-2">Check your inbox</h3>
              <p className="text-gray-600 text-sm mb-4">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <div className="text-xs text-gray-500 mb-3">
                Didn't receive an email? Check your spam folder or
                <Button variant="link" className="p-0 h-auto text-xs text-blue-600 ml-1" onClick={handleSubmit}>
                  try again
                </Button>
              </div>
            </div>
          )}

          <div className="mt-4 text-center text-sm">
            <p>
              Remember your password?{" "}
              <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
