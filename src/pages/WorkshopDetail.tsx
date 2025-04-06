
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

const WorkshopDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="container py-8">
      <Button 
        variant="ghost" 
        className="mb-4 gap-2" 
        onClick={() => navigate('/workshops')}
      >
        <ArrowLeft className="h-4 w-4" /> Back to workshops
      </Button>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-4">Workshop Detail</h1>
        <p className="text-muted-foreground mb-6">
          Workshop ID: {id}
        </p>
        
        <div className="bg-muted rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium mb-2">Workshop details not available</h3>
          <p className="text-muted-foreground">
            This is a placeholder for workshop details.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkshopDetail;
