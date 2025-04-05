
import React, { useState } from 'react';
import { Service } from '@/types';
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

interface ServiceCardProps {
  service: Service;
  isEnrolled?: boolean;
  enrollment?: any;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, isEnrolled = false, enrollment }) => {
  const { currentUser } = useAuth();
  const { bookService, cancelServiceBooking } = useData();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const handleBooking = async () => {
    try {
      if (!currentUser) {
        toast({
          title: "Authentication required",
          description: "Please log in to book this service",
          variant: "destructive"
        });
        navigate('/auth/login');
        return;
      }
      
      // If it's a paid service, show payment modal
      if (!service.isFree && service.price > 0) {
        setShowPaymentModal(true);
      } else {
        // For free services, just send a request
        await bookService(service.id);
        toast({
          title: "Request sent",
          description: "Your booking request has been sent to the provider",
        });
      }
    } catch (error) {
      console.error('Error booking service:', error);
      toast({
        title: "Error",
        description: "There was an error processing your request",
        variant: "destructive"
      });
    }
  };
  
  const handlePaymentSuccess = async () => {
    try {
      // Book with payment status set to paid
      await bookService(service.id, true);
      toast({
        title: "Booking successful",
        description: "Your service has been booked successfully",
      });
    } catch (error) {
      console.error('Error booking after payment:', error);
      toast({
        title: "Error",
        description: "There was an error finalizing your booking",
        variant: "destructive"
      });
    }
  };
  
  const handlePaymentCancel = () => {
    toast({
      title: "Payment cancelled",
      description: "Your payment has been cancelled",
    });
  };
  
  const handleCancel = async () => {
    if (!enrollment) return;
    
    try {
      await cancelServiceBooking(enrollment.id);
      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled",
      });
    } catch (error) {
      console.error('Error canceling booking:', error);
      toast({
        title: "Error",
        description: "There was an error cancelling your booking",
        variant: "destructive"
      });
    }
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
        <p className="text-gray-700 text-sm mb-4">{service.description}</p>
        
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
                {format(new Date(service.startTime), 'PPp')}
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
          <Button variant="outline" className="w-full" onClick={() => navigate(`/services/${service.id}/manage`)}>
            Manage Service
          </Button>
        ) : isEnrolled ? (
          <div className="w-full space-y-2">
            {enrollment?.status === 'pending' ? (
              <Badge className="w-full justify-center py-1" variant="outline">Pending Approval</Badge>
            ) : enrollment?.status === 'approved' ? (
              <Badge className="w-full justify-center py-1" variant="success">Approved</Badge>
            ) : (
              <Badge className="w-full justify-center py-1" variant="destructive">Rejected</Badge>
            )}
            
            <Button variant="outline" className="w-full" onClick={handleCancel}>
              Cancel Booking
            </Button>
          </div>
        ) : (
          <Button className="w-full" onClick={handleBooking} disabled={!service.available}>
            {service.available ? (
              service.isFree ? 'Request Booking' : `Book for $${service.price}`
            ) : (
              'Currently Unavailable'
            )}
          </Button>
        )}
      </CardFooter>
      
      <MockPaymentGateway 
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        amount={service.price}
        serviceName={service.title}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentCancel={handlePaymentCancel}
      />
    </Card>
  );
};

export default ServiceCard;
