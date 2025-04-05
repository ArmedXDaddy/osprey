import React, { createContext, useState, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { generateMockServices, generateMockPosts, generateMockEvents, generateMockGroups, generateMockSessions, generateMockSessionEnrollments, generateMockMessages, generateMockJoinRequests } from '@/utils/mockData';
import { Service, Post, Event, Group, Message, JoinRequest, SessionEnrollment, Booking, Session, ServiceType } from '@/types';
import { createServiceBooking, getUserBookings, getServiceBookings, getUserBookingForService, cancelBooking, approveBooking } from '@/integrations/supabase/helpers';

// Create the context with undefined as default
interface DataContextType {
  posts: Post[];
  events: Event[];
  groups: Group[];
  services: Service[];
  sessions: Session[];
  sessionEnrollments: SessionEnrollment[];
  messages: Message[];
  joinRequests: JoinRequest[];
  loading: boolean;
  error: Error | null;
  createPost: (content: string, image?: string) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  createEvent: (eventData: any) => Promise<Event>;
  joinEvent: (eventId: string) => Promise<void>;
  leaveEvent: (eventId: string) => Promise<void>;
  requestToJoinEvent: (eventId: string) => Promise<void>;
  approveEventRequest: (requestId: string, eventId: string, userId: string) => Promise<void>;
  rejectEventRequest: (requestId: string) => Promise<void>;
  getEventRequests: (eventId: string) => Promise<JoinRequest[]>;
  handleEventJoinRequest: (eventId: string, userId: string, status: 'approved' | 'rejected') => Promise<void>;
  createGroup: (groupData: any) => Promise<Group>;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  requestToJoinGroup: (groupId: string) => Promise<void>;
  approveGroupRequest: (requestId: string, groupId: string, userId: string) => Promise<void>;
  rejectGroupRequest: (requestId: string) => Promise<void>;
  getGroupRequests: (groupId: string) => Promise<JoinRequest[]>;
  handleJoinRequest: (groupId: string, userId: string, status: 'approved' | 'rejected') => Promise<void>;
  removeGroupMember: (groupId: string, userId: string) => Promise<void>;
  updateGroupDetails: (groupId: string, updates: any) => Promise<void>;
  createSession: (sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'coachId' | 'coachName'>) => Promise<Session>;
  enrollInSession: (sessionId: string) => Promise<void>;
  cancelEnrollment: (enrollmentId: string) => Promise<void>;
  approveEnrollment: (enrollmentId: string) => Promise<void>;
  rejectEnrollment: (enrollmentId: string) => Promise<void>;
  getUserSessions: (userId: string) => Promise<Session[]>;
  getCoachSessions: (coachId: string) => Promise<Session[]>;
  getUserEnrollments: (userId: string) => Promise<SessionEnrollment[]>;
  updateSession: (sessionId: string, updates: any) => Promise<void>;
  updateEnrollmentStatus: (enrollmentId: string, status: string) => Promise<void>;
  sendMessage: (messageData: {groupId: string; content: string}) => Promise<void>;
  getServiceById: (serviceId: string) => Promise<Service | null>;
  bookService: (serviceId: string, notes?: string, preferredTime?: Date) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
  getUserBookings: (userId: string) => Promise<Booking[]>;
  getServiceBookings: (serviceId: string) => Promise<Booking[]>;
  createService: (serviceData: any) => Promise<Service>;
  updateService: (serviceId: string, updates: any) => Promise<void>;
  deleteService: (serviceId: string) => Promise<void>;
  approveBooking: (bookingId: string) => Promise<void>;
  sendServiceMessage: (messageData: {serviceId: string; content: string}) => Promise<void>;
  getServiceMessages: (serviceId: string) => Promise<Message[]>;
  getUserBookingForService: (serviceId: string, userId: string) => Promise<Booking | null>;
  fetchUserServices: (userId: string) => Promise<Service[]>;
}

// Create the context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Create the hook to use the context
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

// Props interface for the DataProvider
interface DataProviderProps {
  children: ReactNode;
}

// Create the DataProvider component
export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionEnrollments, setSessionEnrollments] = useState<SessionEnrollment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [mockServices, setMockServices] = useState<Service[]>([]);
  
  const { currentUser } = useAuth();
  
  // Load mock data
  React.useEffect(() => {
    if (mockServices.length === 0) {
      const generatedMockServices = generateMockServices();
      setMockServices(generatedMockServices);
    }
  }, [mockServices.length]);
  
  React.useEffect(() => {
    const loadMockData = async () => {
      try {
        setLoading(true);
        setPosts(generateMockPosts());
        setEvents(generateMockEvents());
        setGroups(generateMockGroups());
        setSessions(generateMockSessions());
        setSessionEnrollments(generateMockSessionEnrollments());
        setMessages(generateMockMessages());
        setJoinRequests(generateMockJoinRequests());
        setLoading(false);
      } catch (err: any) {
        setError(err);
        setLoading(false);
      }
    };
    loadMockData();
  }, []);
  
  React.useEffect(() => {
    const fetchAllServices = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        if (data) {
          const servicesData = data.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            providerId: item.coach_id,
            providerName: item.coach_name,
            price: item.price,
            duration: item.duration,
            available: item.is_active,
            createdAt: new Date(item.created_at),
            isOnline: item.is_online,
            location: item.location,
            capacity: item.capacity,
            serviceType: item.service_type as ServiceType,
            coverImage: item.cover_image,
            meetingUrl: item.meeting_url
          })) as Service[];
          
          setServices(servicesData);
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching all services:", err);
        setError(err);
        setLoading(false);
      }
    };
    
    fetchAllServices();
  }, []);
  
  // ----------------------------------------
  // Session Functions
  // ----------------------------------------
  
  // Let's update just the createSession function to fix the endTime and status issues
  const createSession = async (sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'coachId' | 'coachName'>): Promise<Session> => {
    if (!currentUser) throw new Error('You must be logged in to create a session');
    console.log('Creating session:', sessionData);
    
    // Mock implementation
    const newSession: Session = {
      id: Date.now().toString(),
      title: sessionData.title,
      description: sessionData.description,
      coachId: currentUser.id,
      coachName: currentUser.name,
      sessionType: sessionData.sessionType,
      capacity: sessionData.capacity,
      price: sessionData.price,
      duration: sessionData.duration,
      startTime: sessionData.startTime,
      location: sessionData.location,
      meetingUrl: sessionData.meetingUrl,
      isOnline: sessionData.isOnline,
      isActive: sessionData.isActive !== undefined ? sessionData.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setSessions(prev => [newSession, ...prev]);
    return newSession;
  };
  
  const enrollInSession = async (sessionId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to enroll in a session');
    // Implementation
  };
  
  const cancelEnrollment = async (enrollmentId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to cancel an enrollment');
    // Implementation
  };
  
  const approveEnrollment = async (enrollmentId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be a coach to approve an enrollment');
    // Implementation
  };
  
  const rejectEnrollment = async (enrollmentId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be a coach to reject an enrollment');
    // Implementation
  };
  
  const getUserSessions = async (userId: string): Promise<Session[]> => {
    return [];
  };
  
  const getCoachSessions = async (coachId: string): Promise<Session[]> => {
    return [];
  };
  
  const getUserEnrollments = async (userId: string): Promise<SessionEnrollment[]> => {
    return [];
  };
  
  const updateSession = async (sessionId: string, updates: any): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to update a session');
    // Implementation
  };
  
  const updateEnrollmentStatus = async (enrollmentId: string, status: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to update enrollment status');
    // Implementation
  };
  
  // ----------------------------------------
  // Chat Functions
  // ----------------------------------------
  
  const sendMessage = async (messageData: {groupId: string; content: string}): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to send a message');
    // Implementation
  };
  
  // ----------------------------------------
  // Service Functions
  // ----------------------------------------
  
  const getServiceById = async (serviceId: string): Promise<Service | null> => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();
      
      if (error) throw error;
      if (!data) return null;
      
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        providerId: data.coach_id,
        providerName: data.coach_name,
        price: data.price,
        duration: data.duration,
        available: data.is_active,
        createdAt: new Date(data.created_at),
        isOnline: data.is_online,
        location: data.location,
        capacity: data.capacity,
        serviceType: data.service_type as ServiceType,
        coverImage: data.cover_image,
        meetingUrl: data.meeting_url
      };
    } catch (err) {
      console.error("Error fetching service:", err);
      return null;
    }
  };
  
  const bookService = async (serviceId: string, notes?: string, preferredTime?: Date): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to book a service');
    
    try {
      // Use the helper function instead of direct table access
      const isPaid = notes === 'paid';
      const status = isPaid ? 'approved' : 'pending';
      
      await createServiceBooking(
        serviceId,
        currentUser.id,
        notes,
        isPaid ? 'paid' : 'unpaid',
        status
      );
    } catch (err: any) {
      console.error("Error booking service:", err);
      throw new Error(err.message || 'Failed to book service');
    }
  };
  
  // Override the existing function to use the helper
  const getUserBookingsImpl = async (userId: string): Promise<Booking[]> => {
    try {
      return await getUserBookings(userId);
    } catch (err: any) {
      console.error("Error fetching user bookings:", err);
      return [];
    }
  };
  
  // Override the existing function to use the helper
  const getServiceBookingsImpl = async (serviceId: string): Promise<Booking[]> => {
    try {
      return await getServiceBookings(serviceId);
    } catch (err: any) {
      console.error("Error fetching service bookings:", err);
      return [];
    }
  };
  
  // Override the existing function to use the helper
  const getUserBookingForServiceImpl = async (serviceId: string, userId: string): Promise<Booking | null> => {
    try {
      return await getUserBookingForService(serviceId, userId);
    } catch (err: any) {
      console.error("Error fetching user booking for service:", err);
      return null;
    }
  };
  
  // Override the existing function to use the helper
  const cancelBookingImpl = async (bookingId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to cancel a booking');
    
    try {
      await cancelBooking(bookingId);
    } catch (err: any) {
      console.error("Error cancelling booking:", err);
      throw new Error(err.message || 'Failed to cancel booking');
    }
  };
  
  // Override the existing function to use the helper
  const approveBookingImpl = async (bookingId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to approve a booking');
    
    try {
      await approveBooking(bookingId);
    } catch (err: any) {
      console.error("Error approving booking:", err);
      throw new Error(err.message || 'Failed to approve booking');
    }
  };
  
  const createService = async (serviceData: any): Promise<Service> => {
    if (!currentUser) throw new Error('You must be logged in to create a service');
    try {
      const { data, error } = await supabase
        .from('services')
        .insert({
          title: serviceData.title,
          description: serviceData.description,
          coach_id: currentUser.id,
          coach_name: currentUser.name,
          price: serviceData.price || 0,
          duration: serviceData.duration,
          is_active: serviceData.available !== undefined ? serviceData.available : true,
          is_online: serviceData.isOnline || false,
          location: serviceData.location,
          capacity: serviceData.capacity,
          service_type: serviceData.serviceType,
          cover_image: serviceData.coverImage,
          meeting_url: serviceData.meetingUrl
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        providerId: data.coach_id,
        providerName: data.coach_name,
        price: data.price,
        duration: data.duration,
        available: data.is_active,
        createdAt: new Date(data.created_at),
        isOnline: data.is_online,
        location: data.location,
        capacity: data.capacity,
        serviceType: data.service_type as ServiceType,
        coverImage: data.cover_image,
        meetingUrl: data.meeting_url
      };
    } catch (err: any) {
      console.error("Error creating service:", err);
      setError(err);
      throw err;
    }
  };
  
  const updateService = async (serviceId: string, updates: any): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to update a service');
    // Implementation
  };
  
  const deleteService = async (serviceId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to delete a service');
    // Implementation
  };
  
  const sendServiceMessage = async (messageData: {serviceId: string; content: string}): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to send a service message');
    // Implementation
  };
  
  const getServiceMessages = async (serviceId: string): Promise<Message[]> => {
    return [];
  };
  
  const fetchUserServices = async (userId: string): Promise<Service[]> => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('coach_id', userId);
      
      if (error) throw error;
      if (!data) return [];
      
      return data.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        providerId: item.coach_id,
        providerName: item.coach_name,
        price: item.price,
        duration: item.duration,
        available: item.is_active,
        createdAt: new Date(item.created_at),
        isOnline: item.is_online,
        location: item.location,
        capacity: item.capacity,
        serviceType: item.service_type as ServiceType,
        coverImage: item.cover_image,
        meetingUrl: item.meeting_url
      })) as Service[];
    } catch (err) {
      console.error("Error fetching user services:", err);
      return [];
    }
  };

  // ----------------------------------------
  // Post Functions
  // ----------------------------------------
  
  const createPost = async (content: string, image?: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to create a post');
    // Implementation
  };
  
  const likePost = async (postId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to like a post');
    // Implementation
  };
  
  const unlikePost = async (postId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to unlike a post');
    // Implementation
  };
  
  // ----------------------------------------
  // Event Functions
  // ----------------------------------------
  
  const createEvent = async (eventData: any): Promise<Event> => {
    if (!currentUser) throw new Error('You must be logged in to create an event');
    // Implementation
    return {} as Event;
  };
  
  const joinEvent = async (eventId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to join an event');
    // Implementation
  };
  
  const leaveEvent = async (eventId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to leave an event');
    // Implementation
  };
  
  const requestToJoinEvent = async (eventId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to request to join an event');
    // Implementation
  };
  
  const approveEventRequest = async (requestId: string, eventId: string, userId: string): Promise<void> => {
    // Implementation
  };
  
  const rejectEventRequest = async (requestId: string): Promise<void> => {
    // Implementation
  };
  
  const getEventRequests = async (eventId: string): Promise<JoinRequest[]> => {
    return [];
  };
  
  const handleEventJoinRequest = async (eventId: string, userId: string, status: 'approved' | 'rejected'): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to handle a join request');
    // Implementation
  };
  
  // ----------------------------------------
  // Group Functions
  // ----------------------------------------
  
  const createGroup = async (groupData: any): Promise<Group> => {
    if (!currentUser) throw new Error('You must be logged in to create a group');
    // Implementation
    return {} as Group;
  };
  
  const joinGroup = async (groupId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to join a group');
    // Implementation
  };
  
  const leaveGroup = async (groupId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to leave a group');
    // Implementation
  };
  
  const requestToJoinGroup = async (groupId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to request to join a group');
    // Implementation
  };
  
  const approveGroupRequest = async (requestId: string, groupId: string, userId: string): Promise<void> => {
    // Implementation
  };
  
  const rejectGroupRequest = async (requestId: string): Promise<void> => {
    // Implementation
  };
  
  const getGroupRequests = async (groupId: string): Promise<JoinRequest[]> => {
    return [];
  };
  
  const handleJoinRequest = async (groupId: string, userId: string, status: 'approved' | 'rejected'): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to handle a join request');
    // Implementation
  };
  
  const removeGroupMember = async (groupId: string, userId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to remove a group member');
    // Implementation
  };
  
  const updateGroupDetails = async (groupId: string, updates: any): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to update a group');
    // Implementation
  };
  
  // Create context value
  const contextValue: DataContextType = {
    posts,
    events,
    groups,
    services,
    sessions,
    sessionEnrollments,
    messages,
    joinRequests,
    loading,
    error,
    createPost,
    likePost,
    unlikePost,
    createEvent,
    joinEvent,
    leaveEvent,
    requestToJoinEvent,
    approveEventRequest,
    rejectEventRequest,
    getEventRequests,
    handleEventJoinRequest,
    createGroup,
    joinGroup,
    leaveGroup,
    requestToJoinGroup,
    approveGroupRequest,
    rejectGroupRequest,
    getGroupRequests,
    handleJoinRequest,
    removeGroupMember,
    updateGroupDetails,
    createSession,
    enrollInSession,
    cancelEnrollment,
    approveEnrollment,
    rejectEnrollment,
    getUserSessions,
    getCoachSessions,
    getUserEnrollments,
    updateSession,
    updateEnrollmentStatus,
    sendMessage,
    getServiceById,
    bookService,
    cancelBooking: cancelBookingImpl,
    getUserBookings: getUserBookingsImpl,
    getServiceBookings: getServiceBookingsImpl,
    createService,
    updateService,
    deleteService,
    approveBooking: approveBookingImpl,
    sendServiceMessage,
    getServiceMessages,
    getUserBookingForService: getUserBookingForServiceImpl,
    fetchUserServices
  };
  
  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
