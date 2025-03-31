
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import GroupChatSection from '@/components/group/GroupChatSection';
import GroupRequestsSection from '@/components/group/GroupRequestsSection';
import {
  ChevronLeft,
  Users,
  Calendar,
  Share,
  MoreHorizontal,
  MessageSquare,
  UserPlus,
  Bell,
  BellOff,
  Globe,
  UserCheck,
  Lock,
  UserX,
  DollarSign,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PostCard from '@/components/shared/PostCard';
import EventCard from '@/components/shared/EventCard';

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { groups, events, posts, loading, joinGroup, leaveGroup, requestToJoinGroup, getGroupRequests } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [joined, setJoined] = useState(false);
  const [notifications, setNotifications] = useState(true);

  // Find the group
  const group = groups.find(g => g.id === id);

  // Group events
  const groupEvents = events.filter(event => event.creatorId === group?.creatorId);

  // Group posts
  const groupPosts = posts.filter(post => post.userId === group?.creatorId);

  // Get pending requests for this group (if the user is the creator)
  const isCreator = group?.creatorId === currentUser?.id;
  const pendingRequests = isCreator && group ? getGroupRequests(group.id) : [];

  const handleJoinGroup = async () => {
    if (!group) return;
    
    if (group.privacy === 'private') {
      await requestToJoinGroup(group.id);
    } else {
      const success = await joinGroup(group.id);
      if (success) {
        setJoined(true);
      }
    }
  };

  const handleLeaveGroup = async () => {
    if (!group) return;
    await leaveGroup(group.id);
    setJoined(false);
  };

  const handleNotificationToggle = () => {
    setNotifications(!notifications);
    // In a real app, this would update user preferences
  };

  const getJoinButtonText = () => {
    if (!group) return 'Join Group';
    
    switch (group.privacy) {
      case 'private':
        return 'Request to Join';
      case 'paid':
        return `Join ($${group.price}/month)`;
      default:
        return 'Join Group';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        <div className="rounded-xl overflow-hidden">
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Group not found</h2>
        <p className="text-gray-500 mb-4">The group you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/groups')}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Groups
        </Button>
      </div>
    );
  }

  const getPrivacyIcon = () => {
    switch (group.privacy) {
      case 'private':
        return <Lock className="h-3 w-3 mr-1" />;
      case 'paid':
        return <DollarSign className="h-3 w-3 mr-1" />;
      default:
        return <Globe className="h-3 w-3 mr-1" />;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate('/groups')}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Groups
        </Button>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Share className="h-4 w-4 mr-1" />
            Share
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Report Group</DropdownMenuItem>
              {isCreator && (
                <>
                  <DropdownMenuItem>Edit Group</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Delete Group</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Cover image */}
      <div className="rounded-xl overflow-hidden relative">
        <img 
          src={group.image || 'https://images.unsplash.com/photo-1576678927484-cc907957088c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'} 
          alt={group.name} 
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6 text-white">
          <div className="flex items-center gap-2">
            <Badge className={`bg-${group.creatorRole === 'influencer' ? 'red' : group.creatorRole === 'coach' ? 'teal' : 'blue'}-500`}>
              {group.creatorRole}
            </Badge>
            <Badge variant="outline" className="border-white text-white">
              {getPrivacyIcon()}
              {group.privacy === 'paid' ? `Paid ($${group.price}/month)` : group.privacy === 'private' ? 'Private' : 'Public'}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold mt-2">{group.name}</h1>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {group.members} members
            </div>
            <div className="flex items-center text-sm">
              <span>Created by {group.creatorName}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Group actions */}
      <div className="flex flex-wrap gap-2">
        {!isCreator && !joined && (
          <Button 
            variant="default" 
            onClick={handleJoinGroup}
            className="flex-1 md:flex-none"
          >
            {group.privacy === 'private' ? 
              <UserPlus className="h-4 w-4 mr-2" /> : 
              group.privacy === 'paid' ? 
              <DollarSign className="h-4 w-4 mr-2" /> : 
              <UserPlus className="h-4 w-4 mr-2" />}
            {getJoinButtonText()}
          </Button>
        )}

        {!isCreator && joined && (
          <Button 
            variant="outline" 
            onClick={handleLeaveGroup}
            className="flex-1 md:flex-none"
          >
            <UserX className="h-4 w-4 mr-2" />
            Leave Group
          </Button>
        )}
        
        {joined && (
          <Button 
            variant="outline" 
            onClick={handleNotificationToggle}
            className="flex-1 md:flex-none"
          >
            {notifications ? <BellOff className="h-4 w-4 mr-2" /> : <Bell className="h-4 w-4 mr-2" />}
            {notifications ? 'Mute Notifications' : 'Enable Notifications'}
          </Button>
        )}
        
        {isCreator && (
          <Button className="flex-1 md:flex-none">
            <Calendar className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        )}
      </div>
      
      {/* Group info with tabs */}
      <Card>
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>
          
          <TabsContent value="about" className="p-6">
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <p className="text-gray-700">{group.description}</p>
            
            <Separator className="my-6" />
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Group Rules</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Be respectful to all members</li>
                  <li>No spam or self-promotion</li>
                  <li>Stay on topic and relevant to the group</li>
                  <li>No hate speech or bullying</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Created</h3>
                <p className="text-gray-700">{new Date(group.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            {isCreator && group.privacy === 'private' && pendingRequests?.length > 0 && (
              <>
                <Separator className="my-6" />
                <GroupRequestsSection groupId={group.id} />
              </>
            )}
          </TabsContent>
          
          <TabsContent value="members" className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Members ({group.members})</h3>
              <div className="relative md:w-64">
                <input 
                  type="search" 
                  placeholder="Search members..." 
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Group creator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(group.creatorName)}&background=random`} />
                    <AvatarFallback>{group.creatorName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{group.creatorName}</p>
                    <p className="text-xs text-gray-500">Creator</p>
                  </div>
                </div>
                <Badge variant="outline">Admin</Badge>
              </div>
              
              {/* Placeholder for other members */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={`https://ui-avatars.com/api/?name=Member${i}&background=random`} />
                      <AvatarFallback>M</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">Member {i + 1}</p>
                      <p className="text-xs text-gray-500">Joined {i + 1} months ago</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">View Profile</Button>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="events" className="p-6">
            {groupEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupEvents.map(event => (
                  <Link to={`/events/${event.id}`} key={event.id}>
                    <EventCard event={event} compact />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-gray-300" />
                <h3 className="mt-4 text-lg font-medium">No events yet</h3>
                <p className="text-gray-500">This group hasn't scheduled any events</p>
                {isCreator && (
                  <Button className="mt-4">
                    <Calendar className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="posts" className="p-6">
            {groupPosts.length > 0 ? (
              <div className="space-y-4">
                {groupPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-300" />
                <h3 className="mt-4 text-lg font-medium">No posts yet</h3>
                <p className="text-gray-500">There's no activity in this group yet</p>
                {(isCreator || joined) && (
                  <Button className="mt-4">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Create Post
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="chat" className="p-6">
            {((group.privacy === 'public') || isCreator || joined) ? (
              <GroupChatSection groupId={group.id} />
            ) : (
              <div className="text-center py-12">
                <Lock className="h-12 w-12 mx-auto text-gray-300" />
                <h3 className="mt-4 text-lg font-medium">Chat is only available to members</h3>
                <p className="text-gray-500 mb-4">
                  {group.privacy === 'private' 
                    ? 'Request to join this group to participate in the chat' 
                    : `Subscribe for $${group.price}/month to join the conversation`}
                </p>
                <Button onClick={handleJoinGroup}>
                  {group.privacy === 'private' ? 'Request to Join' : `Join ($${group.price}/month)`}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default GroupDetail;
