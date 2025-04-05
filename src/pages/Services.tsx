
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchServices } from '@/api/services';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus } from 'lucide-react';
import { Service } from '@/types';
import ServiceDetailCard from '@/components/shared/ServiceDetailCard';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const Services = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get the active tab from URL or default to 'all'
  const activeTab = searchParams.get('tab') || 'all';
  
  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };
  
  const { data: services, isLoading, error } = useQuery({
    queryKey: ['services'],
    queryFn: fetchServices
  });
  
  const filteredServices = React.useMemo(() => {
    if (!services) return [];
    
    let filtered = services.filter(service => 
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.coachName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (activeTab === 'oneOnOne') {
      filtered = filtered.filter(service => service.serviceType === 'one_on_one');
    } else if (activeTab === 'group') {
      filtered = filtered.filter(service => service.serviceType === 'group');
    } else if (activeTab === 'free') {
      filtered = filtered.filter(service => service.isFree);
    } else if (activeTab === 'paid') {
      filtered = filtered.filter(service => !service.isFree);
    }
    
    return filtered;
  }, [services, activeTab, searchTerm]);
  
  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600">Error loading services</h2>
        <p className="text-gray-600 mt-2">
          Please try again later or contact support.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Services</h1>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          
          {currentUser?.role === 'coach' && (
            <Button onClick={() => navigate('/services/create')}>
              <Plus className="h-4 w-4 mr-2" />
              <span>Create</span>
            </Button>
          )}
        </div>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="oneOnOne">One-on-One</TabsTrigger>
          <TabsTrigger value="group">Group</TabsTrigger>
          <TabsTrigger value="free">Free</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-lg" />
              ))}
            </div>
          ) : filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map(service => (
                <Link key={service.id} to={`/services/${service.id}`} className="h-full">
                  <ServiceDetailCard service={service} showEnrollButton={false} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500">No services found matching your search.</p>
              {currentUser?.role === 'coach' && (
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/services/create')}
                  className="mt-4"
                >
                  Create a Service
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Services;
