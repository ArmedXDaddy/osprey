
import React from 'react';
import { Workshop } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Laptop } from 'lucide-react';
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
          </div>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-1">{workshop.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{workshop.description}</p>
            
            <div className="space-y-2 mt-3">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{format(new Date(workshop.date), 'MMM d, yyyy')}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-2" />
                <span>{workshop.duration}</span>
              </div>
              
              {workshop.isOnline ? (
                <div className="flex items-center text-sm text-gray-500">
                  <Laptop className="h-4 w-4 mr-2" />
                  <span>Online</span>
                </div>
              ) : workshop.location ? (
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{workshop.location}</span>
                </div>
              ) : null}
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <span className="font-medium">{workshop.price > 0 ? `$${workshop.price}` : 'Free'}</span>
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
