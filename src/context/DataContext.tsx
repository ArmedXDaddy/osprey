
import React, { createContext, useState, useContext } from 'react';
import { Service, SessionEnrollment, Session, User, Post, Event, Group, JoinRequest, Message, ServiceBooking, BookingStatus, PaymentStatus } from '@/types';
import { generateId } from '@/utils';

interface DataContextProps {
  services: Service[];
  sessions: Session[];
  users: User[];
  posts: Post[];
  events: Event[];
  groups: Group[];
  joinRequests: JoinRequest[];
  messages: Message[];
  serviceBookings: ServiceBooking[];
  sessionEnrollments: SessionEnrollment[];
  loading: boolean;
  bookService: (serviceId: string, isPaid?: boolean) => Promise<ServiceBooking | undefined>;
  cancelServiceBooking: (enrollmentId: string) => Promise<void>;
  enrollSession: (sessionId: string) => Promise<SessionEnrollment | undefined>;
  cancelSessionEnrollment: (enrollmentId: string) => Promise<void>;
  createPost: (content: string, mediaUrl?: string, mediaType?: string) => Promise<Post | undefined>;
  addComment: (postId: string, content: string) => Promise<Post | undefined>;
  likePost: (postId: string) => Promise<Post | undefined>;
  createEvent: (eventData: Omit<Event, 'id' | 'createdAt' | 'creatorName' | 'creatorRole' | 'creatorImage' | 'attendees' | 'currentAttendees'>) => Promise<Event | undefined>;
  joinEvent: (eventId: string) => Promise<JoinRequest | undefined>;
  leaveEvent: (eventId: string) => Promise<void>;
  createGroup: (groupData: Omit<Group, 'id' | 'createdAt' | 'creatorName' | 'creatorRole' | 'members'>) => Promise<Group | undefined>;
  joinGroup: (groupId: string) => Promise<JoinRequest | undefined>;
  leaveGroup: (groupId: string) => Promise<void>;
  sendMessage: (groupId: string, content: string, mediaUrl?: string, mediaType?: string) => Promise<Message | undefined>;
  enrollInSession: (sessionId: string, isPaid?: boolean) => Promise<SessionEnrollment | undefined>;
  cancelEnrollment: (enrollmentId: string) => Promise<void>;
  getEventRequests: (eventId: string) => JoinRequest[];
  handleEventJoinRequest: (requestId: string, status: 'approved' | 'rejected') => Promise<void>;
  getGroupRequests: (groupId: string) => JoinRequest[];
  handleJoinRequest: (requestId: string, status: 'approved' | 'rejected') => Promise<void>;
  removeGroupMember: (groupId: string, userId: string) => Promise<void>;
  updateGroupDetails: (groupId: string, data: any) => Promise<Group | undefined>;
  getUserSessions: (userId: string) => Session[];
  getCoachSessions: (coachId: string) => Session[];
  getUserEnrollments: (userId: string) => SessionEnrollment[];
  requestToJoinGroup: (groupId: string) => Promise<JoinRequest | undefined>;
  createSession: (sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Session>;
  updateSession: (sessionId: string, data: Partial<Session>) => Promise<Session | undefined>;
  updateEnrollmentStatus: (enrollmentId: string, status: 'approved' | 'rejected') => Promise<SessionEnrollment | undefined>;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

const mockServices: Service[] = [
  {
    id: '1',
    title: 'Personal Coaching Session',
    description: 'One-on-one coaching session tailored to your needs',
    providerId: '1',
    providerName: 'John Coach',
    price: 50,
    duration: '60 minutes',
    available: true,
    sessionType: 'one_on_one',
    isOnline: true,
    isFree: false,
    location: 'Online',
    meetingUrl: 'https://zoom.us/j/123456789',
    createdAt: new Date(),
  },
  {
    id: '2',
    title: 'Group Fitness Class',
    description: 'High-intensity fitness class for all levels',
    providerId: '2',
    providerName: 'Jane Fitness',
    price: 20,
    duration: '45 minutes',
    available: true,
    sessionType: 'group',
    isOnline: false,
    isFree: false,
    location: 'Local Gym',
    meetingUrl: 'https://zoom.us/j/987654321',
    createdAt: new Date(),
  },
  {
    id: '3',
    title: 'Free Meditation Session',
    description: 'Relax and unwind with our free meditation session',
    providerId: '3',
    providerName: 'Mike Meditation',
    price: 0,
    duration: '30 minutes',
    available: true,
    sessionType: 'one_on_one',
    isOnline: true,
    isFree: true,
    location: 'Online',
    meetingUrl: 'https://zoom.us/j/555555555',
    createdAt: new Date(),
  },
];

const mockSessions: Session[] = [
  {
    id: '1',
    title: 'Yoga for Beginners',
    description: 'Learn the basics of yoga in this introductory session',
    price: 15,
    duration: '60 minutes',
    coachId: '2',
    coachName: 'Jane Fitness',
    isActive: true,
    capacity: 10,
    startTime: new Date(),
    location: 'Yoga Studio',
    isOnline: false,
    meetingUrl: 'https://zoom.us/j/111111111',
    sessionType: 'group',
    createdAt: new Date(),
  },
  {
    id: '2',
    title: 'Advanced Pilates',
    description: 'Challenge yourself with our advanced Pilates session',
    price: 25,
    duration: '75 minutes',
    coachId: '2',
    coachName: 'Jane Fitness',
    isActive: true,
    capacity: 5,
    startTime: new Date(),
    location: 'Pilates Studio',
    isOnline: false,
    meetingUrl: 'https://zoom.us/j/222222222',
    sessionType: 'group',
    createdAt: new Date(),
  },
];

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Coach',
    email: 'john@example.com',
    role: 'coach',
  },
  {
    id: '2',
    name: 'Jane Fitness',
    email: 'jane@example.com',
    role: 'coach',
  },
  {
    id: '3',
    name: 'Mike Meditation',
    email: 'mike@example.com',
    role: 'coach',
  },
  {
    id: '4',
    name: 'Alice User',
    email: 'alice@example.com',
    role: 'user',
  },
];

