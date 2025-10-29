
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const CourseDetailsSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Course Image Skeleton */}
      <Skeleton className="w-full h-48 rounded-lg" />
      
      {/* Course Info Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-4/5" />
        <Skeleton className="h-5 w-2/3" />
        
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center">
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      
      {/* Progress Skeleton */}
      <Skeleton className="h-16 w-full rounded-lg" />
      
      {/* Tabs Skeleton */}
      <div>
        <Skeleton className="h-10 w-full mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-3 flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-4/5 mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Description Skeleton */}
      <div>
        <Skeleton className="h-6 w-40 mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full mt-1" />
        <Skeleton className="h-4 w-2/3 mt-1" />
      </div>
    </div>
  );
};

export default CourseDetailsSkeleton;
