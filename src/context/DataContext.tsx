
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Service, Post, Event, EventPrivacy, Group, GroupPrivacy, Session, 
  SessionEnrollment, Message, JoinRequest, User, Sponsorship, SponsorshipStatus,
  UserRole, Comment, Announcement, ApplicationStatus, SponsorshipApplication,
  BookingStatus, Booking 
} from '@/types';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  generateMockServices, generateMockPosts, generateMockEvents, 
  generateMockGroups, generateMockSessions, generateMockSessionEnrollments, 
  generateMockMessages, generateMockJoinRequests, generateMockSponsorships 
} from '@/utils/mockData';

// Types for DataContext
export interface DataContextType {
  services: Service[];
  posts: Post[];
  events: Event[];
  groups: Group[];
  sessions: Session[];
  sessionEnrollments: SessionEnrollment[];
  messages: Message[];
  joinRequests: JoinRequest[];
  postComments: { [postId: string]: Comment[] };
  sponsorships: Sponsorship[];
  sponsorshipApplications: SponsorshipApplication[];
  loading: boolean;
  
  // Service Functions
  createService: (data: Omit<Service, 'id' | 'createdAt'>) => Promise<Service>;
  updateService: (id: string, data: Partial<Service>) => Promise<Service>;
  deleteService: (id: string) => Promise<void>;
  bookService: (serviceId: string, paymentStatus?: string, notes?: string) => Promise<Booking>;
  
  // Post Functions
  createPost: (content: string, image?: string) => Promise<Post>;
  deletePost: (id: string) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  commentOnPost: (postId: string, content: string) => Promise<Comment>;
  fetchPostComments: (postId: string) => Promise<Comment[]>;
  
  // Event Functions
  createEvent: (data: Omit<Event, 'id' | 'createdAt'>) => Promise<Event>;
  updateEvent: (id: string, data: Partial<Event>) => Promise<Event>;
  deleteEvent: (id: string) => Promise<void>;
  joinEvent: (eventId: string) => Promise<void>;
  leaveEvent: (eventId: string) => Promise<void>;
  requestToJoinEvent: (eventId: string) => Promise<void>;
  approveEventRequest: (requestId: string, eventId: string) => Promise<void>;
  rejectEventRequest: (requestId: string, eventId: string) => Promise<void>;
  createEventAnnouncement: (eventId: string, content: string) => Promise<Announcement>;
  
  // Group Functions
  createGroup: (data: Omit<Group, 'id' | 'createdAt' | 'members'>) => Promise<Group>;
  updateGroup: (id: string, data: Partial<Group>) => Promise<Group>;
  deleteGroup: (id: string) => Promise<void>;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  requestToJoinGroup: (groupId: string) => Promise<void>;
  approveGroupRequest: (requestId: string, groupId: string) => Promise<void>;
  rejectGroupRequest: (requestId: string, groupId: string) => Promise<void>;
  sendMessageToGroup: (data: { groupId: string; content: string }) => Promise<Message>;
  sendMessageToService: (data: { serviceId: string; content: string }) => Promise<Message>;
  
  // Session Functions
  createSession: (data: Omit<Session, 'id' | 'createdAt'>) => Promise<Session>;
  updateSession: (id: string, data: Partial<Session>) => Promise<Session>;
  deleteSession: (id: string) => Promise<void>;
  enrollInSession: (sessionId: string) => Promise<void>;
  unenrollFromSession: (sessionId: string) => Promise<void>;
  
  // Sponsorship Functions
  createSponsorship: (data: Omit<Sponsorship, 'id' | 'createdAt'>) => Promise<Sponsorship>;
  updateSponsorship: (id: string, data: Partial<Sponsorship>) => Promise<Sponsorship>;
  deleteSponsorship: (id: string) => Promise<void>;
  applyToSponsorship: (sponsorshipId: string, data: {
    motivation: string;
    experience: string;
    socialLinks?: { instagram?: string; twitter?: string; website?: string };
  }) => Promise<void>;
  
  // Sponsorship Application Management
  getSponsorshipApplications: (sponsorshipId: string) => Promise<SponsorshipApplication[]>;
  updateApplicationStatus: (applicationId: string, status: ApplicationStatus) => Promise<void>;
  
  // Fetch Data Functions
  fetchServices: () => Promise<void>;
  fetchPosts: () => Promise<void>;
  fetchEvents: () => Promise<void>;
  fetchGroups: () => Promise<void>;
  fetchSessions: () => Promise<void>;
  fetchSessionEnrollments: () => Promise<void>;
  fetchMessages: () => Promise<void>;
  fetchSponsorships: () => Promise<void>;
  fetchSponsorshipApplications: () => Promise<void>;
  
  fetchServiceById: (id: string) => Promise<Service | null>;
  fetchEventById: (id: string) => Promise<Event | null>;
  fetchGroupById: (id: string) => Promise<Group | null>;
  fetchSessionById: (id: string) => Promise<Session | null>;
  fetchSponsorshipById: (id: string) => Promise<Sponsorship | null>;
  
  // Util Functions
  getEnrollmentForSession: (sessionId: string) => SessionEnrollment | undefined;
  getJoinRequestsForEntity: (entityId: string, entityType: 'event' | 'group') => JoinRequest[];
  getEventById: (id: string) => Event | undefined;
  getGroupById: (id: string) => Group | undefined;
  getSessionById: (id: string) => Session | undefined;
  getSponsorshipById: (id: string) => Sponsorship | undefined;
  getServiceById: (id: string) => Service | undefined;
}

// Create the context with default values
export const DataContext = createContext<DataContextType | undefined>(undefined);