const mockPosts: Post[] = [
  {
    id: '1',
    content: 'Excited to share my fitness journey with you all!',
    authorId: '4',
    authorName: 'Alice User',
    authorRole: 'user',
    likes: 25,
    comments: 5,
    createdAt: new Date(),
  },
  {
    id: '2',
    content: 'Check out my new meditation routine for stress relief.',
    authorId: '3',
    authorName: 'Mike Meditation',
    authorRole: 'coach',
    likes: 40,
    comments: 10,
    createdAt: new Date(),
  },
];

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Community Yoga Session',
    description: 'Join us for a relaxing yoga session in the park.',
    location: 'Central Park',
    isOnline: false,
    startDate: new Date(),
    endDate: new Date(),
    price: 0,
    capacity: 20,
    currentAttendees: 15,
    creatorId: '2',
    creatorName: 'Jane Fitness',
    creatorRole: 'coach',
    privacy: 'public',
    createdAt: new Date(),
    attendees: [],
  },
  {
    id: '2',
    title: 'Online Meditation Workshop',
    description: 'Learn mindfulness techniques in our online workshop.',
    isOnline: true,
    meetingUrl: 'https://zoom.us/j/333333333',
    startDate: new Date(),
    endDate: new Date(),
    price: 10,
    capacity: 10,
    currentAttendees: 8,
    creatorId: '3',
    creatorName: 'Mike Meditation',
    creatorRole: 'coach',
    privacy: 'paid',
    createdAt: new Date(),
    attendees: [],
  },
];

