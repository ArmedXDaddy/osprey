
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Post, Event, Group, Service, Session, SessionEnrollment, Message, JoinRequest, Comment, User, Booking, SessionStatus } from '@/types';
import { generateMockPosts, generateMockEvents, generateMockGroups, generateMockServices, generateMockSessions, generateMockSessionEnrollments, generateMockMessages, generateMockJoinRequests, generateMockProfiles } from '@/utils/mockData';

interface DataContextType {
  posts: Post[];
  events: Event[];
  groups: Group[];
  services: Service[];
  sessions: Session[];
  sessionEnrollments: SessionEnrollment[];
  messages: Message[];
  joinRequests: JoinRequest[];
  postComments: Record<string, Comment[]>;
  loading: boolean;
  
  // Add all missing functions
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  sendMessage: (params: { groupId: string; content: string }) => Promise<void>;
  sendServiceMessage: (params: { serviceId: string; content: string }) => Promise<void>;
  getServiceMessages: (serviceId: string) => Promise<Message[]>;
  updateGroupDetails: (groupId: string, details: Partial<Group>) => Promise<void>;
  getGroupRequests: (groupId: string) => Promise<JoinRequest[]>;
  handleJoinRequest: (groupId: string, userId: string, status: 'approved' | 'rejected') => Promise<void>;
  removeGroupMember: (groupId: string, userId: string) => Promise<void>;
  approveEventRequest: (requestId: string, eventId: string, userId: string) => Promise<void>;
  rejectEventRequest: (requestId: string) => Promise<void>;
  bookService: (serviceId: string, userId: string) => Promise<void>;
  getUserBookings: (userId: string) => Promise<Booking[]>;
  getServiceById: (serviceId: string) => Promise<Service | null>;
  getServiceBookings: (serviceId: string) => Promise<Booking[]>;
  getUserBookingForService: (serviceId: string, userId: string) => Promise<Booking | null>;
  cancelBooking: (bookingId: string) => Promise<void>;
  approveBooking: (bookingId: string) => Promise<void>;
  getUserSessions: (userId: string) => Promise<Session[]>;
  getCoachSessions: (coachId: string) => Promise<Session[]>;
  getUserEnrollments: (userId: string) => Promise<SessionEnrollment[]>;
  createService: (serviceData: Partial<Service>) => Promise<void>;
  updateService: (serviceId: string, serviceData: Partial<Service>) => Promise<void>;
  createSession: (sessionData: Partial<Session>) => Promise<void>;
  updateSession: (sessionId: string, sessionData: Partial<Session>) => Promise<void>;
  updateEnrollmentStatus: (enrollmentId: string, status: SessionStatus) => Promise<void>;
  createEvent: (eventData: Partial<Event>) => Promise<void>;
  joinEvent: (eventId: string) => Promise<void>;
  leaveEvent: (eventId: string) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  createGroup: (groupData: Partial<Group>) => Promise<void>;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  requestToJoinGroup: (groupId: string) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  createPost: (content: string, image: File | null) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  updateComment: (commentId: string, content: string) => Promise<void>;
  enrollInSession: (sessionId: string) => Promise<void>;
  cancelEnrollment: (enrollmentId: string) => Promise<void>;
  announcements: any[];
  postAnnouncement: (params: any) => Promise<void>;
  completedEvents: Event[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionEnrollments, setSessionEnrollments] = useState<SessionEnrollment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [postComments, setPostComments] = useState<Record<string, Comment[]>>({});
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [completedEvents, setCompletedEvents] = useState<Event[]>([]);

