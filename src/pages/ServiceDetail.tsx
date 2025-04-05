import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, DollarSign, MapPin, Users, Video, Edit, Trash, AlertTriangle, Link } from 'lucide-react';
import { fetchServiceById, bookService, deleteService } from '@/api/services';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: service, isLoading, error } = useQuery({
    queryKey: ['service', id],
    queryFn: () => fetchServiceById(id as string),
    enabled: !!id,
  });
  
  const bookServiceMutation = useMutation({
    mutationFn: (isPaid: boolean = false) => {
      if (!id) throw new Error("Service ID is required");
      return bookService(id, isPaid);
    },
    onSuccess: () => {
      toast({
        title: "Booking Successful",
        description: "You have successfully booked this service",
      });
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const deleteServiceMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      toast({
        title: "Service Deleted",
        description: "Your service has been deleted successfully",
      });
      navigate('/services');
    },
    onError: (error) => {
      toast({
        title: "Deletion Failed",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const handleBookService = () => {
    if (!currentUser || !service) return;
    bookServiceMutation.mutate(false);
  };
  
  const handleEditService = () => {
    navigate(`/services/${id}/edit`);
  };
  
  const handleDeleteService = () => {
    if (!id) return;
    deleteServiceMutation.mutate(id);
  };
  
  const isOwner = currentUser?.id === service?.providerId;
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-6 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-40" />
            <Skeleton className="h-20" />
          </div>
          <div>
            <Skeleton className="h-60" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !service) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="mx-auto h-10 w-10 text-red-500" />
        <h2 className="mt-4 text-xl font-semibold">Service Not Found</h2>
        <p className="mt-2 text-gray-500">The service you're looking for doesn't exist or has been removed</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/services')}>
          Back to Services
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{service.title}</h1>
          <p className="text-gray-500">by {service.providerName}</p>
        </div>
        
        <div className="flex gap-2">
          <Badge variant={service.sessionType === 'one_on_one' ? 'outline' : 'secondary'}>
            {service.sessionType === 'one_on_one' ? '1:1 Session' : 'Group Session'}
          </Badge>
          
          <Badge variant={service.price > 0 ? 'default' : 'success'}>
            {service.price > 0 ? 'Paid' : 'Free'}
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{service.description}</p>
          </div>
          
          {isOwner && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Manage Service</h2>
              <div className="flex gap-4">
                <Button onClick={handleEditService} variant="outline" className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Service
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex items-center gap-2">
                      <Trash className="h-4 w-4" />
                      Delete Service
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        service and remove it from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteService}>
                        {deleteServiceMutation.isPending ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </div>
        
        <div>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Service Details</h3>
                
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-gray-500" />
                  <span>{service.price > 0 ? `$${service.price}` : 'Free'}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <span>{service.duration}</span>
                </div>
                
                {service.sessionType === 'group' && service.capacity && (
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-500" />
                    <span>{service.capacity} seats available</span>
                  </div>
                )}
                
                {service.startTime && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <span>{new Date(service.startTime).toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  {service.isOnline ? (
                    <>
                      <Video className="h-5 w-5 text-gray-500" />
                      <span>Online Session</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <span>{service.location || 'Location not specified'}</span>
                    </>
                  )}
                </div>
                
                {service.isOnline && service.meetingUrl && (isOwner || bookServiceMutation.isSuccess) && (
                  <div className="flex items-center gap-2">
                    <Link className="h-5 w-5 text-gray-500" />
                    <a 
                      href={service.meetingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate"
                    >
                      Meeting Link
                    </a>
                  </div>
                )}
                
                <Button 
                  className="w-full mt-6" 
                  disabled={!service.available || isOwner || bookServiceMutation.isPending}
                  onClick={handleBookService}
                >
                  {isOwner 
                    ? 'You own this service' 
                    : !service.available 
                      ? 'Currently Unavailable'
                      : bookServiceMutation.isPending 
                        ? 'Processing...' 
                        : bookServiceMutation.isSuccess
                          ? 'Booked Successfully'
                          : 'Book Now'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
