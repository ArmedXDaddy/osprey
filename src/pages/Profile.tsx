import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchUserById } from '@/api/users';
import { fetchServicesByCoachId } from '@/api/services';
import { fetchUserPosts } from '@/api/posts';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Post, User, Service } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, MapPin, User as UserIcon, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import PostItem from '@/components/shared/PostItem';
import EventCard from '@/components/shared/EventCard';
import GroupCard from '@/components/shared/GroupCard';
import ServiceCard from '@/components/shared/ServiceCard';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from "@/components/ui/switch"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();
  const { events, groups, joinEvent, leaveEvent, requestToJoinEvent, handleEventJoinRequest, getEventRequests, removeGroupMember, updateGroupDetails } = useData();
  const [profileId, setProfileId] = useState(id || currentUser?.id);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [isRemovingMember, setIsRemovingMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);
  const [isPromotingMember, setIsPromotingMember] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [isHandlingRequest, setIsHandlingRequest] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [requestStatus, setRequestStatus] = useState<'approved' | 'rejected' | null>(null);
  const [isLeavingEvent, setIsLeavingEvent] = useState(false);
  const [isJoiningEvent, setIsJoiningEvent] = useState(false);
  const [isRequestingEvent, setIsRequestingEvent] = useState(false);
  const [isCancelingRequest, setIsCancelingRequest] = useState(false);
  const [isLeavingGroup, setIsLeavingGroup] = useState(false);
  const [isJoiningGroup, setIsJoiningGroup] = useState(false);
  const [isRequestingGroup, setIsRequestingGroup] = useState(false);
  const [isCancelingGroupRequest, setIsCancelingGroupRequest] = useState(false);
  const [isHandlingGroupRequest, setIsHandlingGroupRequest] = useState(false);
  const [selectedGroupRequest, setSelectedGroupRequest] = useState<string | null>(null);
  const [groupRequestStatus, setGroupRequestStatus] = useState<'approved' | 'rejected' | null>(null);
  const [isRemovingGroupMember, setIsRemovingGroupMember] = useState(false);
  const [selectedGroupMember, setSelectedGroupMember] = useState<string | null>(null);
  const [isUpdatingGroup, setIsUpdatingGroup] = useState(false);
  const [selectedUpdatingGroup, setSelectedUpdatingGroup] = useState<string | null>(null);
  const [isDeletingSelectedGroup, setIsDeletingSelectedGroup] = useState(false);
  const [selectedDeletingGroup, setSelectedDeletingGroup] = useState<string | null>(null);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: () => fetchUserById(profileId!),
    enabled: !!profileId
  });

  const { data: posts } = useQuery({
    queryKey: ['posts', profileId],
    queryFn: () => fetchUserPosts(profileId!),
    enabled: !!profileId
  });

  const { data: services } = useQuery({
    queryKey: ['services', profileId],
    queryFn: () => fetchServicesByCoachId(profileId!),
    enabled: !!profileId
  });

  useEffect(() => {
    if (id) {
      setProfileId(id);
      setIsEditing(false);
    } else if (currentUser) {
      setProfileId(currentUser.id);
      setIsEditing(false);
    }
  }, [id, currentUser]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error fetching profile",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [error]);

  const isOwnProfile = currentUser?.id === profileId;

  const profileFormSchema = z.object({
    bio: z.string().max(160).optional(),
    location: z.string().optional(),
    interests: z.string().optional(),
    socialLinks: z.object({
      instagram: z.string().url().optional(),
      twitter: z.string().url().optional(),
      website: z.string().url().optional(),
    }).optional(),
  })

  type ProfileFormValues = z.infer<typeof profileFormSchema>

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      bio: profile?.bio || "",
      location: profile?.location || "",
      interests: profile?.interests?.join(", ") || "",
      socialLinks: profile?.socialLinks || {
        instagram: "",
        twitter: "",
        website: "",
      },
    },
    mode: "onChange",
  })

  const groupFormSchema = z.object({
    name: z.string().min(3).max(50).optional(),
    description: z.string().min(10).max(500).optional(),
    privacy: z.enum(["public", "private", "paid"]).optional(),
    price: z.number().min(0).optional(),
    rules: z.string().optional(),
    memberLimit: z.number().min(2).max(100).optional(),
  })

  type GroupFormValues = z.infer<typeof groupFormSchema>

  const groupForm = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: "",
      description: "",
      privacy: "public",
      price: 0,
      rules: "",
      memberLimit: 10,
    },
    mode: "onChange",
  })

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveProfile = async (values: ProfileFormValues) => {
    try {
      // TODO: Implement save profile functionality
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
        variant: "success"
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEditGroup = (groupId: string) => {
    setSelectedGroup(groupId);
    setIsEditingGroup(true);
  };

  const handleCancelEditGroup = () => {
    setSelectedGroup(null);
    setIsEditingGroup(false);
  };

  const handleSaveGroup = async (values: GroupFormValues) => {
    try {
      if (!selectedGroup) {
        throw new Error("No group selected");
      }

      const groupData = {
        name: values.name,
        description: values.description,
        privacy: values.privacy,
        price: values.price,
        rules: values.rules ? values.rules.split('\n') : [],
        memberLimit: values.memberLimit,
      };

      await updateGroupDetails(selectedGroup, groupData);

      toast({
        title: "Group updated",
        description: "The group has been successfully updated",
        variant: "success"
      });
      setIsEditingGroup(false);
      setSelectedGroup(null);
    } catch (error: any) {
      toast({
        title: "Error updating group",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleRemoveMember = (groupId: string, userId: string) => {
    setSelectedGroup(groupId);
    setSelectedMember(userId);
    setIsRemovingMember(true);
  };

  const handleConfirmRemoveMember = async () => {
    try {
      if (!selectedGroup || !selectedMember) {
        throw new Error("No group or member selected");
      }

      await removeGroupMember(selectedGroup, selectedMember);

      toast({
        title: "Member removed",
        description: "The member has been successfully removed from the group",
        variant: "success"
      });
      setIsRemovingMember(false);
      setSelectedGroup(null);
      setSelectedMember(null);
    } catch (error: any) {
      toast({
        title: "Error removing member",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCancelRemoveMember = () => {
    setIsRemovingMember(false);
    setSelectedGroup(null);
    setSelectedMember(null);
  };

  const handleDeleteGroup = (groupId: string) => {
    setSelectedDeletingGroup(groupId);
    setIsDeletingSelectedGroup(true);
  };

  const handleConfirmDeleteGroup = async () => {
    try {
      if (!selectedDeletingGroup) {
        throw new Error("No group selected");
      }

      // TODO: Implement delete group functionality
      toast({
        title: "Group deleted",
        description: "The group has been successfully deleted",
        variant: "success"
      });
      setIsDeletingSelectedGroup(false);
      setSelectedDeletingGroup(null);
    } catch (error: any) {
      toast({
        title: "Error deleting group",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCancelDeleteGroup = () => {
    setIsDeletingSelectedGroup(false);
    setSelectedDeletingGroup(null);
  };

  const handlePromoteMember = (groupId: string, userId: string) => {
    setSelectedGroup(groupId);
    setSelectedMember(userId);
    setIsPromotingMember(true);
  };

  const handleConfirmPromoteMember = async () => {
    try {
      if (!selectedGroup || !selectedMember) {
        throw new Error("No group or member selected");
      }

      // TODO: Implement promote member functionality
      toast({
        title: "Member promoted",
        description: "The member has been successfully promoted to admin",
        variant: "success"
      });
      setIsPromotingMember(false);
      setSelectedGroup(null);
      setSelectedMember(null);
    } catch (error: any) {
      toast({
        title: "Error promoting member",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCancelPromoteMember = () => {
    setIsPromotingMember(false);
    setSelectedGroup(null);
    setSelectedMember(null);
  };

  const handleJoinEvent = async (eventId: string) => {
    setSelectedEvent(eventId);
    setIsJoiningEvent(true);
  };

  const handleConfirmJoinEvent = async () => {
    try {
      if (!selectedEvent) {
        throw new Error("No event selected");
      }

      await joinEvent(selectedEvent);

      toast({
        title: "Event joined",
        description: "You have successfully joined the event",
        variant: "success"
      });
      setIsJoiningEvent(false);
      setSelectedEvent(null);
    } catch (error: any) {
      toast({
        title: "Error joining event",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCancelJoinEvent = () => {
    setIsJoiningEvent(false);
    setSelectedEvent(null);
  };

  const handleLeaveEvent = async (eventId: string) => {
    setSelectedEvent(eventId);
    setIsLeavingEvent(true);
  };

  const handleConfirmLeaveEvent = async () => {
    try {
      if (!selectedEvent) {
        throw new Error("No event selected");
      }

      await leaveEvent(selectedEvent);

      toast({
        title: "Event left",
        description: "You have successfully left the event",
        variant: "success"
      });
      setIsLeavingEvent(false);
      setSelectedEvent(null);
    } catch (error: any) {
      toast({
        title: "Error leaving event",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCancelLeaveEvent = () => {
    setIsLeavingEvent(false);
    setSelectedEvent(null);
  };

  const handleRequestToJoinEvent = async (eventId: string) => {
    setSelectedEvent(eventId);
    setIsRequestingEvent(true);
  };

  const handleConfirmRequestToJoinEvent = async () => {
    try {
      if (!selectedEvent) {
        throw new Error("No event selected");
      }

      await requestToJoinEvent(selectedEvent);

      toast({
        title: "Request sent",
        description: "Your request to join the event has been sent",
        variant: "success"
      });
      setIsRequestingEvent(false);
      setSelectedEvent(null);
    } catch (error: any) {
      toast({
        title: "Error requesting to join event",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCancelRequestToJoinEvent = () => {
    setIsRequestingEvent(false);
    setSelectedEvent(null);
  };

  const handleCancelEventRequest = () => {
    setIsCancelingRequest(false);
    setSelectedEvent(null);
  };

  const handleHandleEventRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    setSelectedRequest(requestId);
    setRequestStatus(status);
    setIsHandlingRequest(true);
  };

  const handleConfirmHandleEventRequest = async () => {
    try {
      if (!selectedRequest || !requestStatus) {
        throw new Error("No request or status selected");
      }

      await handleEventJoinRequest(selectedRequest, requestStatus);

      toast({
        title: "Request handled",
        description: "The request has been successfully handled",
        variant: "success"
      });
      setIsHandlingRequest(false);
      setSelectedRequest(null);
      setRequestStatus(null);
    } catch (error: any) {
      toast({
        title: "Error handling request",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCancelHandleEventRequest = () => {
    setIsHandlingRequest(false);
    setSelectedRequest(null);
    setRequestStatus(null);
  };

  const handleJoinGroup = async (groupId: string) => {
    setSelectedGroup(groupId);
    setIsJoiningGroup(true);
  };

  const handleConfirmJoinGroup = async () => {
    try {
      if (!selectedGroup) {
        throw new Error("No group selected");
      }

      // TODO: Implement join group functionality
      toast({
        title: "Group joined",
        description: "You have successfully joined the group",
        variant: "success"
      });
      setIsJoiningGroup(false);
      setSelectedGroup(null);
    } catch (error: any) {
      toast({
        title: "Error joining group",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCancelJoinGroup = () => {
    setIsJoiningGroup(false);
    setSelectedGroup(null);
  };

  const handleLeaveGroup = async (groupId: string) => {
    setSelectedGroup(groupId);
    setIsLeavingGroup(true);
  };

  const handleConfirmLeaveGroup = async () => {
    try {
      if (!selectedGroup) {
        throw new Error("No group selected");
      }

      // TODO: Implement leave group functionality
      toast({
        title: "Group left",
        description: "You have successfully left the group",
        variant: "success"
      });
      setIsLeavingGroup(false);
      setSelectedGroup(null);
    } catch (error: any) {
      toast({
        title: "Error leaving group",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCancelLeaveGroup = () => {
    setIsLeavingGroup(false);
    setSelectedGroup(null);
  };

  const handleRequestToJoinGroup = async (groupId: string) => {
    setSelectedGroup(groupId);
    setIsRequestingGroup(true);
  };

  const handleConfirmRequestToJoinGroup = async () => {
    try {
      if (!selectedGroup) {
        throw new Error("No group selected");
      }

      // TODO: Implement request to join group functionality
      toast({
        title: "Request sent",
        description: "Your request to join the group has been sent",
        variant: "success"
      });
      setIsRequestingGroup(false);
      setSelectedGroup(null);
    } catch (error: any) {
      toast({
        title: "Error requesting to join group",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCancelRequestToJoinGroup = () => {
    setIsRequestingGroup(false);
    setSelectedGroup(null);
  };

  const handleCancelGroupRequest = () => {
    setIsCancelingGroupRequest(false);
    setSelectedGroup(null);
  };

  const handleHandleGroupRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    setSelectedGroupRequest(requestId);
    setGroupRequestStatus(status);
    setIsHandlingGroupRequest(true);
  };

  const handleConfirmHandleGroupRequest = async () => {
    try {
      if (!selectedGroupRequest || !groupRequestStatus) {
        throw new Error("No request or status selected");
      }

      // TODO: Implement handle group request functionality
      toast({
        title: "Request handled",
        description: "The request has been successfully handled",
        variant: "success"
      });
      setIsHandlingGroupRequest(false);
      setSelectedGroupRequest(null);
      setGroupRequestStatus(null);
    } catch (error: any) {
      toast({
        title: "Error handling request",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCancelHandleGroupRequest = () => {
    setIsHandlingGroupRequest(false);
    setSelectedGroupRequest(null);
    setGroupRequestStatus(null);
  };

  const handleRemoveGroupMemberAction = (groupId: string, userId: string) => {
    setSelectedGroup(groupId);
    setSelectedGroupMember(userId);
    setIsRemovingGroupMember(true);
  };

  const handleConfirmRemoveGroupMember = async () => {
    try {
      if (!selectedGroup || !selectedGroupMember) {
        throw new Error("No group or member selected");
      }

      // TODO: Implement remove group member functionality
      toast({
        title: "Member removed",
        description: "The member has been successfully removed from the group",
        variant: "success"
      });
      setIsRemovingGroupMember(false);
      setSelectedGroup(null);
      setSelectedGroupMember(null);
    } catch (error: any) {
      toast({
        title: "Error removing member",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCancelRemoveGroupMember = () => {
    setIsRemovingGroupMember(false);
    setSelectedGroup(null);
    setSelectedGroupMember(null);
  };

  const handleUpdateGroup = (groupId: string) => {
    setSelectedUpdatingGroup(groupId);
    setIsUpdatingGroup(true);
  };

  const handleConfirmUpdateGroup = async () => {
    try {
      if (!selectedUpdatingGroup) {
        throw new Error("No group selected");
      }

      // TODO: Implement update group functionality
      toast({
        title: "Group updated",
        description: "The group has been successfully updated",
        variant: "success"
      });
      setIsUpdatingGroup(false);
      setSelectedUpdatingGroup(null);
    } catch (error: any) {
      toast({
        title: "Error updating group",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCancelUpdateGroup = () => {
    setIsUpdatingGroup(false);
    setSelectedUpdatingGroup(null);
  };

  const handleDeleteSelectedGroup = (groupId: string) => {
    setSelectedDeletingGroup(groupId);
    setIsDeletingSelectedGroup(true);
  };

  const handleConfirmDeleteSelectedGroup = async () => {
    try {
      if (!selectedDeletingGroup) {
        throw new Error("No group selected");
      }

      // TODO: Implement delete group functionality
      toast({
        title: "Group deleted",
        description: "The group has been successfully deleted",
        variant: "success"
      });
      setIsDeletingSelectedGroup(false);
      setSelectedDeletingGroup(null);
    } catch (error: any) {
      toast({
        title: "Error deleting group",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCancelDeleteSelectedGroup = () => {
    setIsDeletingSelectedGroup(false);
    setSelectedDeletingGroup(null);
  };

  if (isLoading || !profile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center gap-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={profile.profileImage} />
          <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{profile.name}</h1>
          <p className="text-gray-500">{profile.role}</p>
          {profile.location && (
            <div className="flex items-center gap-2 text-gray-500">
              <MapPin className="h-4 w-4" />
              <span>{profile.location}</span>
            </div>
          )}
        </div>
        {isOwnProfile && !isEditing && (
          <Button onClick={handleEditProfile} className="ml-auto">
            Edit Profile
          </Button>
        )}
      </div>

      {isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(handleSaveProfile)} className="space-y-4">
                <FormField
                  control={profileForm.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Write a short bio about yourself" {...field} />
                      </FormControl>
                      <FormDescription>Max 160 characters.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Your location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="interests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interests</FormLabel>
                      <FormControl>
                        <Input placeholder="Your interests, separated by commas" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="socialLinks.instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Instagram URL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="socialLinks.twitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Twitter URL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="socialLinks.website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Website URL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {profile.bio && (
            <Card>
              <CardHeader>
                <CardTitle>About Me</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{profile.bio}</p>
              </CardContent>
            </Card>
          )}

          {profile.interests && (
            <Card>
              <CardHeader>
                <CardTitle>Interests</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{profile.interests.join(', ')}</p>
              </CardContent>
            </Card>
          )}

          {profile.socialLinks && (
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
              </CardHeader>
              <CardContent>
                {profile.socialLinks.instagram && (
                  <Link to={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="block">
                    Instagram
                  </Link>
                )}
                {profile.socialLinks.twitter && (
                  <Link to={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="block">
                    Twitter
                  </Link>
                )}
                {profile.socialLinks.website && (
                  <Link to={profile.socialLinks.website} target="_blank" rel="noopener noreferrer" className="block">
                    Website
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {posts && posts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Posts</h2>
          <div className="space-y-4">
            {posts.map(post => (
              <PostItem key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}

      {isOwnProfile && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Manage Your Content</h2>

          {events.filter(event => event.creatorId === profileId).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Your Events</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.filter(event => event.creatorId === profileId).map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {groups.filter(group => group.creatorId === profileId).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Your Groups</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.filter(group => group.creatorId === profileId).map(group => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            </div>
          )}

          {services && services.filter(service => service.coachId === profileId).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Your Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.filter(service => service.coachId === profileId).map(service => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!isOwnProfile && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Content</h2>

          {events.filter(event => event.creatorId === profileId).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Events by this User</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.filter(event => event.creatorId === profileId).map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {groups.filter(group => group.creatorId === profileId).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Groups by this User</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.filter(group => group.creatorId === profileId).map(group => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            </div>
          )}

          {services && services.filter(service => service.coachId === profileId).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Services by this User</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.filter(service => service.coachId === profileId).map(service => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {isOwnProfile && (
        <Button variant="destructive" onClick={() => signOut()}>
          Sign Out
        </Button>
      )}
    </div>
  );
};

export default Profile;
