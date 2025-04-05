
import React, { useState, useEffect } from 'react';
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
import EditGroupForm from '@/components/group/EditGroupForm';
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
  Edit,
  Trash2,
  Shield,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import PostCard from '@/components/shared/PostCard';
import EventCard from '@/components/shared/EventCard';

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { groups, events, posts, loading, joinGroup, leaveGroup, requestToJoinGroup, getGroupRequests, removeGroupMember } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [joined, setJoined] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [removeMemberDialogOpen, setRemoveMemberDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

  // Find the group
  const group = groups.find(g => g.id === id);

  // Check if user has joined the group
  useEffect(() => {
    if (group && currentUser) {
      // In a real app, you would check if the user is in the members list
      // For this mock app, we'll just set a dummy state
      const hasJoined = group.creatorId === currentUser.id || Math.random() > 0.5;
      setJoined(hasJoined);
    }
  }, [group, currentUser]);

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

  const handleRemoveMember = async (userId: string) => {
    setMemberToRemove(userId);
    setRemoveMemberDialogOpen(true);
  };

  const confirmRemoveMember = async () => {
    if (!group || !memberToRemove) return;
    
    await removeGroupMember(group.id, memberToRemove);
    setRemoveMemberDialogOpen(false);
    setMemberToRemove(null);
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

  // Check if user can access restricted content
  const canAccessRestrictedContent = isCreator || joined;

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
    <>
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
                {isCreator ? (
                  <>
                    <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Group
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Group
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem>
                    <Shield className="h-4 w-4 mr-2" />
                    Report Group
                  </DropdownMenuItem>
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
                {group.members} / {group.memberLimit || '∞'} members
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
          
          {isCreator && (
            <Button 
              variant="outline" 
              onClick={() => setEditDialogOpen(true)}
              className="flex-1 md:flex-none"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Group
            </Button>
          )}
        </div>
        
        {/* Group info with tabs */}
        <Card>
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="members" disabled={!canAccessRestrictedContent}>
                Members {!canAccessRestrictedContent && <Lock className="h-3 w-3 ml-1" />}
              </TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="chat" disabled={!canAccessRestrictedContent}>
                Chat {!canAccessRestrictedContent && <Lock className="h-3 w-3 ml-1" />}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="about" className="p-6">
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <p className="text-gray-700">{group.description}</p>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Group Rules</h3>
                  {group.rules && group.rules.length > 0 ? (
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {group.rules.map((rule, index) => (
                        <li key={index}>{rule}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No specific rules have been set for this group.</p>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Member Limit</h3>
                  <p className="text-gray-700">{group.members} / {group.memberLimit || '∞'} members</p>
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
              {canAccessRestrictedContent ? (
                <>
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
                    
                    {/* Mock members (in a real app, these would be real members) */}
                    {Array.from({ length: 2 }).map((_, i) => (
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
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">View Profile</Button>
                          {isCreator && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleRemoveMember(`member-${i}`)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Lock className="h-12 w-12 mx-auto text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium">Members list is only visible to group members</h3>
                  <p className="text-gray-500 mb-4">Join this group to see all members and interact with them</p>
                  <Button onClick={handleJoinGroup}>
                    {group.privacy === 'private' ? 'Request to Join' : group.privacy === 'paid' ? `Join ($${group.price}/month)` : 'Join Group'}
                  </Button>
                </div>
              )}
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
              {canAccessRestrictedContent ? (
                <GroupChatSection groupId={group.id} />
              ) : (
                <div className="text-center py-12">
                  <Lock className="h-12 w-12 mx-auto text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium">Chat is only available to members</h3>
                  <p className="text-gray-500 mb-4">
                    {group.privacy === 'private' 
                      ? 'Request to join this group to participate in the chat' 
                      : group.privacy === 'paid' 
                        ? `Subscribe for $${group.price}/month to join the conversation`
                        : 'Join this group to participate in the chat'}
                  </p>
                  <Button onClick={handleJoinGroup}>
                    {group.privacy === 'private' ? 'Request to Join' : group.privacy === 'paid' ? `Join ($${group.price}/month)` : 'Join Group'}
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      
      {/* Edit Group Dialog */}
      {group && editDialogOpen && (
        <EditGroupForm
          group={group}
          isOpen={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
        />
      )}
      
      {/* Remove Member Confirmation Dialog */}
      <AlertDialog open={removeMemberDialogOpen} onOpenChange={setRemoveMemberDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member from the group? 
              They will need to rejoin if they want to access the group again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveMember} className="bg-red-500 hover:bg-red-600">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default GroupDetail;
