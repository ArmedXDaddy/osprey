
import React from 'react';
import { Service } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, Users, MapPin, Video, Image } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface ServiceCardProps {
  service: Service;
  showViewDetailsButton?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service, 
  showViewDetailsButton = true 
}) => {
  return (
    <Card className="h-full flex flex-col">
      {service.coverImage ? (
        <div className="relative w-full h-36 overflow-hidden rounded-t-lg">
          <img 
            src={service.coverImage} 
            alt={service.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-36 bg-gray-100 flex items-center justify-center rounded-t-lg">
          <Image className="h-12 w-12 text-gray-300" />
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{service.title}</CardTitle>
            <div className="text-sm text-gray-500">by {service.providerName}</div>
          </div>
          <Badge variant={service.price > 0 ? "default" : "outline"}>
            {service.price > 0 ? `$${service.price}` : 'Free'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2 flex-grow">
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">{service.description}</p>
        
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">{service.duration}</span>
          </div>
          
          {service.location && (
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
          
          {service.capacity && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {service.capacity === 1 ? '1-on-1 Session' : `Group (up to ${service.capacity})`}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        {showViewDetailsButton ? (
          <Link to={`/services/${service.id}`} className="w-full">
            <Button className="w-full" variant="outline">
              View Details
            </Button>
          </Link>
        ) : (
          <Button className="w-full" disabled={!service.available}>
            {service.price > 0 
              ? 'Book Session' 
              : 'Request Session'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;
