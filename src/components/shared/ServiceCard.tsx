
import React from 'react';
import { Service } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{service.title}</CardTitle>
        <div className="text-sm text-gray-500">by {service.coachName}</div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <p className="text-gray-700 text-sm mb-4">{service.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">{service.duration}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">${service.price}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button className="w-full" disabled={!service.isActive}>
          {service.isActive ? 'Book Session' : 'Currently Unavailable'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;
