
import React from 'react';
import { Service } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, Users, Calendar, Video, Link, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ServiceCardProps {
  service: Service;
  showActions?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, showActions = true }) => {
  const navigate = useNavigate();
  
  const handleViewService = () => {
    navigate(`/services/${service.id}`);
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{service.title}</CardTitle>
            <div className="text-sm text-gray-500">by {service.providerName}</div>
          </div>
          <Badge variant={service.sessionType === 'one_on_one' ? 'outline' : 'secondary'}>
            {service.sessionType === 'one_on_one' ? '1:1 Session' : 'Group Session'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2 flex-grow">
        <p className="text-gray-700 text-sm mb-4">{service.description}</p>
        
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">{service.duration}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">
                {service.price > 0 ? `$${service.price}` : 'Free'}
              </span>
            </div>
          </div>
          
          {service.sessionType === 'group' && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {service.capacity ? `${service.capacity} seats` : 'Unlimited seats'}
              </span>
            </div>
          )}
          
          {service.startTime && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {new Date(service.startTime).toLocaleString()}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            {service.isOnline ? (
              <>
                <Video className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">Online Session</span>
                
                {service.meetingUrl && (
                  <Link className="h-4 w-4 ml-1 text-blue-500" />
                )}
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {service.location || 'Location not specified'}
                </span>
              </>
            )}
          </div>
        </div>
      </CardContent>
      
      {showActions && (
        <CardFooter className="pt-2">
          <Button 
            className="w-full" 
            disabled={!service.available}
            onClick={handleViewService}
          >
            {service.available ? 'View Details' : 'Currently Unavailable'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ServiceCard;
