
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Post,
  Event,
  Group,
  Service,
  Message,
  Comment,
  Announcement,
  JoinRequest,
  UserRole,
  GroupPrivacy,
  Booking
} from '@/types';

const handleEventJoinRequest = async (eventId: string, userId: string, status: 'approved' | 'rejected'): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('join_requests')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();
      
    if (error) throw error;
    
    if (data) {
      if (status === 'approved') {
        // Use approveEventRequest from DataContext
        await approveEventJoinRequest(data.id, eventId, userId);
      } else {
        await rejectEventJoinRequest(data.id);
      }
    }
  } catch (error: any) {
    console.error("Error handling event join request:", error);
    toast({
      title: "Error",
      description: error.message || "Failed to handle join request",
      variant: "destructive"
    });
    throw new Error(error.message || 'Failed to handle join request');
  }
};

// Define the shape of our context
interface DataContextType {
  posts: Post[];
  events: Event[];
  groups: Group[];
  services: Service[];
  messages: Message[];
  comments: Comment[];
  announcements: Announcement[];
  joinRequests: JoinRequest[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  createPost: (post: Omit<Post, 'id' | 'createdAt' | 'likesCount' | 'commentsCount'>) => Promise<Post>;
  likePost: (postId: string) => Promise<void>;
  createComment: (comment: Omit<Comment, 'id' | 'createdAt'>) => Promise<Comment>;
  createEvent: (event: Omit<Event, 'id' | 'createdAt' | 'isCompleted' | 'pendingRequests' | 'attendees'>) => Promise<Event>;
  joinEvent: (eventId: string) => Promise<void>;
  leaveEvent: (eventId: string) => Promise<void>;
  requestToJoinEvent: (eventId: string) => Promise<void>;
  approveEventRequest: (requestId: string, eventId: string, userId: string) => Promise<void>;
  rejectEventRequest: (requestId: string) => Promise<void>;
  createGroup: (group: Omit<Group, 'id' | 'createdAt' | 'members' | 'pendingRequests'>) => Promise<Group>;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  requestToJoinGroup: (groupId: string) => Promise<void>;
  removeGroupMember: (groupId: string, userId: string) => Promise<void>;
  updateGroupDetails: (groupId: string, updates: Partial<Group>) => Promise<void>;
  getGroupRequests: (groupId: string) => Promise<JoinRequest[]>;
  deleteGroup: (groupId: string) => Promise<void>;
  createMessage: (message: Omit<Message, 'id' | 'createdAt'>) => Promise<Message>;
  sendServiceMessage: (params: { serviceId: string, content: string }) => Promise<void>;
  getServiceMessages: (serviceId: string) => Promise<Message[]>;
  bookService: (serviceId: string, notes?: string) => Promise<void>;
  getUserBookingForService: (serviceId: string) => Promise<Booking | null>;
  approveServiceBooking: (bookingId: string) => Promise<void>;
  rejectServiceBooking: (bookingId: string) => Promise<void>;
  handleEventJoinRequest: (eventId: string, userId: string, status: 'approved' | 'rejected') => Promise<void>;
}

// Create context with default values
const DataContext = createContext<DataContextType>({
  posts: [],
  events: [],
  groups: [],
  services: [],
  messages: [],
  comments: [],
  announcements: [],
  joinRequests: [],
  setMessages: () => {},
  createPost: async () => ({ id: '', content: '', userId: '', userName: '', userRole: 'user', createdAt: new Date(), likesCount: 0, commentsCount: 0 }),
  likePost: async () => {},
  createComment: async () => ({ id: '', content: '', userId: '', userName: '', userRole: 'user', createdAt: new Date() }),
  createEvent: async () => ({ id: '', title: '', description: '', creatorId: '', creatorName: '', creatorRole: 'user', location: '', date: new Date(), image: '', privacy: 'public', isCompleted: false, createdAt: new Date(), attendees: [], pendingRequests: 0 }),
  joinEvent: async () => {},
  leaveEvent: async () => {},
  requestToJoinEvent: async () => {},
  approveEventRequest: async () => {},
  rejectEventRequest: async () => {},
  createGroup: async () => ({ id: '', name: '', description: '', creatorId: '', creatorName: '', creatorRole: 'user', privacy: 'public', image: '', createdAt: new Date(), members: 1, pendingRequests: 0 }),
  joinGroup: async () => {},
  leaveGroup: async () => {},
  requestToJoinGroup: async () => {},
  removeGroupMember: async () => {},
  updateGroupDetails: async () => {},
  getGroupRequests: async () => [],
  deleteGroup: async () => {},
  createMessage: async () => ({ id: '', content: '', userId: '', userName: '', userRole: 'user', createdAt: new Date() }),
  sendServiceMessage: async () => {},
  getServiceMessages: async () => [],
  bookService: async () => {},
  getUserBookingForService: async () => null,
  approveServiceBooking: async () => {},
  rejectServiceBooking: async () => {},
  handleEventJoinRequest,
});

export function DataProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  
  // Fetch initial data
  useEffect(() => {
    fetchPosts();
    fetchEvents();
    fetchGroups();
    fetchServices();
    fetchJoinRequests();
    // Add more fetch functions as needed
  }, []);
  
