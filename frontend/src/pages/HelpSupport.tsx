
import React, { useState } from "react";
import MobileLayout from "../components/MobileLayout";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

const HelpSupport = () => {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }
    
    // Mock submission
    toast({
      title: "Message Sent",
      description: "We've received your message and will respond shortly.",
    });
    
    // Reset form
    setContactForm({ name: "", email: "", message: "" });
  };

  return (
    <MobileLayout title="Help & Support" showBackButton>
      <div className="space-y-6">
        {/* FAQ Section */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Frequently Asked Questions</h2>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">
                How do I purchase a course?
              </AccordionTrigger>
              <AccordionContent>
                To purchase a course, navigate to the course details page and click on the "Purchase Course" button. You'll be guided through our secure payment process using Razorpay.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                How do I access live sessions?
              </AccordionTrigger>
              <AccordionContent>
                After purchasing a course, you can access scheduled live sessions from the course details page. When a session is about to start, the "Join" button will be enabled, allowing you to enter the virtual classroom.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                Can I download course materials for offline use?
              </AccordionTrigger>
              <AccordionContent>
                Yes, most PDF and document materials can be downloaded for offline reference. Videos are streamed and not available for download to protect instructor copyright.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                What if I miss a live session?
              </AccordionTrigger>
              <AccordionContent>
                Don't worry! Most instructors record their live sessions, which will be available for enrolled students to watch at their convenience after the session ends.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left">
                How do I request a refund?
              </AccordionTrigger>
              <AccordionContent>
                Refund requests can be made within 7 days of purchase, provided you haven't completed more than 20% of the course content. Contact our support team with your purchase details to initiate the process.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
        
        {/* Contact Form */}
        <section>
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">Contact Support</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Name</label>
                  <Input 
                    name="name"
                    value={contactForm.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input 
                    type="email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea 
                    name="message"
                    value={contactForm.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    rows={4}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full blue-gradient"
                >
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
        
        {/* Additional Help Resources */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Additional Help</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-blue-50">
              <CardContent className="p-4 text-center">
                <div className="mb-2 text-blue-600 text-xl">📞</div>
                <h3 className="font-medium text-sm">Call Support</h3>
                <p className="text-xs text-gray-600 mt-1">+91 98765 43210</p>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-50">
              <CardContent className="p-4 text-center">
                <div className="mb-2 text-blue-600 text-xl">📧</div>
                <h3 className="font-medium text-sm">Email Support</h3>
                <p className="text-xs text-gray-600 mt-1">help@eduapp.com</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </MobileLayout>
  );
};

export default HelpSupport;