// Custom hook to use the context
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  
  const [services, setServices] = useState<Service[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionEnrollments, setSessionEnrollments] = useState<SessionEnrollment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [sponsorshipApplications, setSponsorshipApplications] = useState<SponsorshipApplication[]>([]);
  const [postComments, setPostComments] = useState<{ [postId: string]: Comment[] }>({});
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // Load data on initial render
    const loadData = async () => {
      try {
        await Promise.all([
          fetchServices(),
          fetchPosts(),
          fetchEvents(),
          fetchGroups(),
          fetchSessions(),
          fetchSessionEnrollments(),
          fetchMessages(),
          fetchSponsorships(),
          fetchSponsorshipApplications()
        ]);
        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Services
  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Transform database schema to our frontend types
      const transformedServices: Service[] = data.map(service => ({
        id: service.id,
        title: service.title,
        description: service.description || '',
        providerId: service.coach_id,
        providerName: service.coach_name,
        price: service.price,
        duration: service.duration || '',
        available: service.is_active,
        createdAt: new Date(service.created_at),
        isOnline: service.is_online,
        location: service.location || null,
        capacity: service.capacity || null,
        serviceType: service.service_type as any,
        coverImage: service.cover_image || '',
        meetingUrl: service.meeting_url || null
      }));
      
      setServices(transformedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      // Fall back to mock data if we can't fetch from database
      setServices(generateMockServices());
    }
  };
  
  const createService = async (data: Omit<Service, 'id' | 'createdAt'>) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to create a service');
      }
      
      // Transform our frontend types to database schema
      const serviceData = {
        title: data.title,
        description: data.description,
        coach_id: data.providerId,
        coach_name: data.providerName,
        price: data.price,
        duration: data.duration,
        is_active: data.available,
        is_online: data.isOnline,
        location: data.location,
        capacity: data.capacity,
        service_type: data.serviceType,
        cover_image: data.coverImage,
        meeting_url: data.meetingUrl
      };
      
      const { data: result, error } = await supabase
        .from('services')
        .insert(serviceData)
        .select()
        .single();
        
      if (error) throw error;
      
      // Transform back to our frontend type
      const newService: Service = {
        id: result.id,
        title: result.title,
        description: result.description || '',
        providerId: result.coach_id,
        providerName: result.coach_name,
        price: result.price,
        duration: result.duration || '',
        available: result.is_active,
        createdAt: new Date(result.created_at),
        isOnline: result.is_online,
        location: result.location || null,
        capacity: result.capacity || null,
        serviceType: result.service_type as any,
        coverImage: result.cover_image || '',
        meetingUrl: result.meeting_url || null
      };
      
      setServices(prev => [newService, ...prev]);
      return newService;
    } catch (error: any) {
      console.error('Error creating service:', error);
      toast({
        variant: "destructive",
        title: "Failed to create service",
        description: error.message
      });
      throw error;
    }
  };
  
  const updateService = async (id: string, data: Partial<Service>) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to update a service');
      }
      
      // Transform our frontend types to database schema
      const serviceData: any = {};
      
      if (data.title !== undefined) serviceData.title = data.title;
      if (data.description !== undefined) serviceData.description = data.description;
      if (data.price !== undefined) serviceData.price = data.price;
      if (data.duration !== undefined) serviceData.duration = data.duration;
      if (data.available !== undefined) serviceData.is_active = data.available;
      if (data.isOnline !== undefined) serviceData.is_online = data.isOnline;
      if (data.location !== undefined) serviceData.location = data.location;
      if (data.capacity !== undefined) serviceData.capacity = data.capacity;
      if (data.serviceType !== undefined) serviceData.service_type = data.serviceType;
      if (data.coverImage !== undefined) serviceData.cover_image = data.coverImage;
      if (data.meetingUrl !== undefined) serviceData.meeting_url = data.meetingUrl;
      
      const { data: result, error } = await supabase
        .from('services')
        .update(serviceData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      // Transform back to our frontend type
      const updatedService: Service = {
        id: result.id,
        title: result.title,
        description: result.description || '',
        providerId: result.coach_id,
        providerName: result.coach_name,
        price: result.price,
        duration: result.duration || '',
        available: result.is_active,
        createdAt: new Date(result.created_at),
        isOnline: result.is_online,
        location: result.location || null,
        capacity: result.capacity || null,
        serviceType: result.service_type as any,
        coverImage: result.cover_image || '',
        meetingUrl: result.meeting_url || null
      };
      
      setServices(prev => prev.map(service => 
        service.id === id ? updatedService : service
      ));
      
      return updatedService;
    } catch (error: any) {
      console.error('Error updating service:', error);
      toast({
        variant: "destructive",
        title: "Failed to update service",
        description: error.message
      });
      throw error;
    }
  };
  
  const deleteService = async (id: string) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to delete a service');
      }
      
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setServices(prev => prev.filter(service => service.id !== id));
    } catch (error: any) {
      console.error('Error deleting service:', error);
      toast({
        variant: "destructive",
        title: "Failed to delete service",
        description: error.message
      });
      throw error;
    }
  };
  
  const fetchServiceById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .maybeSingle();
        
      if (error) throw error;
      if (!data) return null;
      
      // Transform database schema to our frontend types
      const service: Service = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        providerId: data.coach_id,
        providerName: data.coach_name,
        price: data.price,
        duration: data.duration || '',
        available: data.is_active,
        createdAt: new Date(data.created_at),
        isOnline: data.is_online,
        location: data.location || null,
        capacity: data.capacity || null,
        serviceType: data.service_type as any,
        coverImage: data.cover_image || '',
        meetingUrl: data.meeting_url || null
      };
      
      return service;
    } catch (error) {
      console.error('Error fetching service by ID:', error);
      return null;
    }
  };
  
  // Posts
  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Transform database schema to our frontend types
      const transformedPosts = data.map(post => ({
        id: post.id,
        userId: post.user_id,
        userName: post.user_name,
        userRole: post.user_role as UserRole,
        userProfileImage: post.user_profile_image || '',
        content: post.content,
        image: post.image || null,
        createdAt: new Date(post.created_at),
        likesCount: post.likes_count || 0,
        commentsCount: post.comments_count || 0,
        isLiked: false // We'll set this based on user's likes
      }));
      
      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Fall back to mock data if we can't fetch from database
      setPosts(generateMockPosts());
    }
  };
  
  const createPost = async (content: string, image?: string) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to create a post');
      }
      
      const postData = {
        user_id: currentUser.id,
        user_name: currentUser.name,
        user_role: currentUser.role,
        user_profile_image: currentUser.profileImage || null,
        content,
        image: image || null
      };
      
      const { data, error } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single();
        
      if (error) throw error;
      
      const newPost: Post = {
        id: data.id,
        userId: data.user_id,
        userName: data.user_name,
        userRole: data.user_role as UserRole,
        userProfileImage: data.user_profile_image || '',
        content: data.content,
        image: data.image || null,
        createdAt: new Date(data.created_at),
        likesCount: 0,
        commentsCount: 0,
        isLiked: false
      };
      
      setPosts(prev => [newPost, ...prev]);
      return newPost;
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast({
        variant: "destructive",
        title: "Failed to create post",
        description: error.message
      });
      throw error;
    }
  };
  
  const deletePost = async (id: string) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to delete a post');
      }
      
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setPosts(prev => prev.filter(post => post.id !== id));
    } catch (error: any) {
      console.error('Error deleting post:', error);
      toast({
        variant: "destructive",
        title: "Failed to delete post",
        description: error.message
      });
      throw error;
    }
  };
  
  const likePost = async (postId: string) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to like a post');
      }
      
      const { error } = await supabase
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: currentUser.id
        });
        
      if (error) throw error;
      
      // Increment the likes count locally
      setPosts(prev => 
        prev.map(post => 
          post.id === postId 
            ? { ...post, likesCount: post.likesCount + 1, isLiked: true } 
            : post
        )
      );
    } catch (error: any) {
      console.error('Error liking post:', error);
      throw error;
    }
  };
  
  const unlikePost = async (postId: string) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to unlike a post');
      }
      
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', currentUser.id);
        
      if (error) throw error;
      
      // Decrement the likes count locally
      setPosts(prev => 
        prev.map(post => 
          post.id === postId 
            ? { ...post, likesCount: Math.max(0, post.likesCount - 1), isLiked: false } 
            : post
        )
      );
    } catch (error: any) {
      console.error('Error unliking post:', error);
      throw error;
    }
  };
  
  const commentOnPost = async (postId: string, content: string) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to comment on a post');
      }
      
      const commentData = {
        post_id: postId,
        user_id: currentUser.id,
        user_name: currentUser.name,
        user_role: currentUser.role,
        user_profile_image: currentUser.profileImage || null,
        content
      };
      
      const { data, error } = await supabase
        .from('comments')
        .insert(commentData)
        .select()
        .single();
        
      if (error) throw error;
      
      const newComment: Comment = {
        id: data.id,
        postId: data.post_id,
        userId: data.user_id,
        userName: data.user_name,
        userRole: data.user_role as UserRole,
        userProfileImage: data.user_profile_image || '',
        content: data.content,
        createdAt: new Date(data.created_at)
      };
      
      // Update comments for this post
      setPostComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment]
      }));
      
      // Increment the comments count locally
      setPosts(prev => 
        prev.map(post => 
          post.id === postId 
            ? { ...post, commentsCount: post.commentsCount + 1 } 
            : post
        )
      );
      
      return newComment;
    } catch (error: any) {
      console.error('Error commenting on post:', error);
      toast({
        variant: "destructive",
        title: "Failed to add comment",
        description: error.message
      });
      throw error;
    }
  };
  
  const fetchPostComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      const comments: Comment[] = data.map(comment => ({
        id: comment.id,
        postId: comment.post_id,
        userId: comment.user_id,
        userName: comment.user_name,
        userRole: comment.user_role as UserRole,
        userProfileImage: comment.user_profile_image || '',
        content: comment.content,
        createdAt: new Date(comment.created_at)
      }));
      
      setPostComments(prev => ({
        ...prev,
        [postId]: comments
      }));
      
      return comments;
    } catch (error: any) {
      console.error('Error fetching post comments:', error);
      return [];
    }
  };
  
  // Events
  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
        
      if (error) throw error;
      
      const transformedEvents: Event[] = data.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        creatorId: event.creator_id,
        creatorName: event.creator_name,
        creatorRole: event.creator_role as UserRole,
        date: new Date(event.date),
        location: event.location,
        price: event.price || 0,
        image: event.image || '',
        privacy: event.privacy as EventPrivacy,
        attendees: event.attendees || [],
        pendingRequests: event.pending_requests || 0,
        createdAt: new Date(event.created_at)
      }));
      
      setEvents(transformedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      // Fall back to mock data if we can't fetch from database
      setEvents(generateMockEvents());
    }
  };
  
  const createEvent = async (data: Omit<Event, 'id' | 'createdAt'>) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to create an event');
      }
      
      // Transform our frontend types to database schema
      const eventData = {
        title: data.title,
        description: data.description,
        creator_id: currentUser.id,
        creator_name: currentUser.name,
        creator_role: currentUser.role,
        date: data.date.toISOString(),
        location: data.location,
        price: data.price || 0,
        image: data.image || null,
        privacy: data.privacy,
        attendees: [currentUser.id], // Creator is automatically an attendee
        pending_requests: 0
      };
      
      const { data: result, error } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single();
        
      if (error) throw error;
      
      // Transform back to our frontend type
      const newEvent: Event = {
        id: result.id,
        title: result.title,
        description: result.description,
        creatorId: result.creator_id,
        creatorName: result.creator_name,
        creatorRole: result.creator_role as UserRole,
        date: new Date(result.date),
        location: result.location,
        price: result.price || 0,
        image: result.image || '',
        privacy: result.privacy as EventPrivacy,
        attendees: result.attendees || [],
        pendingRequests: result.pending_requests || 0,
        createdAt: new Date(result.created_at)
      };
      
      setEvents(prev => [newEvent, ...prev]);
      return newEvent;
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast({
        variant: "destructive",
        title: "Failed to create event",
        description: error.message
      });
      throw error;
    }
  };
  
  const updateEvent = async (id: string, data: Partial<Event>) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to update an event');
      }
      
      // Transform our frontend types to database schema
      const eventData: any = {};
      
      if (data.title !== undefined) eventData.title = data.title;
      if (data.description !== undefined) eventData.description = data.description;
      if (data.date !== undefined) eventData.date = data.date.toISOString();
      if (data.location !== undefined) eventData.location = data.location;
      if (data.price !== undefined) eventData.price = data.price;
      if (data.image !== undefined) eventData.image = data.image;
      if (data.privacy !== undefined) eventData.privacy = data.privacy;
      if (data.attendees !== undefined) eventData.attendees = data.attendees;
      if (data.pendingRequests !== undefined) eventData.pending_requests = data.pendingRequests;
      
      const { data: result, error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      // Transform back to our frontend type
      const updatedEvent: Event = {
        id: result.id,
        title: result.title,
        description: result.description,
        creatorId: result.creator_id,
        creatorName: result.creator_name,
        creatorRole: result.creator_role as UserRole,
        date: new Date(result.date),
        location: result.location,
        price: result.price || 0,
        image: result.image || '',
        privacy: result.privacy as EventPrivacy,
        attendees: result.attendees || [],
        pendingRequests: result.pending_requests || 0,
        createdAt: new Date(result.created_at)
      };
      
      setEvents(prev => prev.map(event => 
        event.id === id ? updatedEvent : event
      ));
      
      return updatedEvent;
    } catch (error: any) {
      console.error('Error updating event:', error);
      toast({
        variant: "destructive",
        title: "Failed to update event",
        description: error.message
      });
      throw error;
    }
  };
  
  const deleteEvent = async (id: string) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to delete an event');
      }
      
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setEvents(prev => prev.filter(event => event.id !== id));
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast({
        variant: "destructive",
        title: "Failed to delete event",
        description: error.message
      });
      throw error;
    }
  };
  
  const fetchEventById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .maybeSingle();
        
      if (error) throw error;
      if (!data) return null;
      
      // Transform database schema to our frontend types
      const event: Event = {
        id: data.id,
        title: data.title,
        description: data.description,
        creatorId: data.creator_id,
        creatorName: data.creator_name,
        creatorRole: data.creator_role as UserRole,
        date: new Date(data.date),
        location: data.location,
        price: data.price || 0,
        image: data.image || '',
        privacy: data.privacy as EventPrivacy,
        attendees: data.attendees || [],
        pendingRequests: data.pending_requests || 0,
        createdAt: new Date(data.created_at)
      };
      
      return event;
    } catch (error) {
      console.error('Error fetching event by ID:', error);
      return null;
    }
  };
  
  const joinEvent = async (eventId: string) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to join an event');
      }
      
      // Get current event first
      const event = events.find(e => e.id === eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      
      // Check if user is already attending
      if (event.attendees.includes(currentUser.id)) {
        throw new Error('You are already attending this event');
      }
      
      // Add user to attendees
      const updatedAttendees = [...event.attendees, currentUser.id];
      
      // Update the event
      const { error } = await supabase
        .from('events')
        .update({ attendees: updatedAttendees })
        .eq('id', eventId);
        
      if (error) throw error;
      
      // Update local state
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, attendees: updatedAttendees } 
          : event
      ));
    } catch (error: any) {
      console.error('Error joining event:', error);
      toast({
        variant: "destructive",
        title: "Failed to join event",
        description: error.message
      });
      throw error;
    }
  };
  
  const leaveEvent = async (eventId: string) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to leave an event');
      }
      
      // Get current event first
      const event = events.find(e => e.id === eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      
      // Check if user is attending
      if (!event.attendees.includes(currentUser.id)) {
        throw new Error('You are not attending this event');
      }
      
      // Remove user from attendees
      const updatedAttendees = event.attendees.filter(id => id !== currentUser.id);
      
      // Update the event
      const { error } = await supabase
        .from('events')
        .update({ attendees: updatedAttendees })
        .eq('id', eventId);
        
      if (error) throw error;
      
      // Update local state
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, attendees: updatedAttendees } 
          : event
      ));
    } catch (error: any) {
      console.error('Error leaving event:', error);
      toast({
        variant: "destructive",
        title: "Failed to leave event",
        description: error.message
      });
      throw error;
    }
  };
  
  const requestToJoinEvent = async (eventId: string) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to request to join an event');
      }
      
      const requestData = {
        event_id: eventId,
        user_id: currentUser.id,
        user_name: currentUser.name,
        user_profile_image: currentUser.profileImage || null,
        status: 'pending'
      };
      
      const { error } = await supabase
        .from('join_requests')
        .insert(requestData);
        
      if (error) throw error;
      
      // Increment pending requests count in the event
      const event = events.find(e => e.id === eventId);
      if (event) {
        const updatedEvent = { 
          ...event, 
          pendingRequests: event.pendingRequests + 1 
        };
        
        await supabase
          .from('events')
          .update({ pending_requests: updatedEvent.pendingRequests })
          .eq('id', eventId);
        
        // Update local state
        setEvents(prev => prev.map(e => 
          e.id === eventId ? updatedEvent : e
        ));
      }
      
      toast({
        title: "Request Sent",
        description: "Your request to join the event has been sent"
      });
    } catch (error: any) {
      console.error('Error requesting to join event:', error);
      toast({
        variant: "destructive",
        title: "Failed to send request",
        description: error.message
      });
      throw error;
    }
  };
  
  const approveEventRequest = async (requestId: string, eventId: string) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to approve a request');
      }
      
      // Get the request
      const { data: requestData, error: requestError } = await supabase
        .from('join_requests')
        .select('*')
        .eq('id', requestId)
        .single();
        
      if (requestError) throw requestError;
      
      // Update request status to approved
      const { error: updateError } = await supabase
        .from('join_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);
        
      if (updateError) throw updateError;
      
      // Get the event
      const event = events.find(e => e.id === eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      
      // Add user to attendees
      const updatedAttendees = [...event.attendees, requestData.user_id];
      const updatedPendingRequests = Math.max(0, event.pendingRequests - 1);
      
      // Update the event
      const { error: eventError } = await supabase
        .from('events')
        .update({ 
          attendees: updatedAttendees, 
          pending_requests: updatedPendingRequests 
        })
        .eq('id', eventId);
        
      if (eventError) throw eventError;
      
      // Update local state
      setEvents(prev => prev.map(e => 
        e.id === eventId 
          ? { 
              ...e, 
              attendees: updatedAttendees, 
              pendingRequests: updatedPendingRequests 
            } 
          : e
      ));
      
      // Update join requests local state
      setJoinRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'approved' as const } 
          : req
      ));
      
      toast({
        title: "Request Approved",
        description: `${requestData.user_name} has been added to the event`
      });
    } catch (error: any) {
      console.error('Error approving event request:', error);
      toast({
        variant: "destructive",
        title: "Failed to approve request",
        description: error.message
      });
      throw error;
    }
  };
  
  const rejectEventRequest = async (requestId: string, eventId: string) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to reject a request');
      }
      
      // Update request status to rejected
      const { error: updateError } = await supabase
        .from('join_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);
        
      if (updateError) throw updateError;
      
      // Get the event
      const event = events.find(e => e.id === eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      
      // Decrement pending requests
      const updatedPendingRequests = Math.max(0, event.pendingRequests - 1);
      
      // Update the event
      const { error: eventError } = await supabase
        .from('events')
        .update({ pending_requests: updatedPendingRequests })
        .eq('id', eventId);
        
      if (eventError) throw eventError;
      
      // Update local state
      setEvents(prev => prev.map(e => 
        e.id === eventId 
          ? { ...e, pendingRequests: updatedPendingRequests } 
          : e
      ));
      
      // Update join requests local state
      setJoinRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'rejected' as const } 
          : req
      ));
      
      toast({
        title: "Request Rejected",
        description: "The join request has been rejected"
      });
    } catch (error: any) {
      console.error('Error rejecting event request:', error);
      toast({
        variant: "destructive",
        title: "Failed to reject request",
        description: error.message
      });
      throw error;
    }
  };
  
  const createEventAnnouncement = async (eventId: string, content: string) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to create an announcement');
      }
      
      // Create announcement logic here
      // For now, we'll just return a mock announcement
      const announcement: Announcement = {
        id: Math.random().toString(),
        eventId,
        content,
        creatorId: currentUser.id,
        creatorName: currentUser.name,
        creatorRole: currentUser.role,
        createdAt: new Date()
      };
      
      return announcement;
    } catch (error: any) {
      console.error('Error creating event announcement:', error);
      toast({
        variant: "destructive",
        title: "Failed to create announcement",
        description: error.message
      });
      throw error;
    }
  };
  
  // Groups
  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const transformedGroups: Group[] = data.map(group => ({
        id: group.id,
        name: group.name,
        description: group.description,
        creatorId: group.creator_id,
        creatorName: group.creator_name,
        creatorRole: group.creator_role as UserRole,
        members: group.members || 1,
        memberLimit: group.member_limit || 100,
        image: group.image || '',
        rules: group.rules || [],
        privacy: group.privacy as GroupPrivacy,
        price: group.price || 0,
        pendingRequests: group.pending_requests || 0,
        createdAt: new Date(group.created_at)
      }));
      
      setGroups(transformedGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
      // Fall back to mock data if we can't fetch from database
      setGroups(generateMockGroups());
    }
  };
  
  const createGroup = async (data: Omit<Group, 'id' | 'createdAt' | 'members'>) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to create a group');
      }
      
      // Transform our frontend types to database schema
      const groupData = {
        name: data.name,
        description: data.description,
        creator_id: data.creatorId,
        creator_name: data.creatorName,
        creator_role: data.creatorRole,
        members: 1, // Creator is the first member
        member_limit: data.memberLimit,
        image: data.image || null,
        rules: data.rules || [],
        privacy: data.privacy,
        price: data.price || 0,
        pending_requests: 0
      };
      
      const { data: result, error } = await supabase
        .from('groups')
        .insert(groupData)
        .select()
        .single();
        
      if (error) throw error;
      
      // Also insert the creator as a member
      await supabase
        .from('group_members')
        .insert({
          group_id: result.id,
          user_id: data.creatorId
        });
      
      // Transform back to our frontend type
      const newGroup: Group = {
        id: result.id,
        name: result.name,
        description: result.description,
        creatorId: result.creator_id,
        creatorName: result.creator_name,
        creatorRole: result.creator_role as UserRole,
        members: result.members || 1,
        memberLimit: result.member_limit || 100,
        image: result.image || '',
        rules: result.rules || [],
        privacy: result.privacy as GroupPrivacy,
        price: result.price || 0,
        pendingRequests: result.pending_requests || 0,
        createdAt: new Date(result.created_at)
      };
      
      setGroups(prev => [newGroup, ...prev]);
      return newGroup;
    } catch (error: any) {
      console.error('Error creating group:', error);
      toast({
        variant: "destructive",
        title: "Failed to create group",
        description: error.message
      });
      throw error;
    }
  };
  
  const updateGroup = async (id: string, data: Partial<Group>) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to update a group');
      }
      
      // Transform our frontend types to database schema
      const groupData: any = {};
      
      if (data.name !== undefined) groupData.name = data.name;
      if (data.description !== undefined) groupData.description = data.description;
      if (data.memberLimit !== undefined) groupData.member_limit = data.memberLimit;
      if (data.image !== undefined) groupData.image = data.image;
      if (data.rules !== undefined) groupData.rules = data.rules;
      if (data.privacy !== undefined) groupData.privacy = data.privacy;
      if (data.price !== undefined) groupData.price = data.price;
      if (data.members !== undefined) groupData.members = data.members;
      if (data.pendingRequests !== undefined) groupData.pending_requests = data.pendingRequests;
      
      const { data: result, error } = await supabase
        .from('groups')
        .update(groupData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      // Transform back to our frontend type
      const updatedGroup: Group = {
        id: result.id,
        name: result.name,
        description: result.description,
        creatorId: result.creator_id,
        creatorName: result.creator_name,
        creatorRole: result.creator_role as UserRole,
        members: result.members || 1,
        memberLimit: result.member_limit || 100,
        image: result.image || '',
        rules: result.rules || [],
        privacy: result.privacy as GroupPrivacy,
        price: result.price || 0,
        pendingRequests: result.pending_requests || 0,
        createdAt: new Date(result.created_at)
      };
      
      setGroups(prev => prev.map(group => 
        group.id === id ? updatedGroup : group
      ));
      
      return updatedGroup;
    } catch (error: any) {
      console.error('Error updating group:', error);
      toast({
        variant: "destructive",
        title: "Failed to update group",
        description: error.message
      });
      throw error;
    }
  };
  
  const deleteGroup = async (id: string) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to delete a group');
      }
      
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setGroups(prev => prev.filter(group => group.id !== id));
    } catch (error: any) {
      console.error('Error deleting group:', error);
      toast({
        variant: "destructive",
        title: "Failed to delete group",
        description: error.message
      });
      throw error;
    }
  };
  
  const fetchGroupById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('id', id)
        .maybeSingle();
        
      if (error) throw error;
      if (!data) return null;
      
      // Transform database schema to our frontend types
      const group: Group = {
        id: data.id,
        name: data.name,
        description: data.description,
        creatorId: data.creator_id,
        creatorName: data.creator_name,
        creatorRole: data.creator_role as UserRole,
        members: data.members || 1,
        memberLimit: data.member_limit || 100,
        image: data.image || '',
        rules: data.rules || [],
        privacy: data.privacy as GroupPrivacy,
        price: data.price || 0,
        pendingRequests: data.pending_requests || 0,
        createdAt: new Date(data.created_at)
      };
      
      return group;
    } catch (error) {
      console.error('Error fetching group by ID:', error);
      return null;
    }
  };
  
  const joinGroup = async (groupId: string) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to join a group');
      }
      
      // Check if already a member
      const { data: existingMember, error: checkError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)
        .eq('user_id', currentUser.id)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingMember) {
        throw new Error('You are already a member of this group');
      }
      
      // Add to group_members
      const { error: joinError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: currentUser.id
        });
        
      if (joinError) throw joinError;
      
      // Get the group
      const group = groups.find(g => g.id === groupId);
      if (!group) {
        throw new Error('Group not found');
      }
      
      // Increment members count
      const updatedMembers = group.members + 1;
      
      // Update the group
      const { error: updateError } = await supabase
        .from('groups')
        .update({ members: updatedMembers })
        .eq('id', groupId);
        
      if (updateError) throw updateError;
      
      // Update local state
      setGroups(prev => prev.map(g => 
        g.id === groupId 
          ? { ...g, members: updatedMembers } 
          : g
      ));
      
      toast({
        title: "Joined Group",
        description: `You have successfully joined ${group.name}`
      });
    } catch (error: any) {
      console.error('Error joining group:', error);
      toast({
        variant: "destructive",
        title: "Failed to join group",
        description: error.message
      });
      throw error;
    }
  };
  
  const leaveGroup = async (groupId: string) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to leave a group');
      }
      
      // Check if creator
      const group = groups.find(g => g.id === groupId);
      if (!group) {
        throw new Error('Group not found');
      }
      
      if (group.creatorId === currentUser.id) {
        throw new Error('As the creator, you cannot leave the group');
      }
      
      // Remove from group_members
      const { error: leaveError } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', currentUser.id);
        
      if (leaveError) throw leaveError;
      
      // Decrement members count
      const updatedMembers = Math.max(1, group.members - 1);
      
      // Update the group
      const { error: updateError } = await supabase
        .from('groups')
        .update({ members: updatedMembers })
        .eq('id', groupId);
        
      if (updateError) throw updateError;
      
      // Update local state
      setGroups(prev => prev.map(g => 
        g.id === groupId 
          ? { ...g, members: updatedMembers } 
          : g
      ));
      
      toast({
        title: "Left Group",
        description: `You have left ${group.name}`
      });
    } catch (error: any) {
      console.error('Error leaving group:', error);
      toast({
        variant: "destructive",
        title: "Failed to leave group",
        description: error.message
      });
      throw error;
    }
  };
  
  const requestToJoinGroup = async (groupId: string) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to request to join a group');
      }
      
      const requestData = {
        group_id: groupId,
        user_id: currentUser.id,
        user_name: currentUser.name,
        user_profile_image: currentUser.profileImage || null,
        status: 'pending'
      };
      
      const { error } = await supabase
        .from('join_requests')
        .insert(requestData);
        
      if (error) throw error;
      
      // Increment pending requests count in the group
      const group = groups.find(g => g.id === groupId);
      if (group) {
        const updatedGroup = { 
          ...group, 
          pendingRequests: group.pendingRequests + 1 
        };
        
        await supabase
          .from('groups')
          .update({ pending_requests: updatedGroup.pendingRequests })
          .eq('id', groupId);
        
        // Update local state
        setGroups(prev => prev.map(g => 
          g.id === groupId ? updatedGroup : g
        ));
      }
      
      toast({
        title: "Request Sent",
        description: "Your request to join the group has been sent"
      });
    } catch (error: any) {
      console.error('Error requesting to join group:', error);
      toast({
        variant: "destructive",
        title: "Failed to send request",
        description: error.message
      });
      throw error;
    }
  };
  
  const approveGroupRequest = async (requestId: string, groupId: string) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to approve a request');
      }
      
      // Get the request
      const { data: requestData, error: requestError } = await supabase
        .from('join_requests')
        .select('*')
        .eq('id', requestId)
        .single();
        
      if (requestError) throw requestError;
      
      // Update request status to approved
      const { error: updateError } = await supabase
        .from('join_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);
        
      if (updateError) throw updateError;
      
      // Add to group_members
      const { error: joinError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: requestData.user_id
        });
        
      if (joinError) throw joinError;
      
      // Get the group
      const group = groups.find(g => g.id === groupId);
      if (!group) {
        throw new Error('Group not found');
      }
      
      // Update members and pending requests counts
      const updatedMembers = group.members + 1;
      const updatedPendingRequests = Math.max(0, group.pendingRequests - 1);
      
      // Update the group
      const { error: groupError } = await supabase
        .from('groups')
        .update({ 
          members: updatedMembers, 
          pending_requests: updatedPendingRequests 
        })
        .eq('id', groupId);
        
      if (groupError) throw groupError;
      
      // Update local state
      setGroups(prev => prev.map(g => 
        g.id === groupId 
          ? { 
              ...g, 
              members: updatedMembers, 
              pendingRequests: updatedPendingRequests 
            } 
          : g
      ));
      
      // Update join requests local state
      setJoinRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'approved' as const } 
          : req
      ));
      
      toast({
        title: "Request Approved",
        description: `${requestData.user_name} has been added to the group`
      });
    } catch (error: any) {
      console.error('Error approving group request:', error);
      toast({
        variant: "destructive",
        title: "Failed to approve request",
        description: error.message
      });
      throw error;
    }
  };
  
  const rejectGroupRequest = async (requestId: string, groupId: string) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to reject a request');
      }
      
      // Update request status to rejected
      const { error: updateError } = await supabase
        .from('join_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);
        
      if (updateError) throw updateError;
      
      // Get the group
      const group = groups.find(g => g.id === groupId);
      if (!group) {
        throw new Error('Group not found');
      }
      
      // Decrement pending requests
      const updatedPendingRequests = Math.max(0, group.pendingRequests - 1);
      
      // Update the group
      const { error: groupError } = await supabase
        .from('groups')
        .update({ pending_requests: updatedPendingRequests })
        .eq('id', groupId);
        
      if (groupError) throw groupError;
      
      // Update local state
      setGroups(prev => prev.map(g => 
        g.id === groupId 
          ? { ...g, pendingRequests: updatedPendingRequests } 
          : g
      ));
      
      // Update join requests local state
      setJoinRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'rejected' as const } 
          : req
      ));
      
      toast({
        title: "Request Rejected",
        description: "The join request has been rejected"
      });
    } catch (error: any) {
      console.error('Error rejecting group request:', error);
      toast({
        variant: "destructive",
        title: "Failed to reject request",
        description: error.message
      });
      throw error;
    }
  };
  
  // Messages
  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      const transformedMessages: Message[] = data.map(message => ({
        id: message.id,
        groupId: message.group_id || undefined,
        serviceId: message.service_id || undefined,
        content: message.content,
        userId: message.user_id,
        userName: message.user_name,
        userRole: message.user_role as UserRole,
        userProfileImage: message.user_profile_image || '',
        createdAt: new Date(message.created_at)
      }));
      
      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Fall back to mock data if we can't fetch from database
      setMessages(generateMockMessages());
    }
  };
  
  const sendMessageToGroup = async (data: { groupId: string; content: string }) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to send a message');
      }
      
      const messageData = {
        group_id: data.groupId,
        content: data.content,
        user_id: currentUser.id,
        user_name: currentUser.name,
        user_role: currentUser.role,
        user_profile_image: currentUser.profileImage || null
      };
      
      const { data: result, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();
        
      if (error) throw error;
      
      const newMessage: Message = {
        id: result.id,
        groupId: result.group_id,
        content: result.content,
        userId: result.user_id,
        userName: result.user_name,
        userRole: result.user_role as UserRole,
        userProfileImage: result.user_profile_image || '',
        createdAt: new Date(result.created_at)
      };
      
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: error.message
      });
      throw error;
    }
  };
  
  const sendMessageToService = async (data: { serviceId: string; content: string }) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to send a message');
      }
      
      const messageData = {
        service_id: data.serviceId,
        content: data.content,
        user_id: currentUser.id,
        user_name: currentUser.name,
        user_role: currentUser.role,
        user_profile_image: currentUser.profileImage || null
      };
      
      const { data: result, error } = await supabase
        .from('service_messages')
        .insert(messageData)
        .select()
        .single();
        
      if (error) throw error;
      
      const newMessage: Message = {
        id: result.id,
        serviceId: result.service_id,
        content: result.content,
        userId: result.user_id,
        userName: result.user_name,
        userRole: result.user_role as UserRole,
        userProfileImage: result.user_profile_image || '',
        createdAt: new Date(result.created_at)
      };
      
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (error: any) {
      console.error('Error sending service message:', error);
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: error.message
      });
      throw error;
    }
  };
  
  // Sessions
  const fetchSessions = async () => {
    try {
      // Not implemented yet in database, using mock data
      setSessions(generateMockSessions());
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions(generateMockSessions());
    }
  };
  
  const createSession = async (data: Omit<Session, 'id' | 'createdAt'>) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to create a session');
      }
      
      // Not implemented yet in database, using mock data
      const newSession: Session = {
        id: Math.random().toString(),
        ...data,
        createdAt: new Date()
      };
      
      setSessions(prev => [newSession, ...prev]);
      return newSession;
    } catch (error: any) {
      console.error('Error creating session:', error);
      toast({
        variant: "destructive",
        title: "Failed to create session",
        description: error.message
      });
      throw error;
    }
  };
  
  const updateSession = async (id: string, data: Partial<Session>) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to update a session');
      }
      
      // Not implemented yet in database, using mock data
      const session = sessions.find(s => s.id === id);
      if (!session) {
        throw new Error('Session not found');
      }
      
      const updatedSession: Session = {
        ...session,
        ...data
      };
      
      setSessions(prev => prev.map(s => 
        s.id === id ? updatedSession : s
      ));
      
      return updatedSession;
    } catch (error: any) {
      console.error('Error updating session:', error);
      toast({
        variant: "destructive",
        title: "Failed to update session",
        description: error.message
      });
      throw error;
    }
  };
  
  const deleteSession = async (id: string) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to delete a session');
      }
      
      // Not implemented yet in database, using mock data
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (error: any) {
      console.error('Error deleting session:', error);
      toast({
        variant: "destructive",
        title: "Failed to delete session",
        description: error.message
      });
      throw error;
    }
  };
  
  const fetchSessionById = async (id: string) => {
    try {
      // Not implemented yet in database, using mock data
      const session = sessions.find(s => s.id === id);
      return session || null;
    } catch (error) {
      console.error('Error fetching session by ID:', error);
      return null;
    }
  };
  
  const enrollInSession = async (sessionId: string) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to enroll in a session');
      }
      
      // Not implemented yet in database, using mock data
      const newEnrollment: SessionEnrollment = {
        id: Math.random().toString(),
        sessionId,
        userId: currentUser.id,
        status: 'enrolled',
        enrolledAt: new Date()
      };
      
      setSessionEnrollments(prev => [...prev, newEnrollment]);
    } catch (error: any) {
      console.error('Error enrolling in session:', error);
      toast({
        variant: "destructive",
        title: "Failed to enroll in session",
        description: error.message
      });
      throw error;
    }
  };
  
  const unenrollFromSession = async (sessionId: string) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to unenroll from a session');
      }
      
      // Not implemented yet in database, using mock data
      setSessionEnrollments(prev => 
        prev.filter(e => !(e.sessionId === sessionId && e.userId === currentUser.id))
      );
    } catch (error: any) {
      console.error('Error unenrolling from session:', error);
      toast({
        variant: "destructive",
        title: "Failed to unenroll from session",
        description: error.message
      });
      throw error;
    }
  };
  
  const fetchSessionEnrollments = async () => {
    try {
      // Not implemented yet in database, using mock data
      setSessionEnrollments(generateMockSessionEnrollments());
    } catch (error) {
      console.error('Error fetching session enrollments:', error);
      setSessionEnrollments(generateMockSessionEnrollments());
    }
  };
  
  // Sponsorships
  const fetchSponsorships = async () => {
    try {
      const { data, error } = await supabase
        .from('sponsorships')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        console.log("Fetched sponsorships from DB:", data);
        
        // Transform database schema to our frontend types
        const transformedSponsorships: Sponsorship[] = data.map(sp => ({
          id: sp.id,
          title: sp.title,
          description: sp.description,
          companyId: sp.company_id,
          companyName: sp.company_name,
          companyLogo: sp.company_logo || '',
          requirements: sp.requirements || [],
          benefits: sp.benefits || [],
          compensation: sp.compensation || '',
          deadline: sp.deadline ? new Date(sp.deadline) : undefined,
          status: sp.status as SponsorshipStatus,
          tags: sp.tags || [],
          createdAt: new Date(sp.created_at)
        }));
        
        setSponsorships(transformedSponsorships);
      } else {
        console.log("No sponsorships found in DB, using mock data");
        setSponsorships(generateMockSponsorships());
      }
    } catch (error) {
      console.error('Error fetching sponsorships:', error);
      // Fall back to mock data if we can't fetch from database
      setSponsorships(generateMockSponsorships());
    }
  };
  
  const createSponsorship = async (data: Omit<Sponsorship, 'id' | 'createdAt'>) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to create a sponsorship');
      }
      
      if (currentUser.role !== 'company') {
        throw new Error('Only companies can create sponsorships');
      }
      
      // Transform our frontend types to database schema
      const sponsorshipData = {
        title: data.title,
        description: data.description,
        company_id: data.companyId,
        company_name: data.companyName,
        company_logo: data.companyLogo || null,
        requirements: data.requirements,
        benefits: data.benefits,
        compensation: data.compensation || null,
        deadline: data.deadline ? data.deadline.toISOString() : null,
        status: data.status,
        tags: data.tags || null
      };
      
      console.log("Creating sponsorship with data:", sponsorshipData);
      
      const { data: result, error } = await supabase
        .from('sponsorships')
        .insert(sponsorshipData)
        .select()
        .single();
        
      if (error) throw error;
      
      console.log("Created sponsorship:", result);
      
      // Transform back to our frontend type
      const newSponsorship: Sponsorship = {
        id: result.id,
        title: result.title,
        description: result.description,
        companyId: result.company_id,
        companyName: result.company_name,
        companyLogo: result.company_logo || '',
        requirements: result.requirements || [],
        benefits: result.benefits || [],
        compensation: result.compensation || '',
        deadline: result.deadline ? new Date(result.deadline) : undefined,
        status: result.status as SponsorshipStatus,
        tags: result.tags || [],
        createdAt: new Date(result.created_at)
      };
      
      setSponsorships(prev => [newSponsorship, ...prev]);
      return newSponsorship;
    } catch (error: any) {
      console.error('Error creating sponsorship:', error);
      toast({
        variant: "destructive",
        title: "Failed to create sponsorship",
        description: error.message
      });
      throw error;
    }
  };
  
  const updateSponsorship = async (id: string, data: Partial<Sponsorship>) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to update a sponsorship');
      }
      
      // Transform our frontend types to database schema
      const sponsorshipData: any = {};
      
      if (data.title !== undefined) sponsorshipData.title = data.title;
      if (data.description !== undefined) sponsorshipData.description = data.description;
      if (data.requirements !== undefined) sponsorshipData.requirements = data.requirements;
      if (data.benefits !== undefined) sponsorshipData.benefits = data.benefits;
      if (data.compensation !== undefined) sponsorshipData.compensation = data.compensation;
      if (data.deadline !== undefined) sponsorshipData.deadline = data.deadline ? data.deadline.toISOString() : null;
      if (data.status !== undefined) sponsorshipData.status = data.status;
      if (data.tags !== undefined) sponsorshipData.tags = data.tags;
      if (data.companyLogo !== undefined) sponsorshipData.company_logo = data.companyLogo;
      
      const { data: result, error } = await supabase
        .from('sponsorships')
        .update(sponsorshipData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      // Transform back to our frontend type
      const updatedSponsorship: Sponsorship = {
        id: result.id,
        title: result.title,
        description: result.description,
        companyId: result.company_id,
        companyName: result.company_name,
        companyLogo: result.company_logo || '',
        requirements: result.requirements || [],
        benefits: result.benefits || [],
        compensation: result.compensation || '',
        deadline: result.deadline ? new Date(result.deadline) : undefined,
        status: result.status as SponsorshipStatus,
        tags: result.tags || [],
        createdAt: new Date(result.created_at)
      };
      
      setSponsorships(prev => prev.map(sp => 
        sp.id === id ? updatedSponsorship : sp
      ));
      
      return updatedSponsorship;
    } catch (error: any) {
      console.error('Error updating sponsorship:', error);
      toast({
        variant: "destructive",
        title: "Failed to update sponsorship",
        description: error.message
      });
      throw error;
    }
  };
  
  const deleteSponsorship = async (id: string) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to delete a sponsorship');
      }
      
      const { error } = await supabase
        .from('sponsorships')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setSponsorships(prev => prev.filter(sp => sp.id !== id));
    } catch (error: any) {
      console.error('Error deleting sponsorship:', error);
      toast({
        variant: "destructive",
        title: "Failed to delete sponsorship",
        description: error.message
      });
      throw error;
    }
  };
  
  const fetchSponsorshipById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('sponsorships')
        .select('*')
        .eq('id', id)
        .maybeSingle();
        
      if (error) throw error;
      if (!data) return null;
      
      // Transform database schema to our frontend types
      const sponsorship: Sponsorship = {
        id: data.id,
        title: data.title,
        description: data.description,
        companyId: data.company_id,
        companyName: data.company_name,
        companyLogo: data.company_logo || '',
        requirements: data.requirements || [],
        benefits: data.benefits || [],
        compensation: data.compensation || '',
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        status: data.status as SponsorshipStatus,
        tags: data.tags || [],
        createdAt: new Date(data.created_at)
      };
      
      return sponsorship;
    } catch (error) {
      console.error('Error fetching sponsorship by ID:', error);
      return null;
    }
  };
  
  const applyToSponsorship = async (sponsorshipId: string, data: {
    motivation: string;
    experience: string;
    socialLinks?: { instagram?: string; twitter?: string; website?: string };
  }) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to apply to a sponsorship');
      }
      
      // Check if user already applied
      const { data: existingApplication, error: checkError } = await supabase
        .from('sponsorship_applications')
        .select('*')
        .eq('sponsorship_id', sponsorshipId)
        .eq('user_id', currentUser.id)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingApplication) {
        throw new Error('You have already applied to this sponsorship');
      }
      
      // Transform our frontend types to database schema
      const applicationData = {
        sponsorship_id: sponsorshipId,
        user_id: currentUser.id,
        user_name: currentUser.name,
        user_email: currentUser.email,
        user_profile_image: currentUser.profileImage || null,
        motivation: data.motivation,
        experience: data.experience,
        social_links: data.socialLinks || null,
        status: 'pending'
      };
      
      const { error } = await supabase
        .from('sponsorship_applications')
        .insert(applicationData);
        
      if (error) throw error;
      
      toast({
        title: "Application Submitted",
        description: "Your application has been successfully submitted"
      });
    } catch (error: any) {
      console.error('Error applying to sponsorship:', error);
      toast({
        variant: "destructive",
        title: "Failed to submit application",
        description: error.message
      });
      throw error;
    }
  };
  
  const fetchSponsorshipApplications = async () => {
    try {
      if (!currentUser) {
        // No need to fetch if not logged in
        setSponsorshipApplications([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('sponsorship_applications')
        .select('*')
        .or(`user_id.eq.${currentUser.id},sponsorship_id.in.(select id from sponsorships where company_id = '${currentUser.id}')`)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Transform database schema to our frontend types
      const applications: SponsorshipApplication[] = data.map(app => ({
        id: app.id,
        sponsorshipId: app.sponsorship_id,
        userId: app.user_id,
        userName: app.user_name,
        userEmail: app.user_email,
        userProfileImage: app.user_profile_image || '',
        motivation: app.motivation,
        experience: app.experience,
        socialLinks: app.social_links ? app.social_links as { instagram?: string; twitter?: string; website?: string } : {},
        status: app.status as ApplicationStatus,
        createdAt: new Date(app.created_at)
      }));
      
      setSponsorshipApplications(applications);
    } catch (error) {
      console.error('Error fetching sponsorship applications:', error);
      setSponsorshipApplications([]);
    }
  };
  
  const getSponsorshipApplications = async (sponsorshipId: string) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to view applications');
      }
      
      const { data, error } = await supabase
        .from('sponsorship_applications')
        .select('*')
        .eq('sponsorship_id', sponsorshipId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Transform database schema to our frontend types
      const applications: SponsorshipApplication[] = data.map(app => ({
        id: app.id,
        sponsorshipId: app.sponsorship_id,
        userId: app.user_id,
        userName: app.user_name,
        userEmail: app.user_email,
        userProfileImage: app.user_profile_image || '',
        motivation: app.motivation,
        experience: app.experience,
        socialLinks: app.social_links ? app.social_links as { instagram?: string; twitter?: string; website?: string } : {},
        status: app.status as ApplicationStatus,
        createdAt: new Date(app.created_at)
      }));
      
      return applications;
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      toast({
        variant: "destructive",
        title: "Failed to fetch applications",
        description: error.message
      });
      return [];
    }
  };
  
  const updateApplicationStatus = async (applicationId: string, status: ApplicationStatus) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to update an application');
      }
      
      const { error } = await supabase
        .from('sponsorship_applications')
        .update({ status })
        .eq('id', applicationId);
        
      if (error) throw error;
      
      // Update local state
      setSponsorshipApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status } : app
      ));
      
      toast({
        title: "Status Updated",
        description: `Application status updated to ${status}`
      });
    } catch (error: any) {
      console.error('Error updating application status:', error);
      toast({
        variant: "destructive",
        title: "Failed to update status",
        description: error.message
      });
      throw error;
    }
  };
  
  // Join Requests
  const fetchJoinRequests = async () => {
    try {
      if (!currentUser) {
        setJoinRequests(generateMockJoinRequests());
        return;
      }
      
      const { data, error } = await supabase
        .from('join_requests')
        .select('*')
        .or(`user_id.eq.${currentUser.id},event_id.in.(select id from events where creator_id = '${currentUser.id}'),group_id.in.(select id from groups where creator_id = '${currentUser.id}')`)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const requests: JoinRequest[] = data.map(req => ({
        id: req.id,
        userId: req.user_id,
        userName: req.user_name,
        userProfileImage: req.user_profile_image || '',
        eventId: req.event_id || undefined,
        groupId: req.group_id || undefined,
        status: req.status as 'pending' | 'approved' | 'rejected',
        createdAt: new Date(req.created_at)
      }));
      
      setJoinRequests(requests);
    } catch (error) {
      console.error('Error fetching join requests:', error);
      setJoinRequests(generateMockJoinRequests());
    }
  };
  
  // Service Booking
  const bookService = async (serviceId: string, paymentStatus?: string, notes?: string) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to book a service');
      }
      
      const service = services.find(s => s.id === serviceId);
      if (!service) {
        throw new Error('Service not found');
      }
      
      // Check if service is free
      const isPaid = service.price > 0 && paymentStatus === 'paid';
      
      const bookingData = {
        service_id: serviceId,
        user_id: currentUser.id,
        status: 'pending',
        payment_status: isPaid ? 'paid' : 'unpaid',
        notes: notes || null
      };
      
      const { data, error } = await supabase
        .from('service_bookings')
        .insert(bookingData)
        .select()
        .single();
        
      if (error) throw error;
      
      const booking: Booking = {
        id: data.id,
        serviceId: data.service_id,
        userId: data.user_id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        status: data.status as BookingStatus,
        paymentStatus: data.payment_status,
        notes: data.notes,
        createdAt: new Date(data.created_at),
        isPaid: data.payment_status === 'paid'
      };
      
      return booking;
    } catch (error: any) {
      console.error('Error booking service:', error);
      toast({
        variant: "destructive",
        title: "Failed to book service",
        description: error.message
      });
      throw error;
    }
  };
  
  // Utility functions
  const getEventById = (id: string) => {
    return events.find(event => event.id === id);
  };
  
  const getGroupById = (id: string) => {
    return groups.find(group => group.id === id);
  };
  
  const getSessionById = (id: string) => {
    return sessions.find(session => session.id === id);
  };
  
  const getSponsorshipById = (id: string) => {
    return sponsorships.find(sponsorship => sponsorship.id === id);
  };
  
  const getServiceById = (id: string) => {
    return services.find(service => service.id === id);
  };
  
  const getEnrollmentForSession = (sessionId: string) => {
    if (!currentUser) return undefined;
    return sessionEnrollments.find(
      enrollment => enrollment.sessionId === sessionId && enrollment.userId === currentUser.id
    );
  };
  
  const getJoinRequestsForEntity = (entityId: string, entityType: 'event' | 'group') => {
    return joinRequests.filter(request => 
      (entityType === 'event' && request.eventId === entityId) ||
      (entityType === 'group' && request.groupId === entityId)
    );
  };
  
  return (
    <DataContext.Provider value={{
      services,
      posts,
      events,
      groups,
      sessions,
      sessionEnrollments,
      messages,
      joinRequests,
      postComments,
      sponsorships,
      sponsorshipApplications,
      loading,
      // Service Functions
      createService,
      updateService,
      deleteService,
      bookService,
      // Post Functions
      createPost,
      deletePost,
      likePost,
      unlikePost,
      commentOnPost,
      fetchPostComments,
      // Event Functions
      createEvent,
      updateEvent,
      deleteEvent,
      joinEvent,
      leaveEvent,
      requestToJoinEvent,
      approveEventRequest,
      rejectEventRequest,
      createEventAnnouncement,
      // Group Functions
      createGroup,
      updateGroup,
      deleteGroup,
      joinGroup,
      leaveGroup,
      requestToJoinGroup,
      approveGroupRequest,
      rejectGroupRequest,
      sendMessageToGroup,
      sendMessageToService,
      // Session Functions
      createSession,
      updateSession,
      deleteSession,
      enrollInSession,
      unenrollFromSession,
      // Sponsorship Functions
      createSponsorship,
      updateSponsorship,
      deleteSponsorship,
      applyToSponsorship,
      getSponsorshipApplications,
      updateApplicationStatus,
      // Fetch Data Functions
      fetchServices,
      fetchPosts,
      fetchEvents,
      fetchGroups,
      fetchSessions,
      fetchSessionEnrollments,
      fetchMessages,
      fetchSponsorships,
      fetchSponsorshipApplications,
      fetchServiceById,
      fetchEventById,
      fetchGroupById,
      fetchSessionById,
      fetchSponsorshipById,
      // Util Functions
      getEnrollmentForSession,
      getJoinRequestsForEntity,
      getEventById,
      getGroupById,
      getSessionById,
      getSponsorshipById,
      getServiceById
    }}>
      {children}
    </DataContext.Provider>
  );
};
