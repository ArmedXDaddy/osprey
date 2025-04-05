
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Service } from '@/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import ServiceCard from '@/components/shared/ServiceCard';
import { PlusCircle, Search } from 'lucide-react';

const Services = () => {
  const { currentUser } = useAuth();
  const { services } = useData();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const isCoach = currentUser?.role === 'coach';

  const handleCreateService = () => {
    navigate('/services/create');
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          service.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'online') return matchesSearch && service.isOnline;
    if (activeTab === 'offline') return matchesSearch && !service.isOnline;
    if (activeTab === 'free') return matchesSearch && service.price === 0;
    if (activeTab === 'paid') return matchesSearch && service.price > 0;
    if (activeTab === 'oneToOne') return matchesSearch && service.serviceType === 'one_on_one';
    if (activeTab === 'group') return matchesSearch && service.serviceType === 'group';
    return matchesSearch;
  });

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="text-muted-foreground mt-1">
            Browse services offered by our coaches
          </p>
        </div>
        {isCoach && (
          <Button onClick={handleCreateService} className="mt-4 md:mt-0 gap-2">
            <PlusCircle className="h-4 w-4" />
            Create Service
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Tabs 
          defaultValue="all" 
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="w-full md:w-auto grid grid-cols-3 md:grid-cols-7">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="online">Online</TabsTrigger>
            <TabsTrigger value="offline">Offline</TabsTrigger>
            <TabsTrigger value="free">Free</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
            <TabsTrigger value="oneToOne">1-on-1</TabsTrigger>
            <TabsTrigger value="group">Group</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div className="bg-muted rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No services found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? "No services match your search criteria. Try adjusting your filters."
              : "There are no services available yet."}
          </p>
          {isCoach && (
            <Button onClick={handleCreateService}>
              Create Your First Service
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Services;
