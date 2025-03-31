
import React from 'react';
import { JoinRequest } from '@/types';
import { useData } from '@/context/DataContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Check, X } from 'lucide-react';

interface EventRequestsSectionProps {
  eventId: string;
}

const EventRequestsSection: React.FC<EventRequestsSectionProps> = ({ eventId }) => {
  const { getEventRequests, handleEventJoinRequest } = useData();
  const requests = getEventRequests(eventId);

  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No pending join requests</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Pending Requests ({requests.length})</h3>
      
      {requests.map((request) => (
        <div key={request.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={request.userProfileImage} />
              <AvatarFallback>{request.userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{request.userName}</p>
              <p className="text-xs text-gray-500">
                Requested {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleEventJoinRequest(request.id, 'rejected')}
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
            
            <Button 
              size="sm"
              onClick={() => handleEventJoinRequest(request.id, 'approved')}
            >
              <Check className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventRequestsSection;
