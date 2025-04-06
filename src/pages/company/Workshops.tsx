
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { UserRole, Workshop } from '@/types';
import WorkshopGrid from '@/components/company/WorkshopGrid';
import { Plus } from 'lucide-react';
import { getWorkshops } from '@/integrations/supabase/helpers';
import { mapDbWorkshopToWorkshop } from '@/utils/typeMappers';

const Workshops = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWorkshops = async () => {
      setIsLoading(true);
      try {
        const data = await getWorkshops();
        if (currentUser && currentUser.role === 'company') {
          const companyWorkshops = data.filter(workshop => workshop.companyId === currentUser.id);
          setWorkshops(companyWorkshops);
        } else {
          setWorkshops(data);
        }
      } catch (error) {
        console.error('Error fetching workshops:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkshops();
  }, [currentUser]);

  if (!currentUser || currentUser.role !== 'company') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-gray-600">Only company accounts can view this page.</p>
        <Button 
          className="mt-4" 
          variant="outline" 
          onClick={() => navigate('/profile')}
        >
          Go to Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Workshops</h1>
        <Button onClick={() => navigate('/company/workshops/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Workshop
        </Button>
      </div>
      
      {isLoading ? (
        <p>Loading workshops...</p>
      ) : (
        <WorkshopGrid workshops={workshops} />
      )}
    </div>
  );
};

export default Workshops;