const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Fitness Fanatics',
    description: 'A group for fitness enthusiasts to share tips and motivate each other.',
    members: 50,
    creatorId: '2',
    creatorName: 'Jane Fitness',
    creatorRole: 'coach',
    privacy: 'public',
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Meditation Masters',
    description: 'A community for meditation practitioners to deepen their practice.',
    members: 30,
    creatorId: '3',
    creatorName: 'Mike Meditation',
    creatorRole: 'coach',
    privacy: 'private',
    createdAt: new Date(),
  },
];

const mockJoinRequests: JoinRequest[] = [
  {
    id: '1',
    groupId: '1',
    userId: '4',
    userName: 'Alice User',
    status: 'pending',
    createdAt: new Date(),
  },
  {
    id: '2',
    eventId: '2',
    userId: '4',
    userName: 'Alice User',
    status: 'approved',
    createdAt: new Date(),
  },
];

const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Welcome to the Fitness Fanatics group!',
    groupId: '1',
    userId: '2',
    userName: 'Jane Fitness',
    userRole: 'coach',
    createdAt: new Date(),
  },
  {
    id: '2',
    content: 'Namaste everyone! Ready for a peaceful meditation session?',
    groupId: '2',
    userId: '3',
    userName: 'Mike Meditation',
    userRole: 'coach',
    createdAt: new Date(),
  },
];

const mockServiceBookings: ServiceBooking[] = [
  {
    id: '1',
    serviceId: '1',
    userId: '4',
    userName: 'Alice User',
    userEmail: 'alice@example.com',
    status: 'approved',
    paymentStatus: 'paid',
    amount: 50,
    createdAt: new Date(),
  },
  {
    id: '2',
    serviceId: '2',
    userId: '4',
    userName: 'Alice User',
    userEmail: 'alice@example.com',
    status: 'pending',
    paymentStatus: 'unpaid',
    amount: 20,
    createdAt: new Date(),
  },
];

