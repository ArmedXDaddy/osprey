import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { Booking, Event, Group, JoinRequest, Message, Post, 
  Service, Session, SessionEnrollment, 
  Sponsorship, UserRole, SponsorshipApplication, 
  EventPrivacy, Announcement } from '@/types';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  deleteGroupFromDB, deleteEventFromDB, deleteServiceFromDB, deleteProduct,
  deleteWorkshop, deleteJobPosting, deleteSponsorshipFromDB
} from '@/integrations/supabase/helpers';
import { 
  generateMockServices, generateMockPosts, generateMockEvents, 
  generateMockGroups, generateMockSessions, generateMockSessionEnrollments, 
  generateMockMessages, generateMockJoinRequests, mockUsers,
  generateMockSponsorships
} from '@/utils/mockData';
import { useToast } from "@/hooks/use-toast";

interface DataContextProps {
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  groups: Group[];
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  completedEvents: Event[];
  setCompletedEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  sessions: Session[];
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
  sessionEnrollments: SessionEnrollment[];
  setSessionEnrollments: React.Dispatch<React.SetStateAction<SessionEnrollment[]>>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  joinRequests: JoinRequest[];
  setJoinRequests: React.Dispatch<React.SetStateAction<JoinRequest[]>>;
  sponsorships: Sponsorship[];
  setSponsorships: React.Dispatch<React.SetStateAction<Sponsorship[]>>;
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
  createPost: (postData: any) => Promise<Post>;
  createGroup: (groupData: any) => Promise<Group>;
  createEvent: (eventData: any) => Promise<Event>;
  createServiceBooking: (serviceId: string, notes?: string) => Promise<string>;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  approveJoinRequest: (requestId: string) => Promise<void>;
  rejectJoinRequest: (requestId: string) => Promise<void>;
  joinEvent: (eventId: string) => Promise<void>;
  leaveEvent: (eventId: string) => Promise<void>;
  postAnnouncement: (eventId: string, content: string) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<boolean>;
  deleteEvent: (eventId: string, reason?: string) => Promise<boolean>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Add all missing functions referenced in errors
  sendServiceMessage: (messageData: any) => Promise<void>;
  getServiceMessages: (serviceId: string) => Promise<Message[]>;
  approveEventRequest: (requestId: string, eventId: string, userId: string) => Promise<void>;
  rejectEventRequest: (requestId: string) => Promise<void>;
  updateGroupDetails: (groupId: string, details: any) => Promise<void>;
  removeGroupMember: (groupId: string, userId: string) => Promise<void>;
  getGroupRequests: (groupId: string) => Promise<JoinRequest[]>;
  handleJoinRequest: (groupId: string, userId: string, status: 'approved' | 'rejected') => Promise<void>;
  sendMessage: (messageData: any) => Promise<void>;
  bookService: (serviceId: string, data: any) => Promise<void>;
  getUserBookings: (userId: string) => Promise<any[]>;
  getServiceById: (serviceId: string) => Promise<Service | null>;
  cancelBooking: (bookingId: string) => Promise<void>;
  getUserSessions: (userId: string) => Promise<Session[]>;
  getCoachSessions: (coachId: string) => Promise<Session[]>;
  getUserEnrollments: (userId: string) => Promise<SessionEnrollment[]>;
  createService: (serviceData: any) => Promise<Service>;
  updateService: (serviceId: string, serviceData: any) => Promise<Service>;
  getUserBookingForService: (serviceId: string, userId: string) => Promise<any | null>;
  addComment: (postId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  updateComment: (commentId: string, content: string) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  enrollInSession: (sessionId: string) => Promise<void>;
  cancelEnrollment: (enrollmentId: string) => Promise<void>;
  applyForSponsorship: (sponsorshipId: string, applicationData: any) => Promise<void>;
  getSponsorshipApplications: (sponsorshipId: string) => Promise<SponsorshipApplication[]>;
  updateApplicationStatus: (applicationId: string, status: string) => Promise<void>;
  createSession: (sessionData: any) => Promise<Session>;
  createSponsorship: (sponsorshipData: any) => Promise<Sponsorship>;
  requestToJoinGroup: (groupId: string) => Promise<void>;
  postComments: Record<string, any[]>;
  getServiceBookings: (serviceId: string) => Promise<any[]>;
  approveBooking: (bookingId: string) => Promise<void>;
  updateSession: (sessionId: string, data: any) => Promise<void>;
  updateEnrollmentStatus: (enrollmentId: string, status: string) => Promise<void>;
  getSponsorshipById: (sponsorshipId: string) => Promise<Sponsorship | null>;
  getUserApplicationForSponsorship: (sponsorshipId: string, userId: string) => Promise<SponsorshipApplication | null>;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [completedEvents, setCompletedEvents] = useState<Event[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionEnrollments, setSessionEnrollments] = useState<SessionEnrollment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [postComments, setPostComments] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Only initialize mock data if user is logged in and we don't have data yet
  useEffect(() => {
    if (currentUser && posts.length === 0) {
      setPosts(generateMockPosts(currentUser));
    }
  }, [currentUser, posts.length]);

  // Load initial data - typically would be API calls
  useEffect(() => {
    if (currentUser) {
      // Only load mock data once
      if (groups.length === 0) {
        setGroups(generateMockGroups(currentUser));
      }
      
      // Only load additional mock data if services is empty
      if (services.length === 0) {
        setServices(generateMockServices(currentUser));
        setEvents(generateMockEvents(currentUser));
        setSessions(generateMockSessions(currentUser));
        setSessionEnrollments(generateMockSessionEnrollments());
        setMessages(generateMockMessages());
        setJoinRequests(generateMockJoinRequests());
        setSponsorships(generateMockSponsorships(currentUser));
      }
    }
  }, [currentUser]);

  // Add a new post
  const createPost = async (postData: any) => {
    try {
      if (!currentUser) {
        throw new Error('User not logged in');
      }
      
      const newPost: Post = {
        id: uuidv4(),
        content: postData.content,
        createdAt: new Date(),
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role as UserRole,
        likesCount: 0,
        commentsCount: 0,
        shares: 0,
        userProfileImage: currentUser.profileImage,
        image: postData.image
      };
      
      setPosts(prev => [newPost, ...prev]);
      return newPost;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };

  // Add or update a user's group
  const createGroup = async (groupData: any) => {
    try {
      const userRole = currentUser.role as UserRole;
      
      const newGroup: Group = {
        id: uuidv4(),
        name: groupData.name,
        description: groupData.description,
        privacy: groupData.privacy || 'public',
        price: groupData.price || 0,
        members: 1,
        memberLimit: groupData.memberLimit || 100,
        pendingRequests: 0,
        createdAt: new Date(),
        creatorId: currentUser.id,
        creatorName: currentUser.name,
        creatorRole: userRole,
        image: groupData.image,
        rules: groupData.rules || []
      };
      
      setGroups(prev => [newGroup, ...prev]);
      return newGroup;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  };

  // Join a group
  const joinGroup = async (groupId: string) => {
    try {
      setGroups(prev =>
        prev.map(group =>
          group.id === groupId ? { ...group, members: group.members + 1 } : group
        )
      );
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    }
  };

  // Leave a group
  const leaveGroup = async (groupId: string) => {
    try {
      setGroups(prev =>
        prev.map(group =>
          group.id === groupId ? { ...group, members: group.members - 1 } : group
        )
      );
    } catch (error) {
      console.error('Error leaving group:', error);
      throw error;
    }
  };

  // Approve a join request
  const approveJoinRequest = async (requestId: string) => {
    try {
      setJoinRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error approving join request:', error);
      throw error;
    }
  };

  // Reject a join request
  const rejectJoinRequest = async (requestId: string) => {
    try {
      setJoinRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error rejecting join request:', error);
      throw error;
    }
  };

  // Delete a group
  const deleteGroup = async (groupId: string) => {
    try {
      // Make API call to delete group from the database
      await deleteGroupFromDB(groupId);
      
      // Remove from local state
      setGroups(prev => prev.filter(group => group.id !== groupId));
      
      // Clean up related data
      setJoinRequests(prev => prev.filter(req => req.groupId !== groupId));
      setMessages(prev => prev.filter(msg => msg.groupId !== groupId));
      
      return true;
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  };

  // Create an event
  const createEvent = async (eventData: any) => {
    try {
      const eventPrivacy = eventData.privacy as EventPrivacy;
      
      const userRole = currentUser.role as UserRole;
      
      const newEvent: Event = {
        id: Date.now().toString(),
        title: eventData.title,
        description: eventData.description,
        date: new Date(eventData.date),
        location: eventData.location,
        image: eventData.image,
        privacy: eventPrivacy,
        price: eventData.price || 0,
        attendees: [currentUser.id],
        pendingRequests: 0,
        createdAt: new Date(),
        creatorId: currentUser.id,
        creatorName: currentUser.name,
        creatorRole: userRole
      };
      
      setEvents(prev => [newEvent, ...prev]);
      return newEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  // Join an event
  const joinEvent = async (eventId: string) => {
    try {
      setEvents(prev =>
        prev.map(event =>
          event.id === eventId && event.attendees ? { ...event, attendees: [...event.attendees, currentUser.id] } : event
        )
      );
    } catch (error) {
      console.error('Error joining event:', error);
      throw error;
    }
  };

  // Leave an event
  const leaveEvent = async (eventId: string) => {
    try {
      setEvents(prev =>
        prev.map(event =>
          event.id === eventId && event.attendees ? {
            ...event,
            attendees: event.attendees.filter(attendeeId => attendeeId !== currentUser.id)
          } : event
        )
      );
    } catch (error) {
      console.error('Error leaving event:', error);
      throw error;
    }
  };

  // Post an announcement
  const postAnnouncement = async (eventId: string, content: string) => {
    try {
      const newAnnouncement: Announcement = {
        id: uuidv4(),
        eventId: eventId,
        content: content,
        createdAt: new Date(),
        creatorId: currentUser.id,
        creatorName: currentUser.name
      };
      
      setAnnouncements(prev => [newAnnouncement, ...prev]);
    } catch (error) {
      console.error('Error posting announcement:', error);
      throw error;
    }
  };

  // Delete an event
  const deleteEvent = async (eventId: string, reason?: string) => {
    try {
      // Make API call to delete event from the database
      await deleteEventFromDB(eventId);
      
      // Remove from local state
      setEvents(prev => prev.filter(event => event.id !== eventId));
      
      // Archive completed events if a reason is provided
      if (reason === 'completed') {
        const eventToArchive = events.find(e => e.id === eventId);
        if (eventToArchive) {
          setCompletedEvents(prev => [eventToArchive, ...prev]);
        }
      }
      
      // Clean up related data
      setJoinRequests(prev => prev.filter(req => req.eventId !== eventId));
      setAnnouncements(prev => prev.filter(a => a.eventId !== eventId));
      
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  };

  // Create a service booking
  const createServiceBooking = async (serviceId: string, notes?: string) => {
    if (!currentUser) {
      console.error('User not logged in');
      throw new Error('User not logged in');
    }
    
    try {
      const bookingId = await supabase.rpc('create_service_booking', {
        p_service_id: serviceId,
        p_user_id: currentUser.id,
        p_notes: notes || null,
        p_payment_status: 'unpaid',
        p_status: 'pending'
      });
      
      if (!bookingId) {
        throw new Error('Failed to create service booking');
      }
      
      toast({
        title: "Booking request sent!",
        description: "Your booking request has been sent to the service provider."
      });
      
      return bookingId as any;
    } catch (error: any) {
      console.error('Error creating service booking:', error);
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Stub implementations for missing functions to fix TypeScript errors
  const sendServiceMessage = async (messageData: any) => {
    console.log('sendServiceMessage called with:', messageData);
    // Implementation would go here
  };

  const getServiceMessages = async (serviceId: string): Promise<Message[]> => {
    console.log('getServiceMessages called for serviceId:', serviceId);
    return messages.filter(m => m.serviceId === serviceId);
  };

  const approveEventRequest = async (requestId: string, eventId: string, userId: string) => {
    console.log('approveEventRequest called with:', requestId, eventId, userId);
    // Implementation would go here
  };

  const rejectEventRequest = async (requestId: string) => {
    console.log('rejectEventRequest called with:', requestId);
    // Implementation would go here
  };

  const updateGroupDetails = async (groupId: string, details: any) => {
    console.log('updateGroupDetails called with:', groupId, details);
    // Implementation would go here
  };

  const removeGroupMember = async (groupId: string, userId: string) => {
    console.log('removeGroupMember called with:', groupId, userId);
    // Implementation would go here
  };

  const getGroupRequests = async (groupId: string): Promise<JoinRequest[]> => {
    console.log('getGroupRequests called for groupId:', groupId);
    return joinRequests.filter(req => req.groupId === groupId && req.status === 'pending');
  };

  const handleJoinRequest = async (groupId: string, userId: string, status: 'approved' | 'rejected') => {
    console.log('handleJoinRequest called with:', groupId, userId, status);
    // Implementation would go here
  };

  const sendMessage = async (messageData: any) => {
    console.log('sendMessage called with:', messageData);
    // Implementation would go here
  };

  const bookService = async (serviceId: string, data: any) => {
    console.log('bookService called with:', serviceId, data);
    // Implementation would go here
  };

  const getUserBookings = async (userId: string): Promise<any[]> => {
    console.log('getUserBookings called for userId:', userId);
    return [];
  };

  const getServiceById = async (serviceId: string): Promise<Service | null> => {
    console.log('getServiceById called for serviceId:', serviceId);
    const service = services.find(s => s.id === serviceId);
    return service || null;
  };

  const cancelBooking = async (bookingId: string) => {
    console.log('cancelBooking called with:', bookingId);
    // Implementation would go here
  };

  const getUserSessions = async (userId: string): Promise<Session[]> => {
    console.log('getUserSessions called for userId:', userId);
    return sessions.filter(s => s.attendeeIds?.includes(userId));
  };

  const getCoachSessions = async (coachId: string): Promise<Session[]> => {
    console.log('getCoachSessions called for coachId:', coachId);
    return sessions.filter(s => s.coachId === coachId);
  };

  const getUserEnrollments = async (userId: string): Promise<SessionEnrollment[]> => {
    console.log('getUserEnrollments called for userId:', userId);
    return sessionEnrollments.filter(e => e.userId === userId);
  };

  const createService = async (serviceData: any): Promise<Service> => {
    console.log('createService called with:', serviceData);
    const newService = { id: uuidv4(), ...serviceData };
    setServices(prev => [...prev, newService]);
    return newService as Service;
  };

  const updateService = async (serviceId: string, serviceData: any): Promise<Service> => {
    console.log('updateService called with:', serviceId, serviceData);
    // Implementation would go here
    return {} as Service;
  };

  const getUserBookingForService = async (serviceId: string, userId: string): Promise<any | null> => {
    console.log('getUserBookingForService called with:', serviceId, userId);
    return null;
  };

  const addComment = async (postId: string, content: string) => {
    console.log('addComment called with:', postId, content);
    // Implementation would go here
  };

  const deleteComment = async (commentId: string) => {
    console.log('deleteComment called with:', commentId);
    // Implementation would go here
  };

  const updateComment = async (commentId: string, content: string) => {
    console.log('updateComment called with:', commentId, content);
    // Implementation would go here
  };

  const likePost = async (postId: string) => {
    console.log('likePost called with:', postId);
    // Implementation would go here
  };

  const unlikePost = async (postId: string) => {
    console.log('unlikePost called with:', postId);
    // Implementation would go here
  };

  const enrollInSession = async (sessionId: string) => {
    console.log('enrollInSession called with:', sessionId);
    // Implementation would go here
  };

  const cancelEnrollment = async (enrollmentId: string) => {
    console.log('cancelEnrollment called with:', enrollmentId);
    // Implementation would go here
  };

  const applyForSponsorship = async (sponsorshipId: string, applicationData: any) => {
    console.log('applyForSponsorship called with:', sponsorshipId, applicationData);
    // Implementation would go here
  };

  const getSponsorshipApplications = async (sponsorshipId: string): Promise<SponsorshipApplication[]> => {
    console.log('getSponsorshipApplications called for sponsorshipId:', sponsorshipId);
    return [];
  };

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    console.log('updateApplicationStatus called with:', applicationId, status);
    // Implementation would go here
  };

  const createSession = async (sessionData: any): Promise<Session> => {
    console.log('createSession called with:', sessionData);
    const newSession = { id: uuidv4(), ...sessionData };
    setSessions(prev => [...prev, newSession]);
    return newSession as Session;
  };

  const createSponsorship = async (sponsorshipData: any): Promise<Sponsorship> => {
    console.log('createSponsorship called with:', sponsorshipData);
    const newSponsorship = { id: uuidv4(), ...sponsorshipData };
    setSponsorships(prev => [...prev, newSponsorship]);
    return newSponsorship as Sponsorship;
  };

  const requestToJoinGroup = async (groupId: string) => {
    console.log('requestToJoinGroup called with:', groupId);
    // Implementation would go here
  };

  const getServiceBookings = async (serviceId: string): Promise<any[]> => {
    console.log('getServiceBookings called for serviceId:', serviceId);
    return [];
  };

  const approveBooking = async (bookingId: string) => {
    console.log('approveBooking called with:', bookingId);
    // Implementation would go here
  };

  const updateSession = async (sessionId: string, data: any) => {
    console.log('updateSession called with:', sessionId, data);
    // Implementation would go here
  };

  const updateEnrollmentStatus = async (enrollmentId: string, status: string) => {
    console.log('updateEnrollmentStatus called with:', enrollmentId, status);
    // Implementation would go here
  };

  const getSponsorshipById = async (sponsorshipId: string): Promise<Sponsorship | null> => {
    console.log('getSponsorshipById called for sponsorshipId:', sponsorshipId);
    const sponsorship = sponsorships.find(s => s.id === sponsorshipId);
    return sponsorship || null;
  };

  const getUserApplicationForSponsorship = async (sponsorshipId: string, userId: string): Promise<SponsorshipApplication | null> => {
    console.log('getUserApplicationForSponsorship called with:', sponsorshipId, userId);
    return null;
  };

  const value: DataContextProps = {
    posts,
    setPosts,
    groups,
    setGroups,
    services,
    setServices,
    events,
    setEvents,
    completedEvents,
    setCompletedEvents,
    sessions,
    setSessions,
    sessionEnrollments,
    setSessionEnrollments,
    messages,
    setMessages,
    joinRequests,
    setJoinRequests,
    sponsorships,
    setSponsorships,
    announcements,
    setAnnouncements,
    postComments,
    createPost,
    createGroup,
    createEvent,
    createServiceBooking,
    joinGroup,
    leaveGroup,
    approveJoinRequest,
    rejectJoinRequest,
    joinEvent,
    leaveEvent,
    postAnnouncement,
    deleteGroup,
    deleteEvent,
    loading,
    setLoading,
    // Add all the newly implemented functions to the context value
    sendServiceMessage,
    getServiceMessages,
    approveEventRequest,
    rejectEventRequest,
    updateGroupDetails,
    removeGroupMember,
    getGroupRequests,
    handleJoinRequest,
    sendMessage,
    bookService,
    getUserBookings,
    getServiceById,
    cancelBooking,
    getUserSessions,
    getCoachSessions,
    getUserEnrollments,
    createService,
    updateService,
    getUserBookingForService,
    addComment,
    deleteComment,
    updateComment,
    likePost,
    unlikePost,
    enrollInSession,
    cancelEnrollment,
    applyForSponsorship,
    getSponsorshipApplications,
    updateApplicationStatus,
    createSession,
    createSponsorship,
    requestToJoinGroup,
    getServiceBookings,
    approveBooking,
    updateSession,
    updateEnrollmentStatus, 
    getSponsorshipById,
    getUserApplicationForSponsorship
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
