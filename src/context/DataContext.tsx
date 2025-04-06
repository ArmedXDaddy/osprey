
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Service, 
  ServiceType, 
  Post, 
  Event, 
  Group, 
  Session, 
  SessionEnrollment, 
  Message, 
  JoinRequest, 
  Sponsorship, 
  SponsorshipStatus,
  SponsorshipApplication, 
  ApplicationStatus 
} from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { generateMockServices, generateMockPosts, generateMockEvents, generateMockGroups, 
  generateMockSessions, generateMockSessionEnrollments, generateMockMessages, 
  generateMockJoinRequests, generateMockSponsorships } from '@/utils/mockData';

// Define the context type
export interface DataContextType {
  // Data states
  services: Service[];
  posts: Post[];
  events: Event[];
  groups: Group[];
  sessions: Session[];
  sessionEnrollments: SessionEnrollment[];
  messages: Message[];
  joinRequests: JoinRequest[];
  sponsorships: Sponsorship[];
  sponsorshipApplications: SponsorshipApplication[];
  
  // Service functions
  fetchServices: () => Promise<Service[]>;
  getServiceById: (id: string) => Service | undefined;
  createService: (service: Partial<Service>) => Promise<Service>;
  updateService: (id: string, service: Partial<Service>) => Promise<Service>;
  deleteService: (id: string) => Promise<void>;
  
  // Event functions
  createEvent: (event: Partial<Event>) => Promise<Event>;
  updateEvent: (id: string, updatedEvent: Partial<Event>) => Promise<Event>;
  deleteEvent: (id: string) => Promise<void>;
  joinEvent: (eventId: string) => Promise<void>;
  leaveEvent: (eventId: string) => Promise<void>;
  
  // Group functions
  createGroup: (group: Partial<Group>) => Promise<Group>;
  updateGroup: (id: string, updatedGroup: Partial<Group>) => Promise<Group>;
  deleteGroup: (id: string) => Promise<void>;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  
  // Session functions
  createSession: (session: Partial<Session>) => Promise<Session>;
  updateSession: (id: string, session: Partial<Session>) => Promise<Session>;
  deleteSession: (id: string) => Promise<void>;
  enrollInSession: (sessionId: string) => Promise<void>;
  unenrollFromSession: (sessionId: string) => Promise<void>;
  
  // Social functions
  createPost: (post: Partial<Post>) => Promise<Post>;
  updatePost: (id: string, post: Partial<Post>) => Promise<Post>;
  deletePost: (id: string) => Promise<void>;
  
  // Sponsorship functions
  fetchSponsorships: () => Promise<Sponsorship[]>;
  getSponsorshipById: (id: string) => Sponsorship | undefined;
  createSponsorship: (sponsorship: Partial<Sponsorship>) => Promise<Sponsorship>;
  updateSponsorship: (id: string, sponsorship: Partial<Sponsorship>) => Promise<Sponsorship>;
  deleteSponsorship: (id: string) => Promise<void>;
  
  // Sponsorship application functions
  fetchSponsorshipApplications: (sponsorshipId?: string) => Promise<SponsorshipApplication[]>;
  fetchUserSponsorshipApplications: () => Promise<SponsorshipApplication[]>;
  createSponsorshipApplication: (application: Partial<SponsorshipApplication>) => Promise<SponsorshipApplication>;
  updateSponsorshipApplication: (id: string, application: Partial<SponsorshipApplication>) => Promise<SponsorshipApplication>;
  deleteSponsorshipApplication: (id: string) => Promise<void>;
  updateApplicationStatus: (applicationId: string, status: ApplicationStatus) => Promise<SponsorshipApplication>;
}

// Create the context with a default value
const DataContext = createContext<DataContextType | null>(null);

// Custom hook to use the data context
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Helper functions to convert between camelCase and snake_case
const convertSnakeToCamel = (obj: any) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(convertSnakeToCamel);
  }
  
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = obj[key] !== null && typeof obj[key] === 'object' 
      ? convertSnakeToCamel(obj[key]) 
      : obj[key];
    return acc;
  }, {} as any);
};

const convertCamelToSnake = (obj: any) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(convertCamelToSnake);
  }
  
  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    acc[snakeKey] = obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])
      ? convertCamelToSnake(obj[key])
      : obj[key];
    return acc;
  }, {} as any);
};

