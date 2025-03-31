
import React from 'react';
import { Event } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Globe, Lock, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface EventCardProps {
  event: Event;
  compact?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, compact = false }) => {
  // Function to render the privacy icon
  const renderPrivacyIcon = () => {
    switch (event.privacy) {
      case 'public':
        return <Globe className="h-4 w-4 text-blue-500" />;
      case 'private':
        return <Lock className="h-4 w-4 text-amber-500" />;
      case 'paid':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      default:
        return <Globe className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <Card className={`overflow-hidden ${compact ? 'h-full' : ''}`}>
      <div className={`relative ${compact ? 'h-32' : 'h-48'}`}>
        <img 
          src={event.image || 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2882&q=80'} 
          alt={event.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="flex items-center gap-2">
            <p className="font-bold truncate">{event.title}</p>
            {renderPrivacyIcon()}
            {event.privacy === 'paid' && event.price && (
              <span className="text-xs font-medium">${event.price.toFixed(2)}</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs">
            <span className={`inline-block px-2 py-0.5 rounded-full capitalize
              ${event.creatorRole === 'influencer' ? 'bg-red-500' : 
                event.creatorRole === 'coach' ? 'bg-teal-500' : 
                event.creatorRole === 'company' ? 'bg-blue-500' : 
                'bg-purple-500'}`}
            >
              {event.creatorRole}
            </span>
            <span>by {event.creatorName}</span>
          </div>
        </div>
      </div>
      
      <CardContent className={compact ? 'p-3' : 'p-4'}>
        {!compact && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-4">{event.description}</p>
        )}
        
        <div className={`${compact ? 'space-y-1' : 'space-y-2'}`}>
          <div className="flex items-center gap-2">
            <Calendar className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-gray-500`} />
            <span className={`${compact ? 'text-xs' : 'text-sm'} text-gray-700`}>
              {format(new Date(event.date), 'PPP')} at {format(new Date(event.date), 'p')}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-gray-500`} />
            <span className={`${compact ? 'text-xs' : 'text-sm'} text-gray-700 truncate`}>
              {event.location}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-gray-500`} />
            <span className={`${compact ? 'text-xs' : 'text-sm'} text-gray-700`}>
              {event.attendees} {event.attendees === 1 ? 'attendee' : 'attendees'}
            </span>
          </div>
        </div>
      </CardContent>
      
      {!compact && (
        <CardFooter className="px-4 pt-0 pb-4">
          <Link to={`/events/${event.id}`} className="w-full">
            <Button size="sm" className="w-full">View Event</Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
};

export default EventCard;
