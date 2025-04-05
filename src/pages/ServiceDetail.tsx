
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Service } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Clock, 
  DollarSign, 
  MapPin, 
  Video,
  Users,
  ChevronLeft,
  Calendar
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getServiceById, bookService } = useData();
  const { toast } = useToast();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  
  // Fetch service data
  const { data: service, isLoading, error } = useQuery({
    queryKey: ['service', id],
    queryFn: () => getServiceById(id as string),
    enabled: !!id,
  });
  
  // Book service mutation
  const bookServiceMutation = useMutation({
    mutationFn: (isPaid: boolean) => bookService(service?.id as string, isPaid),
    onSuccess: () => {
      toast({
        title: "Booking successful",
        description: service?.price ? "Your payment was successful and your booking is confirmed." : "Your booking request has been sent to the coach.",
      });
      navigate('/profile'); // Redirect to profile after booking
    },
    onError: (error: any) => {
      toast({
        title: "Booking failed",
        description: error.message || "There was an error with your booking. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handleBookNow = () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to book a session",
        variant: "destructive"
      });
      navigate('/auth/login');
      return;
    }
    
    if (service?.price && service.price > 0) {
      setShowPaymentDialog(true);
    } else {
      // For free services, request directly
      bookServiceMutation.mutate(false);
    }
  };
  
  const handleProceedPayment = () => {
    // Here we would implement actual payment processing
    // For now, we'll just simulate a successful payment
    bookServiceMutation.mutate(true);
    setShowPaymentDialog(false);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-24" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }
  
  if (error || !service) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold mb-2">Service Not Found</h2>
        <p className="text-gray-500 mb-4">The service you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">{service.title}</CardTitle>
                  <div className="flex items-center mt-2">
                    <Badge variant={service.capacity === 1 ? "outline" : "secondary"} className="mr-2">
                      {service.capacity === 1 ? '1-on-1 Session' : 'Group Session'}
                    </Badge>
                    {service.isOnline ? (
                      <Badge variant="outline">Online</Badge>
                    ) : (
                      <Badge variant="outline">In-Person</Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">
                    {service.price > 0 ? `$${service.price}` : 'Free'}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-gray-700">{service.description}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-700">{service.duration}</span>
                  </div>
                  
                  {service.capacity && (
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-700">
                        {service.capacity === 1 
                          ? 'One-on-One Session' 
                          : `Group Session (max ${service.capacity} people)`}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  {!service.isOnline && service.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-700">{service.location}</span>
                    </div>
                  )}
                  
                  {service.isOnline && (
                    <div className="flex items-center gap-2">
                      <Video className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-700">Online Session</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-4">
                <h3 className="text-lg font-medium mb-2">About This Session</h3>
                <p className="text-sm text-gray-600">
                  {service.isOnline 
                    ? "This session will be conducted online. The coach will provide you with the meeting link after your booking is confirmed." 
                    : "This session will take place at the specified location. Please arrive 10 minutes early."}
                </p>
                
                {service.price > 0 ? (
                  <p className="text-sm text-gray-600 mt-2">
                    This is a paid session. Your booking will be confirmed immediately after payment.
                  </p>
                ) : (
                  <p className="text-sm text-gray-600 mt-2">
                    This is a free session. Your booking request will be sent to the coach for approval.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Coach</CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="" alt={service.providerName} />
                  <AvatarFallback>{service.providerName.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div>
                  <div className="font-medium">{service.providerName}</div>
                  <div className="text-gray-500 text-sm">Coach</div>
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
                <Button 
                  className="w-full"
                  onClick={handleBookNow}
                  disabled={!service.available || bookServiceMutation.isPending}
                >
                  {bookServiceMutation.isPending 
                    ? "Processing..." 
                    : service.price > 0 
                      ? "Book Now" 
                      : "Request Session"}
                </Button>
                
                {!service.available && (
                  <p className="text-sm text-red-500 text-center">
                    This service is currently unavailable
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Your Booking</DialogTitle>
            <DialogDescription>
              Review your session details and confirm payment to book.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-medium">Session Details</h3>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Session</span>
                <span>{service.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Coach</span>
                <span>{service.providerName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Duration</span>
                <span>{service.duration}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>Total</span>
                <span>${service.price}</span>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="rounded-md bg-gray-50 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3 text-sm text-gray-700">
                    <p>Your session will be scheduled after your booking is confirmed.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleProceedPayment}
              disabled={bookServiceMutation.isPending}
            >
              {bookServiceMutation.isPending ? "Processing..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceDetail;
