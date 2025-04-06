import React, { createContext, useContext, useState, useEffect } from 'react';
import { Post, Event, Group, Service, Session, Message, JoinRequest, Comment, Product, Workshop, JobPosting, Announcement, EventRegistration, Booking, SessionEnrollment } from '@/types';
import { 
  generateMockEvents, 
  generateMockGroups, 
  generateMockSessions, 
  generateMockMessages, 
  generateMockJoinRequests, 
  generateMockPosts,
  generateMockServices 
} from '@/utils/mockData';
import { useAuth } from './AuthContext';

interface DataContextProps {
  posts: Post[];
  events: Event[];
  groups: Group[];
  services: Service[];
  sessions: Session[];
  messages: Message[];
  joinRequests: JoinRequest[];
  comments: Comment[];
  products: Product[];
  workshops: Workshop[];
  jobPostings: JobPosting[];
  announcements: Announcement[];
  completedEvents: Event[];
  sessionEnrollments: SessionEnrollment[];
  loading: boolean;
  
  // Post related functions
  createPost: (postData: Omit<Post, 'id' | 'createdAt'>) => Promise<Post>;
  updatePost: (postId: string, postData: Partial<Post>) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  
  // Comment related functions
  createComment: (commentData: Omit<Comment, 'id' | 'createdAt'>) => Promise<void>;
  updateComment: (commentId: string, commentData: Partial<Comment>) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  addComment: (postId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => Promise<void>;
  postComments: (postId: string) => Comment[];
  
  // Event related functions
  createEvent: (eventData: Omit<Event, 'id' | 'attendees' | 'createdAt'>) => Promise<Event>;
  updateEvent: (eventId: string, eventData: Partial<Event>) => Promise<void>;
  joinEvent: (eventId: string, registrationData?: EventRegistration) => Promise<void>;
  leaveEvent: (eventId: string) => Promise<void>;
  deleteEvent: (eventId: string, reason: 'cancelled' | 'completed') => Promise<void>;
  postAnnouncement: (eventId: string, content: string) => Promise<void>;
  approveEventRequest: (requestId: string, eventId: string, userId: string) => Promise<void>;
  rejectEventRequest: (requestId: string) => Promise<void>;
  
  // Group related functions
  createGroup: (groupData: Omit<Group, 'id' | 'members' | 'createdAt'>) => Promise<Group>;
  updateGroup: (groupId: string, groupData: Partial<Group>) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  requestToJoinGroup: (groupId: string) => Promise<void>;
  removeGroupMember: (groupId: string, memberId: string) => Promise<void>;
  updateGroupDetails: (groupId: string, groupData: Partial<Group>) => Promise<void>;
  getGroupRequests: (groupId: string) => Promise<JoinRequest[]>;
  handleJoinRequest: (groupId: string, userId: string, status: 'approved' | 'rejected') => Promise<void>;
  sendMessage: (messageData: { groupId: string, content: string }) => Promise<void>;
  setMessages: (messages: Message[]) => void;
  
  // Service related functions
  createService: (serviceData: Omit<Service, 'id' | 'createdAt' | 'providerId' | 'providerName'>) => Promise<Service>;
  updateService: (serviceId: string, serviceData: Partial<Service>) => Promise<void>;
  deleteService: (serviceId: string) => Promise<void>;
  getServiceById: (serviceId: string) => Promise<Service>;
  getUserBookings: (userId: string) => Promise<Booking[]>;
  getUserBookingForService: (serviceId: string, userId: string) => Promise<Booking | null>;
  bookService: (serviceId: string, paymentStatus?: string) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
  getServiceBookings: (serviceId: string) => Promise<Booking[]>;
  approveBooking: (bookingId: string) => Promise<void>;
  sendServiceMessage: (serviceId: string, content: string) => Promise<void>;
  getServiceMessages: (serviceId: string) => Promise<Message[]>;
  
  // Session related functions
  createSession: (sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Session>;
  updateSession: (sessionId: string, sessionData: Partial<Session>) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  getUserSessions: (userId: string) => Promise<Session[]>;
  getCoachSessions: (coachId: string) => Promise<Session[]>;
  getUserEnrollments: (userId: string) => Promise<SessionEnrollment[]>;
  enrollInSession: (sessionId: string) => Promise<void>;
  cancelEnrollment: (sessionId: string) => Promise<void>;
  updateEnrollmentStatus: (enrollmentId: string, status: string) => Promise<void>;
  
  // Message related functions
  createMessage: (messageData: Omit<Message, 'id' | 'createdAt'>) => Promise<void>;
  updateMessage: (messageId: string, messageData: Partial<Message>) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  
  // Join Request related functions
  createJoinRequest: (joinRequestData: Omit<JoinRequest, 'id' | 'createdAt'>) => Promise<void>;
  updateJoinRequest: (joinRequestId: string, joinRequestData: Partial<JoinRequest>) => Promise<void>;
  deleteJoinRequest: (joinRequestId: string) => Promise<void>;
  
  // Product related functions
  createProduct: (productData: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  updateProduct: (productId: string, productData: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  
  // Workshop related functions
  createWorkshop: (workshopData: Omit<Workshop, 'id' | 'createdAt'>) => Promise<void>;
  updateWorkshop: (workshopId: string, workshopData: Partial<Workshop>) => Promise<void>;
  deleteWorkshop: (workshopId: string) => Promise<void>;
  
  // Job Posting related functions
  createJobPosting: (jobPostingData: Omit<JobPosting, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateJobPosting: (jobPostingId: string, jobPostingData: Partial<JobPosting>) => Promise<void>;
  deleteJobPosting: (jobPostingId: string) => Promise<void>;
  
  // Announcement related functions
  createAnnouncement: (announcementData: Omit<Announcement, 'id' | 'createdAt'>) => Promise<void>;
  updateAnnouncement: (announcementId: string, announcementData: Partial<Announcement>) => Promise<void>;
  deleteAnnouncement: (announcementId: string) => Promise<void>;
}

const DataContext = createContext<DataContextProps>(null!);

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [completedEvents] = useState<Event[]>([]);
  const [sessionEnrollments] = useState<SessionEnrollment[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { currentUser } = useAuth();
  
  useEffect(() => {
    // Load mock data or fetch from API
    setPosts(generateMockPosts());
    setEvents(generateMockEvents());
    setGroups(generateMockGroups());
    setServices(generateMockServices());
    setSessions(generateMockSessions());
    setMessages(generateMockMessages());
    setJoinRequests(generateMockJoinRequests());
    setWorkshops([]);
  }, []);
  
  // Post functions
  const createPost = async (postData: Omit<Post, 'id' | 'createdAt'>) => {
    const newPost: Post = {
      id: Math.random().toString(),
      ...postData,
      likes: 0,
      comments: 0,
      createdAt: new Date(),
    };
    setPosts([...posts, newPost]);
    return newPost;
  };
  
  const updatePost = async (postId: string, postData: Partial<Post>) => {
    setPosts(posts.map(post => post.id === postId ? { ...post, ...postData } : post));
  };
  
  const deletePost = async (postId: string) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  const likePost = async (postId: string) => {
    // Implementation
  };

  const unlikePost = async (postId: string) => {
    // Implementation
  };
  
  // Comment functions
  const createComment = async (commentData: Omit<Comment, 'id' | 'createdAt'>) => {
    const newComment: Comment = {
      id: Math.random().toString(),
      ...commentData,
      createdAt: new Date(),
    };
    setComments([...comments, newComment]);
  };
  
  const updateComment = async (commentId: string, commentData: Partial<Comment>) => {
    setComments(comments.map(comment => comment.id === commentId ? { ...comment, ...commentData } : comment));
  };
  
  const deleteComment = async (commentId: string) => {
    setComments(comments.filter(comment => comment.id !== commentId));
  };

  const addComment = async (postId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => {
    // Implementation
  };

  const postComments = (postId: string) => {
    return comments.filter(comment => comment.postId === postId);
  };
  
  // Event functions
  const createEvent = async (eventData: Omit<Event, 'id' | 'attendees' | 'createdAt'>) => {
    if (!currentUser) throw new Error("Authentication required");
    
    const newEvent: Event = {
      id: Math.random().toString(),
      attendees: [],
      attendeeDetails: [],
      attendeeRegistrations: [],
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      creatorRole: currentUser.role,
      ...eventData,
      createdAt: new Date(),
    };
    setEvents([...events, newEvent]);
    return newEvent;
  };
  
  const joinEvent = async (eventId: string, registrationData?: EventRegistration) => {
    setEvents(prevEvents => {
      return prevEvents.map(event => {
        if (event.id === eventId && currentUser) {
          // If user is not already in the attendees list, add them
          if (!event.attendees.includes(currentUser.id)) {
            // Create a new attendee detail
            const newAttendeeDetail = {
              id: currentUser.id,
              name: currentUser.name,
              profileImage: currentUser.profileImage
            };
            
            // Initialize or update the attendeeDetails array
            let updatedAttendeeDetails = event.attendeeDetails ? [...event.attendeeDetails] : [];
            const existingAttendeeIndex = updatedAttendeeDetails.findIndex(a => a.id === currentUser.id);
            
            if (existingAttendeeIndex >= 0) {
              updatedAttendeeDetails[existingAttendeeIndex] = newAttendeeDetail;
            } else {
              updatedAttendeeDetails.push(newAttendeeDetail);
            }
            
            // Add registration data if provided
            let updatedRegistrations = event.attendeeRegistrations ? [...event.attendeeRegistrations] : [];
            
            if (registrationData) {
              const existingRegIndex = updatedRegistrations.findIndex(r => r.userId === currentUser.id);
              
              if (existingRegIndex >= 0) {
                updatedRegistrations[existingRegIndex] = registrationData;
              } else {
                updatedRegistrations.push(registrationData);
              }
            }
            
            return {
              ...event,
              attendees: [...event.attendees, currentUser.id],
              attendeeDetails: updatedAttendeeDetails,
              attendeeRegistrations: updatedRegistrations
            };
          }
        }
        return event;
      });
    });
  };
  
  const leaveEvent = async (eventId: string) => {
    setEvents(prevEvents => {
      return prevEvents.map(event => {
        if (event.id === eventId && currentUser) {
          // Remove user from attendees list
          const updatedAttendees = event.attendees.filter(id => id !== currentUser.id);
          
          // Remove user from attendee details
          const updatedAttendeeDetails = event.attendeeDetails ? 
            event.attendeeDetails.filter(a => a.id !== currentUser.id) : [];
          
          // Remove user's registration data
          const updatedRegistrations = event.attendeeRegistrations ?
            event.attendeeRegistrations.filter(r => r.userId !== currentUser.id) : [];
          
          return {
            ...event,
            attendees: updatedAttendees,
            attendeeDetails: updatedAttendeeDetails,
            attendeeRegistrations: updatedRegistrations
          };
        }
        return event;
      });
    });
  };
  
  const deleteEvent = async (eventId: string, reason: 'cancelled' | 'completed') => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
  };
  
  const updateEvent = async (eventId: string, eventData: Partial<Event>) => {
    setEvents(prevEvents =>
      prevEvents.map(event => (event.id === eventId ? { ...event, ...eventData } : event))
    );
  };

  // Implementation of postAnnouncement for EventAnnouncements component
  const postAnnouncement = async (eventId: string, content: string) => {
    if (!currentUser) return;
    
    const announcementData: Omit<Announcement, 'id' | 'createdAt' | 'creatorId' | 'creatorName'> = {
      eventId,
      content
    };
    
    await createAnnouncement({
      ...announcementData,
      creatorId: currentUser.id,
      creatorName: currentUser.name
    });
  };

  const approveEventRequest = async (requestId: string, eventId: string, userId: string) => {
    // Implementation
  };

  const rejectEventRequest = async (requestId: string) => {
    // Implementation
  };
  
  // Group functions
  const createGroup = async (groupData: Omit<Group, 'id' | 'members' | 'createdAt'>) => {
    const newGroup: Group = {
      id: Math.random().toString(),
      members: 0,
      ...groupData,
      createdAt: new Date(),
    };
    setGroups([...groups, newGroup]);
    return newGroup;
  };
  
  const updateGroup = async (groupId: string, groupData: Partial<Group>) => {
    setGroups(groups.map(group => group.id === groupId ? { ...group, ...groupData } : group));
  };
  
  const deleteGroup = async (groupId: string) => {
    setGroups(groups.filter(group => group.id !== groupId));
  };

  const joinGroup = async (groupId: string) => {
    // Implementation
  };

  const leaveGroup = async (groupId: string) => {
    // Implementation
  };

  const requestToJoinGroup = async (groupId: string) => {
    // Implementation
  };

  const removeGroupMember = async (groupId: string, memberId: string) => {
    // Implementation
  };

  const updateGroupDetails = async (groupId: string, groupData: Partial<Group>) => {
    // Implementation
  };

  const getGroupRequests = async (groupId: string): Promise<JoinRequest[]> => {
    return joinRequests.filter(request => request.groupId === groupId);
  };

  const handleJoinRequest = async (groupId: string, userId: string, status: 'approved' | 'rejected') => {
    // Implementation
    console.log(`Handling join request for group ${groupId}, user ${userId}, status: ${status}`);
  };

  // Group message functions
  const sendMessage = async (messageData: { groupId: string, content: string }) => {
    if (!currentUser) return;
    
    const newMessage: Message = {
      id: Math.random().toString(),
      groupId: messageData.groupId,
      content: messageData.content,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      userProfileImage: currentUser.profileImage,
      createdAt: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
  };
  
  // Service functions
  const createService = async (serviceData: Omit<Service, 'id' | 'createdAt' | 'providerId' | 'providerName'>) => {
    if (!currentUser) throw new Error("Authentication required");
    
    const newService: Service = {
      id: Math.random().toString(),
      providerId: currentUser.id,
      providerName: currentUser.name,
      ...serviceData,
      createdAt: new Date(),
    };
    setServices([...services, newService]);
    return newService;
  };
  
  const updateService = async (serviceId: string, serviceData: Partial<Service>) => {
    setServices(services.map(service => service.id === serviceId ? { ...service, ...serviceData } : service));
  };
  
  const deleteService = async (serviceId: string) => {
    setServices(services.filter(service => service.id !== serviceId));
  };

  const getServiceById = async (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) throw new Error("Service not found");
    return service;
  };

  const getUserBookings = async (userId: string) => {
    // Implementation
    return [];
  };

  const getUserBookingForService = async (serviceId: string, userId: string) => {
    // Implementation
    return null;
  };

  const bookService = async (serviceId: string, paymentStatus?: string) => {
    // Implementation
  };

  const cancelBooking = async (bookingId: string) => {
    // Implementation
  };

  const getServiceBookings = async (serviceId: string) => {
    // Implementation
    return [];
  };

  const approveBooking = async (bookingId: string) => {
    // Implementation
  };

  // Service message functions
  const sendServiceMessage = async (serviceId: string, content: string) => {
    if (!currentUser) return;
    
    // Implementation similar to sendMessage but for services
    console.log(`Sending service message to ${serviceId}: ${content}`);
  };

  const getServiceMessages = async (serviceId: string): Promise<Message[]> => {
    // Mock implementation
    return messages.filter(msg => msg.serviceId === serviceId);
  };
  
  // Session functions
  const createSession = async (sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSession: Session = {
      id: Math.random().toString(),
      ...sessionData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSessions([...sessions, newSession]);
    return newSession;
  };
  
  const updateSession = async (sessionId: string, sessionData: Partial<Session>) => {
    setSessions(sessions.map(session => session.id === sessionId ? { ...session, ...sessionData } : session));
  };
  
  const deleteSession = async (sessionId: string) => {
    setSessions(sessions.filter(session => session.id !== sessionId));
  };

  const getUserSessions = async (userId: string) => {
    // Implementation
    return [];
  };

  const getCoachSessions = async (coachId: string) => {
    // Implementation
    return [];
  };

  const getUserEnrollments = async (userId: string) => {
    // Implementation
    return [];
  };

  const enrollInSession = async (sessionId: string) => {
    // Implementation
  };

  const cancelEnrollment = async (sessionId: string) => {
    // Implementation
  };

  const updateEnrollmentStatus = async (enrollmentId: string, status: string) => {
    // Implementation
  };
  
  // Message functions
  const createMessage = async (messageData: Omit<Message, 'id' | 'createdAt'>) => {
    const newMessage: Message = {
      id: Math.random().toString(),
      ...messageData,
      createdAt: new Date(),
    };
    setMessages([...messages, newMessage]);
  };
  
  const updateMessage = async (messageId: string, messageData: Partial<Message>) => {
    setMessages(messages.map(message => message.id === messageId ? { ...message, ...messageData } : message));
  };
  
  const deleteMessage = async (messageId: string) => {
    setMessages(messages.filter(message => message.id !== messageId));
  };
  
  // Join Request functions
  const createJoinRequest = async (joinRequestData: Omit<JoinRequest, 'id' | 'createdAt'>) => {
    const newJoinRequest: JoinRequest = {
      id: Math.random().toString(),
      ...joinRequestData,
      createdAt: new Date(),
    };
    setJoinRequests([...joinRequests, newJoinRequest]);
  };
  
  const updateJoinRequest = async (joinRequestId: string, joinRequestData: Partial<JoinRequest>) => {
    setJoinRequests(joinRequests.map(joinRequest => joinRequest.id === joinRequestId ? { ...joinRequest, ...joinRequestData } : joinRequest));
  };
  
  const deleteJoinRequest = async (joinRequestId: string) => {
    setJoinRequests(joinRequests.filter(joinRequest => joinRequest.id !== joinRequestId));
  };
  
  // Product functions
  const createProduct = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      id: Math.random().toString(),
      ...productData,
      createdAt: new Date(),
    };
    setProducts([...products, newProduct]);
  };
  
  const updateProduct = async (productId: string, productData: Partial<Product>) => {
    setProducts(products.map(product => product.id === productId ? { ...product, ...productData } : product));
  };
  
  const deleteProduct = async (productId: string) => {
    setProducts(products.filter(product => product.id !== productId));
  };
  
  // Workshop functions
  const createWorkshop = async (workshopData: Omit<Workshop, 'id' | 'createdAt'>) => {
    const newWorkshop: Workshop = {
      id: Math.random().toString(),
      ...workshopData,
      createdAt: new Date(),
    };
    setWorkshops([...workshops, newWorkshop]);
  };
  
  const updateWorkshop = async (workshopId: string, workshopData: Partial<Workshop>) => {
    setWorkshops(workshops.map(workshop => workshop.id === workshopId ? { ...workshop, ...workshopData } : workshop));
  };
  
  const deleteWorkshop = async (workshopId: string) => {
    setWorkshops(workshops.filter(workshop => workshop.id !== workshopId));
  };
  
  // Job Posting functions
  const createJobPosting = async (jobPostingData: Omit<JobPosting, 'id' | 'created_at' | 'updated_at'>) => {
    const newJobPosting: JobPosting = {
      id: Math.random().toString(),
      ...jobPostingData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setJobPostings([...jobPostings, newJobPosting]);
  };
  
  const updateJobPosting = async (jobPostingId: string, jobPostingData: Partial<JobPosting>) => {
    setJobPostings(jobPostings.map(jobPosting => jobPosting.id === jobPostingId ? { ...jobPosting, ...jobPostingData } : jobPosting));
  };
  
  const deleteJobPosting = async (jobPostingId: string) => {
    setJobPostings(jobPostings.filter(jobPosting => jobPosting.id !== jobPostingId));
  };
  
  // Announcement functions
  const createAnnouncement = async (announcementData: Omit<Announcement, 'id' | 'createdAt'>) => {
    if (!currentUser) return;
    
    const newAnnouncement: Announcement = {
      id: Math.random().toString(),
      ...announcementData,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      createdAt: new Date(),
    };
    setAnnouncements(prevAnnouncements => [...prevAnnouncements, newAnnouncement]);
  };
  
  const updateAnnouncement = async (announcementId: string, announcementData: Partial<Announcement>) => {
    setAnnouncements(prevAnnouncements =>
      prevAnnouncements.map(announcement =>
        announcement.id === announcementId ? { ...announcement, ...announcementData } : announcement
      )
    );
  };
  
  const deleteAnnouncement = async (announcementId: string) => {
    setAnnouncements(prevAnnouncements => prevAnnouncements.filter(announcement => announcement.id !== announcementId));
  };
  
  return (
    <DataContext.Provider value={{
      posts,
      events,
      groups,
      services,
      sessions,
      messages,
      joinRequests,
      comments,
      products,
      workshops,
      jobPostings,
      announcements,
      completedEvents,
      sessionEnrollments,
      loading,
      
      createPost,
      updatePost,
      deletePost,
      likePost,
      unlikePost,
      
      createComment,
      updateComment,
      deleteComment,
      addComment,
      postComments,
      
      createEvent,
      updateEvent,
      joinEvent,
      leaveEvent,
      deleteEvent,
      postAnnouncement,
      approveEventRequest,
      rejectEventRequest,
      
      createGroup,
      updateGroup,
      deleteGroup,
      joinGroup,
      leaveGroup,
      requestToJoinGroup,
      removeGroupMember,
      updateGroupDetails,
      getGroupRequests,
      handleJoinRequest,
      sendMessage,
      setMessages,
      
      createService,
      updateService,
      deleteService,
      getServiceById,
      getUserBookings,
      getUserBookingForService,
      bookService,
      cancelBooking,
      getServiceBookings,
      approveBooking,
      sendServiceMessage,
      getServiceMessages,
      
      createSession,
      updateSession,
      deleteSession,
      getUserSessions,
      getCoachSessions,
      getUserEnrollments,
      enrollInSession,
      cancelEnrollment,
      updateEnrollmentStatus,
      
      createMessage,
      updateMessage,
      deleteMessage,
      
      createJoinRequest,
      updateJoinRequest,
      deleteJoinRequest,
      
      createProduct,
      updateProduct,
      deleteProduct,
      
      createWorkshop,
      updateWorkshop,
      deleteWorkshop,
      
      createJobPosting,
      updateJobPosting,
      deleteJobPosting,
      
      createAnnouncement,
      updateAnnouncement,
      deleteAnnouncement,
    }}>
      {children}
    </DataContext.Provider>
  );
};
