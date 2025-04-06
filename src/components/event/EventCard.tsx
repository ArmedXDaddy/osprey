
import React from 'react';
import { Event } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { format } from 'date-fns';

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{event.title}</h3>
            <p className="mt-2 text-sm text-gray-500">{event.description}</p>
            <div className="mt-3">
              <span className="font-medium">{format(event.date, 'PPP')}</span>
              <span className="mx-2">•</span>
              <span>{event.location}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-4 py-2 border-t">
        <p className="text-sm">By {event.creatorName}</p>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