  // Example function implementations
  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        const postsWithDates = data.map(post => ({
          ...post,
          createdAt: new Date(post.created_at)
        })) as Post[];
        
        setPosts(postsWithDates);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };
  
  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
        
      if (error) throw error;
      
      if (data) {
        const eventsWithDates = data.map(event => ({
          ...event,
          date: new Date(event.date),
          createdAt: new Date(event.created_at)
        })) as Event[];
        
        setEvents(eventsWithDates);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };
  
  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        const groupsWithDates = data.map(group => ({
          ...group,
          createdAt: new Date(group.created_at)
        })) as Group[];
        
        setGroups(groupsWithDates);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };
  
  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        const servicesWithDates = data.map(service => ({
          ...service,
          createdAt: new Date(service.created_at),
          updatedAt: new Date(service.updated_at)
        })) as Service[];
        
        setServices(servicesWithDates);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };
  
  const fetchJoinRequests = async () => {
    if (!currentUser) return;
    
    try {
      const { data, error } = await supabase
        .from('join_requests')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        const requests = data.map(request => ({
          id: request.id,
          eventId: request.event_id,
          groupId: request.group_id,
          userId: request.user_id,
          userName: request.user_name,
          userProfileImage: request.user_profile_image,
          status: request.status as "approved" | "rejected" | "pending",
          createdAt: new Date(request.created_at)
        })) as JoinRequest[];
        
        setJoinRequests(requests);
      }
    } catch (error) {
      console.error("Error fetching join requests:", error);
    }
  };
  
  const createPost = async (post: Omit<Post, 'id' | 'createdAt' | 'likesCount' | 'commentsCount'>): Promise<Post> => {
    if (!currentUser) throw new Error("You must be logged in to create a post");
    
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([{
          content: post.content,
          user_id: post.userId,
          user_name: post.userName,
          user_role: post.userRole,
          user_profile_image: post.userProfileImage,
          image: post.image,
          likes_count: 0,
          comments_count: 0
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        const newPost: Post = {
          id: data.id,
          content: data.content,
          userId: data.user_id,
          userName: data.user_name,
          userRole: data.user_role,
          userProfileImage: data.user_profile_image,
          image: data.image,
          likesCount: data.likes_count,
          commentsCount: data.comments_count,
          createdAt: new Date(data.created_at)
        };
        
        setPosts(prev => [newPost, ...prev]);
        return newPost;
      }
      
      throw new Error("Failed to create post");
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const likePost = async (postId: string): Promise<void> => {
    if (!currentUser) throw new Error("You must be logged in to like a post");
    
    try {
      // Check if already liked
      const { data: existingLike, error: checkError } = await supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', currentUser.id)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingLike) {
        // Unlike
        const { error: unlikeError } = await supabase
          .from('post_likes')
          .delete()
          .eq('id', existingLike.id);
          
        if (unlikeError) throw unlikeError;
        
        // Call function to decrement likes count
        const { error: decrementError } = await supabase
          .rpc('decrement_post_likes', { post_id: postId });
          
        if (decrementError) throw decrementError;
      } else {
        // Like
        const { error: likeError } = await supabase
          .from('post_likes')
          .insert([{ 
            post_id: postId,
            user_id: currentUser.id
          }]);
          
        if (likeError) throw likeError;
        
        // Call function to increment likes count
        const { error: incrementError } = await supabase
          .rpc('increment_post_likes', { post_id: postId });
          
        if (incrementError) throw incrementError;
      }
      
      // Update local state
      fetchPosts();
    } catch (error: any) {
      console.error("Error liking post:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to like post",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const createComment = async (comment: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> => {
    if (!currentUser) throw new Error("You must be logged in to comment");
    
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          content: comment.content,
          user_id: comment.userId,
          user_name: comment.userName,
          user_role: comment.userRole,
          user_profile_image: comment.userProfileImage,
          post_id: comment.postId
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        const newComment: Comment = {
          id: data.id,
          content: data.content,
          userId: data.user_id,
          userName: data.user_name,
          userRole: data.user_role,
          userProfileImage: data.user_profile_image,
          postId: data.post_id,
          createdAt: new Date(data.created_at)
        };
        
        setComments(prev => [...prev, newComment]);
        
        // Increment comments count
        const { error: incrementError } = await supabase
          .rpc('increment_post_comments', { post_id: comment.postId });
          
        if (incrementError) throw incrementError;
        
        // Update posts to reflect new comment count
        fetchPosts();
        
        return newComment;
      }
      
      throw new Error("Failed to create comment");
    } catch (error: any) {
      console.error("Error creating comment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create comment",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const createEvent = async (event: Omit<Event, 'id' | 'createdAt' | 'isCompleted' | 'pendingRequests' | 'attendees'>): Promise<Event> => {
    if (!currentUser) throw new Error("You must be logged in to create an event");
    
    try {
      // Call the RPC function to create an event
      const { data, error } = await supabase
        .rpc('create_event', {
          title: event.title,
          description: event.description,
          creator_id: currentUser.id,
          creator_name: event.creatorName,
          creator_role: event.creatorRole,
          location: event.location,
          date: event.date.toISOString(),
          image: event.image || null,
          privacy: event.privacy,
          price: event.price || null,
          attendees: [currentUser.id],
          pending_requests: 0
        });
        
      if (error) throw error;
      
      if (data) {
        const newEvent: Event = {
          id: data.id,
          title: data.title,
          description: data.description,
          creatorId: data.creator_id,
          creatorName: data.creator_name,
          creatorRole: data.creator_role,
          location: data.location,
          date: new Date(data.date),
          image: data.image,
          privacy: data.privacy,
          price: data.price,
          attendees: data.attendees,
          pendingRequests: data.pending_requests,
          isCompleted: data.is_completed,
          createdAt: new Date(data.created_at)
        };
        
        setEvents(prev => [newEvent, ...prev]);
        return newEvent;
      }
      
      throw new Error("Failed to create event");
    } catch (error: any) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const joinEvent = async (eventId: string): Promise<void> => {
    if (!currentUser) throw new Error("You must be logged in to join an event");
    
    try {
      // Get the event
      const event = events.find(e => e.id === eventId);
      if (!event) throw new Error("Event not found");
      
      // Check if user is already attending
      if (event.attendees.includes(currentUser.id)) {
        throw new Error("You are already attending this event");
      }
      
      // Add user to attendees array
      const updatedAttendees = [...event.attendees, currentUser.id];
      
      // Update the event
      const { error } = await supabase
        .from('events')
        .update({ attendees: updatedAttendees })
        .eq('id', eventId);
        
      if (error) throw error;
      
      // Update local state
      setEvents(prev => prev.map(e => 
        e.id === eventId 
          ? { ...e, attendees: updatedAttendees } 
          : e
      ));
      
      toast({
        title: "Success",
        description: "You have joined the event"
      });
    } catch (error: any) {
      console.error("Error joining event:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to join event",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const leaveEvent = async (eventId: string): Promise<void> => {
    if (!currentUser) throw new Error("You must be logged in to leave an event");
    
    try {
      // Get the event
      const event = events.find(e => e.id === eventId);
      if (!event) throw new Error("Event not found");
      
      // Check if user is attending
      if (!event.attendees.includes(currentUser.id)) {
        throw new Error("You are not attending this event");
      }
      
      // Remove user from attendees array
      const updatedAttendees = event.attendees.filter(id => id !== currentUser.id);
      
      // Update the event
      const { error } = await supabase
        .from('events')
        .update({ attendees: updatedAttendees })
        .eq('id', eventId);
        
      if (error) throw error;
      
      // Update local state
      setEvents(prev => prev.map(e => 
        e.id === eventId 
          ? { ...e, attendees: updatedAttendees } 
          : e
      ));
      
      toast({
        title: "Success",
        description: "You have left the event"
      });
    } catch (error: any) {
      console.error("Error leaving event:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to leave event",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const requestToJoinEvent = async (eventId: string): Promise<void> => {
    if (!currentUser) throw new Error("You must be logged in to request to join an event");
    
    try {
      // Get the event
      const event = events.find(e => e.id === eventId);
      if (!event) throw new Error("Event not found");
      
      // Check if a request already exists
      const { data: existingRequest, error: checkError } = await supabase
        .from('join_requests')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', currentUser.id)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingRequest) {
        throw new Error("You have already requested to join this event");
      }
      
      // Create join request
      const { error } = await supabase
        .from('join_requests')
        .insert([{
          event_id: eventId,
          user_id: currentUser.id,
          user_name: currentUser.name,
          user_profile_image: currentUser.profileImage,
          status: 'pending'
        }]);
        
      if (error) throw error;
      
      // Increment pending requests count
      const { error: updateError } = await supabase
        .from('events')
        .update({ 
          pending_requests: event.pendingRequests + 1 
        })
        .eq('id', eventId);
        
      if (updateError) throw updateError;
      
      // Update local state
      setEvents(prev => prev.map(e => 
        e.id === eventId 
          ? { ...e, pendingRequests: e.pendingRequests + 1 } 
          : e
      ));
      
      // Refresh join requests
      fetchJoinRequests();
      
      toast({
        title: "Success",
        description: "Your request to join has been sent"
      });
    } catch (error: any) {
      console.error("Error requesting to join event:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to request to join event",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const approveEventJoinRequest = async (requestId: string, eventId: string, userId: string): Promise<void> => {
    if (!currentUser) throw new Error("You must be logged in to approve requests");
    
    try {
      // Get the event
      const event = events.find(e => e.id === eventId);
      if (!event) throw new Error("Event not found");
      
      // Check if user is the creator
      if (event.creatorId !== currentUser.id) {
        throw new Error("Only the event creator can approve requests");
      }
      
      // Update request status
      const { error: updateRequestError } = await supabase
        .from('join_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);
        
      if (updateRequestError) throw updateRequestError;
      
      // Add user to attendees array
      const updatedAttendees = [...event.attendees, userId];
      
      // Decrement pending requests count
      const { error: updateEventError } = await supabase
        .from('events')
        .update({ 
          attendees: updatedAttendees,
          pending_requests: Math.max(0, event.pendingRequests - 1)
        })
        .eq('id', eventId);
        
      if (updateEventError) throw updateEventError;
      
      // Update local state
      setEvents(prev => prev.map(e => 
        e.id === eventId 
          ? { 
              ...e, 
              attendees: updatedAttendees,
              pendingRequests: Math.max(0, e.pendingRequests - 1)
            } 
          : e
      ));
      
      // Refresh join requests
      fetchJoinRequests();
      
      toast({
        title: "Success",
        description: "Request approved"
      });
    } catch (error: any) {
      console.error("Error approving join request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve request",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const rejectEventJoinRequest = async (requestId: string): Promise<void> => {
    if (!currentUser) throw new Error("You must be logged in to reject requests");
    
    try {
      // Get the request
      const request = joinRequests.find(r => r.id === requestId);
      if (!request) throw new Error("Request not found");
      
      // Get the event
      const event = events.find(e => e.id === request.eventId);
      if (!event) throw new Error("Event not found");
      
      // Check if user is the creator
      if (event.creatorId !== currentUser.id) {
        throw new Error("Only the event creator can reject requests");
      }
      
      // Update request status
      const { error: updateRequestError } = await supabase
        .from('join_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);
        
      if (updateRequestError) throw updateRequestError;
      
      // Decrement pending requests count
      const { error: updateEventError } = await supabase
        .from('events')
        .update({ 
          pending_requests: Math.max(0, event.pendingRequests - 1)
        })
        .eq('id', event.id);
        
      if (updateEventError) throw updateEventError;
      
      // Update local state
      setEvents(prev => prev.map(e => 
        e.id === event.id 
          ? { 
              ...e,
              pendingRequests: Math.max(0, e.pendingRequests - 1)
            } 
          : e
      ));
      
      // Refresh join requests
      fetchJoinRequests();
      
      toast({
        title: "Success",
        description: "Request rejected"
      });
    } catch (error: any) {
      console.error("Error rejecting join request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject request",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const createGroup = async (group: Omit<Group, 'id' | 'createdAt' | 'members' | 'pendingRequests'>): Promise<Group> => {
    if (!currentUser) throw new Error("You must be logged in to create a group");
    
    try {
      const { data, error } = await supabase
        .from('groups')
        .insert([{
          name: group.name,
          description: group.description,
          creator_id: currentUser.id,
          creator_name: group.creatorName,
          creator_role: group.creatorRole,
          privacy: group.privacy,
          image: group.image || null,
          members: 1,
          pending_requests: 0,
          member_limit: group.memberLimit,
          rules: group.rules || []
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        const newGroup: Group = {
          id: data.id,
          name: data.name,
          description: data.description,
          creatorId: data.creator_id,
          creatorName: data.creator_name,
          creatorRole: data.creator_role,
          privacy: data.privacy,
          image: data.image,
          members: data.members,
          pendingRequests: data.pending_requests,
          memberLimit: data.member_limit,
          rules: data.rules,
          createdAt: new Date(data.created_at),
          memberIds: [currentUser.id]
        };
        
        // Add creator as member
        const { error: memberError } = await supabase
          .from('group_members')
          .insert([{
            group_id: data.id,
            user_id: currentUser.id
          }]);
          
        if (memberError) throw memberError;
        
        setGroups(prev => [newGroup, ...prev]);
        return newGroup;
      }
      
      throw new Error("Failed to create group");
    } catch (error: any) {
      console.error("Error creating group:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create group",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const joinGroup = async (groupId: string): Promise<void> => {
    if (!currentUser) throw new Error("You must be logged in to join a group");
    
    try {
      // Get the group
      const group = groups.find(g => g.id === groupId);
      if (!group) throw new Error("Group not found");
      
      // Check if user is already a member
      const { data: existingMember, error: checkError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)
        .eq('user_id', currentUser.id)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingMember) {
        throw new Error("You are already a member of this group");
      }
      
      // Add user as member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert([{
          group_id: groupId,
          user_id: currentUser.id
        }]);
        
      if (memberError) throw memberError;
      
      // Increment members count
      const { error: updateError } = await supabase
        .from('groups')
        .update({ members: group.members + 1 })
        .eq('id', groupId);
        
      if (updateError) throw updateError;
      
      // Update local state
      setGroups(prev => prev.map(g => 
        g.id === groupId 
          ? { 
              ...g, 
              members: g.members + 1,
              memberIds: g.memberIds ? [...g.memberIds, currentUser.id] : [currentUser.id]
            } 
          : g
      ));
      
      toast({
        title: "Success",
        description: "You have joined the group"
      });
    } catch (error: any) {
      console.error("Error joining group:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to join group",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const leaveGroup = async (groupId: string): Promise<void> => {
    if (!currentUser) throw new Error("You must be logged in to leave a group");
    
    try {
      // Get the group
      const group = groups.find(g => g.id === groupId);
      if (!group) throw new Error("Group not found");
      
      // Check if user is the creator
      if (group.creatorId === currentUser.id) {
        throw new Error("Group creators cannot leave their own group");
      }
      
      // Check if user is a member
      const { data: existingMember, error: checkError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)
        .eq('user_id', currentUser.id)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (!existingMember) {
        throw new Error("You are not a member of this group");
      }
      
      // Remove user as member
      const { error: deleteError } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', currentUser.id);
        
      if (deleteError) throw deleteError;
      
      // Decrement members count
      const { error: updateError } = await supabase
        .from('groups')
        .update({ members: Math.max(1, group.members - 1) })
        .eq('id', groupId);
        
      if (updateError) throw updateError;
      
      // Update local state
      setGroups(prev => prev.map(g => 
        g.id === groupId 
          ? { 
              ...g, 
              members: Math.max(1, g.members - 1),
              memberIds: g.memberIds ? g.memberIds.filter(id => id !== currentUser.id) : []
            } 
          : g
      ));
      
      toast({
        title: "Success",
        description: "You have left the group"
      });
    } catch (error: any) {
      console.error("Error leaving group:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to leave group",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const requestToJoinGroup = async (groupId: string): Promise<void> => {
    if (!currentUser) throw new Error("You must be logged in to request to join a group");
    
    try {
      // Get the group
      const group = groups.find(g => g.id === groupId);
      if (!group) throw new Error("Group not found");
      
      // Check if a request already exists
      const { data: existingRequest, error: checkError } = await supabase
        .from('join_requests')
        .select('*')
        .eq('group_id', groupId)
        .eq('user_id', currentUser.id)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingRequest) {
        throw new Error("You have already requested to join this group");
      }
      
      // Create join request
      const { error } = await supabase
        .from('join_requests')
        .insert([{
          group_id: groupId,
          user_id: currentUser.id,
          user_name: currentUser.name,
          user_profile_image: currentUser.profileImage,
          status: 'pending'
        }]);
        
      if (error) throw error;
      
      // Increment pending requests count
      const { error: updateError } = await supabase
        .from('groups')
        .update({ 
          pending_requests: group.pendingRequests + 1 
        })
        .eq('id', groupId);
        
      if (updateError) throw updateError;
      
      // Update local state
      setGroups(prev => prev.map(g => 
        g.id === groupId 
          ? { ...g, pendingRequests: g.pendingRequests + 1 } 
          : g
      ));
      
      // Refresh join requests
      fetchJoinRequests();
      
      toast({
        title: "Success",
        description: "Your request to join has been sent"
      });
    } catch (error: any) {
      console.error("Error requesting to join group:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to request to join group",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const removeGroupMember = async (groupId: string, userId: string): Promise<void> => {
    if (!currentUser) throw new Error("You must be logged in to remove a member");
    
    try {
      // Get the group
      const group = groups.find(g => g.id === groupId);
      if (!group) throw new Error("Group not found");
      
      // Check if user is the creator
      if (group.creatorId !== currentUser.id) {
        throw new Error("Only the group creator can remove members");
      }
      
      // Cannot remove the creator
      if (userId === group.creatorId) {
        throw new Error("Cannot remove the group creator");
      }
      
      // Remove user as member
      const { error: deleteError } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);
        
      if (deleteError) throw deleteError;
      
      // Decrement members count
      const { error: updateError } = await supabase
        .from('groups')
        .update({ members: Math.max(1, group.members - 1) })
        .eq('id', groupId);
        
      if (updateError) throw updateError;
      
      // Update local state
      setGroups(prev => prev.map(g => 
        g.id === groupId 
          ? { 
              ...g, 
              members: Math.max(1, g.members - 1),
              memberIds: g.memberIds ? g.memberIds.filter(id => id !== userId) : []
            } 
          : g
      ));
      
      toast({
        title: "Success",
        description: "Member removed from group"
      });
    } catch (error: any) {
      console.error("Error removing group member:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove member",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const updateGroupDetails = async (groupId: string, updates: Partial<Group>): Promise<void> => {
    if (!currentUser) throw new Error("You must be logged in to update a group");
    
    try {
      // Get the group
      const group = groups.find(g => g.id === groupId);
      if (!group) throw new Error("Group not found");
      
      // Check if user is the creator
      if (group.creatorId !== currentUser.id) {
        throw new Error("Only the group creator can update group details");
      }
      
      // Format updates for database
      const dbUpdates: any = {};
      
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.privacy !== undefined) dbUpdates.privacy = updates.privacy;
      if (updates.image !== undefined) dbUpdates.image = updates.image;
      if (updates.memberLimit !== undefined) dbUpdates.member_limit = updates.memberLimit;
      if (updates.rules !== undefined) dbUpdates.rules = updates.rules;
      
      // Update group
      const { error } = await supabase
        .from('groups')
        .update(dbUpdates)
        .eq('id', groupId);
        
      if (error) throw error;
      
      // Update local state
      setGroups(prev => prev.map(g => 
        g.id === groupId 
          ? { ...g, ...updates } 
          : g
      ));
      
      toast({
        title: "Success",
        description: "Group details updated"
      });
    } catch (error: any) {
      console.error("Error updating group details:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update group details",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const getGroupRequests = async (groupId: string): Promise<JoinRequest[]> => {
    if (!currentUser) throw new Error("You must be logged in to view requests");
    
    try {
      const { data, error } = await supabase
        .from('join_requests')
        .select('*')
        .eq('group_id', groupId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        return data.map(request => ({
          id: request.id,
          groupId: request.group_id,
          userId: request.user_id,
          userName: request.user_name,
          userProfileImage: request.user_profile_image,
          status: request.status as "approved" | "rejected" | "pending",
          createdAt: new Date(request.created_at)
        }));
      }
      
      return [];
    } catch (error: any) {
      console.error("Error fetching group requests:", error);
      throw error;
    }
  };
  
  const deleteGroup = async (groupId: string): Promise<void> => {
    if (!currentUser) throw new Error("You must be logged in to delete a group");
    
    try {
      // Get the group
      const group = groups.find(g => g.id === groupId);
      if (!group) throw new Error("Group not found");
      
      // Check if user is the creator
      if (group.creatorId !== currentUser.id) {
        throw new Error("Only the group creator can delete the group");
      }
      
      // Delete messages in the group
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('group_id', groupId);
        
      if (messagesError) throw messagesError;
      
      // Delete group members
      const { error: membersError } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId);
        
      if (membersError) throw membersError;
      
      // Delete join requests
      const { error: requestsError } = await supabase
        .from('join_requests')
        .delete()
        .eq('group_id', groupId);
        
      if (requestsError) throw requestsError;
      
      // Delete the group
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);
        
      if (error) throw error;
      
      // Update local state
      setGroups(prev => prev.filter(g => g.id !== groupId));
      
      toast({
        title: "Success",
        description: "Group deleted"
      });
    } catch (error: any) {
      console.error("Error deleting group:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete group",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const createMessage = async (message: Omit<Message, 'id' | 'createdAt'>): Promise<Message> => {
    if (!currentUser) throw new Error("You must be logged in to send a message");
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          content: message.content,
          user_id: message.userId,
          user_name: message.userName,
          user_role: message.userRole,
          user_profile_image: message.userProfileImage,
          group_id: message.groupId,
          media_url: message.mediaUrl,
          media_type: message.mediaType
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        const newMessage: Message = {
          id: data.id,
          content: data.content,
          userId: data.user_id,
          userName: data.user_name,
          userRole: data.user_role,
          userProfileImage: data.user_profile_image,
          groupId: data.group_id,
          mediaUrl: data.media_url,
          mediaType: data.media_type,
          createdAt: new Date(data.created_at)
        };
        
        setMessages(prev => [...prev, newMessage]);
        return newMessage;
      }
      
      throw new Error("Failed to create message");
    } catch (error: any) {
      console.error("Error creating message:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const sendServiceMessage = async (params: { serviceId: string, content: string }): Promise<void> => {
    if (!currentUser) throw new Error("You must be logged in to send a message");
    
    try {
      const { data, error } = await supabase
        .rpc('send_service_chat_message', {
          p_service_id: params.serviceId,
          p_user_id: currentUser.id,
          p_content: params.content
        });
        
      if (error) throw error;
      
      // Success, nothing to return
    } catch (error: any) {
      console.error("Error sending service message:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const getServiceMessages = async (serviceId: string): Promise<Message[]> => {
    try {
      const { data, error } = await supabase
        .rpc('get_service_chat_messages', {
          p_service_id: serviceId
        });
        
      if (error) throw error;
      
      if (data) {
        return data.map((msg: any) => ({
          id: msg.id,
          serviceId: msg.service_id,
          userId: msg.user_id,
          userName: msg.user_name,
          userProfileImage: msg.user_profile_image,
          content: msg.content,
          createdAt: new Date(msg.created_at),
          userRole: 'user' // Default value as it might not be in the response
        }));
      }
      
      return [];
    } catch (error: any) {
      console.error("Error fetching service messages:", error);
      throw error;
    }
  };
  
  const bookService = async (serviceId: string, notes?: string): Promise<void> => {
    if (!currentUser) throw new Error("You must be logged in to book a service");
    
    try {
      const service = services.find(s => s.id === serviceId);
      if (!service) throw new Error("Service not found");
      
      // Create booking
      await supabase.rpc('create_service_booking', {
        p_service_id: serviceId,
        p_user_id: currentUser.id,
        p_notes: notes || null,
        p_payment_status: service.price > 0 ? 'unpaid' : 'paid',
        p_status: service.price > 0 ? 'pending' : 'approved'
      });
      
      toast({
        title: "Success",
        description: "Service booked successfully"
      });
    } catch (error: any) {
      console.error("Error booking service:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to book service",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const getUserBookingForService = async (serviceId: string): Promise<Booking | null> => {
    if (!currentUser) return null;
    
    try {
      const { data, error } = await supabase
        .rpc('get_user_booking_for_service', {
          p_service_id: serviceId,
          p_user_id: currentUser.id
        });
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const booking = data[0];
        return {
          id: booking.id,
          serviceId: booking.service_id,
          userId: booking.user_id,
          userName: booking.user_name,
          userEmail: booking.user_email,
          status: booking.status,
          paymentStatus: booking.payment_status,
          notes: booking.notes,
          createdAt: new Date(booking.created_at)
        };
      }
      
      return null;
    } catch (error: any) {
      console.error("Error fetching user booking:", error);
      return null;
    }
  };
  
  const approveServiceBooking = async (bookingId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('service_bookings')
        .update({ status: 'approved' })
        .eq('id', bookingId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Booking approved"
      });
    } catch (error: any) {
      console.error("Error approving booking:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve booking",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const rejectServiceBooking = async (bookingId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('service_bookings')
        .update({ status: 'rejected' })
        .eq('id', bookingId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Booking rejected"
      });
    } catch (error: any) {
      console.error("Error rejecting booking:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject booking",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const approveEventRequest = async (requestId: string, eventId: string, userId: string) => {
    return approveEventJoinRequest(requestId, eventId, userId);
  };
  
  const rejectEventRequest = async (requestId: string) => {
    return rejectEventJoinRequest(requestId);
  };
  
  const value: DataContextType = {
    posts,
    events,
    groups,
    services,
    messages,
    comments,
    announcements,
    joinRequests,
    setMessages,
    createPost,
    likePost,
    createComment,
    createEvent,
    joinEvent,
    leaveEvent,
    requestToJoinEvent,
    approveEventRequest,
    rejectEventRequest,
    createGroup,
    joinGroup,
    leaveGroup,
    requestToJoinGroup,
    removeGroupMember,
    updateGroupDetails,
    getGroupRequests,
    deleteGroup,
    createMessage,
    sendServiceMessage,
    getServiceMessages,
    bookService,
    getUserBookingForService,
    approveServiceBooking,
    rejectServiceBooking,
    handleEventJoinRequest
  };
  
  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

export { DataContext, DataProvider };