const mockSessionEnrollments: SessionEnrollment[] = [
  {
    id: '1',
    sessionId: '1',
    userId: '4',
    userName: 'Alice User',
    userEmail: 'alice@example.com',
    status: 'approved',
    paymentStatus: 'paid',
    createdAt: new Date(),
  },
  {
    id: '2',
    sessionId: '2',
    userId: '4',
    userName: 'Alice User',
    userEmail: 'alice@example.com',
    status: 'pending',
    paymentStatus: 'unpaid',
    createdAt: new Date(),
  },
];

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [services, setServices] = useState<Service[]>(mockServices);
  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [groups, setGroups] = useState<Group[]>(mockGroups);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>(mockJoinRequests);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [serviceBookings, setServiceBookings] = useState<ServiceBooking[]>(mockServiceBookings);
  const [sessionEnrollments, setSessionEnrollments] = useState<SessionEnrollment[]>(mockSessionEnrollments);
  const [loading, setLoading] = useState<boolean>(false);

  const bookService = async (serviceId: string, isPaid: boolean = false) => {
    try {
      const service = services.find(s => s.id === serviceId);
      const currentUser = users.find(u => u.id === '4');

      if (!service) {
        throw new Error('Service not found');
      }

      if (!currentUser) {
        throw new Error('User not found');
      }

      const existingBooking = serviceBookings.find(
        booking => booking.serviceId === serviceId && booking.userId === currentUser.id
      );

      if (existingBooking) {
        if (isPaid && (existingBooking.status !== 'approved' || existingBooking.paymentStatus !== 'paid')) {
          const updatedBooking: ServiceBooking = {
            ...existingBooking,
            status: 'approved' as BookingStatus,
            paymentStatus: 'paid' as PaymentStatus
          };

          setServiceBookings(prev => 
            prev.map(booking => 
              booking.id === existingBooking.id ? updatedBooking : booking
            )
          );

          return updatedBooking;
        }
        
        return existingBooking;
      }

      const status = isPaid ? 'approved' as BookingStatus : 'pending' as BookingStatus;
      
      const newEnrollment: ServiceBooking = {
        id: generateId(),
        serviceId,
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        userProfileImage: currentUser.profileImage,
        status: status,
        paymentStatus: isPaid ? 'paid' as PaymentStatus : 'unpaid' as PaymentStatus,
        amount: service.price,
        createdAt: new Date(),
      };

      setServiceBookings(prev => [...prev, newEnrollment]);
      return newEnrollment;
    } catch (error) {
      console.error('Error booking service:', error);
      throw error;
    }
  };

  const cancelServiceBooking = async (enrollmentId: string) => {
    setServiceBookings(prev => prev.filter(enrollment => enrollment.id !== enrollmentId));
  };

  const enrollSession = async (sessionId: string) => {
    try {
      const session = sessions.find(s => s.id === sessionId);
      const currentUser = users.find(u => u.id === '4');

      if (!session) {
        throw new Error('Session not found');
      }

      if (!currentUser) {
        throw new Error('User not found');
      }

      const newEnrollment: SessionEnrollment = {
        id: generateId(),
        sessionId,
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        status: 'pending',
        paymentStatus: 'unpaid',
        createdAt: new Date(),
      };

      setSessionEnrollments(prev => [...prev, newEnrollment]);
      return newEnrollment;
    } catch (error) {
      console.error('Error enrolling in session:', error);
      throw error;
    }
  };

  const cancelSessionEnrollment = async (enrollmentId: string) => {
    setSessionEnrollments(prev => prev.filter(enrollment => enrollment.id !== enrollmentId));
  };

  const createPost = async (content: string, mediaUrl?: string, mediaType?: string) => {
    try {
      const currentUser = users.find(u => u.id === '4');

      if (!currentUser) {
        throw new Error('User not found');
      }

      const newPost: Post = {
        id: generateId(),
        content,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorRole: currentUser.role,
        likes: 0,
        comments: 0,
        createdAt: new Date(),
        mediaUrl,
        mediaType,
      };

      setPosts(prev => [...prev, newPost]);
      return newPost;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };

  const addComment = async (postId: string, content: string) => {
    setPosts(prev =>
      prev.map(post => {
        if (post.id === postId) {
          return { ...post, comments: post.comments + 1 };
        }
        return post;
      })
    );
    return posts.find(post => post.id === postId);
  };

  const likePost = async (postId: string) => {
    setPosts(prev =>
      prev.map(post => {
        if (post.id === postId) {
          return { ...post, likes: post.likes + 1 };
        }
        return post;
      })
    );
    return posts.find(post => post.id === postId);
  };

  const createEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'creatorName' | 'creatorRole' | 'creatorImage' | 'attendees' | 'currentAttendees'>) => {
    try {
      const currentUser = users.find(u => u.id === '4');

      if (!currentUser) {
        throw new Error('User not found');
      }

      const newEvent: Event = {
        id: generateId(),
        title: eventData.title,
        description: eventData.description,
        location: eventData.location,
        isOnline: eventData.isOnline,
        meetingUrl: eventData.meetingUrl,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        price: eventData.price,
        capacity: eventData.capacity,
        currentAttendees: 0,
        creatorId: currentUser.id,
        creatorName: currentUser.name,
        creatorRole: currentUser.role,
        privacy: eventData.privacy,
        createdAt: new Date(),
        attendees: [],
      };

      setEvents(prev => [...prev, newEvent]);
      return newEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  const joinEvent = async (eventId: string) => {
    try {
      const event = events.find(e => e.id === eventId);
      const currentUser = users.find(u => u.id === '4');

      if (!event) {
        throw new Error('Event not found');
      }

      if (!currentUser) {
        throw new Error('User not found');
      }

      const newJoinRequest: JoinRequest = {
        id: generateId(),
        eventId,
        userId: currentUser.id,
        userName: currentUser.name,
        status: 'pending',
        createdAt: new Date(),
      };

      setJoinRequests(prev => [...prev, newJoinRequest]);
      return newJoinRequest;
    } catch (error) {
      console.error('Error joining event:', error);
      throw error;
    }
  };

  const leaveEvent = async (eventId: string) => {
    setJoinRequests(prev => prev.filter(req => req.eventId !== eventId && req.userId !== '4'));
  };

  const createGroup = async (groupData: Omit<Group, 'id' | 'createdAt' | 'creatorName' | 'creatorRole' | 'members'>) => {
    try {
      const currentUser = users.find(u => u.id === '4');

      if (!currentUser) {
        throw new Error('User not found');
      }

      const newGroup: Group = {
        id: generateId(),
        name: groupData.name,
        description: groupData.description,
        members: 1,
        creatorId: currentUser.id,
        creatorName: currentUser.name,
        creatorRole: currentUser.role,
        privacy: groupData.privacy,
        createdAt: new Date(),
        ...groupData
      };

      setGroups(prev => [...prev, newGroup]);
      return newGroup;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  };

  const joinGroup = async (groupId: string) => {
    try {
      const group = groups.find(g => g.id === groupId);
      const currentUser = users.find(u => u.id === '4');

      if (!group) {
        throw new Error('Group not found');
      }

      if (!currentUser) {
        throw new Error('User not found');
      }

      const newJoinRequest: JoinRequest = {
        id: generateId(),
        groupId,
        userId: currentUser.id,
        userName: currentUser.name,
        status: 'pending',
        createdAt: new Date(),
      };

      setJoinRequests(prev => [...prev, newJoinRequest]);
      return newJoinRequest;
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    }
  };

  const leaveGroup = async (groupId: string) => {
    setJoinRequests(prev => prev.filter(req => req.groupId !== groupId && req.userId !== '4'));
  };

  const sendMessage = async (groupId: string, content: string, mediaUrl?: string, mediaType?: string) => {
    try {
      const group = groups.find(g => g.id === groupId);
      const currentUser = users.find(u => u.id === '4');

      if (!group) {
        throw new Error('Group not found');
      }

      if (!currentUser) {
        throw new Error('User not found');
      }

      const newMessage: Message = {
        id: generateId(),
        content,
        groupId,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        createdAt: new Date(),
        mediaUrl,
        mediaType,
      };

      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const enrollInSession = async (sessionId: string, isPaid: boolean = false) => {
    try {
      const session = sessions.find(s => s.id === sessionId);
      const currentUser = users.find(u => u.id === '4');

      if (!session) {
        throw new Error('Session not found');
      }

      if (!currentUser) {
        throw new Error('User not found');
      }

      const status = isPaid ? 'approved' : 'pending';
      
      const newEnrollment: SessionEnrollment = {
        id: generateId(),
        sessionId,
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        status: status,
        paymentStatus: isPaid ? 'paid' : 'unpaid',
        createdAt: new Date(),
      };

      setSessionEnrollments(prev => [...prev, newEnrollment]);
      return newEnrollment;
    } catch (error) {
      console.error('Error enrolling in session:', error);
      throw error;
    }
  };

  const cancelEnrollment = async (enrollmentId: string) => {
    setSessionEnrollments(prev => prev.filter(enrollment => enrollment.id !== enrollmentId));
  };

  const getEventRequests = (eventId: string) => {
    return joinRequests.filter(request => request.eventId === eventId && request.status === 'pending');
  };

  const handleEventJoinRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    setJoinRequests(prev => 
      prev.map(request => 
        request.id === requestId ? { ...request, status } : request
      )
    );
  };

  const getGroupRequests = (groupId: string) => {
    return joinRequests.filter(request => request.groupId === groupId && request.status === 'pending');
  };

  const handleJoinRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    setJoinRequests(prev => 
      prev.map(request => 
        request.id === requestId ? { ...request, status } : request
      )
    );
    
    if (status === 'approved') {
      const request = joinRequests.find(r => r.id === requestId);
      if (request && request.groupId) {
        setGroups(prev => 
          prev.map(group => 
            group.id === request.groupId ? { ...group, members: group.members + 1 } : group
          )
        );
      }
    }
  };

  const removeGroupMember = async (groupId: string, userId: string) => {
    setJoinRequests(prev => 
      prev.filter(request => !(request.groupId === groupId && request.userId === userId))
    );
    
    setGroups(prev => 
      prev.map(group => 
        group.id === groupId ? { ...group, members: Math.max(1, group.members - 1) } : group
      )
    );
  };

  const updateGroupDetails = async (groupId: string, data: any) => {
    const updatedGroups = groups.map(group => 
      group.id === groupId ? { ...group, ...data } : group
    );
    setGroups(updatedGroups);
    return updatedGroups.find(group => group.id === groupId);
  };

  const getUserSessions = (userId: string) => {
    const userEnrollments = sessionEnrollments.filter(enrollment => enrollment.userId === userId);
    return sessions.filter(session => 
      userEnrollments.some(enrollment => enrollment.sessionId === session.id)
    );
  };

  const getCoachSessions = (coachId: string) => {
    return sessions.filter(session => session.coachId === coachId);
  };

  const getUserEnrollments = (userId: string) => {
    return sessionEnrollments.filter(enrollment => enrollment.userId === userId);
  };

  const requestToJoinGroup = async (groupId: string) => {
    try {
      const group = groups.find(g => g.id === groupId);
      const currentUser = users.find(u => u.id === '4');

      if (!group) {
        throw new Error('Group not found');
      }

      if (!currentUser) {
        throw new Error('User not found');
      }

      const newJoinRequest: JoinRequest = {
        id: generateId(),
        groupId,
        userId: currentUser.id,
        userName: currentUser.name,
        status: 'pending',
        createdAt: new Date(),
      };

      setJoinRequests(prev => [...prev, newJoinRequest]);
      return newJoinRequest;
    } catch (error) {
      console.error('Error requesting to join group:', error);
      throw error;
    }
  };

  const createSession = async (sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newSession: Session = {
        id: generateId(),
        ...sessionData,
        createdAt: new Date(),
      };
      
      setSessions(prev => [...prev, newSession]);
      return newSession;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };

  const updateSession = async (sessionId: string, data: Partial<Session>) => {
    const updatedSessions = sessions.map(session => 
      session.id === sessionId ? { ...session, ...data } : session
    );
    setSessions(updatedSessions);
    return updatedSessions.find(session => session.id === sessionId);
  };

  const updateEnrollmentStatus = async (enrollmentId: string, status: 'approved' | 'rejected') => {
    const updatedEnrollments = sessionEnrollments.map(enrollment => 
      enrollment.id === enrollmentId ? { ...enrollment, status } : enrollment
    );
    setSessionEnrollments(updatedEnrollments);
    return updatedEnrollments.find(enrollment => enrollment.id === enrollmentId);
  };

  const value: DataContextProps = {
    services,
    sessions,
    users,
    posts,
    events,
    groups,
    joinRequests,
    messages,
    serviceBookings,
    sessionEnrollments,
    loading,
    bookService,
    cancelServiceBooking,
    enrollSession,
    cancelSessionEnrollment,
    createPost,
    addComment,
    likePost,
    createEvent,
    joinEvent,
    leaveEvent,
    createGroup,
    joinGroup,
    leaveGroup,
    sendMessage,
    enrollInSession,
    cancelEnrollment,
    getEventRequests,
    handleEventJoinRequest,
    getGroupRequests,
    handleJoinRequest,
    removeGroupMember,
    updateGroupDetails,
    getUserSessions,
    getCoachSessions,
    getUserEnrollments,
    requestToJoinGroup,
    createSession,
    updateSession,
    updateEnrollmentStatus,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
