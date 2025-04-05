
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Service, Booking } from '@/types';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, DollarSign, Users, MessageSquare } from 'lucide-react';
import EditServiceForm from '@/components/service/EditServiceForm';
import BookingsList from '@/components/service/BookingsList';
import ServiceChatAccess from '@/components/service/ServiceChatAccess';
import { toast } from '@/hooks/use-toast';

const ManageService = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getServiceById, getServiceBookings } = useData();
  
  const [service, setService] = useState<Service | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingService, setLoadingService] = useState<boolean>(true);
  const [loadingBookings, setLoadingBookings] = useState<boolean>(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  
  // Fetch service data
  useEffect(() => {
    const fetchService = async () => {
      if (!id) return;
      
      try {
        setLoadingService(true);
        const serviceData = await getServiceById(id);
        
        if (!serviceData) {
          toast({
            variant: "destructive",
            title: "Service not found",
            description: "The requested service could not be found."
          });
          navigate('/services');
          return;
        }
        
        setService(serviceData);
      } catch (error) {
        console.error("Error fetching service:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load service details."
        });
      } finally {
        setLoadingService(false);
      }
    };
    
    fetchService();
  }, [id, getServiceById, navigate]);
  
  // Update the problematic section to handle the Promise correctly:
  useEffect(() => {
    const fetchServiceBookings = async () => {
      try {
        setLoadingBookings(true);
        if (id) {
          const bookingsData = await getServiceBookings(id);
          setBookings(bookingsData);
        }
      } catch (error) {
        console.error("Error fetching service bookings:", error);
      } finally {
        setLoadingBookings(false);
      }
    };
    
    fetchServiceBookings();
  }, [id, getServiceBookings]);
  
  // Check if the user is authorized to manage this service
  useEffect(() => {
    if (service && currentUser && service.providerId !== currentUser.id) {
      toast({
        variant: "destructive",
        title: "Unauthorized",
        description: "You don't have permission to manage this service."
      });
      navigate('/services');
    }
  }, [service, currentUser, navigate]);
  
  if (loadingService) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
      </div>
    );
  }
  
  if (!service) return null;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => navigate(`/services/${id}`)} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Service
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{service.title}</h1>
          <p className="text-muted-foreground">Manage your service details and bookings</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setIsEditModalOpen(true)}>
            Edit Service
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Service Details</CardTitle>
          <CardDescription>Overview of your service</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Description</h3>
                <p className="text-muted-foreground">{service.description}</p>
              </div>
              
              <div>
                <h3 className="font-medium">Type</h3>
                <Badge variant="outline" className="mt-1">
                  {service.serviceType === 'one_on_one' ? 'One-on-One' : 
                   service.serviceType === 'group' ? 'Group' : 
                   service.serviceType === 'webinar' ? 'Webinar' : 'Course'}
                </Badge>
              </div>
              
              <div>
                <h3 className="font-medium">Status</h3>
                <Badge variant={service.available ? "success" : "destructive"} className="mt-1">
                  {service.available ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-gray-500 mr-2" />
                <div>
                  <h3 className="font-medium">Price</h3>
                  <p>${service.price}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-500 mr-2" />
                <div>
                  <h3 className="font-medium">Duration</h3>
                  <p>{service.duration}</p>
                </div>
              </div>
              
              {service.capacity && service.capacity > 1 && (
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <h3 className="font-medium">Capacity</h3>
                    <p>{service.capacity} people</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                <div>
                  <h3 className="font-medium">Created</h3>
                  <p>{service.createdAt.toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="bookings">
        <TabsList>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="chat">
            Chat
            <MessageSquare className="ml-2 h-4 w-4" />
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="bookings" className="space-y-4">
          <BookingsList 
            bookings={bookings} 
            isLoading={loadingBookings} 
            serviceId={service.id}
          />
        </TabsContent>
        
        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Chat</CardTitle>
              <CardDescription>
                Chat with users who have booked your service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ServiceChatAccess service={service} booking={null} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {isEditModalOpen && (
        <EditServiceForm 
          service={service}
          onSave={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ManageService;
