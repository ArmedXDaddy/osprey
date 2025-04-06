
import React, { useEffect, useState } from 'react';
import { Service, Booking } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Clock, X, MessageSquare } from 'lucide-react';
import ServiceChat from '../chat/ServiceChat';
import { useToast } from '@/hooks/use-toast';

interface ServiceChatAccessProps {
  service: Service;
  booking: Booking | null;
}

const ServiceChatAccess: React.FC<ServiceChatAccessProps> = ({ service, booking }) => {
  const { currentUser } = useAuth();
  const { getUserBookingForService } = useData();
  const { toast } = useToast();
  const [userBooking, setUserBooking] = useState<Booking | null>(booking);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchBooking = async () => {
      if (!currentUser || !service || booking) return;
      
      try {
        setLoading(true);
        // Only fetch if we don't already have the booking
        const result = await getUserBookingForService(service.id, currentUser.id);
        if (result) {
          setUserBooking(result);
        }
      } catch (error) {
        console.error("Error fetching booking:", error);
        toast({
          title: "Error",
          description: "Failed to retrieve service booking information",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchBooking();
  }, [service, currentUser, booking, getUserBookingForService, toast]);
  
  // Check if current user is the service provider/coach
  const isProvider = currentUser?.id === service.providerId;
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Loading...</CardTitle>
          <CardDescription>Checking access status</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  // If user is the provider, they always have access to the chat
  if (isProvider) {
    return <ServiceChat serviceId={service.id} userId={currentUser?.id || ''} isProvider={true} />;
  }
  
  // For regular users, show appropriate content based on booking status
  if (!userBooking) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Chat Access</CardTitle>
          <CardDescription>
            Book this service to access the chat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button disabled className="w-full">
            <MessageSquare className="mr-2 h-4 w-4" />
            Book to unlock chat
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Handle paid services - all types
  if (userBooking.paymentStatus === 'paid') {
    return <ServiceChat serviceId={service.id} userId={currentUser?.id || ''} isProvider={false} />;
  }

  // Handle free services that need approval
  if (service.price === 0) {
    if (userBooking.status === 'approved') {
      return <ServiceChat serviceId={service.id} userId={currentUser?.id || ''} isProvider={false} />;
    } else if (userBooking.status === 'pending') {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Waiting for Approval</CardTitle>
            <CardDescription>
              Your request is pending approval from the service provider
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="flex items-center text-muted-foreground">
              <Clock className="mr-2 h-5 w-5" />
              <span>Awaiting approval to access chat</span>
            </div>
          </CardContent>
        </Card>
      );
    } else if (userBooking.status === 'rejected') {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Request Rejected</CardTitle>
            <CardDescription>
              Your request to access this service was rejected
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="flex items-center text-destructive">
              <X className="mr-2 h-5 w-5" />
              <span>Access denied</span>
            </div>
          </CardContent>
        </Card>
      );
    } else {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Booking Cancelled</CardTitle>
            <CardDescription>
              This booking has been cancelled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full">
              <MessageSquare className="mr-2 h-4 w-4" />
              Book again to access chat
            </Button>
          </CardContent>
        </Card>
      );
    }
  }

  // This should not happen, but just in case
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Chat Unavailable</CardTitle>
        <CardDescription>
          There was an issue with your booking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground">
          Please contact support for assistance
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceChatAccess;
