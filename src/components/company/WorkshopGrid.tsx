
import React from 'react';
import { Workshop } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Clock, Users, MapPin, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface WorkshopGridProps {
  workshops: Workshop[];
}

const WorkshopGrid: React.FC<WorkshopGridProps> = ({ workshops }) => {
  if (workshops.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No workshops found.</p>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    try {
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {workshops.map((workshop) => (
        <Card key={workshop.id} className="overflow-hidden">
          <div className="aspect-video relative">
            {workshop.image ? (
              <img 
                src={workshop.image} 
                alt={workshop.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}
            <Badge 
              className="absolute top-2 right-2"
              variant={workshop.isFree ? "outline" : "secondary"}
            >
              {workshop.isFree ? 'Free' : `$${workshop.price?.toFixed(2)}`}
            </Badge>
          </div>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-1">{workshop.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{workshop.description}</p>
            
            <div className="flex flex-col space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2" />
                <span>{formatDate(workshop.date)}</span>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>{workshop.startTime} - {workshop.endTime}</span>
              </div>
              
              <div className="flex items-center">
                {workshop.isOnline ? (
                  <Video className="h-4 w-4 mr-2" />
                ) : (
                  <MapPin className="h-4 w-4 mr-2" />
                )}
                <span className="line-clamp-1">
                  {workshop.isOnline ? 'Online' : workshop.location}
                </span>
              </div>
              
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                <span>{workshop.capacity} seats</span>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Link 
                to={`/company/workshops/${workshop.id}`}
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                View Details
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default WorkshopGrid;
