
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

interface PDFViewerProps {
  url: string;
  onClose?: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url, onClose }) => {
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);

  const handlePageChange = (increment: number) => {
    setPage(prev => Math.max(1, prev + increment));
  };

  const handleZoom = (increment: number) => {
    setZoom(prev => Math.max(50, Math.min(200, prev + increment)));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white p-3 border-b flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handlePageChange(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm">Page {page}</span>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handlePageChange(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleZoom(-10)}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <span className="text-sm">{zoom}%</span>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleZoom(10)}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 bg-gray-100 overflow-auto p-4 flex justify-center">
        <iframe
          src={url}
          className="bg-white shadow-md"
          style={{ 
            width: `${zoom}%`,
            height: `${zoom}%`,
            maxWidth: "100%",
            maxHeight: "100%"
          }}
          title="PDF Document"
        />
      </div>

      {onClose && (
        <div className="bg-white p-3 border-t">
          <Button 
            variant="default" 
            className="w-full"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
