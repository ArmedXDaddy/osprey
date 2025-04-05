
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import ServiceCard from '@/components/shared/ServiceCard';
import { Plus, Search, AlertTriangle } from 'lucide-react';
import { fetchServices } from '@/api/services';
import { useToast } from '@/hooks/use-toast';

const Services = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  const { data: services, isLoading, error, refetch } = useQuery({
    queryKey: ['services'],
    queryFn: fetchServices,
    retry: 2,
  });
  
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading services",
        description: "There was a problem loading services. Please try again.",
        variant: "destructive"
      });
    }
  }, [error, toast]);
  
  const isCoach = currentUser?.role === 'coach';
  
  // Filter services based on search query and active tab
  const filteredServices = services?.filter(service => {
    const matchesSearch = searchQuery.trim() === '' || 
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.providerName.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (!matchesSearch) return false;
    
    if (activeTab === 'all') return true;
    if (activeTab === 'one_on_one') return service.sessionType === 'one_on_one';
    if (activeTab === 'group') return service.sessionType === 'group';
    if (activeTab === 'free') return service.isFree;
    if (activeTab === 'paid') return !service.isFree && service.price > 0;
    
    return true;
  });
  
  const handleCreateService = () => {
    navigate('/services/create');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Services</h1>
        {isCoach && (
          <Button onClick={handleCreateService}>
            <Plus className="h-4 w-4 mr-2" />
            Create Service
          </Button>
        )}
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          placeholder="Search services..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="one_on_one">One-on-One</TabsTrigger>
          <TabsTrigger value="group">Group</TabsTrigger>
          <TabsTrigger value="free">Free</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="pt-4">
          {error ? (
            <div className="text-center py-10">
              <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-semibold">Error Loading Services</h3>
              <p className="text-gray-500 mb-4">There was a problem loading the services. Please try again later.</p>
              <Button variant="outline" onClick={() => refetch()}>Try Again</Button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="rounded-lg border overflow-hidden">
                  <Skeleton className="h-32" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredServices?.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No services found</p>
              {isCoach && (
                <Button variant="outline" className="mt-4" onClick={handleCreateService}>
                  Create your first service
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServices?.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Services;
