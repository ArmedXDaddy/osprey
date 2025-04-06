
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
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Calendar, Clock, DollarSign, Users, MessageSquare, Trash2 } from 'lucide-react';
import EditServiceForm from '@/components/service/EditServiceForm';
import BookingsList from '@/components/service/BookingsList';
import ServiceChatAccess from '@/components/service/ServiceChatAccess';
import { toast } from '@/hooks/use-toast';

const ManageService = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getServiceById, getServiceBookings, deleteService } = useData();
  
  const [service, setService] = useState<Service | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingService, setLoadingService] = useState<boolean>(true);
  const [loadingBookings, setLoadingBookings] = useState<boolean>(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  
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

  const handleDelete = async () => {
    if (!service || !id) return;
    
    try {
      await deleteService(id);
      toast({
        title: "Service deleted",
        description: "Your service has been successfully deleted."
      });
      navigate('/services');
    } catch (error) {
      console.error("Error deleting service:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the service."
      });
    }
  };
  
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
          <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
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
          <ServiceChatAccess service={service} booking={null} />
        </TabsContent>
      </Tabs>
      
      {isEditModalOpen && (
        <EditServiceForm 
          service={service}
          onSave={() => setIsEditModalOpen(false)}
        />
      )}

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this service?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your service
              and remove all data associated with it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageService;
