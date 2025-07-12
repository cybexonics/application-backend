import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Download, Share2, Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  completionDate: string;
  instructorName: string;
}

const Certificate = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [activeCertificate, setActiveCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    // Mock data loading - in a real app, fetch from API
    setTimeout(() => {
      const mockCertificates: Certificate[] = [
        {
          id: "cert-1",
          courseId: "course-1",
          courseTitle: "Complete Web Development Bootcamp",
          completionDate: new Date().toISOString(),
          instructorName: "Jane Smith"
        },
        {
          id: "cert-2",
          courseId: "course-2",
          courseTitle: "Advanced JavaScript Masterclass",
          completionDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          instructorName: "John Doe"
        },
        {
          id: "cert-3",
          courseId: "course-3",
          courseTitle: "Mobile App Development with React Native",
          completionDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          instructorName: "Alice Johnson"
        }
      ];
      
      setCertificates(mockCertificates);
      
      // If courseId is provided, select that certificate
      if (courseId) {
        const certificate = mockCertificates.find(c => c.courseId === courseId);
        if (certificate) {
          setActiveCertificate(certificate);
        } else {
          toast({
            title: "Certificate Not Found",
            description: "The requested certificate could not be found.",
            variant: "destructive"
          });
          navigate("/my-learning");
        }
      } else {
        // Otherwise select the first certificate
        setActiveCertificate(mockCertificates[0]);
      }
      
      setIsLoading(false);
    }, 800);
  }, [courseId, navigate, toast]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const handleDownload = () => {
    toast({
      title: "Certificate Downloaded",
      description: "Your certificate has been downloaded successfully."
    });
  };

  const handleShare = () => {
    toast({
      title: "Share Link Generated",
      description: "A shareable link to your certificate has been copied to clipboard."
    });
  };

  if (isLoading) {
    return (
      <MobileLayout title="Certificate" showBackButton>
        <div className="space-y-6">
          <Tabs defaultValue="view">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="view">View</TabsTrigger>
              <TabsTrigger value="all">All Certificates</TabsTrigger>
            </TabsList>
            
            <TabsContent value="view" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <Skeleton className="h-72 w-full" />
                </CardContent>
              </Card>
              
              <div className="flex justify-center space-x-3 mt-4">
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-28" />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Certificate" showBackButton>
      <div className="space-y-6">
        <Tabs defaultValue="view">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="view">View</TabsTrigger>
            <TabsTrigger value="all">All Certificates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="view" className="mt-4">
            {activeCertificate && (
              <>
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="certificate-container border-8 border-blue-200 p-6 rounded-lg text-center relative">
                      {/* Certificate border decorations */}
                      <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-blue-600"></div>
                      <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-blue-600"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-blue-600"></div>
                      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-blue-600"></div>
                      
                      {/* Certificate content */}
                      <div className="my-2">
                        <Award className="h-10 w-10 mx-auto text-blue-600" />
                      </div>
                      <div className="mb-1 text-blue-800 text-xl font-bold">EduApp</div>
                      <div className="text-lg mb-1">CERTIFICATE OF COMPLETION</div>
                      <div className="text-sm text-gray-500 mb-3">This certifies that</div>
                      <div className="text-xl font-bold mb-2">{user?.name}</div>
                      <div className="text-sm text-gray-500 mb-2">has successfully completed the course</div>
                      <div className="text-lg font-bold mb-4">{activeCertificate.courseTitle}</div>
                      <div className="text-sm text-gray-500 mb-1">Awarded on</div>
                      <div className="text-md mb-4">{formatDate(activeCertificate.completionDate)}</div>
                      
                      {/* Signature lines */}
                      <div className="flex justify-around mt-4">
                        <div className="text-center">
                          <div className="border-t border-gray-400 w-28 mx-auto"></div>
                          <div className="text-sm mt-1">{activeCertificate.instructorName}</div>
                          <div className="text-xs text-gray-500">Instructor</div>
                        </div>
                        <div className="text-center">
                          <div className="border-t border-gray-400 w-28 mx-auto"></div>
                          <div className="text-sm mt-1">EduApp</div>
                          <div className="text-xs text-gray-500">Platform</div>
                        </div>
                      </div>

                      {/* Certificate ID */}
                      <div className="mt-3 text-xs text-gray-400">
                        Certificate ID: {activeCertificate.id.toUpperCase()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-center space-x-3 mt-4">
                  <Button 
                    className="blue-gradient flex-1"
                    onClick={handleDownload}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1"
                    onClick={handleShare}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="all" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Certificates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {certificates.map((certificate) => (
                  <Card 
                    key={certificate.id} 
                    className={`card-shadow hover:bg-blue-50 cursor-pointer ${
                      activeCertificate?.id === certificate.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => setActiveCertificate(certificate)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Award className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{certificate.courseTitle}</h3>
                          <p className="text-sm text-gray-600">
                            Completed on {formatDate(certificate.completionDate)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
};

export default Certificate;
