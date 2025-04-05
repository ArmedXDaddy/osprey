
import React, { useState, useEffect } from 'react';
import { Service, ServiceBooking } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, MapPin, Calendar, Users, Video } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/hooks/use-toast';
import MockPaymentGateway from './MockPaymentGateway';
import { useNavigate } from 'react-router-dom';
import { logError } from '@/utils';

interface ServiceCardProps {
  service: Service;
  isEnrolled?: boolean;
  enrollment?: ServiceBooking;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, isEnrolled = false, enrollment }) => {
  const { currentUser } = useAuth();
  const { bookService, cancelServiceBooking, serviceBookings } = useData();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [localIsEnrolled, setLocalIsEnrolled] = useState(isEnrolled);
  const [localEnrollment, setLocalEnrollment] = useState(enrollment);
  
  useEffect(() => {
    setLocalIsEnrolled(isEnrolled);
    setLocalEnrollment(enrollment);
  }, [isEnrolled, enrollment]);
  
  useEffect(() => {
    if (currentUser && service && serviceBookings && !localIsEnrolled) {
      const userBooking = serviceBookings.find(
        booking => booking.serviceId === service.id && booking.userId === currentUser.id
      );
      
      if (userBooking) {
        setLocalIsEnrolled(true);
        setLocalEnrollment(userBooking);
      }
    }
  }, [currentUser, service, serviceBookings, localIsEnrolled]);
  
  const handleBooking = async () => {
    try {
      if (!currentUser) {
        toast({
          title: "Authentication required",
          description: "Please log in to book this service",
          variant: "destructive"
        });
        return;
      }
      
      if (!service.isFree && service.price > 0) {
        setShowPaymentModal(true);
      } else {
        console.log("Booking free service with ID:", service.id);
        const newBooking = await bookService(service.id);
        if (newBooking) {
          setLocalIsEnrolled(true);
          setLocalEnrollment(newBooking);
          
          toast({
            title: "Request sent",
            description: "Your booking request has been sent to the provider",
          });
        }
      }
    } catch (error) {
      logError('Error booking service', error);
      toast({
        title: "Error",
        description: "There was an error processing your request",
        variant: "destructive"
      });
    }
  };
  
  const handlePaymentSuccess = async () => {
    try {
      if (!service || !service.id) {
        throw new Error("Service information is missing");
      }
      
      console.log("Payment successful, booking service with ID:", service.id);
      
      // Pass the serviceId and isPaid=true to bookService
      const newBooking = await bookService(service.id, true);
      console.log("Booking result:", newBooking);
      
      if (newBooking) {
        setLocalIsEnrolled(true);
        setLocalEnrollment(newBooking);
        
        toast({
          title: "Booking successful",
          description: "Your payment was processed and your service has been booked",
        });
      } else {
        throw new Error("Booking failed after payment");
      }
    } catch (error) {
      logError('Error booking after payment', error);
      toast({
        title: "Error",
        description: "There was an error processing your booking after payment",
        variant: "destructive"
      });
    }
  };
  
  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    toast({
      title: "Payment cancelled",
      description: "Your payment has been cancelled",
    });
  };
  
  const handleCancel = async () => {
    if (!localEnrollment) return;
    
    try {
      await cancelServiceBooking(localEnrollment.id);
      
      setLocalIsEnrolled(false);
      setLocalEnrollment(undefined);
      
      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled",
      });
    } catch (error) {
      logError('Error canceling booking', error);
      toast({
        title: "Error",
        description: "There was an error cancelling your booking",
        variant: "destructive"
      });
    }
  };
  
  const handleViewService = () => {
    navigate(`/services/${service.id}`);
  };
  
  const isCoach = currentUser?.role === 'coach';
  const isOwnService = isCoach && currentUser?.id === service.providerId;
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{service.title}</CardTitle>
            <div className="text-sm text-gray-500">by {service.providerName}</div>
          </div>
          <Badge variant={service.sessionType === 'one_on_one' ? 'outline' : 'secondary'}>
            {service.sessionType === 'one_on_one' ? '1:1 Session' : 'Group Class'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">{service.description}</p>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">{service.duration}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">
                {service.isFree ? 'Free' : `$${service.price}`}
              </span>
            </div>
          </div>
          
          {service.startTime && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {format(service.startTime, 'PPp')}
              </span>
            </div>
          )}
          
          {service.location && !service.isOnline && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">{service.location}</span>
            </div>
          )}
          
          {service.isOnline && (
            <div className="flex items-center gap-1">
              <Video className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">Online Session</span>
            </div>
          )}
          
          {service.sessionType === 'group' && service.capacity && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">Capacity: {service.capacity} people</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        {isOwnService ? (
          <div className="w-full space-y-2">
            <Button variant="outline" className="w-full" onClick={handleViewService}>
              View Service
            </Button>
            <Button className="w-full" asChild>
              <a href={`/services/${service.id}/manage`}>Manage Service</a>
            </Button>
          </div>
        ) : localIsEnrolled ? (
          <div className="w-full space-y-2">
            {localEnrollment?.status === 'pending' ? (
              <Badge className="w-full justify-center py-1" variant="outline">Pending Approval</Badge>
            ) : localEnrollment?.status === 'approved' ? (
              <Badge className="w-full justify-center py-1" variant="success">Approved</Badge>
            ) : (
              <Badge className="w-full justify-center py-1" variant="destructive">Rejected</Badge>
            )}
            
            {localEnrollment?.status === 'approved' && service.isOnline && service.meetingUrl && (
              <Button variant="outline" className="w-full" asChild>
                <a href={service.meetingUrl} target="_blank" rel="noopener noreferrer">
                  Join Meeting
                </a>
              </Button>
            )}
            
            <Button variant="outline" className="w-full" onClick={handleCancel}>
              Cancel Booking
            </Button>
          </div>
        ) : (
          <div className="w-full space-y-2">
            <Button className="w-full" onClick={handleViewService}>
              View Details
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleBooking} 
              disabled={!service.available}
            >
              {service.available ? (
                service.isFree ? 'Request Booking' : `Book for $${service.price}`
              ) : (
                'Currently Unavailable'
              )}
            </Button>
          </div>
        )}
      </CardFooter>
      
      <MockPaymentGateway 
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        amount={service.price}
        serviceName={service.title}
        serviceId={service.id}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentCancel={handlePaymentCancel}
      />
    </Card>
  );
};

export default ServiceCard;
