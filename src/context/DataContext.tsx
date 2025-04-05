import React, { createContext, useContext, useState, useEffect } from 'react';
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
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionEnrollments, setSessionEnrollments] = useState<SessionEnrollment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const generateId = () => uuidv4();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setPosts(mockPosts);
        setEvents(mockEvents);
        setGroups(mockGroups);
        setServices(mockServices);
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

    fetchData();
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
    const service = mockServices.find(s => s.id === serviceId);
    if (!service) {
      throw new Error("Service not found");
    }
    return service;
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

  const mockPosts: Post[] = [
    {
      id: '1',
      userId: 'user1',
      userName: 'John Doe',
      userRole: 'user',
      userProfileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
      content: 'Just finished an amazing workout session!',
      likes: 15,
      comments: 3,
      createdAt: new Date('2023-06-15T10:30:00'),
    },
    {
      id: '2',
      userId: 'influencer1',
      userName: 'Fitness Pro',
      userRole: 'influencer',
      userProfileImage: 'https://randomuser.me/api/portraits/women/2.jpg',
      content: 'Check out my new workout routine for beginners!',
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438',
      likes: 42,
      comments: 7,
      createdAt: new Date('2023-06-14T15:45:00'),
    },
  ];

  const mockEvents: Event[] = [
    {
      id: '1',
      title: 'Summer Fitness Bootcamp',
      description: 'Join us for an intensive 3-day fitness bootcamp to kickstart your summer fitness journey!',
      creatorId: 'coach1',
      creatorName: 'Elite Trainer',
      creatorRole: 'coach',
      location: 'Central Park, New York',
      date: new Date('2023-07-15T09:00:00'),
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
      attendees: ['user1', 'user2', 'user3'],
      privacy: 'public',
      price: 99.99,
      createdAt: new Date('2023-06-01T12:00:00'),
    },
    {
      id: '2',
      title: 'Nutrition Workshop',
      description: 'Learn about proper nutrition for optimal performance and recovery.',
      creatorId: 'coach2',
      creatorName: 'Nutrition Expert',
      creatorRole: 'coach',
      location: 'Health Hub, Los Angeles',
      date: new Date('2023-07-20T14:00:00'),
      attendees: ['user1', 'user4'],
      privacy: 'private',
      createdAt: new Date('2023-06-05T10:30:00'),
    },
  ];

  const mockGroups: Group[] = [
    {
      id: '1',
      name: 'Morning Runners Club',
      description: 'A community of early birds who love to start their day with a refreshing run!',
      creatorId: 'user3',
      creatorName: 'Running Enthusiast',
      creatorRole: 'user',
      members: 28,
      memberIds: ['user1', 'user3', 'user5'],
      image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5',
      privacy: 'public',
      createdAt: new Date('2023-05-10T08:15:00'),
      rules: ['Be respectful', 'No spam', 'Share your running achievements'],
    },
    {
      id: '2',
      name: 'Elite Athletes',
      description: 'A private group for professional and semi-professional athletes to network and share insights.',
      creatorId: 'influencer2',
      creatorName: 'Pro Athlete',
      creatorRole: 'influencer',
      members: 15,
      memberIds: ['influencer1', 'influencer2', 'coach1'],
      privacy: 'private',
      createdAt: new Date('2023-04-20T16:45:00'),
      rules: ['Verified athletes only', 'Confidential discussions', 'No media sharing without permission'],
      memberLimit: 50,
    },
  ];

  const mockServices: Service[] = [
    {
      id: "service-1",
      title: "One-on-One Fitness Coaching",
      description: "Personalized fitness coaching tailored to your specific goals and needs. Get expert guidance on exercises, nutrition, and lifestyle changes.",
      providerId: "coach-1",
      providerName: "John Smith",
      price: 99.99,
      duration: "60 min",
      available: true,
      createdAt: new Date("2023-01-15"),
      isOnline: false,
      location: "Fitness Studio, 123 Main St",
      capacity: 1,
      serviceType: "one_on_one"
    },
    {
      id: "service-2",
      title: "Group HIIT Training",
      description: "High-intensity interval training in a motivating group setting. Burn calories, build strength, and improve cardiovascular health.",
      providerId: "coach-1",
      providerName: "John Smith",
      price: 29.99,
      duration: "45 min",
      available: true,
      createdAt: new Date("2023-02-20"),
      isOnline: false,
      location: "Fitness Studio, 123 Main St",
      capacity: 8,
      serviceType: "group"
    },
    {
      id: "service-3",
      title: "Nutrition Consultation",
      description: "Comprehensive nutrition assessment and personalized meal planning. Learn how to fuel your body for optimal health and performance.",
      providerId: "coach-2",
      providerName: "Sarah Johnson",
      price: 79.99,
      duration: "75 min",
      available: true,
      createdAt: new Date("2023-03-10"),
      isOnline: true,
      capacity: 1,
      serviceType: "one_on_one"
    },
    {
      id: "service-4",
      title: "Free Fitness Assessment",
      description: "Initial fitness assessment to evaluate your current fitness level and discuss your goals. Includes body composition analysis and fitness tests.",
      providerId: "coach-2",
      providerName: "Sarah Johnson",
      price: 0,
      duration: "30 min",
      available: true,
      createdAt: new Date("2023-04-05"),
      isOnline: false,
      location: "Fitness Studio, 123 Main St",
      capacity: 1,
      serviceType: "one_on_one"
    },
    {
      id: "service-5",
      title: "Online Yoga Class",
      description: "Virtual yoga sessions focusing on flexibility, strength, and mindfulness. Suitable for all levels from beginners to advanced practitioners.",
      providerId: "coach-3",
      providerName: "Emily Chen",
      price: 19.99,
      duration: "60 min",
      available: true,
      createdAt: new Date("2023-05-12"),
      isOnline: true,
      capacity: 15,
      serviceType: "group"
    }
  ];

  const mockSessions: Session[] = [
    {
      id: '1',
      title: 'Strength Training Fundamentals',
      description: 'Learn the basics of strength training with proper form and technique. Suitable for beginners.',
      coachId: 'coach1',
      coachName: 'Elite Trainer',
      sessionType: 'group',
      capacity: 10,
      price: 25,
      duration: '60 min',
      startTime: new Date('2023-07-10T18:00:00'),
      location: 'Fitness Center, Downtown',
      isOnline: false,
      isActive: true,
      createdAt: new Date('2023-06-01T10:00:00'),
      updatedAt: new Date('2023-06-01T10:00:00'),
    },
    {
      id: '2',
      title: 'Personal Training Session',
      description: 'One-on-one training session tailored to your specific fitness goals and needs.',
      coachId: 'coach1',
      coachName: 'Elite Trainer',
      sessionType: 'one_on_one',
      price: 75,
      duration: '45 min',
      isOnline: false,
      location: 'Fitness Center, Downtown',
      isActive: true,
      createdAt: new Date('2023-06-02T11:30:00'),
      updatedAt: new Date('2023-06-02T11:30:00'),
    },
    {
      id: '3',
      title: 'Online Yoga Flow',
      description: 'A rejuvenating yoga flow class to improve flexibility, strength, and mindfulness.',
      coachId: 'coach2',
      coachName: 'Yoga Master',
      sessionType: 'group',
      capacity: 20,
      price: 15,
      duration: '60 min',
      startTime: new Date('2023-07-12T09:00:00'),
      isOnline: true,
      meetingUrl: 'https://zoom.us/j/123456789',
      isActive: true,
      createdAt: new Date('2023-06-03T14:15:00'),
      updatedAt: new Date('2023-06-03T14:15:00'),
    },
  ];

  const mockSessionEnrollments: SessionEnrollment[] = [
    {
      id: '1',
      sessionId: '1',
      userId: 'user1',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      userProfileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
      status: 'approved',
      paymentStatus: 'paid',
      createdAt: new Date('2023-06-05T09:30:00'),
    },
    {
      id: '2',
      sessionId: '2',
      userId: 'user2',
      userName: 'Jane Smith',
      userEmail: 'jane@example.com',
      status: 'pending',
      paymentStatus: 'unpaid',
      createdAt: new Date('2023-06-06T14:45:00'),
    },
  ];

  const mockMessages: Message[] = [
    {
      id: '1',
      groupId: '1',
      userId: 'user1',
      userName: 'John Doe',
      userRole: 'user',
      userProfileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
      content: 'Good morning everyone! Who\'s up for a run today?',
      createdAt: new Date('2023-06-10T07:30:00'),
    },
    {
      id: '2',
      groupId: '1',
      userId: 'user3',
      userName: 'Running Enthusiast',
      userRole: 'user',
      content: 'I\'ll be at the park at 8 AM if anyone wants to join!',
      createdAt: new Date('2023-06-10T07:35:00'),
    },
  ];

  const mockJoinRequests: JoinRequest[] = [
    {
      id: '1',
      groupId: '2',
      userId: 'user4',
      userName: 'Aspiring Athlete',
      status: 'pending',
      createdAt: new Date('2023-06-08T16:20:00'),
    },
    {
      id: '2',
      eventId: '2',
      userId: 'user5',
      userName: 'Health Enthusiast',
      status: 'pending',
      createdAt: new Date('2023-06-09T11:15:00'),
    },
  ];

  return (
    <DataContext.Provider
      value={{
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
        cancelBooking,
        getUserBookings,
        getServiceBookings
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
