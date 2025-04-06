import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Service, ServiceType, Post, Event, Group, Session, SessionEnrollment, Message, JoinRequest, User, Product, Workshop, JobPosting, Announcement, Sponsorship, SponsorshipStatus, SponsorshipApplication, ApplicationStatus, Booking } from '@/types';
import { generateMockServices, generateMockEvents, generateMockGroups, generateMockSessions, generateMockSessionEnrollments, generateMockMessages, generateMockJoinRequests, generateMockPosts, generateMockSponsorships } from '@/utils/mockData';
import { toast } from '@/hooks/use-toast';

interface DataContextType {
  services: Service[];
  events: Event[];
  groups: Group[];
  sessions: Session[];
  sessionEnrollments: SessionEnrollment[];
  messages: Message[];
  joinRequests: JoinRequest[];
  posts: Post[];
  products: Product[];
  workshops: Workshop[];
  jobPostings: JobPosting[];
  announcements: Announcement[];
  sponsorships: Sponsorship[];
  sponsorshipApplications: SponsorshipApplication[];
  loading?: boolean;
  completedEvents?: Event[];
  
  // Get methods
  getServices: () => Promise<Service[]>;
  getEvents: () => Promise<Event[]>;
  getGroups: () => Promise<Group[]>;
  getSessions: () => Promise<Session[]>;
  getSessionEnrollments: () => Promise<SessionEnrollment[]>;
  getMessages: () => Promise<Message[]>;
  getJoinRequests: () => Promise<JoinRequest[]>;
  getPosts: () => Promise<Post[]>;
  getProducts: () => Promise<Product[]>;
  getWorkshops: () => Promise<Workshop[]>;
  getJobPostings: () => Promise<JobPosting[]>;
  getAnnouncements: () => Promise<Announcement[]>;
  getSponsorships: () => Promise<Sponsorship[]>;
  getSponsorshipById: (id: string) => Promise<Sponsorship | null>;
  getGroupRequests: (groupId: string) => Promise<JoinRequest[]>;
  getUserBookings: (userId: string) => Promise<Booking[]>;
  getServiceById: (id: string) => Promise<Service | null>;
  getServiceBookings: (serviceId: string) => Promise<Booking[]>;
  getUserBookingForService: (serviceId: string, userId: string) => Promise<Booking | null>;
  getUserSessions: (userId: string) => Promise<Session[]>;
  getCoachSessions: (coachId: string) => Promise<Session[]>;
  getUserEnrollments: (userId: string) => Promise<SessionEnrollment[]>;
  getServiceMessages: (serviceId: string) => Promise<Message[]>;
  
