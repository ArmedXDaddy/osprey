import React, { createContext, useContext, useState, useEffect } from 'react';
import { Post, Event, Group, Service, Session, Message, JoinRequest, Comment, Product, Workshop, JobPosting, Announcement, EventRegistration } from '@/types';
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
  
  createPost: (postData: Omit<Post, 'id' | 'createdAt'>) => Promise<void>;
  updatePost: (postId: string, postData: Partial<Post>) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  
  createComment: (commentData: Omit<Comment, 'id' | 'createdAt'>) => Promise<void>;
  updateComment: (commentId: string, commentData: Partial<Comment>) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  
  createEvent: (eventData: Omit<Event, 'id' | 'attendees' | 'createdAt'>) => Promise<void>;
  updateEvent: (eventId: string, eventData: Partial<Event>) => Promise<void>;
  
  createGroup: (groupData: Omit<Group, 'id' | 'members' | 'createdAt'>) => Promise<void>;
  updateGroup: (groupId: string, groupData: Partial<Group>) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  
  createService: (serviceData: Omit<Service, 'id' | 'createdAt'>) => Promise<void>;
  updateService: (serviceId: string, serviceData: Partial<Service>) => Promise<void>;
  deleteService: (serviceId: string) => Promise<void>;
  
  createSession: (sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSession: (sessionId: string, sessionData: Partial<Session>) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  
  createMessage: (messageData: Omit<Message, 'id' | 'createdAt'>) => Promise<void>;
  updateMessage: (messageId: string, messageData: Partial<Message>) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  
  createJoinRequest: (joinRequestData: Omit<JoinRequest, 'id' | 'createdAt'>) => Promise<void>;
  updateJoinRequest: (joinRequestId: string, joinRequestData: Partial<JoinRequest>) => Promise<void>;
  deleteJoinRequest: (joinRequestId: string) => Promise<void>;
  
  createProduct: (productData: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  updateProduct: (productId: string, productData: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  
  createWorkshop: (workshopData: Omit<Workshop, 'id' | 'createdAt'>) => Promise<void>;
  updateWorkshop: (workshopId: string, workshopData: Partial<Workshop>) => Promise<void>;
  deleteWorkshop: (workshopId: string) => Promise<void>;
  
  createJobPosting: (jobPostingData: Omit<JobPosting, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateJobPosting: (jobPostingId: string, jobPostingData: Partial<JobPosting>) => Promise<void>;
  deleteJobPosting: (jobPostingId: string) => Promise<void>;
  
  createAnnouncement: (announcementData: Omit<Announcement, 'id' | 'createdAt'>) => Promise<void>;
  updateAnnouncement: (announcementId: string, announcementData: Partial<Announcement>) => Promise<void>;
  deleteAnnouncement: (announcementId: string) => Promise<void>;
  
  // Event functions
  joinEvent: (eventId: string, registrationData?: EventRegistration) => Promise<void>;
  leaveEvent: (eventId: string) => Promise<void>;
  deleteEvent: (eventId: string, reason: 'cancelled' | 'completed') => Promise<void>;
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
  };
  
  const updatePost = async (postId: string, postData: Partial<Post>) => {
    setPosts(posts.map(post => post.id === postId ? { ...post, ...postData } : post));
  };
  
  const deletePost = async (postId: string) => {
    setPosts(posts.filter(post => post.id !== postId));
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
  
  // Event functions
  const createEvent = async (eventData: Omit<Event, 'id' | 'attendees' | 'createdAt'>) => {
    const newEvent: Event = {
      id: Math.random().toString(),
      attendees: [],
      attendeeDetails: [],
      attendeeRegistrations: [],
      ...eventData,
      createdAt: new Date(),
    };
    setEvents([...events, newEvent]);
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
  
  // Group functions
  const createGroup = async (groupData: Omit<Group, 'id' | 'members' | 'createdAt'>) => {
    const newGroup: Group = {
      id: Math.random().toString(),
      members: 0,
      ...groupData,
      createdAt: new Date(),
    };
    setGroups([...groups, newGroup]);
  };
  
  const updateGroup = async (groupId: string, groupData: Partial<Group>) => {
    setGroups(groups.map(group => group.id === groupId ? { ...group, ...groupData } : group));
  };
  
  const deleteGroup = async (groupId: string) => {
    setGroups(groups.filter(group => group.id !== groupId));
  };
  
  // Service functions
  const createService = async (serviceData: Omit<Service, 'id' | 'createdAt'>) => {
    const newService: Service = {
      id: Math.random().toString(),
      ...serviceData,
      createdAt: new Date(),
    };
    setServices([...services, newService]);
  };
  
  const updateService = async (serviceId: string, serviceData: Partial<Service>) => {
    setServices(services.map(service => service.id === serviceId ? { ...service, ...serviceData } : service));
  };
  
  const deleteService = async (serviceId: string) => {
    setServices(services.filter(service => service.id !== serviceId));
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
  };
  
  const updateSession = async (sessionId: string, sessionData: Partial<Session>) => {
    setSessions(sessions.map(session => session.id === sessionId ? { ...session, ...sessionData } : session));
  };
  
  const deleteSession = async (sessionId: string) => {
    setSessions(sessions.filter(session => session.id !== sessionId));
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
      
      createPost,
      updatePost,
      deletePost,
      
      createComment,
      updateComment,
      deleteComment,
      
      createEvent,
      updateEvent,
      deleteEvent,
      
      createGroup,
      updateGroup,
      deleteGroup,
      
      createService,
      updateService,
      deleteService,
      
      createSession,
      updateSession,
      deleteSession,
      
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
      
      // Event functions
      joinEvent,
      leaveEvent,
      deleteEvent,
    }}>
      {children}
    </DataContext.Provider>
  );
};
