
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { PlusCircle } from 'lucide-react';

const Workshops = () => {
  const navigate = useNavigate();

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Workshops</h1>
          <p className="text-muted-foreground mt-1">
            Browse available workshops
          </p>
        </div>
        <Button 
          onClick={() => navigate('/company/workshops/create')} 
          className="mt-4 md:mt-0 gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Create Workshop
        </Button>
      </div>

      <div className="bg-muted rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium mb-2">No workshops found</h3>
        <p className="text-muted-foreground mb-4">
          There are no workshops available yet.
        </p>
      </div>
    </div>
  );
};

export default Workshops;
