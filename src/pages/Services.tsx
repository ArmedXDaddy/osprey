
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import ServiceCard from '@/components/shared/ServiceCard';
import { Service } from '@/types';
import { Plus, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Services = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getServices } = useData();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const allServices = await getServices();
        
        // Filter out one-on-one services that are already booked
        const availableServices = allServices.filter(service => {
          // If it's not a one-on-one service, show it
          if (service.serviceType !== 'one_on_one') return true;
          
          // If user is the provider, show it
          if (currentUser && service.providerId === currentUser.id) return true;
          
          // If the service has bookings, check if any are active
          if (service.bookings && service.bookings.length > 0) {
            const hasActiveBookings = service.bookings.some(booking => 
              booking.status === 'approved' || booking.status === 'pending'
            );
            // Only show if there are no active bookings
            return !hasActiveBookings;
          }
          
          // No bookings, so show it
          return true;
        });
        
        setServices(availableServices);
        setFilteredServices(availableServices);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [getServices, currentUser]);

  // Filter logic for when search or filter changes
  useEffect(() => {
    let results = services;

    // Filter by type
    if (filterType !== 'all') {
      results = results.filter(service => service.serviceType === filterType);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        service =>
          service.title.toLowerCase().includes(query) ||
          service.description?.toLowerCase().includes(query) ||
          service.providerName.toLowerCase().includes(query)
      );
    }

    setFilteredServices(results);
  }, [searchQuery, filterType, services]);

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="text-muted-foreground">Browse and book services from professionals</p>
        </div>

        {currentUser && currentUser.role === 'coach' && (
          <Button onClick={() => navigate('/create-service')} className="mt-4 md:mt-0">
            <Plus className="h-4 w-4 mr-2" />
            Create Service
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search services..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="one_on_one">One-on-One</SelectItem>
              <SelectItem value="group">Group</SelectItem>
              <SelectItem value="webinar">Webinar</SelectItem>
              <SelectItem value="course">Course</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No services found</h3>
          <p className="text-muted-foreground mt-2">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default Services;
