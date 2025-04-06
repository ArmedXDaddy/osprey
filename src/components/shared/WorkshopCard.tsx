
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Video, Users, ArrowRight } from 'lucide-react';
import { Workshop } from '@/types';
import { format } from 'date-fns';

interface WorkshopCardProps {
  workshop: Workshop;
  onClick: () => void;
}

export const WorkshopCard = ({ workshop, onClick }: WorkshopCardProps) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="aspect-video w-full overflow-hidden bg-gray-100">
        <img src={workshop.image} alt={workshop.title} className="w-full h-full object-cover" />
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-lg">{workshop.title}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <img src={workshop.company_logo} alt={workshop.company_name} className="h-4 w-4 rounded-full" />
              <span>{workshop.company_name}</span>
            </CardDescription>
          </div>
          {workshop.category && <Badge variant="outline">{workshop.category}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="pb-2 flex-1">
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div className="flex items-center gap-1 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(workshop.date), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{workshop.duration}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            {workshop.is_online ? (
              <>
                <Video className="h-4 w-4" />
                <span>Online</span>
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4" />
                <span>In-person</span>
              </>
            )}
          </div>
          {workshop.capacity && (
            <div className="flex items-center gap-1 text-gray-600">
              <Users className="h-4 w-4" />
              <span>{workshop.capacity} spots</span>
            </div>
          )}
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-3 mb-3">{workshop.description}</p>
        
        <div className="mt-auto">
          <div className="text-lg font-bold text-primary">
            ${typeof workshop.price === 'number' ? workshop.price.toFixed(2) : workshop.price}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button 
          variant="default" 
          className="w-full"
          onClick={onClick}
        >
          Learn More
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