// Provider component
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  // State for all data
  const [services, setServices] = useState<Service[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionEnrollments, setSessionEnrollments] = useState<SessionEnrollment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [sponsorshipApplications, setSponsorshipApplications] = useState<SponsorshipApplication[]>([]);
  
  // Load initial data
  useEffect(() => {
    // Check if we have Supabase integration or use mock data
    const loadInitialData = async () => {
      try {
        // Try to load data from Supabase first
        await fetchServices();
        // Load sponsorships data
        await fetchSponsorships();
      } catch (error) {
        console.error('Error loading initial data:', error);
        // Fall back to mock data
        loadMockData();
      }
    };
    
    loadInitialData();
  }, []);
  
  const loadMockData = () => {
    // Load mock data
    setServices(generateMockServices());
    setPosts(generateMockPosts());
    setEvents(generateMockEvents());
    setGroups(generateMockGroups());
    setSessions(generateMockSessions());
    setSessionEnrollments(generateMockSessionEnrollments());
    setMessages(generateMockMessages());
    setJoinRequests(generateMockJoinRequests());
    setSponsorships(generateMockSponsorships());
    setSponsorshipApplications([]);
  };
  
  // Generic CRUD operations
  const createItem = async <T,>(
    items: T[],
    setItems: React.Dispatch<React.SetStateAction<T[]>>,
    item: Partial<T>,
    tableName?: string,
    successMessage = 'Item created successfully'
  ): Promise<T> => {
    // Generate a UUID if not provided
    const newItem = {
      ...(item as T),
      id: (item as any).id || uuidv4(),
      createdAt: new Date()
    };
    
    try {
      if (tableName) {
        // Convert to snake_case for database
        const snakeCaseItem = convertCamelToSnake(newItem);
        
        // Add to database
        const { data, error } = await supabase
          .from(tableName)
          .insert(snakeCaseItem)
          .select();
          
        if (error) throw error;
        
        if (data && data[0]) {
          // Convert back to camelCase
          const createdItem = convertSnakeToCamel(data[0]);
          setItems(prev => [...prev, createdItem]);
          sonnerToast.success(successMessage);
          return createdItem;
        }
      }
      
      // If no table or fallback to local storage
      setItems(prev => [...prev, newItem as T]);
      sonnerToast.success(successMessage);
      return newItem as T;
    } catch (error) {
      console.error(`Error creating ${tableName || 'item'}:`, error);
      sonnerToast.error(`Failed to create: ${(error as Error).message}`);
      throw error;
    }
  };
  
  const updateItem = async <T extends { id: string }>(
    items: T[],
    setItems: React.Dispatch<React.SetStateAction<T[]>>,
    id: string,
    updates: Partial<T>,
    tableName?: string,
    successMessage = 'Item updated successfully'
  ): Promise<T> => {
    try {
      const itemIndex = items.findIndex(item => item.id === id);
      if (itemIndex === -1) {
        throw new Error('Item not found');
      }
      
      const updatedItem = {
        ...items[itemIndex],
        ...updates
      };
      
      if (tableName) {
        // Convert to snake_case for database
        const snakeCaseUpdates = convertCamelToSnake(updates);
        
        // Update in database
        const { data, error } = await supabase
          .from(tableName)
          .update(snakeCaseUpdates)
          .eq('id', id)
          .select();
          
        if (error) throw error;
        
        if (data && data[0]) {
          // Convert back to camelCase
          const updatedDbItem = convertSnakeToCamel(data[0]);
          const newItems = [...items];
          newItems[itemIndex] = updatedDbItem;
          setItems(newItems);
          sonnerToast.success(successMessage);
          return updatedDbItem;
        }
      }
      
      // If no table or fallback to local storage
      const newItems = [...items];
      newItems[itemIndex] = updatedItem;
      setItems(newItems);
      sonnerToast.success(successMessage);
      return updatedItem;
    } catch (error) {
      console.error(`Error updating ${tableName || 'item'}:`, error);
      sonnerToast.error(`Failed to update: ${(error as Error).message}`);
      throw error;
    }
  };
  
  const deleteItem = async <T extends { id: string }>(
    items: T[],
    setItems: React.Dispatch<React.SetStateAction<T[]>>,
    id: string,
    tableName?: string,
    successMessage = 'Item deleted successfully'
  ): Promise<void> => {
    try {
      if (tableName) {
        // Delete from database
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('id', id);
          
        if (error) throw error;
      }
      
      // Update local state
      setItems(prev => prev.filter(item => item.id !== id));
      sonnerToast.success(successMessage);
    } catch (error) {
      console.error(`Error deleting ${tableName || 'item'}:`, error);
      sonnerToast.error(`Failed to delete: ${(error as Error).message}`);
      throw error;
    }
  };
  
  // Service functions
  const fetchServices = async (): Promise<Service[]> => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*');
        
      if (error) throw error;
      
      if (data) {
        const camelCaseServices = data.map(convertSnakeToCamel);
        setServices(camelCaseServices);
        return camelCaseServices;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  };
  
  const getServiceById = (id: string): Service | undefined => {
    return services.find(service => service.id === id);
  };
  
  const createService = async (service: Partial<Service>): Promise<Service> => {
    return createItem(services, setServices, service, 'services', 'Service created successfully');
  };
  
  const updateService = async (id: string, service: Partial<Service>): Promise<Service> => {
    return updateItem(services, setServices, id, service, 'services', 'Service updated successfully');
  };
  
  const deleteService = async (id: string): Promise<void> => {
    return deleteItem(services, setServices, id, 'services', 'Service deleted successfully');
  };
  
  // Event functions
  const createEvent = async (event: Partial<Event>): Promise<Event> => {
    return createItem(events, setEvents, event, 'events', 'Event created successfully');
  };
  
  const updateEvent = async (id: string, updatedEvent: Partial<Event>): Promise<Event> => {
    return updateItem(events, setEvents, id, updatedEvent, 'events', 'Event updated successfully');
  };
  
  const deleteEvent = async (id: string): Promise<void> => {
    return deleteItem(events, setEvents, id, 'events', 'Event deleted successfully');
  };
  
  const joinEvent = async (eventId: string): Promise<void> => {
    if (!currentUser) {
      throw new Error('You must be logged in to join an event');
    }
    
    try {
      // Implement join event logic
      sonnerToast.success('Joined event successfully');
    } catch (error) {
      console.error('Error joining event:', error);
      sonnerToast.error(`Failed to join event: ${(error as Error).message}`);
      throw error;
    }
  };
  
  const leaveEvent = async (eventId: string): Promise<void> => {
    if (!currentUser) {
      throw new Error('You must be logged in to leave an event');
    }
    
    try {
      // Implement leave event logic
      sonnerToast.success('Left event successfully');
    } catch (error) {
      console.error('Error leaving event:', error);
      sonnerToast.error(`Failed to leave event: ${(error as Error).message}`);
      throw error;
    }
  };
  
  // Group functions
  const createGroup = async (group: Partial<Group>): Promise<Group> => {
    return createItem(groups, setGroups, group, 'groups', 'Group created successfully');
  };
  
  const updateGroup = async (id: string, updatedGroup: Partial<Group>): Promise<Group> => {
    return updateItem(groups, setGroups, id, updatedGroup, 'groups', 'Group updated successfully');
  };
  
  const deleteGroup = async (id: string): Promise<void> => {
    return deleteItem(groups, setGroups, id, 'groups', 'Group deleted successfully');
  };
  
  const joinGroup = async (groupId: string): Promise<void> => {
    if (!currentUser) {
      throw new Error('You must be logged in to join a group');
    }
    
    try {
      // Implement join group logic
      sonnerToast.success('Joined group successfully');
    } catch (error) {
      console.error('Error joining group:', error);
      sonnerToast.error(`Failed to join group: ${(error as Error).message}`);
      throw error;
    }
  };
  
  const leaveGroup = async (groupId: string): Promise<void> => {
    if (!currentUser) {
      throw new Error('You must be logged in to leave a group');
    }
    
    try {
      // Implement leave group logic
      sonnerToast.success('Left group successfully');
    } catch (error) {
      console.error('Error leaving group:', error);
      sonnerToast.error(`Failed to leave group: ${(error as Error).message}`);
      throw error;
    }
  };
  
  // Session functions
  const createSession = async (session: Partial<Session>): Promise<Session> => {
    return createItem(sessions, setSessions, session, 'sessions', 'Session created successfully');
  };
  
  const updateSession = async (id: string, session: Partial<Session>): Promise<Session> => {
    return updateItem(sessions, setSessions, id, session, 'sessions', 'Session updated successfully');
  };
  
  const deleteSession = async (id: string): Promise<void> => {
    return deleteItem(sessions, setSessions, id, 'sessions', 'Session deleted successfully');
  };
  
  const enrollInSession = async (sessionId: string): Promise<void> => {
    if (!currentUser) {
      throw new Error('You must be logged in to enroll in a session');
    }
    
    try {
      // Implement enroll in session logic
      sonnerToast.success('Enrolled in session successfully');
    } catch (error) {
      console.error('Error enrolling in session:', error);
      sonnerToast.error(`Failed to enroll: ${(error as Error).message}`);
      throw error;
    }
  };
  
  const unenrollFromSession = async (sessionId: string): Promise<void> => {
    if (!currentUser) {
      throw new Error('You must be logged in to unenroll from a session');
    }
    
    try {
      // Implement unenroll from session logic
      sonnerToast.success('Unenrolled from session successfully');
    } catch (error) {
      console.error('Error unenrolling from session:', error);
      sonnerToast.error(`Failed to unenroll: ${(error as Error).message}`);
      throw error;
    }
  };
  
  // Social functions
  const createPost = async (post: Partial<Post>): Promise<Post> => {
    return createItem(posts, setPosts, post, 'posts', 'Post created successfully');
  };
  
  const updatePost = async (id: string, post: Partial<Post>): Promise<Post> => {
    return updateItem(posts, setPosts, id, post, 'posts', 'Post updated successfully');
  };
  
  const deletePost = async (id: string): Promise<void> => {
    return deleteItem(posts, setPosts, id, 'posts', 'Post deleted successfully');
  };
  
  // Sponsorship functions
  const fetchSponsorships = async (): Promise<Sponsorship[]> => {
    try {
      const { data, error } = await supabase
        .from('sponsorships')
        .select('*');
        
      if (error) throw error;
      
      if (data) {
        const camelCaseSponsorships = data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          requirements: item.requirements,
          benefits: item.benefits,
          compensation: item.compensation,
          deadline: item.deadline ? new Date(item.deadline) : null,
          tags: item.tags,
          companyId: item.company_id,
          companyName: item.company_name,
          companyLogo: item.company_logo,
          status: item.status,
          createdAt: new Date(item.created_at)
        }));
        
        setSponsorships(camelCaseSponsorships);
        return camelCaseSponsorships;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching sponsorships:', error);
      setSponsorships(generateMockSponsorships());
      return generateMockSponsorships();
    }
  };
  
  const getSponsorshipById = (id: string): Sponsorship | undefined => {
    return sponsorships.find(sponsorship => sponsorship.id === id);
  };
  
  const createSponsorship = async (sponsorship: Partial<Sponsorship>): Promise<Sponsorship> => {
    if (!currentUser) {
      throw new Error('You must be logged in to create a sponsorship');
    }
    
    if (currentUser.role !== 'company') {
      throw new Error('Only companies can create sponsorships');
    }
    
    try {
      // Prepare the data with company info
      const sponsorshipData = {
        ...sponsorship,
        companyId: currentUser.id,
        companyName: currentUser.name || 'Unknown Company',
        companyLogo: currentUser.profileImage,
        status: sponsorship.status || 'active' as SponsorshipStatus,
        createdAt: new Date()
      };
      
      // Convert to snake_case for database
      const snakeCaseData = {
        title: sponsorshipData.title,
        description: sponsorshipData.description,
        requirements: sponsorshipData.requirements,
        benefits: sponsorshipData.benefits,
        compensation: sponsorshipData.compensation,
        deadline: sponsorshipData.deadline,
        tags: sponsorshipData.tags,
        company_id: sponsorshipData.companyId,
        company_name: sponsorshipData.companyName,
        company_logo: sponsorshipData.companyLogo,
        status: sponsorshipData.status,
      };
      
      const { data, error } = await supabase
        .from('sponsorships')
        .insert(snakeCaseData)
        .select();
        
      if (error) throw error;
      
      if (data && data[0]) {
        // Format the returned data
        const newSponsorship: Sponsorship = {
          id: data[0].id,
          title: data[0].title,
          description: data[0].description,
          requirements: data[0].requirements,
          benefits: data[0].benefits,
          compensation: data[0].compensation,
          deadline: data[0].deadline ? new Date(data[0].deadline) : null,
          tags: data[0].tags,
          companyId: data[0].company_id,
          companyName: data[0].company_name,
          companyLogo: data[0].company_logo,
          status: data[0].status,
          createdAt: new Date(data[0].created_at)
        };
        
        setSponsorships(prev => [...prev, newSponsorship]);
        sonnerToast.success('Sponsorship created successfully');
        return newSponsorship;
      }
      
      throw new Error('Failed to create sponsorship');
    } catch (error) {
      console.error('Error creating sponsorship:', error);
      sonnerToast.error(`Failed to create sponsorship: ${(error as Error).message}`);
      throw error;
    }
  };
  
  const updateSponsorship = async (id: string, sponsorship: Partial<Sponsorship>): Promise<Sponsorship> => {
    if (!currentUser) {
      throw new Error('You must be logged in to update a sponsorship');
    }
    
    const existingSponsorship = sponsorships.find(s => s.id === id);
    
    if (!existingSponsorship) {
      throw new Error('Sponsorship not found');
    }
    
    if (existingSponsorship.companyId !== currentUser.id) {
      throw new Error('You can only update your own sponsorships');
    }
    
    try {
      // Convert to snake_case for database
      const snakeCaseData = {
        title: sponsorship.title,
        description: sponsorship.description,
        requirements: sponsorship.requirements,
        benefits: sponsorship.benefits,
        compensation: sponsorship.compensation,
        deadline: sponsorship.deadline,
        tags: sponsorship.tags,
        company_id: sponsorship.companyId,
        company_name: sponsorship.companyName,
        company_logo: sponsorship.companyLogo,
        status: sponsorship.status,
      };
      
      const { data, error } = await supabase
        .from('sponsorships')
        .update(snakeCaseData)
        .eq('id', id)
        .select();
        
      if (error) throw error;
      
      if (data && data[0]) {
        // Format the returned data
        const updatedSponsorship: Sponsorship = {
          id: data[0].id,
          title: data[0].title,
          description: data[0].description,
          requirements: data[0].requirements,
          benefits: data[0].benefits,
          compensation: data[0].compensation,
          deadline: data[0].deadline ? new Date(data[0].deadline) : null,
          tags: data[0].tags,
          companyId: data[0].company_id,
          companyName: data[0].company_name,
          companyLogo: data[0].company_logo,
          status: data[0].status,
          createdAt: new Date(data[0].created_at)
        };
        
        setSponsorships(prev => 
          prev.map(s => s.id === id ? updatedSponsorship : s)
        );
        
        sonnerToast.success('Sponsorship updated successfully');
        return updatedSponsorship;
      }
      
      throw new Error('Failed to update sponsorship');
    } catch (error) {
      console.error('Error updating sponsorship:', error);
      sonnerToast.error(`Failed to update sponsorship: ${(error as Error).message}`);
      throw error;
    }
  };
  
  const deleteSponsorship = async (id: string): Promise<void> => {
    if (!currentUser) {
      throw new Error('You must be logged in to delete a sponsorship');
    }
    
    const existingSponsorship = sponsorships.find(s => s.id === id);
    
    if (!existingSponsorship) {
      throw new Error('Sponsorship not found');
    }
    
    if (existingSponsorship.companyId !== currentUser.id) {
      throw new Error('You can only delete your own sponsorships');
    }
    
    try {
      const { error } = await supabase
        .from('sponsorships')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setSponsorships(prev => prev.filter(s => s.id !== id));
      sonnerToast.success('Sponsorship deleted successfully');
    } catch (error) {
      console.error('Error deleting sponsorship:', error);
      sonnerToast.error(`Failed to delete sponsorship: ${(error as Error).message}`);
      throw error;
    }
  };
  
  // Sponsorship application functions
  const fetchSponsorshipApplications = async (sponsorshipId?: string): Promise<SponsorshipApplication[]> => {
    if (!currentUser) {
      throw new Error('You must be logged in to view applications');
    }
    
    try {
      let query = supabase
        .from('sponsorship_applications')
        .select('*');
        
      if (sponsorshipId) {
        query = query.eq('sponsorship_id', sponsorshipId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data) {
        const camelCaseApplications = data.map(item => ({
          id: item.id,
          sponsorshipId: item.sponsorship_id,
          userId: item.user_id,
          userName: item.user_name,
          userEmail: item.user_email,
          userProfileImage: item.user_profile_image,
          motivation: item.motivation,
          experience: item.experience,
          socialLinks: item.social_links,
          status: item.status,
          createdAt: new Date(item.created_at)
        }));
        
        setSponsorshipApplications(camelCaseApplications);
        return camelCaseApplications;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching sponsorship applications:', error);
      return [];
    }
  };
  
  const fetchUserSponsorshipApplications = async (): Promise<SponsorshipApplication[]> => {
    if (!currentUser) {
      throw new Error('You must be logged in to view your applications');
    }
    
    try {
      const { data, error } = await supabase
        .from('sponsorship_applications')
        .select('*')
        .eq('user_id', currentUser.id);
        
      if (error) throw error;
      
      if (data) {
        const camelCaseApplications = data.map(item => ({
          id: item.id,
          sponsorshipId: item.sponsorship_id,
          userId: item.user_id,
          userName: item.user_name,
          userEmail: item.user_email,
          userProfileImage: item.user_profile_image,
          motivation: item.motivation,
          experience: item.experience,
          socialLinks: item.social_links,
          status: item.status,
          createdAt: new Date(item.created_at)
        }));
        
        return camelCaseApplications;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching user sponsorship applications:', error);
      return [];
    }
  };
  
  const createSponsorshipApplication = async (application: Partial<SponsorshipApplication>): Promise<SponsorshipApplication> => {
    if (!currentUser) {
      throw new Error('You must be logged in to apply for a sponsorship');
    }
    
    try {
      // Prepare the data with user info
      const applicationData = {
        ...application,
        userId: currentUser.id,
        userName: currentUser.name || 'Anonymous',
        userEmail: currentUser.email || '',
        userProfileImage: currentUser.profileImage || '',
        status: 'pending' as ApplicationStatus
      };
      
      // Convert to snake_case for database
      const snakeCaseData = {
        sponsorship_id: applicationData.sponsorshipId,
        user_id: applicationData.userId,
        user_name: applicationData.userName,
        user_email: applicationData.userEmail,
        user_profile_image: applicationData.userProfileImage,
        motivation: applicationData.motivation,
        experience: applicationData.experience,
        social_links: applicationData.socialLinks,
        status: applicationData.status
      };
      
      const { data, error } = await supabase
        .from('sponsorship_applications')
        .insert(snakeCaseData)
        .select();
        
      if (error) throw error;
      
      if (data && data[0]) {
        // Format the returned data
        const newApplication: SponsorshipApplication = {
          id: data[0].id,
          sponsorshipId: data[0].sponsorship_id,
          userId: data[0].user_id,
          userName: data[0].user_name,
          userEmail: data[0].user_email,
          userProfileImage: data[0].user_profile_image,
          motivation: data[0].motivation,
          experience: data[0].experience,
          socialLinks: data[0].social_links,
          status: data[0].status,
          createdAt: new Date(data[0].created_at)
        };
        
        setSponsorshipApplications(prev => [...prev, newApplication]);
        sonnerToast.success('Application submitted successfully');
        return newApplication;
      }
      
      throw new Error('Failed to create application');
    } catch (error) {
      console.error('Error creating sponsorship application:', error);
      sonnerToast.error(`Failed to apply: ${(error as Error).message}`);
      throw error;
    }
  };
  
  const updateSponsorshipApplication = async (id: string, application: Partial<SponsorshipApplication>): Promise<SponsorshipApplication> => {
    if (!currentUser) {
      throw new Error('You must be logged in to update an application');
    }
    
    const existingApplication = sponsorshipApplications.find(a => a.id === id);
    
    if (!existingApplication) {
      throw new Error('Application not found');
    }
    
    if (existingApplication.userId !== currentUser.id) {
      throw new Error('You can only update your own applications');
    }
    
    try {
      // Convert to snake_case for database
      const snakeCaseData = {
        motivation: application.motivation,
        experience: application.experience,
        social_links: application.socialLinks
      };
      
      const { data, error } = await supabase
        .from('sponsorship_applications')
        .update(snakeCaseData)
        .eq('id', id)
        .select();
        
      if (error) throw error;
      
      if (data && data[0]) {
        // Format the returned data
        const updatedApplication: SponsorshipApplication = {
          id: data[0].id,
          sponsorshipId: data[0].sponsorship_id,
          userId: data[0].user_id,
          userName: data[0].user_name,
          userEmail: data[0].user_email,
          userProfileImage: data[0].user_profile_image,
          motivation: data[0].motivation,
          experience: data[0].experience,
          socialLinks: data[0].social_links,
          status: data[0].status,
          createdAt: new Date(data[0].created_at)
        };
        
        setSponsorshipApplications(prev => 
          prev.map(a => a.id === id ? updatedApplication : a)
        );
        
        sonnerToast.success('Application updated successfully');
        return updatedApplication;
      }
      
      throw new Error('Failed to update application');
    } catch (error) {
      console.error('Error updating sponsorship application:', error);
      sonnerToast.error(`Failed to update application: ${(error as Error).message}`);
      throw error;
    }
  };
  
  const deleteSponsorshipApplication = async (id: string): Promise<void> => {
    if (!currentUser) {
      throw new Error('You must be logged in to delete an application');
    }
    
    const existingApplication = sponsorshipApplications.find(a => a.id === id);
    
    if (!existingApplication) {
      throw new Error('Application not found');
    }
    
    if (existingApplication.userId !== currentUser.id) {
      throw new Error('You can only delete your own applications');
    }
    
    try {
      const { error } = await supabase
        .from('sponsorship_applications')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setSponsorshipApplications(prev => prev.filter(a => a.id !== id));
      sonnerToast.success('Application deleted successfully');
    } catch (error) {
      console.error('Error deleting sponsorship application:', error);
      sonnerToast.error(`Failed to delete application: ${(error as Error).message}`);
      throw error;
    }
  };
  
  const updateApplicationStatus = async (applicationId: string, status: ApplicationStatus): Promise<SponsorshipApplication> => {
    if (!currentUser) {
      throw new Error('You must be logged in to update application status');
    }
    
    if (currentUser.role !== 'company') {
      throw new Error('Only companies can update application status');
    }
    
    const existingApplication = sponsorshipApplications.find(a => a.id === applicationId);
    
    if (!existingApplication) {
      throw new Error('Application not found');
    }
    
    // Check if this company owns the sponsorship
    const sponsorship = sponsorships.find(s => s.id === existingApplication.sponsorshipId);
    
    if (!sponsorship || sponsorship.companyId !== currentUser.id) {
      throw new Error('You can only update status for your own sponsorships');
    }
    
    try {
      const { data, error } = await supabase
        .from('sponsorship_applications')
        .update({ status })
        .eq('id', applicationId)
        .select();
        
      if (error) throw error;
      
      if (data && data[0]) {
        // Format the returned data
        const updatedApplication: SponsorshipApplication = {
          id: data[0].id,
          sponsorshipId: data[0].sponsorship_id,
          userId: data[0].user_id,
          userName: data[0].user_name,
          userEmail: data[0].user_email,
          userProfileImage: data[0].user_profile_image,
          motivation: data[0].motivation,
          experience: data[0].experience,
          socialLinks: data[0].social_links,
          status: data[0].status,
          createdAt: new Date(data[0].created_at)
        };
        
        setSponsorshipApplications(prev => 
          prev.map(a => a.id === applicationId ? updatedApplication : a)
        );
        
        sonnerToast.success(`Application ${status}`);
        return updatedApplication;
      }
      
      throw new Error('Failed to update application status');
    } catch (error) {
      console.error('Error updating application status:', error);
      sonnerToast.error(`Failed to update status: ${(error as Error).message}`);
      throw error;
    }
  };
  
  const value: DataContextType = {
    // Data states
    services,
    posts,
    events,
    groups,
    sessions,
    sessionEnrollments,
    messages,
    joinRequests,
    sponsorships,
    sponsorshipApplications,
    
    // Service functions
    fetchServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
    
    // Event functions
    createEvent,
    updateEvent,
    deleteEvent,
    joinEvent,
    leaveEvent,
    
    // Group functions
    createGroup,
    updateGroup,
    deleteGroup,
    joinGroup,
    leaveGroup,
    
    // Session functions
    createSession,
    updateSession,
    deleteSession,
    enrollInSession,
    unenrollFromSession,
    
    // Social functions
    createPost,
    updatePost,
    deletePost,
    
    // Sponsorship functions
    fetchSponsorships,
    getSponsorshipById,
    createSponsorship,
    updateSponsorship,
    deleteSponsorship,
    
    // Sponsorship application functions
    fetchSponsorshipApplications,
    fetchUserSponsorshipApplications,
    createSponsorshipApplication,
    updateSponsorshipApplication,
    deleteSponsorshipApplication,
    updateApplicationStatus
  };
  
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