  // Create methods
  createService: (serviceData: Omit<Service, 'id' | 'createdAt'>) => Promise<Service>;
  createEvent: (eventData: Omit<Event, 'id' | 'createdAt'>) => Promise<Event>;
  createGroup: (groupData: Omit<Group, 'id' | 'createdAt'>) => Promise<Group>;
  createSession: (sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Session>;
  createSessionEnrollment: (enrollmentData: Omit<SessionEnrollment, 'id' | 'createdAt' | 'status' | 'paymentStatus'>) => Promise<SessionEnrollment>;
  createMessage: (messageData: Omit<Message, 'id' | 'createdAt'>) => Promise<Message>;
  createJoinRequest: (joinRequestData: Omit<JoinRequest, 'id' | 'createdAt' | 'status'>) => Promise<JoinRequest>;
  createPost: (postData: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments'>) => Promise<Post>;
  createProduct: (productData: Omit<Product, 'id' | 'createdAt'>) => Promise<Product>;
  createWorkshop: (workshopData: Omit<Workshop, 'id' | 'createdAt'>) => Promise<Workshop>;
  createJobPosting: (jobPostingData: Omit<JobPosting, 'id' | 'created_at' | 'updated_at'>) => Promise<JobPosting>;
  createAnnouncement: (announcementData: Omit<Announcement, 'id' | 'createdAt'>) => Promise<Announcement>;
  createSponsorship: (sponsorshipData: Omit<Sponsorship, 'id' | 'createdAt'>) => Promise<Sponsorship>;
  createSponsorshipApplication: (applicationData: Omit<SponsorshipApplication, 'id' | 'createdAt' | 'status'>) => Promise<SponsorshipApplication>;
  
  // Update methods
  updateService: (id: string, updates: Partial<Service>) => Promise<Service | null>;
  updateSponsorshipStatus: (id: string, status: SponsorshipStatus) => Promise<boolean>;
  updateSponsorshipApplicationStatus: (id: string, status: ApplicationStatus) => Promise<boolean>;
  updateGroupDetails: (id: string, updates: Partial<Group>) => Promise<Group | null>;
  updateSession: (id: string, updates: Partial<Session>) => Promise<Session | null>;
  updateEnrollmentStatus: (id: string, status: string) => Promise<boolean>;
  updateComment: (id: string, content: string) => Promise<boolean>;
  
  // Delete methods
  deleteService: (id: string) => Promise<boolean>;
  deleteComment: (id: string) => Promise<boolean>;
  deleteGroup: (id: string) => Promise<boolean>;
  deleteEvent: (id: string) => Promise<boolean>;
  
  // Other actions
  approveEventRequest: (requestId: string, eventId: string, userId: string) => Promise<boolean>;
  rejectEventRequest: (requestId: string) => Promise<boolean>;
  approveBooking: (bookingId: string) => Promise<boolean>;
  cancelBooking: (bookingId: string) => Promise<boolean>;
  bookService: (serviceId: string, userId: string, data: any) => Promise<Booking>;
  joinEvent: (eventId: string, userId: string) => Promise<boolean>;
  leaveEvent: (eventId: string, userId: string) => Promise<boolean>;
  joinGroup: (groupId: string, userId: string) => Promise<boolean>;
  leaveGroup: (groupId: string, userId: string) => Promise<boolean>;
  removeGroupMember: (groupId: string, userId: string) => Promise<boolean>;
  requestToJoinGroup: (groupId: string, userId: string) => Promise<boolean>;
  handleJoinRequest: (groupId: string, userId: string, status: 'approved' | 'rejected') => Promise<boolean>;
  sendMessage: (data: { groupId: string, content: string }) => Promise<Message>;
  sendServiceMessage: (data: { serviceId: string, content: string }) => Promise<Message>;
  likePost: (postId: string) => Promise<boolean>;
  unlikePost: (postId: string) => Promise<boolean>;
  enrollInSession: (sessionId: string, userId: string) => Promise<boolean>;
  cancelEnrollment: (enrollmentId: string) => Promise<boolean>;
  addComment: (postId: string, content: string) => Promise<boolean>;
  postAnnouncement: (eventId: string, content: string) => Promise<Announcement>;
  applyForSponsorship: (data: any) => Promise<SponsorshipApplication>;
  getSponsorshipApplicationsBySponsorshipId: (sponsorshipId: string) => Promise<SponsorshipApplication[]>;
  getSponsorshipApplications: (sponsorshipId: string) => Promise<SponsorshipApplication[]>;
  updateApplicationStatus: (id: string, status: ApplicationStatus) => Promise<boolean>;
  getUserApplicationForSponsorship: (sponsorshipId: string, userId: string) => Promise<SponsorshipApplication | null>;
  postComments?: any; // Using any temporarily
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>; 
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionEnrollments, setSessionEnrollments] = useState<SessionEnrollment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [sponsorships, setSponshorships] = useState<Sponsorship[]>([]);
  const [sponsorshipApplications, setSponsorshipApplications] = useState<SponsorshipApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [completedEvents, setCompletedEvents] = useState<Event[]>([]);

  useEffect(() => {
    getServices();
    getEvents();
    getGroups();
    getSessions();
    getSessionEnrollments();
    getMessages();
    getJoinRequests();
    getPosts();
    getProducts();
    getWorkshops();
    getJobPostings();
    getAnnouncements();
    getSponsorships();
  }, []);

  // Get functions
  
  const getServices = async () => {
    try {
      // Simulate API call
      const mockServices = generateMockServices();
      setServices(mockServices);
      return mockServices;
    } catch (error) {
      console.error('Error fetching services:', error);
      return [];
    }
  };

  const createService = async (serviceData: Omit<Service, 'id' | 'createdAt'>) => {
    try {
      // Simulate API call
      const newService: Service = {
        id: Math.random().toString(36).substring(2, 15),
        createdAt: new Date(),
        ...serviceData,
      };
      setServices(prev => [...prev, newService]);
      return newService;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  };

  const updateService = async (id: string, updates: Partial<Service>) => {
    try {
      setServices(prev =>
        prev.map(service => (service.id === id ? { ...service, ...updates } : service))
      );
      const updatedService = services.find(service => service.id === id) || null;
      return updatedService;
    } catch (error) {
      console.error('Error updating service:', error);
      return null;
    }
  };

  const deleteService = async (id: string) => {
    try {
      setServices(prev => prev.filter(service => service.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting service:', error);
      return false;
    }
  };

  const getEvents = async () => {
    try {
      // Simulate API call
      const mockEvents = generateMockEvents();
      setEvents(mockEvents);
      return mockEvents;
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  };

  const createEvent = async (eventData: Omit<Event, 'id' | 'createdAt'>) => {
    try {
      // Simulate API call
      const newEvent: Event = {
        id: Math.random().toString(36).substring(2, 15),
        createdAt: new Date(),
        attendees: [],
        ...eventData,
      };
      setEvents(prev => [...prev, newEvent]);
      return newEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  const getGroups = async () => {
    try {
      // Simulate API call
      const mockGroups = generateMockGroups();
      setGroups(mockGroups);
      return mockGroups;
    } catch (error) {
      console.error('Error fetching groups:', error);
      return [];
    }
  };

  const createGroup = async (groupData: Omit<Group, 'id' | 'createdAt'>) => {
    try {
      // Simulate API call
      const newGroup: Group = {
        id: Math.random().toString(36).substring(2, 15),
        createdAt: new Date(),
        members: 1,
        ...groupData,
      };
      setGroups(prev => [...prev, newGroup]);
      return newGroup;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  };

  const getSessions = async () => {
    try {
      // Simulate API call
      const mockSessions = generateMockSessions();
      setSessions(mockSessions);
      return mockSessions;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return [];
    }
  };

  const createSession = async (sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Simulate API call
      const newSession: Session = {
        id: Math.random().toString(36).substring(2, 15),
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        ...sessionData,
      };
      setSessions(prev => [...prev, newSession]);
      return newSession;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };

  const getSessionEnrollments = async () => {
    try {
      // Simulate API call
      const mockSessionEnrollments = generateMockSessionEnrollments();
      setSessionEnrollments(mockSessionEnrollments);
      return mockSessionEnrollments;
    } catch (error) {
      console.error('Error fetching session enrollments:', error);
      return [];
    }
  };

  const createSessionEnrollment = async (sessionEnrollmentData: Omit<SessionEnrollment, 'id' | 'createdAt' | 'status' | 'paymentStatus'>) => {
    try {
      // Simulate API call
      const newSessionEnrollment: SessionEnrollment = {
        id: Math.random().toString(36).substring(2, 15),
        createdAt: new Date(),
        status: 'pending',
        paymentStatus: 'unpaid',
        ...sessionEnrollmentData,
      };
      setSessionEnrollments(prev => [...prev, newSessionEnrollment]);
      return newSessionEnrollment;
    } catch (error) {
      console.error('Error creating session enrollment:', error);
      throw error;
    }
  };

  const getMessages = async () => {
    try {
      // Simulate API call
      const mockMessages = generateMockMessages();
      setMessages(mockMessages);
      return mockMessages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  };

  const createMessage = async (messageData: Omit<Message, 'id' | 'createdAt'>) => {
    try {
      // Simulate API call
      const newMessage: Message = {
        id: Math.random().toString(36).substring(2, 15),
        createdAt: new Date(),
        ...messageData,
      };
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  };

  const getJoinRequests = async () => {
    try {
      // Simulate API call
      const mockJoinRequests = generateMockJoinRequests();
      setJoinRequests(mockJoinRequests);
      return mockJoinRequests;
    } catch (error) {
      console.error('Error fetching join requests:', error);
      return [];
    }
  };

  const createJoinRequest = async (joinRequestData: Omit<JoinRequest, 'id' | 'createdAt' | 'status'>) => {
    try {
      // Simulate API call
      const newJoinRequest: JoinRequest = {
        id: Math.random().toString(36).substring(2, 15),
        createdAt: new Date(),
        status: 'pending',
        ...joinRequestData,
      };
      setJoinRequests(prev => [...prev, newJoinRequest]);
      return newJoinRequest;
    } catch (error) {
      console.error('Error creating join request:', error);
      throw error;
    }
  };

  const getPosts = async () => {
    try {
      // Simulate API call
      const mockPosts = generateMockPosts();
      setPosts(mockPosts);
      return mockPosts;
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  };

  const createPost = async (postData: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments'>) => {
    try {
      // Simulate API call
      const newPost: Post = {
        id: Math.random().toString(36).substring(2, 15),
        createdAt: new Date(),
        likes: 0,
        comments: 0,
        ...postData,
      };
      setPosts(prev => [...prev, newPost]);
      return newPost;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };

  const getProducts = async () => {
    try {
      // Simulate API call
      setProducts([]); 
      return []; 
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  };

  const createProduct = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    try {
      // Simulate API call
      const newProduct: Product = {
        id: Math.random().toString(36).substring(2, 15),
        createdAt: new Date(),
        ...productData,
      };
      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  };

  const getWorkshops = async () => {
    try {
      // Simulate API call
      setWorkshops([]); 
      return []; 
    } catch (error) {
      console.error('Error fetching workshops:', error);
      return [];
    }
  };

  const createWorkshop = async (workshopData: Omit<Workshop, 'id' | 'createdAt'>) => {
    try {
      // Simulate API call
      const newWorkshop: Workshop = {
        id: Math.random().toString(36).substring(2, 15),
        createdAt: new Date(),
        ...workshopData,
      };
      setWorkshops(prev => [...prev, newWorkshop]);
      return newWorkshop;
    } catch (error) {
      console.error('Error creating workshop:', error);
      throw error;
    }
  };

  const getJobPostings = async () => {
    try {
      // Simulate API call
      setJobPostings([]); 
      return []; 
    } catch (error) {
      console.error('Error fetching job postings:', error);
      return [];
    }
  };

  const createJobPosting = async (jobPostingData: Omit<JobPosting, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Simulate API call
      const newJobPosting: JobPosting = {
        id: Math.random().toString(36).substring(2, 15),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...jobPostingData,
      };
      setJobPostings(prev => [...prev, newJobPosting]);
      return newJobPosting;
    } catch (error) {
      console.error('Error creating job posting:', error);
      throw error;
    }
  };

  const getAnnouncements = async () => {
    try {
      // Simulate API call
      setAnnouncements([]); 
      return []; 
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }
  };

  const createAnnouncement = async (announcementData: Omit<Announcement, 'id' | 'createdAt'>) => {
    try {
      // Simulate API call
      const newAnnouncement: Announcement = {
        id: Math.random().toString(36).substring(2, 15),
        createdAt: new Date(),
        ...announcementData,
      };
      setAnnouncements(prev => [...prev, newAnnouncement]);
      return newAnnouncement;
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  };

  // Update getSponsorships function to fetch from Supabase
  const getSponsorships = async () => {
    try {
      const { data, error } = await supabase
        .from('sponsorships')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sponsorships:', error);
        throw error;
      }

      // Transform from snake_case to camelCase
      const transformedSponsorships: Sponsorship[] = data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        companyId: item.company_id,
        companyName: item.company_name,
        companyLogo: item.company_logo,
        requirements: item.requirements,
        benefits: item.benefits,
        compensation: item.compensation,
        deadline: item.deadline ? new Date(item.deadline) : undefined,
        status: item.status as SponsorshipStatus,
        tags: item.tags,
        createdAt: new Date(item.created_at)
      }));

      setSponshorships(transformedSponsorships);
      return transformedSponsorships;
    } catch (error) {
      console.error('Error in getSponsorships:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to load sponsorships',
        description: 'Please try again later',
      });
      return [];
    }
  };

  // Update createSponsorship function to save to Supabase
  const createSponsorship = async (sponsorshipData: Omit<Sponsorship, 'id' | 'createdAt'>) => {
    try {
      // Transform from camelCase to snake_case for Supabase
      const sponsorshipForDb = {
        title: sponsorshipData.title,
        description: sponsorshipData.description,
        company_id: sponsorshipData.companyId,
        company_name: sponsorshipData.companyName,
        company_logo: sponsorshipData.companyLogo,
        requirements: sponsorshipData.requirements,
        benefits: sponsorshipData.benefits,
        compensation: sponsorshipData.compensation,
        deadline: sponsorshipData.deadline,
        status: sponsorshipData.status,
        tags: sponsorshipData.tags
      };

      const { data, error } = await supabase
        .from('sponsorships')
        .insert(sponsorshipForDb)
        .select()
        .single();

      if (error) {
        console.error('Error creating sponsorship:', error);
        throw error;
      }

      // Transform back from snake_case to camelCase
      const newSponsorship: Sponsorship = {
        id: data.id,
        title: data.title,
        description: data.description,
        companyId: data.company_id,
        companyName: data.company_name,
        companyLogo: data.company_logo,
        requirements: data.requirements,
        benefits: data.benefits,
        compensation: data.compensation,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        status: data.status as SponsorshipStatus,
        tags: data.tags,
        createdAt: new Date(data.created_at)
      };

      setSponshorships(prev => [newSponsorship, ...prev]);
      return newSponsorship;
    } catch (error) {
      console.error('Error in createSponsorship:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to create sponsorship',
        description: 'Please try again later',
      });
      throw error;
    }
  };

  // Update getSponsorshipById function to fetch from Supabase
  const getSponsorshipById = async (id: string) => {
    try {
      let sponsorship = sponsorships.find(s => s.id === id);
      
      if (!sponsorship) {
        const { data, error } = await supabase
          .from('sponsorships')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching sponsorship:', error);
          throw error;
        }

        if (data) {
          // Transform from snake_case to camelCase
          sponsorship = {
            id: data.id,
            title: data.title,
            description: data.description,
            companyId: data.company_id,
            companyName: data.company_name,
            companyLogo: data.company_logo,
            requirements: data.requirements,
            benefits: data.benefits,
            compensation: data.compensation,
            deadline: data.deadline ? new Date(data.deadline) : undefined,
            status: data.status as SponsorshipStatus,
            tags: data.tags,
            createdAt: new Date(data.created_at)
          };
        }
      }

      return sponsorship || null;
    } catch (error) {
      console.error('Error in getSponsorshipById:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to load sponsorship details',
        description: 'Please try again later',
      });
      return null;
    }
  };

  // Update updateSponsorshipStatus function to update in Supabase
  const updateSponsorshipStatus = async (id: string, status: SponsorshipStatus) => {
    try {
      const { error } = await supabase
        .from('sponsorships')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('Error updating sponsorship status:', error);
        throw error;
      }

      setSponshorships(prev => 
        prev.map(s => s.id === id ? { ...s, status } : s)
      );

      return true;
    } catch (error) {
      console.error('Error in updateSponsorshipStatus:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to update sponsorship',
        description: 'Please try again later',
      });
      return false;
    }
  };

  // Implemented sponsorship application functions
  const createSponsorshipApplication = async (applicationData: Omit<SponsorshipApplication, 'id' | 'createdAt' | 'status'>) => {
    try {
      // Transform from camelCase to snake_case for Supabase
      const applicationForDb = {
        sponsorship_id: applicationData.sponsorshipId,
        user_id: applicationData.userId,
        user_name: applicationData.userName,
        user_email: applicationData.userEmail,
        user_profile_image: applicationData.userProfileImage,
        motivation: applicationData.motivation,
        experience: applicationData.experience,
        social_links: applicationData.socialLinks,
      };
  
      const { data, error } = await supabase
        .from('sponsorship_applications')
        .insert(applicationForDb)
        .select()
        .single();
  
      if (error) {
        console.error('Error creating sponsorship application:', error);
        throw error;
      }
  
      // Transform back from snake_case to camelCase
      const newApplication: SponsorshipApplication = {
        id: data.id,
        sponsorshipId: data.sponsorship_id,
        userId: data.user_id,
        userName: data.user_name,
        userEmail: data.user_email,
        userProfileImage: data.user_profile_image,
        motivation: data.motivation,
        experience: data.experience,
        socialLinks: data.social_links,
        status: data.status as ApplicationStatus,
        createdAt: new Date(data.created_at)
      };
  
      setSponsorshipApplications(prev => [...prev, newApplication]);
      return newApplication;
    } catch (error) {
      console.error('Error in createSponsorshipApplication:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to create application',
        description: 'Please try again later',
      });
      throw error;
    }
  };

  const getSponsorshipApplicationsBySponsorshipId = async (sponsorshipId: string) => {
    try {
      const { data, error } = await supabase
        .from('sponsorship_applications')
        .select('*')
        .eq('sponsorship_id', sponsorshipId);
  
      if (error) {
        console.error('Error fetching sponsorship applications:', error);
        throw error;
      }
  
      // Transform from snake_case to camelCase
      const transformedApplications: SponsorshipApplication[] = data.map(item => ({
        id: item.id,
        sponsorshipId: item.sponsorship_id,
        userId: item.user_id,
        userName: item.user_name,
        userEmail: item.user_email,
        userProfileImage: item.user_profile_image,
        motivation: item.motivation,
        experience: item.experience,
        socialLinks: item.social_links,
        status: item.status as ApplicationStatus,
        createdAt: new Date(item.created_at)
      }));
  
      setSponsorshipApplications(transformedApplications);
      return transformedApplications;
    } catch (error) {
      console.error('Error in getSponsorshipApplicationsBySponsorshipId:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to load applications',
        description: 'Please try again later',
      });
      return [];
    }
  };

  const updateSponsorshipApplicationStatus = async (id: string, status: ApplicationStatus) => {
    try {
      const { error } = await supabase
        .from('sponsorship_applications')
        .update({ status })
        .eq('id', id);
  
      if (error) {
        console.error('Error updating application status:', error);
        throw error;
      }
  
      setSponsorshipApplications(prev =>
        prev.map(app => (app.id === id ? { ...app, status } : app))
      );
  
      return true;
    } catch (error) {
      console.error('Error in updateSponsorshipApplicationStatus:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to update application',
        description: 'Please try again later',
      });
      return false;
    }
  };

