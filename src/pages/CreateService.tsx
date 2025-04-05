
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import CreateServiceForm from '@/components/service/CreateServiceForm';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

const CreateService = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  React.useEffect(() => {
    if (currentUser && currentUser.role !== 'coach') {
      toast({
        title: "Access denied",
        description: "Only coaches can create services",
        variant: "destructive"
      });
      navigate('/services');
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.role !== 'coach') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/services')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Create New Service</h1>
      </div>
      
      <div className="border rounded-lg p-6 bg-white">
        <CreateServiceForm />
      </div>
    </div>
  );
};

export default CreateService;