  // Initialize with mock data
  useEffect(() => {
    if (isInitialLoad) {
      const mockGroups = generateMockGroups();
      const mockEvents = generateMockEvents();
      const mockServices = generateMockServices();
      const mockPosts = generateMockPosts();
      const mockSessions = generateMockSessions();
      const mockSessionEnrollments = generateMockSessionEnrollments();
      const mockMessages = generateMockMessages();
      const mockJoinRequests = generateMockJoinRequests();
      const mockProfiles = generateMockProfiles();
      
      setGroups(mockGroups);
      setEvents(mockEvents);
      setServices(mockServices);
      setPosts(mockPosts);
      setSessions(mockSessions);
      setSessionEnrollments(mockSessionEnrollments);
      setMessages(mockMessages);
      setJoinRequests(mockJoinRequests);
      
      // Generate mock comments for each post
      const mockCommentsMap: Record<string, Comment[]> = {};
      mockPosts.forEach(post => {
        mockCommentsMap[post.id] = Array(post.commentsCount).fill(0).map((_, index) => {
          const randomProfileIndex = Math.floor(Math.random() * mockProfiles.length);
          const profile = mockProfiles[randomProfileIndex];
          
          return {
            id: `comment-${post.id}-${index}`,
            postId: post.id,
            userId: profile.id,
            userName: profile.name,
            userRole: profile.role,
            userProfileImage: profile.profileImage,
            content: [
              "Great post! Thanks for sharing.",
              "This is really helpful information.",
              "I've been trying this approach and it works wonders!",
              "Could you share more details about this?",
              "Looking forward to more content like this.",
              "I completely agree with your perspective.",
              "This changed my approach to fitness!",
              "Very insightful, thank you."
            ][Math.floor(Math.random() * 8)],
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time within last week
          };
        });
      });
      
      setPostComments(mockCommentsMap);
      setIsInitialLoad(false);
      setLoading(false);
    }
  }, [isInitialLoad]);

  // Implement stub functions for all the required methods
  const sendMessage = async (params: { groupId: string; content: string }) => {
    console.log('Sending message:', params);
    // Implementation would go here
  };

  const sendServiceMessage = async (params: { serviceId: string; content: string }) => {
    console.log('Sending service message:', params);
    // Implementation would go here
  };

  const getServiceMessages = async (serviceId: string) => {
    console.log('Getting service messages for:', serviceId);
    return [];
  };

  const updateGroupDetails = async (groupId: string, details: Partial<Group>) => {
    console.log('Updating group details:', groupId, details);
    // Implementation would go here
  };

  const getGroupRequests = async (groupId: string) => {
    console.log('Getting group requests for:', groupId);
    return joinRequests.filter(req => req.groupId === groupId && req.status === 'pending');
  };

  const handleJoinRequest = async (groupId: string, userId: string, status: 'approved' | 'rejected') => {
    console.log('Handling join request:', groupId, userId, status);
    // Implementation would go here
  };

  const removeGroupMember = async (groupId: string, userId: string) => {
    console.log('Removing group member:', groupId, userId);
    // Implementation would go here
  };

  const approveEventRequest = async (requestId: string, eventId: string, userId: string) => {
    console.log('Approving event request:', requestId, eventId, userId);
    // Implementation would go here
  };

  const rejectEventRequest = async (requestId: string) => {
    console.log('Rejecting event request:', requestId);
    // Implementation would go here
  };

  const bookService = async (serviceId: string, userId: string) => {
    console.log('Booking service:', serviceId, userId);
    // Implementation would go here
  };

  const getUserBookings = async (userId: string) => {
    console.log('Getting user bookings for:', userId);
    return [];
  };

  const getServiceById = async (serviceId: string) => {
    console.log('Getting service by ID:', serviceId);
    const service = services.find(s => s.id === serviceId);
    return service || null;
  };

  const getServiceBookings = async (serviceId: string) => {
    console.log('Getting service bookings for:', serviceId);
    return [];
  };

  const getUserBookingForService = async (serviceId: string, userId: string) => {
    console.log('Getting user booking for service:', serviceId, userId);
    return null;
  };

  const cancelBooking = async (bookingId: string) => {
    console.log('Canceling booking:', bookingId);
    // Implementation would go here
  };

  const approveBooking = async (bookingId: string) => {
    console.log('Approving booking:', bookingId);
    // Implementation would go here
  };

  const getUserSessions = async (userId: string) => {
    console.log('Getting user sessions for:', userId);
    return [];
  };

  const getCoachSessions = async (coachId: string) => {
    console.log('Getting coach sessions for:', coachId);
    return [];
  };

  const getUserEnrollments = async (userId: string) => {
    console.log('Getting user enrollments for:', userId);
    return [];
  };

  const createService = async (serviceData: Partial<Service>) => {
    console.log('Creating service:', serviceData);
    // Implementation would go here
  };

