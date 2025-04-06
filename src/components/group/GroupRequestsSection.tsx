import React, { useState, useEffect } from 'react';
import { JoinRequest } from '@/types';
import { useData } from '@/context/DataContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Check, X } from 'lucide-react';

interface GroupRequestsSectionProps {
  groupId: string;
}

const GroupRequestsSection: React.FC<GroupRequestsSectionProps> = ({ groupId }) => {
  const { getGroupRequests, handleJoinRequest } = useData();
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const data = await getGroupRequests(groupId);
        setRequests(data);
      } catch (error) {
        console.error("Error fetching group requests:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequests();
  }, [groupId, getGroupRequests]);

  if (loading) {
    return <div className="text-center py-8">Loading requests...</div>;
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No pending join requests</p>
      </div>
    );
  }

  const handleApprove = async (requestId: string, userId: string) => {
    await handleJoinRequest(groupId, userId, 'approved');
    // Update the local requests list
    setRequests(prev => prev.filter(req => req.id !== requestId));
  };
  
  const handleReject = async (requestId: string, userId: string) => {
    await handleJoinRequest(groupId, userId, 'rejected');
    // Update the local requests list
    setRequests(prev => prev.filter(req => req.id !== requestId));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Pending Requests ({requests.length})</h3>
      
      {requests.map((request) => (
        <div key={request.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={request.userProfileImage ?? ""} />
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
              onClick={() => handleReject(request.id, request.userId)}
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
            
            <Button 
              size="sm"
              onClick={() => handleApprove(request.id, request.userId)}
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

export default GroupRequestsSection;
