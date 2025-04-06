
import React from 'react';
import { Service } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, DollarSign, MapPin, User, Users, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const { currentUser } = useAuth();
  
  // Check if a one-on-one service is already booked
  const isOneOnOneBooked = service.serviceType === 'one_on_one' && 
    service.bookings?.some(booking => 
      booking.status === 'approved' || booking.status === 'pending'
    );
  
  // Determine if user should see this service
  const canViewDetails = () => {
    // Provider can always view
    if (currentUser && service.providerId === currentUser.id) return true;
    
    // If service is one-on-one and booked, current user must be the booker
    if (isOneOnOneBooked && currentUser) {
      return service.bookings?.some(booking => 
        booking.userId === currentUser.id && 
        (booking.status === 'approved' || booking.status === 'pending')
      );
    }
    
    // Not booked or not one-on-one, so viewable
    return true;
  };
  
  // If the service is one-on-one, booked, and user can't view, don't render
  if (isOneOnOneBooked && !canViewDetails()) {
    return null;
  }
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex flex-col space-y-1.5">
          <CardTitle className="text-lg">{service.title}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            <span>By {service.providerName}</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline">
              {service.serviceType === 'one_on_one' ? '1-on-1' : 
               service.serviceType === 'group' ? 'Group' : 
               service.serviceType === 'webinar' ? 'Webinar' : 'Course'}
            </Badge>
            {service.isOnline && <Badge variant="outline">Online</Badge>}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {service.description}
        </p>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{service.duration}</span>
          </div>
          
          {service.serviceType === 'one_on_one' ? (
            <div className="flex items-center text-sm">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>One-on-One Session</span>
            </div>
          ) : service.capacity ? (
            <div className="flex items-center text-sm">
              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Up to {service.capacity} participants</span>
            </div>
          ) : null}
          
          <div className="flex items-center text-sm">
            <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{service.price > 0 ? `$${service.price}` : 'Free'}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button 
          className="w-full" 
          variant="default" 
          asChild
        >
          <Link to={`/services/${service.id}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;
