
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { PlusCircle, Users } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { fetchWorkshops } from '@/integrations/supabase/helpers';
import { Workshop } from '@/types';
import { WorkshopCard } from '@/components/shared/WorkshopCard';
import { useToast } from '@/components/ui/use-toast';

const Workshops = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isCompany = currentUser?.role === 'company';
  const isCompanyRoute = location.pathname.startsWith('/company');
  
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadWorkshops = async () => {
      try {
        setLoading(true);
        // If on company route and user is a company, only show their workshops
        const workshopsData = await fetchWorkshops(
          isCompanyRoute && isCompany ? currentUser?.id : undefined
        );
        setWorkshops(workshopsData);
      } catch (error) {
        console.error('Error loading workshops:', error);
        toast({
          title: 'Failed to load workshops',
          description: 'Please try again later',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadWorkshops();
  }, [currentUser, isCompany, isCompanyRoute, toast]);
  
  const handleCreateWorkshop = () => {
    navigate('/company/workshops/create');
  };
  
  const handleViewWorkshop = (id: string) => {
    navigate(isCompanyRoute ? `/company/workshops/${id}` : `/workshops/${id}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workshops & Training</h1>
          <p className="text-gray-500">Browse upcoming workshops and training sessions</p>
        </div>
        
        {isCompany && (
          <Button onClick={handleCreateWorkshop}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Workshop
          </Button>
        )}
      </div>
      
      <Separator />
      
      {loading ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-96 rounded-lg border bg-card animate-pulse" />
          ))}
        </div>
      ) : workshops.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {workshops.map((workshop) => (
            <WorkshopCard 
              key={workshop.id} 
              workshop={workshop} 
              onClick={() => handleViewWorkshop(workshop.id)} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No workshops available</h3>
          <p className="text-gray-500 mt-2">
            {isCompany 
              ? "You haven't created any workshops yet."
              : "There are no workshops available at this time."}
          </p>
          {isCompany && (
            <Button className="mt-4" onClick={handleCreateWorkshop}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Workshop
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Workshops;