  const getUserApplicationForSponsorship = async (sponsorshipId: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('sponsorship_applications')
        .select('*')
        .eq('sponsorship_id', sponsorshipId)
        .eq('user_id', userId)
        .maybeSingle();
  
      if (error) {
        console.error('Error fetching user application:', error);
        return null;
      }
  
      if (!data) {
        return null; // No application found
      }
  
      // Transform from snake_case to camelCase
      const transformedApplication: SponsorshipApplication = {
        id: data.id,
        sponsorshipId: data.sponsorship_id,
        userId: data.user_id,
        userName: data.user_name,
        userEmail: data.user_email,
        userProfileImage: data.user_profile_image,
        motivation: data.motivation,
        experience: data.experience,
        socialLinks: data.social_links,
        status: data.status as ApplicationStatus,
        createdAt: new Date(data.created_at)
      };
  
      return transformedApplication;
    } catch (error) {
      // Log the error, but return null as the function should return null when no application is found
      console.error('Error in getUserApplicationForSponsorship:', error);
      return null;
    }
  };

  // Method aliases and stub functions
  const getSponsorshipApplications = getSponsorshipApplicationsBySponsorshipId;
  const applyForSponsorship = createSponsorshipApplication;
  const updateApplicationStatus = updateSponsorshipApplicationStatus;

  // Mock functions for event related actions
  const joinEvent = async (eventId: string, userId: string) => {
    console.log('Joining event', eventId, 'with user', userId);
    return true;
  };

  const leaveEvent = async (eventId: string, userId: string) => {
    console.log('Leaving event', eventId, 'with user', userId);
    return true;
  };

  const deleteEvent = async (id: string) => {
    console.log('Deleting event', id);
    return true;
  };

  const postAnnouncement = async (eventId: string, content: string) => {
    console.log('Posting announcement for event', eventId, 'with content', content);
    return {
      id: 'mock-announcement',
      eventId,
      content,
      creatorId: 'mock-user',
      creatorName: 'Mock User',
      createdAt: new Date()
    };
  };

  // Mock functions for group actions
  const joinGroup = async (groupId: string, userId: string) => {
    console.log('Joining group', groupId, 'with user', userId);
    return true;
  };

  const leaveGroup = async (groupId: string, userId: string) => {
    console.log('Leaving group', groupId, 'with user', userId);
    return true;
  };

  const removeGroupMember = async (groupId: string, userId: string) => {
    console.log('Removing member', userId, 'from group', groupId);
    return true;
  };

  const requestToJoinGroup = async (groupId: string, userId: string) => {
    console.log('Requesting to join group', groupId, 'with user', userId);
    return true;
  };

  const handleJoinRequest = async (groupId: string, userId: string, status: 'approved' | 'rejected') => {
    console.log('Handling join request for group', groupId, 'with user', userId, 'status:', status);
    return true;
  };

  const getGroupRequests = async (groupId: string) => {
    console.log('Getting requests for group', groupId);
    return [];
  };

  const deleteGroup = async (id: string) => {
    console.log('Deleting group', id);
    return true;
  };

  const updateGroupDetails = async (id: string, updates: Partial<Group>) => {
    console.log('Updating group', id, 'with', updates);
    return null;
  };

  // Mock functions for message related actions
  const sendMessage = async (data: { groupId: string, content: string }) => {
    console.log('Sending message to group', data.groupId, 'content:', data.content);
    return {
      id: 'mock-message',
      groupId: data.groupId,
      content: data.content,
      userId: 'mock-user',
      userName: 'Mock User',
      userRole: 'user',
      createdAt: new Date()
    };
  };

  const sendServiceMessage = async (data: { serviceId: string, content: string }) => {
    console.log('Sending message for service', data.serviceId, 'content:', data.content);
    return {
      id: 'mock-service-message',
      serviceId: data.serviceId,
      content: data.content,
      userId: 'mock-user',
      userName: 'Mock User',
      userRole: 'user',
      createdAt: new Date()
    };
  };

  const getServiceMessages = async (serviceId: string) => {
    console.log('Getting messages for service', serviceId);
    return [];
  };

  // Mock functions for booking related actions
  const getUserBookings = async (userId: string) => {
    console.log('Getting bookings for user', userId);
    return [];
  };

  const getServiceById = async (id: string) => {
    console.log('Getting service', id);
    return null;
  };

  const cancelBooking = async (id: string) => {
    console.log('Cancelling booking', id);
    return true;
  };

  const getUserBookingForService = async (serviceId: string, userId: string) => {
    console.log('Getting booking for user', userId, 'and service', serviceId);
    return null;
  };

  const getServiceBookings = async (serviceId: string) => {
    console.log('Getting bookings for service', serviceId);
    return [];
  };

  const approveBooking = async (id: string) => {
    console.log('Approving booking', id);
    return true;
  };

  const bookService = async (serviceId: string, userId: string, data: any) => {
    console.log('Booking service', serviceId, 'for user', userId, 'with data', data);
    return {
      id: 'mock-booking',
      serviceId,
      userId,
      userName: 'Mock User',
      userEmail: 'mock@example.com',
      status: 'pending',
      paymentStatus: 'unpaid',
      notes: data.notes,
      createdAt: new Date(),
      isPaid: false
    };
  };

  // Mock functions for session related actions
  const getUserSessions = async (userId: string) => {
    console.log('Getting sessions for user', userId);
    return [];
  };

  const getCoachSessions = async (coachId: string) => {
    console.log('Getting sessions for coach', coachId);
    return [];
  };

  const getUserEnrollments = async (userId: string) => {
    console.log('Getting enrollments for user', userId);
    return [];
  };

  const enrollInSession = async (sessionId: string, userId: string) => {
    console.log('Enrolling user', userId, 'in session', sessionId);
    return true;
  };

  const cancelEnrollment = async (id: string) => {
    console.log('Cancelling enrollment', id);
    return true;
  };

  const updateSession = async (id: string, updates: Partial<Session>) => {
    console.log('Updating session', id, 'with', updates);
    return null;
  };

  const updateEnrollmentStatus = async (id: string, status: string) => {
    console.log('Updating enrollment', id, 'status to', status);
    return true;
  };

  // Mock functions for post & comment related actions
  const likePost = async (id: string) => {
    console.log('Liking post', id);
    return true;
  };

  const unlikePost = async (id: string) => {
    console.log('Unliking post', id);
    return true;
  };

  const addComment = async (postId: string, content: string) => {
    console.log('Adding comment to post', postId, 'content:', content);
    return true;
  };

  const deleteComment = async (id: string) => {
    console.log('Deleting comment', id);
    return true;
  };

  const updateComment = async (id: string, content: string) => {
    console.log('Updating comment', id, 'with content', content);
    return true;
  };

  // Mock functions for event requests
  const approveEventRequest = async (requestId: string, eventId: string, userId: string) => {
    console.log('Approving event request', requestId, 'for event', eventId, 'and user', userId);
    return true;
  };

  const rejectEventRequest = async (requestId: string) => {
    console.log('Rejecting event request', requestId);
    return true;
  };

  const value: DataContextType = {
    services,
    events,
    groups,
    sessions,
    sessionEnrollments,
    messages,
    joinRequests,
    posts,
    products,
    workshops,
    jobPostings,
    announcements,
    sponsorships,
    sponsorshipApplications,
    loading,
    completedEvents,
    getServices,
    createService,
    updateService,
    deleteService,
    getEvents,
    createEvent,
    getGroups,
    createGroup,
    getSessions,
    createSession,
    getSessionEnrollments,
    createSessionEnrollment,
    getMessages,
    createMessage,
    getJoinRequests,
    createJoinRequest,
    getPosts,
    createPost,
    getProducts,
    createProduct,
    getWorkshops,
    createWorkshop,
    getJobPostings,
    createJobPosting,
    getAnnouncements,
    createAnnouncement,
    getSponsorships,
    createSponsorship,
    getSponsorshipById,
    updateSponsorshipStatus,
    createSponsorshipApplication,
    getSponsorshipApplicationsBySponsorshipId,
    updateSponsorshipApplicationStatus,
    getUserApplicationForSponsorship,
    getSponsorshipApplications,
    applyForSponsorship,
    updateApplicationStatus,
    setMessages,
    joinEvent,
    leaveEvent,
    deleteEvent,
    postAnnouncement,
    joinGroup,
    leaveGroup,
    removeGroupMember,
    requestToJoinGroup,
    handleJoinRequest,
    getGroupRequests,
    deleteGroup,
    updateGroupDetails,
    sendMessage,
    sendServiceMessage,
    getServiceMessages,
    getUserBookings,
    getServiceById,
    cancelBooking,
    getUserBookingForService,
    getServiceBookings,
    approveBooking,
    bookService,
    getUserSessions,
    getCoachSessions,
    getUserEnrollments,
    enrollInSession,
    cancelEnrollment,
    updateSession,
    updateEnrollmentStatus,
    likePost,
    unlikePost,
    addComment,
    deleteComment,
    updateComment,
    approveEventRequest,
    rejectEventRequest
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
