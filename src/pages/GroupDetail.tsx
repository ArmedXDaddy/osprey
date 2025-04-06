import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Users, Globe, Lock, DollarSign, Calendar, Info, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import GroupChatSection from '@/components/group/GroupChatSection';
import GroupMembersSection from '@/components/group/GroupMembersSection';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Group, UserRole, GroupPrivacy } from '@/types';

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { groups, loading } = useData();
  const { currentUser } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [isUserMember, setIsUserMember] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        setIsLoading(true);
        
        const { data: groupData, error } = await supabase
          .from('groups')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        const group = {
          ...groupData,
          creator_role: groupData.creator_role as UserRole,
          memberIds: groupData.member_ids || []
        };
        
        setGroup({
          ...group,
          privacy: group.privacy as GroupPrivacy
        });
      } catch (error) {
        console.error("Error fetching group:", error);
        toast({
          title: "Error",
          description: "Could not load group details",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchGroupDetails();
    }
  }, [id, groups]);
  
  useEffect(() => {
    const checkMembership = async () => {
      if (!currentUser || !group) return;
      
      try {
        const { data, error } = await supabase
          .from('group_members')
          .select('*')
          .eq('group_id', group.id)
          .eq('user_id', currentUser.id)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          console.error("Error checking membership:", error);
        }
        
        setIsUserMember(!!data || currentUser.id === group.creatorId);
      } catch (error) {
        console.error("Error checking membership:", error);
      }
    };
    
    checkMembership();
  }, [currentUser, group]);
  
  const handleJoinGroup = async () => {
    if (!currentUser || !group) return;
    
    setIsJoining(true);
    
    try {
      if (group.privacy === 'private') {
        // Send join request
        const { error } = await supabase
          .from('join_requests')
          .insert({
            group_id: group.id,
            user_id: currentUser.id,
            user_name: currentUser.name,
            user_profile_image: currentUser.profileImage,
            status: 'pending'
          });
          
        if (error) throw error;
        
        toast({
          title: "Request sent",
          description: "Your request to join this group has been sent",
        });
      } else if (group.privacy === 'paid') {
        // Would handle payment here in a real app
        toast({
          title: "Payment required",
          description: `This is a paid group ($${group.price}/month)`,
        });
      } else {
        // Direct join for public groups
        const { error } = await supabase
          .from('group_members')
          .insert({
            group_id: group.id,
            user_id: currentUser.id
          });
          
        if (error) throw error;
        
        // Update the members count
        const { error: updateError } = await supabase
          .from('groups')
          .update({ members: (group.members || 0) + 1 })
          .eq('id', group.id);
          
        if (updateError) throw updateError;
        
        setIsUserMember(true);
        setGroup(prev => prev ? {...prev, members: (prev.members || 0) + 1} : null);
        
        toast({
          title: "Joined successfully",
          description: "You are now a member of this group",
        });
      }
    } catch (error) {
      console.error("Error joining group:", error);
      toast({
        title: "Error",
        description: "There was a problem joining this group",
        variant: "destructive"
      });
    } finally {
      setIsJoining(false);
    }
  };
  
  const getPrivacyIcon = () => {
    if (!group) return null;
    
    switch (group.privacy) {
      case 'private':
        return <Lock className="h-4 w-4 mr-1" />;
      case 'paid':
        return <DollarSign className="h-4 w-4 mr-1" />;
      default:
        return <Globe className="h-4 w-4 mr-1" />;
    }
  };
  
  const getPrivacyLabel = () => {
    if (!group) return '';
    
    switch (group.privacy) {
      case 'private':
        return 'Private';
      case 'paid':
        return `Paid ($${group.price}/month)`;
      default:
        return 'Public';
    }
  };
  
  if (loading || !group) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/groups">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to groups
          </Link>
        </Button>
      </div>
      
      <div className="relative">
        {/* Cover image */}
        <div className="h-48 md:h-64 rounded-t-lg overflow-hidden">
          <img 
            src={group.image || 'https://images.unsplash.com/photo-1596920566403-2072ed71e29b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'} 
            alt={group.name} 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Group info */}
        <div className="bg-white shadow-md rounded-b-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">{group.name}</h1>
              <div className="flex items-center gap-2 my-1">
                <Badge className="flex items-center">
                  {getPrivacyIcon()}
                  {getPrivacyLabel()}
                </Badge>
                <Badge variant="outline" className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {group.members} members
                </Badge>
                <Badge variant="outline" className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Created {format(new Date(group.createdAt), 'MMM d, yyyy')}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${group.creatorName}&background=random`} />
                  <AvatarFallback>{group.creatorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-600">
                  Created by <span className="font-medium">{group.creatorName}</span> 
                  <span className="ml-1 px-2 py-0.5 text-xs rounded-full capitalize bg-gray-100">
                    {group.creatorRole}
                  </span>
                </span>
              </div>
            </div>
            
            {currentUser && !isUserMember && (
              <Button 
                onClick={handleJoinGroup}
                disabled={isJoining}
              >
                {isJoining ? 'Joining...' : 'Join Group'}
              </Button>
            )}
            
            {currentUser && isUserMember && currentUser.id === group.creatorId && (
              <Link to={`/groups/${group.id}/edit`}>
                <Button variant="outline">
                  Manage Group
                </Button>
              </Link>
            )}
            
            {currentUser && isUserMember && currentUser.id !== group.creatorId && (
              <Badge variant="outline" className="px-3 py-1.5">Member</Badge>
            )}
          </div>
        </div>
      </div>
      
      {/* Group description and content */}
      <Tabs defaultValue="chat" className="w-full">
        <TabsList>
          <TabsTrigger value="chat" className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-1">
            <Info className="h-4 w-4" />
            About
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Members
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="mt-4">
          {currentUser && isUserMember ? (
            <Card>
              <CardContent className="p-0">
                <GroupChatSection group={group} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium">Join the conversation</h3>
                <p className="text-gray-500 mb-4">
                  {currentUser
                    ? "Join this group to participate in the discussion"
                    : "Sign in and join this group to participate in the discussion"}
                </p>
                
                {currentUser ? (
                  <Button 
                    onClick={handleJoinGroup}
                    disabled={isJoining}
                  >
                    {isJoining ? 'Joining...' : 'Join Group'}
                  </Button>
                ) : (
                  <Link to="/auth/login">
                    <Button>Sign In</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="about" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>About This Group</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-lg mb-2">Description</h3>
                <p className="text-gray-700">{group.description}</p>
              </div>
              
              {group.rules && group.rules.length > 0 && (
                <div>
                  <h3 className="font-medium text-lg mb-2">Group Rules</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {group.rules.map((rule, index) => (
                      <li key={index} className="text-gray-700">{rule}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="members" className="mt-4">
          <Card>
            <CardContent className="py-4">
              <GroupMembersSection 
                groupId={group.id} 
                creatorId={group.creatorId} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GroupDetail;
