
import React from "react";
import MobileLayout from "../components/MobileLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const TermsConditions = () => {
  const navigate = useNavigate();

  return (
    <MobileLayout title="Terms & Conditions" showBackButton>
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Terms of Service</h2>
          
          <div className="space-y-4 text-sm text-gray-700">
            <section>
              <h3 className="font-medium text-blue-700">1. Acceptance of Terms</h3>
              <p>By accessing and using EduApp, you agree to be bound by these Terms and Conditions and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this service.</p>
            </section>
            
            <section>
              <h3 className="font-medium text-blue-700">2. User Accounts</h3>
              <p>To access certain features of the platform, you must register for an account. You agree to provide accurate information and to keep your account secure. You are responsible for all activities under your account.</p>
            </section>
            
            <section>
              <h3 className="font-medium text-blue-700">3. Course Enrollment</h3>
              <p>Once you purchase a course, you will have access to the course content and live sessions. Refunds are only available within 7 days of purchase if you have not accessed more than 20% of the course content.</p>
            </section>
            
            <section>
              <h3 className="font-medium text-blue-700">4. Live Sessions</h3>
              <p>Live sessions are scheduled by instructors. By joining, you agree not to record, share, or redistribute the content without explicit permission. Technical issues may occasionally affect sessions, and makeup sessions will be provided when possible.</p>
            </section>
            
            <section>
              <h3 className="font-medium text-blue-700">5. Code of Conduct</h3>
              <p>Users must conduct themselves appropriately. Harassment, hate speech, or disruptive behavior will result in removal from the platform without refund.</p>
            </section>
            
            <section>
              <h3 className="font-medium text-blue-700">6. Intellectual Property</h3>
              <p>All content provided on the platform is the property of EduApp or its content providers and is protected by international copyright laws.</p>
            </section>
            
            <section>
              <h3 className="font-medium text-blue-700">7. Data Privacy</h3>
              <p>Your use of this platform is also governed by our Privacy Policy, which outlines how we collect, use, and protect your personal information.</p>
            </section>
            
            <section>
              <h3 className="font-medium text-blue-700">8. Modifications to Terms</h3>
              <p>EduApp reserves the right to modify these terms at any time. Changes will be effective immediately upon posting.</p>
            </section>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button 
            className="blue-gradient w-full"
            onClick={() => navigate(-1)}
          >
            I Accept
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
};

export default TermsConditions;
