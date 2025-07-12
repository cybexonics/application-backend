import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Video, Users, Award } from 'lucide-react';

const onboardingData = [
  {
    title: "Learn Anywhere, Anytime",
    description: "Access quality courses from top teachers right from your mobile device.",
    icon: BookOpen,
    image: "/onboarding/learn-anywhere.svg",
  },
  {
    title: "Live Interactive Sessions",
    description: "Join real-time classes with teachers and ask questions on the go.",
    icon: Video,
    image: "/onboarding/live-sessions.svg",
  },
  {
    title: "Connect with Peers",
    description: "Build your network with fellow students from around the world.",
    icon: Users,
    image: "/onboarding/connect-peers.svg",
  },
  {
    title: "Earn Certificates",
    description: "Complete courses and earn verified certificates for your career growth.",
    icon: Award,
    image: "/onboarding/certificates.svg",
  }
];

const SplashScreen: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < onboardingData.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      navigate('/login');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const current = onboardingData[currentStep];
  const Icon = current.icon;

  return (
  <>
      <div className="max-w-md text-center">
        <div className="mb-8 md:mb-12">
          <div className="bg-white rounded-full p-6 inline-flex items-center justify-center shadow-md mb-6">
            <Icon size={48} className="text-primary" />
          </div>
          <img
            src={current.image || '/placeholder.svg'}
            alt={current.title}
            className="max-w-[250px] mx-auto"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-dark-text">{current.title}</h1>
        <p className="text-muted-foreground md:text-lg max-w-xs mx-auto">{current.description}</p>
      </div>
    </>
  );
};

export default SplashScreen;
