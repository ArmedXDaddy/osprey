
import React from 'react';
import { Service } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{service.title}</h3>
            <p className="mt-2 text-sm text-gray-500">{service.description}</p>
            <div className="mt-3">
              <span className="font-medium">${service.price}</span>
              <span className="mx-2">•</span>
              <span>{service.duration}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-4 py-2 border-t">
        <p className="text-sm">By {service.providerName}</p>
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;
