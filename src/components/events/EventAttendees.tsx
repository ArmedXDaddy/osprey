
import React from 'react';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AttendeeDetail } from '@/types';

interface EventAttendeesProps {
  attendees: AttendeeDetail[];
  totalCount: number;
  maxDisplay?: number;
}

const EventAttendees = ({ 
  attendees, 
  totalCount, 
  maxDisplay = 8 
}: EventAttendeesProps) => {
  if (totalCount === 0) {
    return <p className="text-muted-foreground text-sm">No attendees yet. Be the first to join!</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {attendees.slice(0, maxDisplay).map((attendee, i) => (
        <Avatar 
          key={attendee.id || i} 
          className="h-10 w-10 border border-muted"
          title={attendee.name}
        >
          <AvatarImage 
            src={attendee.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(attendee.name || 'User')}&background=random`} 
            alt={attendee.name}
          />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      ))}
      
      {totalCount > maxDisplay && (
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm" title={`${totalCount - maxDisplay} more attendees`}>
          +{totalCount - maxDisplay}
        </div>
      )}
    </div>
  );
};

export default EventAttendees;
