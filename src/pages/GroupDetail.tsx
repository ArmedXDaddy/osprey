
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Group, GroupPrivacy } from '@/types';
import { Users, Globe, Lock, DollarSign, Edit, Trash2, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import GroupChatSection from '@/components/group/GroupChatSection';
import GroupMembersSection from '@/components/group/GroupMembersSection';
import GroupRequestsSection from '@/components/group/GroupRequestsSection';
import GroupRulesSection from '@/components/group/GroupRulesSection';
import GroupSettingsSection from '@/components/group/GroupSettingsSection';

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { 
    groups, 
    joinGroup, 
    leaveGroup, 
    requestToJoinGroup, 
    removeGroupMember, 
    updateGroupDetails, 
    getGroupRequests, 
    deleteGroup 
  } = useData();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => {
    if (id && groups.length > 0) {
      const foundGroup = groups.find(group => group.id === id);
      if (foundGroup) {
        setGroup(foundGroup);
      } else {
        toast({
          variant: "destructive",
          title: "Group not found",
          description: "The group you're looking for doesn't exist or has been removed."
        });
        navigate('/groups');
      }
    }
  }, [id, groups, navigate]);

  const handleJoinGroup = async () => {
    if (!group) return;
    
    try {
      await joinGroup(group.id, currentUser?.id);
      toast({
        title: "Success",
        description: "You've successfully joined this group.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "There was an error joining the group."
      });
    }
  };

  const handleLeaveGroup = async () => {
    if (!group) return;
    
    try {
      await leaveGroup(group.id, currentUser?.id);
      toast({
        title: "Success",
        description: "You've successfully left this group.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "There was an error leaving the group."
      });
    }
  };

  const handleRequestToJoin = async () => {
    if (!group) return;
    
    try {
      await requestToJoinGroup(group.id);
      toast({
        title: "Request sent",
        description: "Your request to join this group has been sent to the group admin.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "There was an error requesting to join the group."
      });
    }
  };

  const handleDeleteGroup = async () => {
    if (!group) return;
    
    try {
      await deleteGroup(group.id);
      setIsDeleteDialogOpen(false);
      navigate('/groups');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "There was an error deleting the group."
      });
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link copied",
        description: "Group link has been copied to clipboard."
      });
      setIsShareDialogOpen(false);
    }).catch(() => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy link to clipboard."
      });
    });
  };

  if (!group) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-xl">Loading group details...</div>
      </div>
    );
  }

  const isMember = currentUser && group.memberIds?.includes(currentUser.id);
  const isCreator = currentUser && group.creatorId === currentUser.id;
  const isPaidGroup = group.privacy === 'paid' && group.price && group.price > 0;

  const renderPrivacyBadge = () => {
    switch (group.privacy) {
      case 'public':
        return <Badge variant="outline" className="flex gap-1 items-center"><Globe className="h-3 w-3" /> Public</Badge>;
      case 'private':
        return <Badge variant="outline" className="flex gap-1 items-center"><Lock className="h-3 w-3" /> Private</Badge>;
      case 'paid':
        return <Badge variant="outline" className="flex gap-1 items-center"><DollarSign className="h-3 w-3" /> Paid</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container max-w-5xl py-8">
      <div className="space-y-8">
        {/* Group header */}
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold">{group.name}</h1>
              <p className="text-muted-foreground">Created by {group.creatorName}</p>
            </div>
            <div className="flex gap-2">
              {isCreator && (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/groups/${group.id}/edit`} className="flex items-center gap-1">
                      <Edit className="h-4 w-4" /> Edit
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1 text-destructive hover:text-destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => setIsShareDialogOpen(true)}
              >
                <Share2 className="h-4 w-4" /> Share
              </Button>
            </div>
          </div>

          {/* Group cover image */}
          {group.image && (
            <div className="rounded-lg overflow-hidden h-64 relative">
              <img 
                src={group.image} 
                alt={group.name} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Group metadata and description */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>About this group</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{group.description}</p>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{group.members} members</p>
                    <p className="text-sm text-muted-foreground">
                      {group.memberLimit ? `Limited to ${group.memberLimit} members` : 'No member limit'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {renderPrivacyBadge()}
                  {isPaidGroup && (
                    <Badge variant="secondary">${group.price}</Badge>
                  )}
                </div>

                <div className="text-sm text-muted-foreground">
                  Created on {format(new Date(group.createdAt), 'MMMM d, yyyy')}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                {!isCreator && (
                  <>
                    {!isMember ? (
                      <>
                        {group.privacy === 'public' ? (
                          <Button 
                            className="w-full" 
                            onClick={handleJoinGroup}
                          >
                            Join Group
                          </Button>
                        ) : group.privacy === 'private' ? (
                          <Button 
                            className="w-full"
                            onClick={handleRequestToJoin}
                          >
                            Request to Join
                          </Button>
                        ) : (
                          <Button 
                            className="w-full"
                          >
                            Join (${group.price})
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={handleLeaveGroup}
                      >
                        Leave Group
                      </Button>
                    )}
                  </>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Group content */}
        {(isMember || isCreator || group.privacy === 'public') && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
              {isCreator && (
                <>
                  <TabsTrigger value="requests">
                    Requests
                    {group.pendingRequests && group.pendingRequests > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {group.pendingRequests}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </>
              )}
            </TabsList>
            
            <TabsContent value="chat" className="space-y-4">
              <GroupChatSection groupId={group.id} isCreator={isCreator} />
            </TabsContent>
            
            <TabsContent value="members" className="space-y-4">
              <GroupMembersSection 
                group={group} 
                isCreator={isCreator} 
                onRemoveMember={removeGroupMember}
              />
            </TabsContent>
            
            <TabsContent value="rules" className="space-y-4">
              <GroupRulesSection rules={group.rules || []} isCreator={isCreator} />
            </TabsContent>
            
            {isCreator && (
              <>
                <TabsContent value="requests" className="space-y-4">
                  <GroupRequestsSection groupId={group.id} />
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-4">
                  <GroupSettingsSection 
                    group={group} 
                    onUpdateSettings={updateGroupDetails}
                  />
                </TabsContent>
              </>
            )}
          </Tabs>
        )}
      </div>

      {/* Delete group dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this group? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDeleteGroup}
            >
              Delete Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share group dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Group</DialogTitle>
            <DialogDescription>
              Share this group with your friends and network.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center space-x-2 py-4">
            <input 
              readOnly 
              value={window.location.href} 
              className="flex-1 px-3 py-2 border rounded-md"
            />
            <Button type="button" onClick={handleCopyLink}>
              Copy
            </Button>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsShareDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupDetail;
