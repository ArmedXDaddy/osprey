import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { Booking, Event, Group, JoinRequest, Message, Post, 
  Service, ServiceBooking, Session, SessionEnrollment, 
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
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Init mock data
  useEffect(() => {
    // Only initialize mock data if user is logged in and we don't have data yet
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
      const newPost: Post = {
        id: uuidv4(),
        content: postData.content,
        createdAt: new Date(),
        creatorId: currentUser.id,
        creatorName: currentUser.name,
        creatorRole: currentUser.role as UserRole,
        likes: 0,
        comments: 0,
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
    setLoading
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
