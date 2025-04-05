import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  User, 
  Post, 
  Event, 
  Group, 
  Service, 
  Session, 
  SessionEnrollment, 
  Message, 
  JoinRequest,
  Booking,
  ServiceType,
  BookingStatus,
  PaymentStatus,
  SessionStatus
} from '@/types';
import { useAuth } from './AuthContext';
import { supabase } from "@/integrations/supabase/client";

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
  error: string | null;
  
  // Posts
  createPost: (content: string, image?: string) => Promise<Post>;
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  
  // Events
  createEvent: (eventData: Omit<Event, 'id' | 'creatorId' | 'creatorName' | 'creatorRole' | 'attendees' | 'createdAt'>) => Promise<Event>;
  joinEvent: (eventId: string) => Promise<void>;
  leaveEvent: (eventId: string) => Promise<void>;
  requestToJoinEvent: (eventId: string) => Promise<void>;
  approveEventRequest: (requestId: string) => Promise<void>;
  rejectEventRequest: (requestId: string) => Promise<void>;
  getEventRequests: (eventId: string) => JoinRequest[];
  handleEventJoinRequest: (requestId: string, status: 'approved' | 'rejected') => Promise<void>;
  
  // Groups
  createGroup: (groupData: Omit<Group, 'id' | 'creatorId' | 'creatorName' | 'creatorRole' | 'members' | 'createdAt'>) => Promise<Group>;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  requestToJoinGroup: (groupId: string) => Promise<void>;
  approveGroupRequest: (requestId: string) => Promise<void>;
  rejectGroupRequest: (requestId: string) => Promise<void>;
  getGroupRequests: (groupId: string) => JoinRequest[];
  handleJoinRequest: (requestId: string, status: 'approved' | 'rejected') => Promise<void>;
  removeGroupMember: (groupId: string, memberId: string) => Promise<void>;
  updateGroupDetails: (groupId: string, details: Partial<Group>) => Promise<Group>;
  
  // Sessions
  createSession: (sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Session>;
  enrollInSession: (sessionId: string) => Promise<SessionEnrollment>;
  cancelEnrollment: (enrollmentId: string) => Promise<void>;
  approveEnrollment: (enrollmentId: string) => Promise<void>;
  rejectEnrollment: (enrollmentId: string) => Promise<void>;
  getUserSessions: (userId: string) => Session[];
  getCoachSessions: (coachId: string) => Session[];
  getUserEnrollments: (userId: string) => SessionEnrollment[];
  updateSession: (sessionId: string, data: Partial<Session>) => Promise<Session>;
  updateEnrollmentStatus: (enrollmentId: string, status: SessionStatus) => Promise<void>;
  
  // Messages
  sendMessage: (groupId: string, content: string, mediaUrl?: string, mediaType?: 'image' | 'video' | 'file') => Promise<Message>;
  
  // Services
  getServiceById: (serviceId: string) => Promise<Service>;
  bookService: (serviceId: string, isPaid: boolean) => Promise<Booking>;
  cancelBooking: (bookingId: string) => Promise<void>;
  getUserBookings: (userId: string) => Booking[];
  getServiceBookings: (serviceId: string) => Booking[];
  createService: (serviceData: Omit<Service, 'id' | 'createdAt'>) => Promise<Service>;
  updateService: (serviceId: string, data: Partial<Service>) => Promise<Service>;
  deleteService: (serviceId: string) => Promise<void>;
  
  // Method to approve a booking
  approveBooking: (bookingId: string) => Promise<Booking>;
  
  // New functions
  sendServiceMessage: (serviceId: string, content: string, mediaUrl?: string, mediaType?: 'image' | 'video' | 'file') => Promise<Message>;
  getServiceMessages: (serviceId: string) => Message[];
  getUserBookingForService: (userId: string, serviceId: string) => Booking | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [mockServices, setMockServices] = useState<Service[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionEnrollments, setSessionEnrollments] = useState<SessionEnrollment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const generateId = () => uuidv4();

  const allServices = useMemo(() => {
    return [...services, ...mockServices];
  }, [services, mockServices]);

  useEffect(() => {
    if (mockServices.length === 0) {
      const generatedMockServices = generateMockServices();
      setMockServices(generatedMockServices);
    }
  }, [mockServices.length]);

  useEffect(() => {
    const loadMockData = async () => {
      try {
        setLoading(true);
        setPosts(mockPosts);
        setEvents(mockEvents);
        setGroups(mockGroups);
        setSessions(mockSessions);
        setSessionEnrollments(mockSessionEnrollments);
        setMessages(mockMessages);
        setJoinRequests(mockJoinRequests);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadMockData();
  }, []);

  useEffect(() => {
    if (services.length > 0) {
      localStorage.setItem('userCreatedServices', JSON.stringify(services));
    }
  }, [services]);

  useEffect(() => {
    const savedServices = localStorage.getItem('userCreatedServices');
    if (savedServices) {
      try {
        const parsedServices = JSON.parse(savedServices);
        setServices(parsedServices);
      } catch (err) {
        console.error('Error parsing saved services:', err);
      }
    }
  }, []);

  const createPost = async (content: string, image?: string): Promise<Post> => {
    if (!currentUser) throw new Error('You must be logged in to create a post');

    const newPost: Post = {
      id: generateId(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      userProfileImage: currentUser.profileImage,
      content,
      image,
      likes: 0,
      comments: 0,
      createdAt: new Date(),
    };

    setPosts(prevPosts => [newPost, ...prevPosts]);
    return newPost;
  };

  const likePost = async (postId: string): Promise<void> => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  const unlikePost = async (postId: string): Promise<void> => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, likes: Math.max(0, post.likes - 1) } : post
      )
    );
  };

  const createEvent = async (eventData: Omit<Event, 'id' | 'creatorId' | 'creatorName' | 'creatorRole' | 'attendees' | 'createdAt'>): Promise<Event> => {
    if (!currentUser) throw new Error('You must be logged in to create an event');

    const newEvent: Event = {
      id: generateId(),
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      creatorRole: currentUser.role,
      attendees: [currentUser.id],
      createdAt: new Date(),
      ...eventData,
    };

    setEvents(prevEvents => [...prevEvents, newEvent]);
    return newEvent;
  };

  const joinEvent = async (eventId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to join an event');

    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === eventId && !event.attendees.includes(currentUser.id)
          ? { ...event, attendees: [...event.attendees, currentUser.id] }
          : event
      )
    );
  };

  const leaveEvent = async (eventId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to leave an event');

    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === eventId
          ? { ...event, attendees: event.attendees.filter(id => id !== currentUser.id) }
          : event
      )
    );
  };

  const requestToJoinEvent = async (eventId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to request to join an event');

    const event = events.find(e => e.id === eventId);
    if (!event) throw new Error('Event not found');

    if (event.privacy === 'public') {
      await joinEvent(eventId);
      return;
    }

    const existingRequest = joinRequests.find(
      req => req.eventId === eventId && req.userId === currentUser.id
    );
    if (existingRequest) throw new Error('You have already requested to join this event');

    const newRequest: JoinRequest = {
      id: generateId(),
      eventId,
      userId: currentUser.id,
      userName: currentUser.name,
      userProfileImage: currentUser.profileImage,
      status: 'pending',
      createdAt: new Date(),
    };

    setJoinRequests(prevRequests => [...prevRequests, newRequest]);

    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === eventId
          ? { ...event, pendingRequests: (event.pendingRequests || 0) + 1 }
          : event
      )
    );
  };

  const approveEventRequest = async (requestId: string): Promise<void> => {
    const request = joinRequests.find(req => req.id === requestId);
    if (!request) throw new Error('Request not found');
    if (!request.eventId) throw new Error('Invalid request: no event ID');

    setJoinRequests(prevRequests =>
      prevRequests.map(req =>
        req.id === requestId ? { ...req, status: 'approved' } : req
      )
    );

    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === request.eventId
          ? {
              ...event,
              attendees: [...event.attendees, request.userId],
              pendingRequests: Math.max(0, (event.pendingRequests || 0) - 1),
            }
          : event
      )
    );
  };

  const rejectEventRequest = async (requestId: string): Promise<void> => {
    const request = joinRequests.find(req => req.id === requestId);
    if (!request) throw new Error('Request not found');
    if (!request.eventId) throw new Error('Invalid request: no event ID');

    setJoinRequests(prevRequests =>
      prevRequests.map(req =>
        req.id === requestId ? { ...req, status: 'rejected' } : req
      )
    );

    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === request.eventId
          ? { ...event, pendingRequests: Math.max(0, (event.pendingRequests || 0) - 1) }
          : event
      )
    );
  };

  const getEventRequests = (eventId: string): JoinRequest[] => {
    return joinRequests.filter(
      request => request.eventId === eventId && request.status === 'pending'
    );
  };

  const handleEventJoinRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    if (status === 'approved') {
      await approveEventRequest(requestId);
    } else {
      await rejectEventRequest(requestId);
    }
  };

  const createGroup = async (groupData: Omit<Group, 'id' | 'creatorId' | 'creatorName' | 'creatorRole' | 'members' | 'createdAt'>): Promise<Group> => {
    if (!currentUser) throw new Error('You must be logged in to create a group');

    const newGroup: Group = {
      id: generateId(),
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      creatorRole: currentUser.role,
      members: 1,
      memberIds: [currentUser.id],
      createdAt: new Date(),
      ...groupData,
    };

    setGroups(prevGroups => [...prevGroups, newGroup]);
    return newGroup;
  };

  const joinGroup = async (groupId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to join a group');

    setGroups(prevGroups =>
      prevGroups.map(group => {
        if (group.id === groupId) {
          const memberIds = group.memberIds || [];
          if (!memberIds.includes(currentUser.id)) {
            return {
              ...group,
              members: group.members + 1,
              memberIds: [...memberIds, currentUser.id],
            };
          }
        }
        return group;
      })
    );
  };

  const leaveGroup = async (groupId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to leave a group');

    setGroups(prevGroups =>
      prevGroups.map(group => {
        if (group.id === groupId) {
          const memberIds = group.memberIds || [];
          if (memberIds.includes(currentUser.id)) {
            return {
              ...group,
              members: Math.max(0, group.members - 1),
              memberIds: memberIds.filter(id => id !== currentUser.id),
            };
          }
        }
        return group;
      })
    );
  };

  const requestToJoinGroup = async (groupId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to request to join a group');

    const group = groups.find(g => g.id === groupId);
    if (!group) throw new Error('Group not found');

    if (group.privacy === 'public') {
      await joinGroup(groupId);
      return;
    }

    const existingRequest = joinRequests.find(
      req => req.groupId === groupId && req.userId === currentUser.id
    );
    if (existingRequest) throw new Error('You have already requested to join this group');

    const newRequest: JoinRequest = {
      id: generateId(),
      groupId,
      userId: currentUser.id,
      userName: currentUser.name,
      userProfileImage: currentUser.profileImage,
      status: 'pending',
      createdAt: new Date(),
    };

    setJoinRequests(prevRequests => [...prevRequests, newRequest]);

    setGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === groupId
          ? { ...group, pendingRequests: (group.pendingRequests || 0) + 1 }
          : group
      )
    );
  };

  const approveGroupRequest = async (requestId: string): Promise<void> => {
    const request = joinRequests.find(req => req.id === requestId);
    if (!request) throw new Error('Request not found');
    if (!request.groupId) throw new Error('Invalid request: no group ID');

    setJoinRequests(prevRequests =>
      prevRequests.map(req =>
        req.id === requestId ? { ...req, status: 'approved' } : req
      )
    );

    setGroups(prevGroups =>
      prevGroups.map(group => {
        if (group.id === request.groupId) {
          const memberIds = group.memberIds || [];
          return {
            ...group,
            members: group.members + 1,
            memberIds: [...memberIds, request.userId],
            pendingRequests: Math.max(0, (group.pendingRequests || 0) - 1),
          };
        }
        return group;
      })
    );
  };

  const rejectGroupRequest = async (requestId: string): Promise<void> => {
    const request = joinRequests.find(req => req.id === requestId);
    if (!request) throw new Error('Request not found');
    if (!request.groupId) throw new Error('Invalid request: no group ID');

    setJoinRequests(prevRequests =>
      prevRequests.map(req =>
        req.id === requestId ? { ...req, status: 'rejected' } : req
      )
    );

    setGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === request.groupId
          ? { ...group, pendingRequests: Math.max(0, (group.pendingRequests || 0) - 1) }
          : group
      )
    );
  };

  const getGroupRequests = (groupId: string): JoinRequest[] => {
    return joinRequests.filter(
      request => request.groupId === groupId && request.status === 'pending'
    );
  };

  const handleJoinRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    if (status === 'approved') {
      await approveGroupRequest(requestId);
    } else {
      await rejectGroupRequest(requestId);
    }
  };

  const removeGroupMember = async (groupId: string, memberId: string) => {
    if (!currentUser) throw new Error('You must be logged in to remove a group member');

    const group = groups.find(g => g.id === groupId);
    if (!group) throw new Error('Group not found');

    if (group.creatorId !== currentUser.id) {
      throw new Error('Only the group creator can remove members');
    }

    setGroups(prevGroups =>
      prevGroups.map(group => {
        if (group.id === groupId) {
          const memberIds = group.memberIds || [];
          if (memberIds.includes(memberId)) {
            return {
              ...group,
              members: Math.max(0, group.members - 1),
              memberIds: memberIds.filter(id => id !== memberId),
            };
          }
        }
        return group;
      })
    );
  };

  const updateGroupDetails = async (groupId: string, details: Partial<Group>): Promise<Group> => {
    if (!currentUser) throw new Error('You must be logged in to update a group');

    const groupIndex = groups.findIndex(g => g.id === groupId);
    if (groupIndex === -1) throw new Error('Group not found');

    const group = groups[groupIndex];
    
    if (group.creatorId !== currentUser.id) {
      throw new Error('Only the group creator can update the group details');
    }

    const updatedGroup = { ...group, ...details };
    setGroups(prevGroups => {
      const newGroups = [...prevGroups];
      newGroups[groupIndex] = updatedGroup;
      return newGroups;
    });

    return updatedGroup;
  };

  const createSession = async (sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Promise<Session> => {
    if (!currentUser) throw new Error('You must be logged in to create a session');
    if (currentUser.role !== 'coach') throw new Error('Only coaches can create sessions');

    const newSession: Session = {
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...sessionData,
    };

    setSessions(prevSessions => [...prevSessions, newSession]);
    return newSession;
  };

  const enrollInSession = async (sessionId: string): Promise<SessionEnrollment> => {
    if (!currentUser) throw new Error('You must be logged in to enroll in a session');

    const session = sessions.find(s => s.id === sessionId);
    if (!session) throw new Error('Session not found');
    if (!session.isActive) throw new Error('This session is not currently active');

    const existingEnrollment = sessionEnrollments.find(
      e => e.sessionId === sessionId && e.userId === currentUser.id
    );
    if (existingEnrollment) throw new Error('You are already enrolled in this session');

    if (session.sessionType === 'group' && session.capacity) {
      const currentEnrollments = sessionEnrollments.filter(
        e => e.sessionId === sessionId && e.status !== 'rejected'
      ).length;
      if (currentEnrollments >= session.capacity) {
        throw new Error('This session has reached its maximum capacity');
      }
    }

    const newEnrollment: SessionEnrollment = {
      id: generateId(),
      sessionId,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      userProfileImage: currentUser.profileImage,
      status: session.sessionType === 'one_on_one' ? 'pending' : 'approved',
      paymentStatus: 'unpaid',
      createdAt: new Date(),
    };

    setSessionEnrollments(prevEnrollments => [...prevEnrollments, newEnrollment]);
    return newEnrollment;
  };

  const cancelEnrollment = async (enrollmentId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to cancel an enrollment');

    const enrollment = sessionEnrollments.find(e => e.id === enrollmentId);
    if (!enrollment) throw new Error('Enrollment not found');

    const session = sessions.find(s => s.id === enrollment.sessionId);
    if (!session) throw new Error('Session not found');

    if (enrollment.userId !== currentUser.id && session.coachId !== currentUser.id) {
      throw new Error('You do not have permission to cancel this enrollment');
    }

    setSessionEnrollments(prevEnrollments =>
      prevEnrollments.filter(e => e.id !== enrollmentId)
    );
  };

  const approveEnrollment = async (enrollmentId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to approve an enrollment');

    const enrollment = sessionEnrollments.find(e => e.id === enrollmentId);
    if (!enrollment) throw new Error('Enrollment not found');

    const session = sessions.find(s => s.id === enrollment.sessionId);
    if (!session) throw new Error('Session not found');

    if (session.coachId !== currentUser.id) {
      throw new Error('Only the session coach can approve enrollments');
    }

    setSessionEnrollments(prevEnrollments =>
      prevEnrollments.map(e =>
        e.id === enrollmentId ? { ...e, status: 'approved' } : e
      )
    );
  };

  const rejectEnrollment = async (enrollmentId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to reject an enrollment');

    const enrollment = sessionEnrollments.find(e => e.id === enrollmentId);
    if (!enrollment) throw new Error('Enrollment not found');

    const session = sessions.find(s => s.id === enrollment.sessionId);
    if (!session) throw new Error('Session not found');

    if (session.coachId !== currentUser.id) {
      throw new Error('Only the session coach can reject enrollments');
    }

    setSessionEnrollments(prevEnrollments =>
      prevEnrollments.map(e =>
        e.id === enrollmentId ? { ...e, status: 'rejected' } : e
      )
    );
  };

  const getUserSessions = (userId: string): Session[] => {
    const userEnrollmentSessionIds = sessionEnrollments
      .filter(e => e.userId === userId)
      .map(e => e.sessionId);

    return sessions.filter(session => userEnrollmentSessionIds.includes(session.id));
  };

  const getCoachSessions = (coachId: string): Session[] => {
    return sessions.filter(session => session.coachId === coachId);
  };

  const getUserEnrollments = (userId: string): SessionEnrollment[] => {
    return sessionEnrollments.filter(enrollment => enrollment.userId === userId);
  };

  const updateSession = async (sessionId: string, data: Partial<Session>): Promise<Session> => {
    if (!currentUser) throw new Error('You must be logged in to update a session');

    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    if (sessionIndex === -1) throw new Error('Session not found');

    const session = sessions[sessionIndex];
    
    if (session.coachId !== currentUser.id) {
      throw new Error('Only the session coach can update the session');
    }

    const updatedSession = { ...session, ...data, updatedAt: new Date() };
    setSessions(prevSessions => {
      const newSessions = [...prevSessions];
      newSessions[sessionIndex] = updatedSession;
      return newSessions;
    });

    return updatedSession;
  };

  const updateEnrollmentStatus = async (enrollmentId: string, status: SessionStatus): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to update an enrollment');

    const enrollmentIndex = sessionEnrollments.findIndex(e => e.id === enrollmentId);
    if (enrollmentIndex === -1) throw new Error('Enrollment not found');

    const enrollment = sessionEnrollments[enrollmentIndex];

    const session = sessions.find(s => s.id === enrollment.sessionId);
    if (!session) throw new Error('Session not found');

    if (session.coachId !== currentUser.id) {
      throw new Error('Only the session coach can update enrollment status');
    }

    setSessionEnrollments(prevEnrollments => {
      const newEnrollments = [...prevEnrollments];
      newEnrollments[enrollmentIndex] = { ...enrollment, status };
      return newEnrollments;
    });
  };

  const sendMessage = async (
    groupId: string,
    content: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'video' | 'file'
  ): Promise<Message> => {
    if (!currentUser) throw new Error('You must be logged in to send a message');

    const group = groups.find(g => g.id === groupId);
    if (!group) throw new Error('Group not found');

    const memberIds = group.memberIds || [];
    if (!memberIds.includes(currentUser.id)) {
      throw new Error('You must be a member of the group to send messages');
    }

    const newMessage: Message = {
      id: generateId(),
      groupId,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      userProfileImage: currentUser.profileImage,
      content,
      mediaUrl,
      mediaType,
      createdAt: new Date(),
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    return newMessage;
  };

  const getServiceById = async (serviceId: string): Promise<Service> => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
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
        meetingUrl: data.meeting_url,
      };
    } catch (err: any) {
      console.error("Error fetching service:", err);
      throw err;
    }
  };

  const bookService = async (serviceId: string, isPaid: boolean): Promise<Booking> => {
    const service = await getServiceById(serviceId);
    if (!service) {
      throw new Error("Service not found");
    }

    const newBooking: Booking = {
      id: generateId(),
      serviceId,
      userId: currentUser?.id || '',
      userName: currentUser?.name || '',
      userEmail: currentUser?.email || '',
      status: isPaid ? 'approved' : 'pending',
      paymentStatus: isPaid ? 'paid' : 'unpaid',
      isPaid,
      createdAt: new Date(),
    };

    setBookings(prev => [...prev, newBooking]);

    return newBooking;
  };

  const cancelBooking = async (bookingId: string): Promise<void> => {
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1) {
      throw new Error("Booking not found");
    }

    const updatedBookings = [...bookings];
    updatedBookings[bookingIndex] = {
      ...updatedBookings[bookingIndex],
      status: 'cancelled'
    };

    setBookings(updatedBookings);
  };

  const getUserBookings = (userId: string): Booking[] => {
    return bookings.filter(booking => booking.userId === userId);
  };

  const getServiceBookings = (serviceId: string): Booking[] => {
    return bookings.filter(booking => booking.serviceId === serviceId);
  };

  const createService = async (serviceData: Omit<Service, 'id' | 'createdAt'>): Promise<Service> => {
    if (!currentUser) throw new Error('You must be logged in to create a service');
    if (currentUser.role !== 'coach') throw new Error('Only coaches can create services');

    try {
      const { data, error } = await supabase
        .from('services')
        .insert({
          title: serviceData.title,
          description: serviceData.description,
          service_type: serviceData.serviceType,
          price: serviceData.price,
          duration: serviceData.duration,
          is_online: serviceData.isOnline,
          location: serviceData.location,
          meeting_url: serviceData.meetingUrl,
          capacity: serviceData.capacity,
          is_active: serviceData.available,
          cover_image: serviceData.coverImage,
          coach_id: currentUser.id,
          coach_name: currentUser.name,
        })
        .select()
        .single();

      if (error) throw error;

      console.log("Service created in Supabase:", data);
      
      // Update local state
      const newService: Service = {
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
        meetingUrl: data.meeting_url,
      };

      setServices(prevServices => [...prevServices, newService]);
      
      return newService;
    } catch (err: any) {
      console.error("Error creating service:", err);
      throw err;
    }
  };

  const updateService = async (serviceId: string, data: Partial<Service>): Promise<Service> => {
    if (!currentUser) throw new Error('You must be logged in to update a service');

    try {
      const { data: updatedData, error } = await supabase
        .from('services')
        .update({
          title: data.title,
          description: data.description,
          service_type: data.serviceType,
          price: data.price,
          duration: data.duration,
          is_online: data.isOnline,
          location: data.location,
          meeting_url: data.meetingUrl,
          capacity: data.capacity,
          is_active: data.available,
          cover_image: data.coverImage,
        })
        .eq('id', serviceId)
        .eq('coach_id', currentUser.id)
        .select()
        .single();

      if (error) throw error;

      const updatedService: Service = {
        id: updatedData.id,
        title: updatedData.title,
        description: updatedData.description,
        providerId: updatedData.coach_id,
        providerName: updatedData.coach_name,
        price: updatedData.price,
        duration: updatedData.duration,
        available: updatedData.is_active,
        createdAt: new Date(updatedData.created_at),
        isOnline: updatedData.is_online,
        location: updatedData.location,
        capacity: updatedData.capacity,
        serviceType: updatedData.service_type as ServiceType,
        coverImage: updatedData.cover_image,
        meetingUrl: updatedData.meeting_url,
      };

      setServices(prevServices => 
        prevServices.map(service => 
          service.id === serviceId ? updatedService : service
        )
      );

      return updatedService;
    } catch (err: any) {
      console.error("Error updating service:", err);
      throw err;
    }
  };

  const deleteService = async (serviceId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to delete a service');
    
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId)
        .eq('coach_id', currentUser.id);

      if (error) throw error;

      // Update local state by removing the deleted service
      setServices(prevServices => 
        prevServices.filter(service => service.id !== serviceId)
      );
      
      console.log("Service deleted successfully:", serviceId);
    } catch (err: any) {
      console.error("Error deleting service:", err);
      throw err;
    }
  };

  const approveBooking = async (bookingId: string): Promise<Booking> => {
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1) {
      throw new Error("Booking not found");
    }

    const booking = bookings[bookingIndex];
    const service = await getServiceById(booking.serviceId);

    if (!service) {
      throw new Error("Service not found");
    }

    if (currentUser?.id !== service.providerId) {
      throw new Error("Only the service provider can approve bookings");
    }

    const updatedBooking = {
      ...booking,
      status: 'approved' as BookingStatus
    };

    setBookings(prev => 
      prev.map(b => b.id === bookingId ? updatedBooking : b)
    );

    return updatedBooking;
  };

  const sendServiceMessage = async (
    serviceId: string,
    content: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'video' | 'file'
  ): Promise<Message> => {
    if (!currentUser) throw new Error('You must be logged in to send a message');

    // Check if user is allowed to send messages for this service
    const service = await getServiceById(serviceId);
    if (!service) throw new Error('Service not found');

    // Allow provider or users who booked the service to send messages
    const userBooking = getUserBookingForService(currentUser.id, serviceId);
    const isProvider = service.providerId === currentUser.id;
    
    if (!isProvider && !userBooking) {
      throw new Error('You must be the provider or have booked this service to send messages');
    }

    const newMessage: Message = {
      id: generateId(),
      serviceId,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      userProfileImage: currentUser.profileImage,
      content,
      mediaUrl,
      mediaType,
      createdAt: new Date(),
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    return newMessage;
  };

  const getServiceMessages = (serviceId: string): Message[] => {
    return messages.filter(message => message.serviceId === serviceId);
  };

  const getUserBookingForService = (userId: string, serviceId: string): Booking | null => {
    const userBookings = bookings.filter(
      booking => booking.userId === userId && booking.serviceId === serviceId
    );
    
    // Return the most recent booking if there are multiple
    return userBookings.length > 0 
      ? userBookings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] 
      : null;
  };

  const fetchUserServices = useCallback(async () => {
    if (currentUser) {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('coach_id', currentUser.id);
  
        if (error) {
          console.error('Error fetching user services:', error);
          return;
        }
  
        if (data) {
          const mappedServices: Service[] = data.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description || '',
            providerId: item.coach_id,
            providerName: item.coach_name,
            price: item.price,
            duration: item.duration || '',
            available: item.is_active,
            createdAt: new Date(item.created_at),
            isOnline: item.is_online,
            location: item.location,
            capacity: item.capacity,
            serviceType: item.service_type as ServiceType,
            coverImage: item.cover_image,
            meetingUrl: item.meeting_url,
          }));
  
          setServices(mappedServices);
        }
      } catch (err) {
        console.error('Error in fetchUserServices:', err);
      }
    }
  }, [currentUser]);

  // Fetch services on initial load
  useEffect(() => {
    fetchUserServices();
  }, [fetchUserServices]);

  return (
    <DataContext.Provider
      value={{
        posts,
        events,
        groups,
        services: allServices,
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
        cancelBooking,
        getUserBookings,
        getServiceBookings,
        createService,
        updateService,
        deleteService,
        approveBooking,
        sendServiceMessage,
        getServiceMessages,
        getUserBookingForService,
      }}
    >
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

const generateMockServices = (): Service[] => {
  const mockServices: Service[] = [
    {
      id: "s1",
      title: "Personal Training Session",
      description: "One-on-one personal training session tailored to your fitness goals.",
      providerId: "u2",
      providerName: "Emily Johnson",
      price: 75,
      duration: "60 minutes",
      available: true,
      createdAt: new Date(),
      isOnline: false,
      location: "Downtown Fitness Center",
      capacity: 1,
      serviceType: "one_on_one",
      coverImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1170&auto=format&fit=crop",
    },
    {
      id: "s2",
      title: "Group Meditation Class",
      description: "Guided meditation session for stress relief and mindfulness practice.",
      providerId: "u3",
      providerName: "David Wilson",
      price: 25,
      duration: "45 minutes",
      available: true,
      createdAt: new Date(),
      isOnline: true,
      capacity: 15,
      serviceType: "group",
      meetingUrl: "https://zoom.us/j/123456789",
      coverImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1122&auto=format&fit=crop",
    },
    {
      id: "s3",
      title: "Nutrition Consultation",
      description: "Personalized nutrition advice and meal planning based on your health goals.",
      providerId: "u2",
      providerName: "Emily Johnson",
      price: 90,
      duration: "60 minutes",
      available: true,
      createdAt: new Date(),
      isOnline: true,
      capacity: 1,
      serviceType: "one_on_one",
      meetingUrl: "https://meet.google.com/abc-defg-hij",
      coverImage: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1153&auto=format&fit=crop",
    },
    {
      id: "s4",
      title: "Webinar: Effective Public Speaking",
      description: "Learn techniques to overcome fear and speak confidently in public settings.",
      providerId: "u4",
      providerName: "Michael Brown",
      price: 35,
      duration: "90 minutes",
      available: true,
      createdAt: new Date(),
      isOnline: true,
      capacity: 50,
      serviceType: "webinar",
      meetingUrl: "https://webinar-platform.com/effective-speaking",
      coverImage: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1170&auto=format&fit=crop",
    },
    {
      id: "s5",
      title: "Yoga for Beginners",
      description: "Introduction to yoga fundamentals suitable for complete beginners.",
      providerId: "u5",
      providerName: "Sarah Lee",
      price: 30,
      duration: "60 minutes",
      available: true,
      createdAt: new Date(),
      isOnline: false,
      location: "Serenity Yoga Studio",
      capacity: 10,
      serviceType: "group",
      coverImage: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?q=80&w=1170&auto=format&fit=crop",
    },
  ];

  return mockServices;
};

const mockPosts: Post[] = [];
const mockEvents: Event[] = [];
const mockGroups: Group[] = [];
const mockSessions: Session[] = [];
const mockSessionEnrollments: SessionEnrollment[] = [];
const mockMessages: Message[] = [];
const mockJoinRequests: JoinRequest[] = [];
