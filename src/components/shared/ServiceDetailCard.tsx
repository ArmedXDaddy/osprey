
import React from 'react';
import { Service } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, MapPin, Video, DollarSign, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

interface ServiceDetailCardProps {
  service: Service;
  onEnroll?: () => void;
  showEnrollButton?: boolean;
  isEnrolled?: boolean;
}

const ServiceDetailCard: React.FC<ServiceDetailCardProps> = ({ 
  service,
  onEnroll,
  showEnrollButton = true,
  isEnrolled = false
}) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      {service.image ? (
        <div className="relative h-48 w-full">
          <img 
            src={service.image} 
            alt={service.title} 
            className="h-full w-full object-cover"
          />
          {!service.isActive && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg px-3 py-1">Inactive</Badge>
            </div>
          )}
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white">
          {!service.isActive && (
            <Badge variant="destructive" className="absolute top-2 right-2 text-lg px-3 py-1">Inactive</Badge>
          )}
          <h3 className="text-xl font-bold">{service.title}</h3>
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{service.title}</CardTitle>
            <CardDescription>by {service.coachName}</CardDescription>
          </div>
          <Badge variant={service.serviceType === 'one_on_one' ? 'outline' : 'secondary'}>
            {service.serviceType === 'one_on_one' ? 'One-on-One' : 'Group'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1">
        <p className="text-gray-700 mb-4">{service.description}</p>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{service.duration}</span>
          </div>
          
          {service.serviceType === 'group' && service.capacity && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Capacity: {service.capacity} people</span>
            </div>
          )}
          
          {service.isOnline ? (
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              <span>Online session</span>
            </div>
          ) : service.location ? (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{service.location}</span>
            </div>
          ) : null}
          
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span>{service.isFree ? 'Free' : `$${service.price}`}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Created {formatDistanceToNow(service.createdAt, { addSuffix: true })}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4">
        {showEnrollButton ? (
          <Button 
            className="w-full" 
            onClick={onEnroll}
            disabled={!service.isActive || isEnrolled}
            variant={isEnrolled ? "outline" : "default"}
          >
            {isEnrolled ? 'Already Enrolled' : service.isActive ? 'Enroll Now' : 'Currently Unavailable'}
          </Button>
        ) : (
          <Link to={`/services/${service.id}`} className="w-full">
            <Button className="w-full">View Details</Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
};

export default ServiceDetailCard;
