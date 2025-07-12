
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import VideoPlayer from "./VideoPlayer";
import PDFViewer from "./PDFViewer";
import { Book, FileText, Video } from "lucide-react";

type ContentType = "video" | "pdf" | "text";

interface ContentViewerProps {
  contentType: ContentType;
  contentUrl: string;
  title: string;
  onClose?: () => void;
  onComplete?: () => void;
  completed?: boolean;
}

const ContentViewer: React.FC<ContentViewerProps> = ({
  contentType,
  contentUrl,
  title,
  onClose,
  onComplete,
  completed = false
}) => {
  const [isCompleted, setIsCompleted] = useState(completed);

  const handleComplete = () => {
    setIsCompleted(true);
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-white flex flex-col z-50">
      <div className="bg-white p-4 border-b flex items-center justify-between">
        <h3 className="font-medium truncate">{title}</h3>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </div>
      
      <div className="flex-1 overflow-auto">
        {contentType === "video" && (
          <VideoPlayer url={contentUrl} title={title} />
        )}
        
        {contentType === "pdf" && (
          <PDFViewer url={contentUrl} />
        )}
        
        {contentType === "text" && (
          <div className="p-4 max-w-2xl mx-auto">
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="flex items-center mb-2">
                <FileText className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-blue-700">Text Content</h3>
              </div>
              <p className="text-sm text-blue-600">
                You are viewing a text-based lesson. Read through the content below.
              </p>
            </div>
            
            <div className="prose">
              <h1>{title}</h1>
              <p>This is a placeholder for the text content of this lesson. In a real application, this would contain the actual lesson content formatted with proper styling and possibly interactive elements.</p>
              
              <h2>Section 1</h2>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisi vel consectetur interdum, nisl nisi consectetur nisi, euismod consectetur nisl nisi consectetur nisl.</p>
              
              <h2>Section 2</h2>
              <p>Nullam euismod, nisi vel consectetur interdum, nisl nisi consectetur nisi, euismod consectetur nisl nisi consectetur nisl. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              
              <div className="bg-yellow-50 p-4 rounded-lg my-4 border-l-4 border-yellow-500">
                <h3 className="font-semibold text-yellow-700">Important Note</h3>
                <p className="text-sm text-yellow-600">
                  This is a highlighted section that emphasizes important information for students to pay attention to.
                </p>
              </div>
              
              <h2>Section 3</h2>
              <p>Euismod consectetur nisl nisi consectetur nisl. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisi vel consectetur interdum, nisl nisi consectetur nisi.</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white p-4 border-t flex justify-between items-center">
        <div>
          <span className="text-sm text-gray-500">
            {contentType === "video" ? "Video Lesson" : 
             contentType === "pdf" ? "PDF Document" : "Text Lesson"}
          </span>
        </div>
        
        <Button 
          onClick={handleComplete}
          disabled={isCompleted}
          className={isCompleted ? "bg-green-500 hover:bg-green-600" : ""}
        >
          {isCompleted ? "Completed" : "Mark as Complete"}
        </Button>
      </div>
    </div>
  );
};

export default ContentViewer;