  const updateService = async (serviceId: string, serviceData: Partial<Service>) => {
    console.log('Updating service:', serviceId, serviceData);
    // Implementation would go here
  };

  const createSession = async (sessionData: Partial<Session>) => {
    console.log('Creating session:', sessionData);
    // Implementation would go here
  };

  const updateSession = async (sessionId: string, sessionData: Partial<Session>) => {
    console.log('Updating session:', sessionId, sessionData);
    // Implementation would go here
  };

  const updateEnrollmentStatus = async (enrollmentId: string, status: SessionStatus) => {
    console.log('Updating enrollment status:', enrollmentId, status);
    // Implementation would go here
  };

  const createEvent = async (eventData: Partial<Event>) => {
    console.log('Creating event:', eventData);
    // Implementation would go here
  };

  const joinEvent = async (eventId: string) => {
    console.log('Joining event:', eventId);
    // Implementation would go here
  };

  const leaveEvent = async (eventId: string) => {
    console.log('Leaving event:', eventId);
    // Implementation would go here
  };

  const deleteEvent = async (eventId: string) => {
    console.log('Deleting event:', eventId);
    // Implementation would go here
  };

  const createGroup = async (groupData: Partial<Group>) => {
    console.log('Creating group:', groupData);
    // Implementation would go here
  };

  const joinGroup = async (groupId: string) => {
    console.log('Joining group:', groupId);
    // Implementation would go here
  };

  const leaveGroup = async (groupId: string) => {
    console.log('Leaving group:', groupId);
    // Implementation would go here
  };

  const requestToJoinGroup = async (groupId: string) => {
    console.log('Requesting to join group:', groupId);
    // Implementation would go here
  };

  const deleteGroup = async (groupId: string) => {
    console.log('Deleting group:', groupId);
    // Implementation would go here
  };

  const createPost = async (content: string, image: File | null) => {
    console.log('Creating post:', content, image);
    // Implementation would go here
  };

  const likePost = async (postId: string) => {
    console.log('Liking post:', postId);
    // Implementation would go here
  };

  const unlikePost = async (postId: string) => {
    console.log('Unliking post:', postId);
    // Implementation would go here
  };

  const addComment = async (postId: string, content: string) => {
    console.log('Adding comment:', postId, content);
    // Implementation would go here
  };

  const deleteComment = async (commentId: string) => {
    console.log('Deleting comment:', commentId);
    // Implementation would go here
  };

  const updateComment = async (commentId: string, content: string) => {
    console.log('Updating comment:', commentId, content);
    // Implementation would go here
  };

  const enrollInSession = async (sessionId: string) => {
    console.log('Enrolling in session:', sessionId);
    // Implementation would go here
  };

  const cancelEnrollment = async (enrollmentId: string) => {
    console.log('Canceling enrollment:', enrollmentId);
    // Implementation would go here
  };

  const postAnnouncement = async (params: any) => {
    console.log('Posting announcement:', params);
    // Implementation would go here
  };

  const value: DataContextType = {
    posts,
    events,
    groups,
    services,
    sessions,
    sessionEnrollments,
    messages,
    joinRequests,
    postComments,
    loading,
    setMessages,
    sendMessage,
    sendServiceMessage,
    getServiceMessages,
    updateGroupDetails,
    getGroupRequests,
    handleJoinRequest,
    removeGroupMember,
    approveEventRequest,
    rejectEventRequest,
    bookService,
    getUserBookings,
    getServiceById,
    getServiceBookings,
    getUserBookingForService,
    cancelBooking,
    approveBooking,
    getUserSessions,
    getCoachSessions,
    getUserEnrollments,
    createService,
    updateService,
    createSession,
    updateSession,
    updateEnrollmentStatus,
    createEvent,
    joinEvent,
    leaveEvent,
    deleteEvent,
    createGroup,
    joinGroup,
    leaveGroup,
    requestToJoinGroup,
    deleteGroup,
    createPost,
    likePost,
    unlikePost,
    addComment,
    deleteComment,
    updateComment,
    enrollInSession,
    cancelEnrollment,
    announcements,
    postAnnouncement,
    completedEvents
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
