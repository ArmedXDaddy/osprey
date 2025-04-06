
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
  const { joinRequests, approveEventRequest, rejectEventRequest } = useData();
  const requests = joinRequests.filter(
    request => request.eventId === eventId && request.status === 'pending'
  );

  if (requests.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-400 text-sm">No pending join requests</p>
      </div>
    );
  }

  const handleEventJoinRequest = (requestId: string, userId: string, status: 'approved' | 'rejected') => {
    if (status === 'approved') {
      // Fix function call to match expected arguments (requestId, userId)
      approveEventRequest(requestId, userId);
    } else {
      // Fix function call to match expected arguments (requestId)
      rejectEventRequest(requestId);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-base font-medium mb-3">Pending Requests ({requests.length})</h3>
      
      <div className="space-y-2">
        {requests.map((request) => (
          <div key={request.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-md border border-gray-100">
            <div className="flex items-center gap-2.5">
              <Avatar className="h-8 w-8">
                <AvatarImage src={request.userProfileImage} />
                <AvatarFallback>{request.userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{request.userName}</p>
                <p className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            
            <div className="flex gap-1.5">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 px-2 text-xs border-gray-200 hover:bg-gray-100 hover:text-gray-700"
                onClick={() => handleEventJoinRequest(request.id, request.userId, 'rejected')}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Reject
              </Button>
              
              <Button 
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => handleEventJoinRequest(request.id, request.userId, 'approved')}
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Approve
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventRequestsSection;
