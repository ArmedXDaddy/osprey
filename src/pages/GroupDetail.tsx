import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Edit, UserPlus, UserMinus, Users, Lock, LockOpen } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from '@/hooks/use-toast';

const GroupDetail = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { group, getGroupRequests, handleJoinRequest, joinGroup, leaveGroup, requestToJoinGroup, removeGroupMember, updateGroupDetails } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isMember, setIsMember] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Key to force refresh useEffect
  
  const groupData = group || {
    id: 'group-1',
    name: 'Fitness Fanatics',
    description: 'A group for fitness enthusiasts to share tips and motivate each other.',
    creatorId: 'user-1',
    creatorName: 'John Doe',
    creatorRole: 'user',
    members: 25,
    privacy: 'public',
    createdAt: new Date(),
    image: '/images/group-fitness.jpg',
  };
  
  useEffect(() => {
    // Simulate checking membership status
    const checkMembership = async () => {
      setLoading(true);
      // Replace with actual logic to check if user is a member or has a pending request
      setIsMember(Math.random() > 0.5); // Mock membership status
      setIsPending(Math.random() < 0.3); // Mock pending status
      setLoading(false);
    };
    
    if (groupId) {
      checkMembership();
    }
  }, [groupId, refreshKey]);
  
  const handleJoinGroup = async () => {
    try {
      await requestToJoinGroup(groupId);
      toast({
        title: "Request Sent",
        description: "Your request to join this group has been sent.",
      });
      
      // Refresh group data
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to request join",
        variant: "destructive",
      });
    }
  };
  
  const handleLeaveGroup = async () => {
    try {
      await leaveGroup(groupId);
      toast({
        title: "Left Group",
        description: "You have left this group.",
      });
      
      // Refresh group data
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to leave group",
        variant: "destructive",
      });
    }
  };
  
  const isCreator = currentUser?.id === groupData?.creatorId;
  
  return (
    <div className="container max-w-4xl mx-auto mt-8 space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">{groupData?.name || <Skeleton className="h-8 w-40" />}</CardTitle>
          
          {/* Actions Dropdown */}
          {currentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate(`/groups/${groupId}/edit`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  <span>Edit Group</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserPlus className="h-4 w-4 mr-2" />
                  <span>Invite Members</span>
                </DropdownMenuItem>
                {isCreator && (
                  <DropdownMenuItem>
                    <UserMinus className="h-4 w-4 mr-2" />
                    <span>Remove Members</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {loading ? (
            <Skeleton className="h-4 w-full" />
          ) : (
            <p>{groupData?.description}</p>
          )}
          
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-500" />
            {loading ? (
              <Skeleton className="h-5 w-20" />
            ) : (
              <span>{groupData?.members} members</span>
            )}
            
            {groupData?.privacy === 'private' ? (
              <Lock className="h-4 w-4 text-gray-500" />
            ) : (
              <LockOpen className="h-4 w-4 text-gray-500" />
            )}
            <span>{groupData?.privacy}</span>
          </div>
          
          {currentUser && !isCreator && (
            <>
              {isMember ? (
                <Button variant="destructive" onClick={handleLeaveGroup} disabled={loading}>
                  Leave Group
                </Button>
              ) : isPending ? (
                <Badge variant="secondary">Pending Approval</Badge>
              ) : (
                <Button onClick={handleJoinGroup} disabled={loading}>
                  Request to Join
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 sm:grid-cols-4 gap-4">
          {loading ? (
            Array(8).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-md" />
            ))
          ) : (
            [1, 2, 3, 4, 5, 6, 7, 8].map(num => (
              <div key={num} className="flex flex-col items-center">
                <Avatar>
                  <AvatarImage src={`https://i.pravatar.cc/150?img=${num}`} alt={`User ${num}`} />
                  <AvatarFallback>U{num}</AvatarFallback>
                </Avatar>
                <span className="text-sm mt-1">User {num}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupDetail;
