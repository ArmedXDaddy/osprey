
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const LoadingState: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="space-y-4 w-full max-w-md p-4">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-[80vh] w-full rounded-lg" />
      </div>
    </div>
  );
};

export default LoadingState;
