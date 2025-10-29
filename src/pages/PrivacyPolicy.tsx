
import React from "react";
import MobileLayout from "../components/MobileLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <MobileLayout title="Privacy Policy" showBackButton>
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Privacy Policy</h2>
          
          <div className="space-y-4 text-sm text-gray-700">
            <section>
              <h3 className="font-medium text-blue-700">1. Information We Collect</h3>
              <p>We collect information you provide directly to us when registering for an account, including your name, email address, phone number, and payment information. We also collect information about your usage of our services and device information.</p>
            </section>
            
            <section>
              <h3 className="font-medium text-blue-700">2. Use of Information</h3>
              <p>We use the information we collect to provide, maintain, and improve our services, process transactions, send communications, and for analytical purposes to improve our platform.</p>
            </section>
            
            <section>
              <h3 className="font-medium text-blue-700">3. Sharing of Information</h3>
              <p>We do not sell your personal information. We may share your information with service providers who help us deliver our services, comply with legal obligations, and with your consent.</p>
            </section>
            
            <section>
              <h3 className="font-medium text-blue-700">4. Data Security</h3>
              <p>We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, disclosure, alteration, and destruction.</p>
            </section>
            
            <section>
              <h3 className="font-medium text-blue-700">5. Your Rights</h3>
              <p>You have the right to access, correct, delete, or export your personal information. You may also object to or restrict certain processing of your information.</p>
            </section>
            
            <section>
              <h3 className="font-medium text-blue-700">6. Data Retention</h3>
              <p>We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.</p>
            </section>
            
            <section>
              <h3 className="font-medium text-blue-700">7. Children's Privacy</h3>
              <p>Our services are not intended for children under 13 years of age, and we do not knowingly collect personal information from children under 13.</p>
            </section>
            
            <section>
              <h3 className="font-medium text-blue-700">8. Changes to This Policy</h3>
              <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.</p>
            </section>
            
            <section>
              <h3 className="font-medium text-blue-700">9. Contact Us</h3>
              <p>If you have any questions about this Privacy Policy, please contact us at support@eduapp.com.</p>
            </section>
            
            <p className="text-xs text-gray-500 mt-4">Last Updated: May 11, 2023</p>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button 
            className="blue-gradient w-full"
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
};

export default PrivacyPolicy;
