import React, { createContext, useState, useContext, useEffect } from 'react';
import { Post, Event, Group, Service, Message, JoinRequest, GroupPrivacy, EventPrivacy, UserRole, Session, SessionEnrollment, SessionType, SessionStatus, PaymentStatus } from '@/types';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

interface DataContextType {
  posts: Post[];
  events: Event[];
  groups: Group[];
  services: Service[];
  messages: Message[];
  joinRequests: JoinRequest[];
  sessions: Session[];
  sessionEnrollments: SessionEnrollment[];
  loading: boolean;
  createPost: (post: Omit<Post, 'id' | 'createdAt'>) => Promise<Post>;
  createEvent: (event: Omit<Event, 'id' | 'createdAt' | 'attendees' | 'pendingRequests'>) => Promise<Event>;
  createGroup: (group: Omit<Group, 'id' | 'createdAt' | 'members' | 'pendingRequests'>) => Promise<Group>;
  createService: (service: Omit<Service, 'id' | 'createdAt'>) => Promise<Service>;
  createSession: (session: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Session>;
  updateSession: (sessionId: string, sessionData: Partial<Session>) => Promise<Session>;
  enrollInSession: (sessionId: string) => Promise<SessionEnrollment>;
  cancelEnrollment: (enrollmentId: string) => Promise<void>;
  updateEnrollmentStatus: (enrollmentId: string, status: SessionStatus) => Promise<void>;
  getUserSessions: (userId: string) => Session[];
  getCoachSessions: (coachId: string) => Session[];
  getSessionEnrollments: (sessionId: string) => SessionEnrollment[];
  getUserEnrollments: (userId: string) => SessionEnrollment[];
  likePost: (postId: string) => Promise<void>;
  sendMessage: (message: Omit<Message, 'id' | 'createdAt'>) => Promise<Message>;
  getGroupMessages: (groupId: string) => Message[];
  joinGroup: (groupId: string) => Promise<boolean>;
  leaveGroup: (groupId: string) => Promise<void>;
  requestToJoinGroup: (groupId: string) => Promise<void>;
  handleJoinRequest: (requestId: string, status: 'approved' | 'rejected') => Promise<void>;
  getGroupRequests: (groupId: string) => JoinRequest[];
  joinEvent: (eventId: string) => Promise<boolean>;
  leaveEvent: (eventId: string) => Promise<void>;
  requestToJoinEvent: (eventId: string) => Promise<void>;
  handleEventJoinRequest: (requestId: string, status: 'approved' | 'rejected') => Promise<void>;
  getEventRequests: (eventId: string) => JoinRequest[];
  removeGroupMember: (groupId: string, userId: string) => Promise<void>;
  updateGroupDetails: (groupId: string, groupData: Partial<Group>) => Promise<void>;
}

const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    userId: '2',
    userName: 'Sophia Williams',
    userRole: 'influencer',
    userProfileImage: 'https://randomuser.me/api/portraits/women/68.jpg',
    content: 'Just finished my morning HIIT session! Who else loves to start their day with a high-intensity workout? 💪 #morningworkout #fitnessmotivation',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
    likes: 342,
    comments: 45,
    createdAt: new Date('2023-09-18T08:30:00')
  },
  {
    id: 'p2',
    userId: '3',
    userName: 'Alexandra Chen',
    userRole: 'coach',
    userProfileImage: 'https://randomuser.me/api/portraits/women/33.jpg',
    content: "New strength program dropping next week! Perfect for beginners wanting to build a solid foundation. Who's in? 📝 #strengthtraining #womenlifting",
    likes: 128,
    comments: 23,
    createdAt: new Date('2023-09-17T14:45:00')
  },
  {
    id: 'p3',
    userId: '4',
    userName: 'FitTech Apparel',
    userRole: 'company',
    userProfileImage: 'https://via.placeholder.com/150?text=FT',
    content: 'Our new performance leggings are finally here! Designed with sweat-wicking technology and a high-rise waistband for maximum comfort during your toughest workouts.',
    image: 'https://images.unsplash.com/photo-1506292926-9e0b21854fd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=826&q=80',
    likes: 215,
    comments: 31,
    createdAt: new Date('2023-09-16T11:20:00')
  }
];

const MOCK_EVENTS: Event[] = [
  {
    id: 'e1',
    title: 'Summer Bootcamp Challenge',
    description: 'Join us for a 4-week intensive bootcamp designed to push your limits and transform your fitness! All levels welcome.',
    creatorId: '3',
    creatorName: 'Alexandra Chen',
    creatorRole: 'coach',
    location: 'Millennium Park, Chicago',
    date: new Date('2023-10-02T09:00:00'),
    image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=775&q=80',
    attendees: ['3', '4', '5'], // Changed from number to string array
    privacy: 'public',
    createdAt: new Date('2023-08-15')
  },
  {
    id: 'e2',
    title: 'Yoga & Mindfulness Retreat',
    description: 'A weekend escape to restore balance to your body and mind. Includes yoga sessions, meditation, and healthy meals.',
    creatorId: '2',
    creatorName: 'Sophia Williams',
    creatorRole: 'influencer',
    location: 'Serenity Retreat Center, Malibu',
    date: new Date('2023-11-10T16:00:00'),
    image: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
    attendees: ['1', '2', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28'], // Changed
    privacy: 'private',
    pendingRequests: 3,
    createdAt: new Date('2023-09-01')
  },
  {
    id: 'e3',
    title: 'FitTech Launch Party',
    description: 'Be the first to experience our new collection of performance wear! Includes DJ, healthy snacks, and exclusive discounts.',
    creatorId: '4',
    creatorName: 'FitTech Apparel',
    creatorRole: 'company',
    location: 'FitTech Flagship Store, NYC',
    date: new Date('2023-10-15T18:00:00'),
    image: 'https://images.unsplash.com/photo-1543165796-35a3418c27df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    attendees: Array.from({ length: 120 }, (_, i) => `attendee-${i + 1}`), // Convert to string array
    privacy: 'paid',
    price: 49.99,
    createdAt: new Date('2023-09-10')
  }
];

const MOCK_SERVICES: Service[] = [
  {
    id: 's1',
    title: '1:1 Strength Coaching',
    description: 'Personalized strength training sessions tailored to your goals and fitness level.',
    providerId: '3',
    providerName: 'Alexandra Chen',
    price: 75,
    duration: '60 min',
    available: true,
    createdAt: new Date('2023-03-15')
  },
  {
    id: 's2',
    title: 'Nutrition Consultation',
    description: 'Comprehensive assessment of your current diet with personalized recommendations for your fitness goals.',
    providerId: '3',
    providerName: 'Alexandra Chen',
    price: 100,
    duration: '90 min',
    available: true,
    createdAt: new Date('2023-05-20')
  },
  {
    id: 's3',
    title: 'Online Coaching (Monthly)',
    description: 'Full month of programming, check-ins, and support to help you reach your fitness goals.',
    providerId: '2',
    providerName: 'Sophia Williams',
    price: 250,
    duration: '30 days',
    available: true,
    createdAt: new Date('2023-01-10')
  }
];

const MOCK_MESSAGES: Message[] = [
  {
    id: 'm1',
    groupId: 'g2',
    userId: '2',
    userName: 'Sophia Williams',
    userRole: 'influencer',
    userProfileImage: 'https://randomuser.me/api/portraits/women/68.jpg',
    content: "Welcome everyone to our Mindful Movers group! I'm excited to share this journey with all of you.",
    createdAt: new Date('2023-04-22T14:30:00')
  },
  {
    id: 'm2',
    groupId: 'g2',
    userId: '1',
    userName: 'Emma Johnson',
    userRole: 'user',
    userProfileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    content: "Thanks for creating this group! I've been practicing yoga for years but want to explore pilates more.",
    createdAt: new Date('2023-04-22T15:45:00')
  },
  {
    id: 'm3',
    groupId: 'g2',
    userId: '2',
    userName: 'Sophia Williams',
    userRole: 'influencer',
    userProfileImage: 'https://randomuser.me/api/portraits/women/68.jpg',
    content: "That's great Emma! I'll be sharing some beginner pilates sequences later this week. Stay tuned!",
    createdAt: new Date('2023-04-22T16:20:00')
  },
  {
    id: 'm4',
    groupId: 'g1',
    userId: '3',
    userName: 'Alexandra Chen',
    userRole: 'coach',
    userProfileImage: 'https://randomuser.me/api/portraits/women/33.jpg',
    content: "Hey Strength Queens! Who's hitting the weights today? Share your workouts below!",
    createdAt: new Date('2023-02-10T09:15:00')
  }
];

const MOCK_JOIN_REQUESTS: JoinRequest[] = [
  {
    id: 'jr1',
    groupId: 'g3',
    userId: '1',
    userName: 'Emma Johnson',
    userProfileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    status: 'pending',
    createdAt: new Date('2023-08-15T10:30:00')
  },
  {
    id: 'jr2',
    groupId: 'g3',
    userId: '4',
    userName: 'FitTech Apparel',
    userProfileImage: 'https://via.placeholder.com/150?text=FT',
    status: 'pending',
    createdAt: new Date('2023-08-16T14:45:00')
  },
  {
    id: 'jr3',
    eventId: 'e2',
    userId: '1',
    userName: 'Emma Johnson',
    userProfileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    status: 'pending',
    createdAt: new Date('2023-09-05T09:15:00')
  },
  {
    id: 'jr4',
    eventId: 'e2',
    userId: '4',
    userName: 'FitTech Apparel',
    userProfileImage: 'https://via.placeholder.com/150?text=FT',
    status: 'pending',
    createdAt: new Date('2023-09-07T11:30:00')
  }
];

const MOCK_SESSIONS: Session[] = [
  {
    id: 'sess1',
    title: 'Strength Training Fundamentals',
    description: 'Learn proper form and techniques for key strength exercises.',
    coachId: '3',
    coachName: 'Alexandra Chen',
    sessionType: 'group',
    capacity: 10,
    price: 30,
    duration: '60 min',
    location: 'Fitness Studio, Downtown',
    isOnline: false,
    isActive: true,
    createdAt: new Date('2023-06-10'),
    updatedAt: new Date('2023-06-10')
  },
  {
    id: 'sess2',
    title: 'Personal Training Session',
    description: 'One-on-one training tailored to your specific fitness goals.',
    coachId: '3',
    coachName: 'Alexandra Chen',
    sessionType: 'one_on_one',
    price: 75,
    duration: '45 min',
    isOnline: false,
    location: 'Fitness Studio, Downtown',
    isActive: true,
    createdAt: new Date('2023-07-15'),
    updatedAt: new Date('2023-07-15')
  },
  {
    id: 'sess3',
    title: 'Virtual HIIT Workout',
    description: 'High-intensity interval training session conducted via Zoom.',
    coachId: '2',
    coachName: 'Sophia Williams',
    sessionType: 'group',
    capacity: 20,
    price: 15,
    duration: '30 min',
    isOnline: true,
    meetingUrl: 'https://zoom.us/j/example',
    isActive: true,
    createdAt: new Date('2023-05-22'),
    updatedAt: new Date('2023-05-22')
  }
];

const MOCK_SESSION_ENROLLMENTS: SessionEnrollment[] = [
  {
    id: 'enroll1',
    sessionId: 'sess1',
    userId: '1',
    userName: 'Emma Johnson',
    userEmail: 'emma@example.com',
    userProfileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    status: 'approved',
    paymentStatus: 'paid',
    createdAt: new Date('2023-08-20')
  },
  {
    id: 'enroll2',
    sessionId: 'sess2',
    userId: '1',
    userName: 'Emma Johnson',
    userEmail: 'emma@example.com',
    userProfileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    status: 'pending',
    paymentStatus: 'unpaid',
    createdAt: new Date('2023-09-01')
  }
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [groups, setGroups] = useState<Group[]>([]);
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>(MOCK_JOIN_REQUESTS);
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);
  const [sessionEnrollments, setSessionEnrollments] = useState<SessionEnrollment[]>(MOCK_SESSION_ENROLLMENTS);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('groups').select('*');
        
        if (error) {
          console.error('Error fetching groups:', error);
          toast({
            title: "Error fetching groups",
            description: error.message,
            variant: "destructive"
          });
        } else if (data) {
          const formattedGroups: Group[] = data.map(group => ({
            id: group.id,
            name: group.name,
            description: group.description,
            creatorId: group.creator_id,
            creatorName: group.creator_name,
            creatorRole: group.creator_role as UserRole, // Cast to UserRole
            members: group.members,
            privacy: group.privacy as GroupPrivacy,
            price: group.price || undefined,
            image: group.image || undefined,
            createdAt: new Date(group.created_at),
            rules: group.rules || [],
            memberLimit: group.member_limit,
            pendingRequests: group.pending_requests
          }));
          
          setGroups(formattedGroups);
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) setLoading(false);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, [loading]);

  const createPost = async (postData: Omit<Post, 'id' | 'createdAt'>) => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newPost: Post = {
        ...postData,
        id: `p${Date.now()}`,
        createdAt: new Date()
      };
      
      setPosts(prev => [newPost, ...prev]);
      return newPost;
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'attendees' | 'pendingRequests'>) => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newEvent: Event = {
        ...eventData,
        id: `e${Date.now()}`,
        attendees: [], // Initialize as empty array
        pendingRequests: 0,
        createdAt: new Date()
      };
      
      setEvents(prev => [newEvent, ...prev]);
      return newEvent;
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (groupData: Omit<Group, 'id' | 'createdAt' | 'members' | 'pendingRequests'>) => {
    setLoading(true);
    
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to create a group');
      }
      
      const supabaseGroupData = {
        name: groupData.name,
        description: groupData.description,
        creator_id: currentUser.id,
        creator_name: currentUser.name,
        creator_role: currentUser.role,
        privacy: groupData.privacy,
        price: groupData.privacy === 'paid' ? groupData.price : null,
        image: groupData.image,
        rules: groupData.rules,
        member_limit: groupData.memberLimit
      };
      
      const { data, error } = await supabase
        .from('groups')
        .insert(supabaseGroupData)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating group:', error);
        throw new Error(error.message);
      }
      
      if (!data) {
        throw new Error('Failed to create group');
      }
      
      const memberData = {
        group_id: data.id,
        user_id: currentUser.id
      };
      
      await supabase.from('group_members').insert(memberData);
      
      const newGroup: Group = {
        id: data.id,
        name: data.name,
        description: data.description,
        creatorId: data.creator_id,
        creatorName: data.creator_name,
        creatorRole: data.creator_role as UserRole, // Cast to UserRole
        members: data.members,
        privacy: data.privacy as GroupPrivacy,
        price: data.price || undefined,
        image: data.image || undefined,
        createdAt: new Date(data.created_at),
        rules: data.rules || [],
        memberLimit: data.member_limit,
        pendingRequests: 0
      };
      
      setGroups(prev => [newGroup, ...prev]);
      
      return newGroup;
    } catch (error: any) {
      console.error('Error in createGroup:', error);
      toast({
        title: "Error creating group",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createService = async (serviceData: Omit<Service, 'id' | 'createdAt'>) => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newService: Service = {
        ...serviceData,
        id: `s${Date.now()}`,
        createdAt: new Date()
      };
      
      setServices(prev => [newService, ...prev]);
      return newService;
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to create a session');
      }
      
      if (currentUser.role !== 'coach') {
        throw new Error('Only coaches can create sessions');
      }
      
      const sessionFormData: any = {
        title: sessionData.title,
        description: sessionData.description,
        coach_id: currentUser.id,
        coach_name: currentUser.name,
        session_type: sessionData.sessionType,
        capacity: sessionData.capacity,
        price: sessionData.price,
        duration: sessionData.duration,
        start_time: sessionData.startTime?.toISOString(),
        location: sessionData.location,
        is_online: sessionData.isOnline,
        meeting_url: sessionData.meetingUrl,
        is_active: sessionData.isActive
      };
      
      const { data, error } = await supabase
        .from('sessions')
        .insert(sessionFormData)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating session:', error);
        throw new Error(error.message);
      }
      
      if (!data) {
        throw new Error('Failed to create session');
      }
      
      const newSession: Session = {
        id: data.id,
        title: data.title,
        description: data.description,
        coachId: data.coach_id,
        coachName: data.coach_name,
        sessionType: data.session_type as SessionType,
        capacity: data.capacity,
        price: data.price,
        duration: data.duration,
        startTime: data.start_time ? new Date(data.start_time) : undefined,
        location: data.location,
        isOnline: data.is_online,
        meetingUrl: data.meeting_url,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
      
      setSessions(prev => [newSession, ...prev]);
      
      return newSession;
    } catch (error: any) {
      console.error('Error in createSession:', error);
      toast({
        title: "Error creating session",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSession = async (sessionId: string, sessionData: Partial<Session>) => {
    setLoading(true);
    
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to update a session');
      }
      
      const existingSession = sessions.find(s => s.id === sessionId);
      if (!existingSession) {
        throw new Error('Session not found');
      }
      
      if (existingSession.coachId !== currentUser.id) {
        throw new Error('You can only update your own sessions');
      }
      
      const supabaseSessionData: any = {};
      
      if (sessionData.title !== undefined) supabaseSessionData.title = sessionData.title;
      if (sessionData.description !== undefined) supabaseSessionData.description = sessionData.description;
      if (sessionData.sessionType !== undefined) supabaseSessionData.session_type = sessionData.sessionType;
      if (sessionData.capacity !== undefined) supabaseSessionData.capacity = sessionData.capacity;
      if (sessionData.price !== undefined) supabaseSessionData.price = sessionData.price;
      if (sessionData.duration !== undefined) supabaseSessionData.duration = sessionData.duration;
      if (sessionData.startTime !== undefined) supabaseSessionData.start_time = sessionData.startTime?.toISOString();
      if (sessionData.location !== undefined) supabaseSessionData.location = sessionData.location;
      if (sessionData.isOnline !== undefined) supabaseSessionData.is_online = sessionData.isOnline;
      if (sessionData.meetingUrl !== undefined) supabaseSessionData.meeting_url = sessionData.meetingUrl;
      if (sessionData.isActive !== undefined) supabaseSessionData.is_active = sessionData.isActive;
      
      supabaseSessionData.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('sessions')
        .update(supabaseSessionData)
        .eq('id', sessionId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating session:', error);
        throw new Error(error.message);
      }
      
      if (!data) {
        throw new Error('Failed to update session');
      }
      
      const updatedSession: Session = {
        id: data.id,
        title: data.title,
        description: data.description,
        coachId: data.coach_id,
        coachName: data.coach_name,
        sessionType: data.session_type as SessionType,
        capacity: data.capacity,
        price: data.price,
        duration: data.duration,
        startTime: data.start_time ? new Date(data.start_time) : undefined,
        location: data.location,
        isOnline: data.is_online,
        meetingUrl: data.meeting_url,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
      
      setSessions(prev => 
        prev.map(s => s.id === sessionId ? updatedSession : s)
      );
      
      return updatedSession;
    } catch (error: any) {
      console.error('Error in updateSession:', error);
      toast({
        title: "Error updating session",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const enrollInSession = async (sessionId: string) => {
    setLoading(true);
    
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to enroll in a session');
      }
      
      const session = sessions.find(s => s.id === sessionId);
      if (!session) {
        throw new Error('Session not found');
      }
      
      if (!session.isActive) {
        throw new Error('This session is not currently active');
      }
      
      if (session.sessionType === 'group' && session.capacity !== undefined) {
        const currentEnrollments = sessionEnrollments.filter(e => 
          e.sessionId === sessionId && e.status !== 'rejected'
        ).length;
        
        if (currentEnrollments >= session.capacity) {
          throw new Error('This session is at full capacity');
        }
      }
      
      // Check if user is already enrolled
      const existingEnrollment = sessionEnrollments.find(e => 
        e.sessionId === sessionId && e.userId === currentUser.id
      );
      
      if (existingEnrollment) {
        throw new Error('You are already enrolled in this session');
      }
      
      const enrollmentData: any = {
        session_id: sessionId,
        user_id: currentUser.id,
        user_name: currentUser.name,
        user_email: currentUser.email,
        user_profile_image: currentUser.profileImage,
        status: 'pending',
        payment_status: 'unpaid'
      };
      
      const { data, error } = await supabase
        .from('session_enrollments')
        .insert(enrollmentData)
        .select()
        .single();
      
      if (error) {
        console.error('Error enrolling in session:', error);
        throw new Error(error.message);
      }
      
      if (!data) {
        throw new Error('Failed to enroll in session');
      }
      
      const newEnrollment: SessionEnrollment = {
        id: data.id,
        sessionId: data.session_id,
        userId: data.user_id,
        userName: data.user_name,
        userEmail: data.user_email,
        userProfileImage: data.user_profile_image,
        status: data.status as SessionStatus,
        paymentStatus: data.payment_status as PaymentStatus,
        createdAt: new Date(data.created_at)
      };
      
      setSessionEnrollments(prev => [...prev, newEnrollment]);
      
      toast({
        title: session.sessionType === 'one_on_one' ? "Request sent" : "Enrollment successful",
        description: session.sessionType === 'one_on_one' 
          ? "Your request for a one-on-one session has been sent to the coach" 
          : "You have successfully enrolled in the group session",
      });
      
      return newEnrollment;
    } catch (error: any) {
      console.error('Error enrolling in session:', error);
      toast({
        title: "Enrollment failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cancelEnrollment = async (enrollmentId: string) => {
    setLoading(true);
    
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to cancel an enrollment');
      }
      
      const enrollment = sessionEnrollments.find(e => e.id === enrollmentId);
      if (!enrollment) {
        throw new Error('Enrollment not found');
      }
      
      if (enrollment.userId !== currentUser.id && !sessions.some(s => 
        s.id === enrollment.sessionId && s.coachId === currentUser.id
      )) {
        throw new Error('You can only cancel your own enrollments or enrollments for your sessions');
      }
      
      const { error } = await supabase
        .from('session_enrollments')
        .delete()
        .eq('id', enrollmentId);
      
      if (error) {
        console.error('Error canceling enrollment:', error);
        throw new Error(error.message);
      }
      
      setSessionEnrollments(prev => 
        prev.filter(e => e.id !== enrollmentId)
      );
      
      toast({
        title: "Enrollment canceled",
        description: "Your enrollment has been successfully canceled",
      });
    } catch (error: any) {
      console.error('Error canceling enrollment:', error);
      toast({
        title: "Cancellation failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateEnrollmentStatus = async (enrollmentId: string, status: SessionStatus) => {
    setLoading(true);
    
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to update an enrollment');
      }
      
      const enrollment = sessionEnrollments.find(e => e.id === enrollmentId);
      if (!enrollment) {
        throw new Error('Enrollment not found');
      }
      
      const session = sessions.find(s => s.id === enrollment.sessionId);
      if (!session || session.coachId !== currentUser.id) {
        throw new Error('You can only update enrollments for your own sessions');
      }
      
      const { data, error } = await supabase
        .from('session_enrollments')
        .update({ status })
        .eq('id', enrollmentId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating enrollment status:', error);
        throw new Error(error.message);
      }
      
      if (!data) {
        throw new Error('Failed to update enrollment status');
      }
      
      const updatedEnrollment: SessionEnrollment = {
        id: data.id,
        sessionId: data.session_id,
        userId: data.user_id,
        userName: data.user_name,
        userEmail: data.user_email,
        userProfileImage: data.user_profile_image,
        status: data.status as SessionStatus,
        paymentStatus: data.payment_status as PaymentStatus,
        createdAt: new Date(data.created_at)
      };
      
      setSessionEnrollments(prev => 
        prev.map(e => e.id === enrollmentId ? updatedEnrollment : e)
      );
      
      toast({
        title: `Enrollment ${status}`,
        description: `The enrollment has been marked as ${status}`,
      });
    } catch (error: any) {
      console.error('Error updating enrollment status:', error);
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getUserSessions = (userId: string) => {
    return sessions.filter(session => {
      const userEnrollments = sessionEnrollments.filter(e => 
        e.userId === userId && e.sessionId === session.id && e.status === 'approved'
      );
      return userEnrollments.length > 0;
    });
  };

  const getCoachSessions = (coachId: string) => {
    return sessions.filter(session => session.coachId === coachId);
  };

  const getSessionEnrollments = (sessionId: string) => {
    return sessionEnrollments.filter(enrollment => enrollment.sessionId === sessionId);
  };

  const getUserEnrollments = (userId: string) => {
    return sessionEnrollments.filter(enrollment => enrollment.userId === userId);
  };

  const likePost = async (postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes + 1 } 
          : post
      )
    );
    
    await new Promise(resolve => setTimeout(resolve, 300));
  };

  const sendMessage = async (messageData: Omit<Message, 'id' | 'createdAt'>) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to send a message');
      }

      const supabaseMessageData = {
        content: messageData.content,
        group_id: messageData.groupId,
        user_id: currentUser.id,
        user_name: currentUser.name,
        user_role: currentUser.role,
        user_profile_image: currentUser.profileImage,
        media_url: messageData.mediaUrl || null,
        media_type: messageData.mediaType || null,
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('messages')
        .insert(supabaseMessageData)
        .select()
        .single();
      
      if (error) {
        console.error('Error sending message:', error);
        throw new Error(error.message);
      }
      
      if (!data) {
        throw new Error('Failed to send message');
      }
      
      const newMessage: Message = {
        id: data.id,
        groupId: data.group_id,
        userId: data.user_id,
        userName: data.user_name,
        userRole: data.user_role as UserRole,
        userProfileImage: data.user_profile_image,
        content: data.content,
        mediaUrl: data.media_url,
        mediaType: data.media_type as 'image' | 'video' | 'file' | undefined,
        createdAt: new Date(data.created_at)
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      return newMessage;
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const getGroupMessages = (groupId: string) => {
    return messages.filter(message => message.groupId === groupId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  };

  const joinGroup = async (groupId: string) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to join this group",
        variant: "destructive"
      });
      return false;
    }

    const group = groups.find(g => g.id === groupId);
    if (!group) return false;

    if (group.privacy === 'paid') {
      toast({
        title: "Paid membership required",
        description: `This group requires a payment of $${group.price}/month to join`,
      });
      return false;
    }

    if (group.privacy === 'public') {
      try {
        const { data: existingMember, error: checkError } = await supabase
          .from('group_members')
          .select('id')
          .eq('group_id', groupId)
          .eq('user_id', currentUser.id)
          .single();
        
        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Error checking group membership:', checkError);
          toast({
            title: "Error joining group",
            description: checkError.message,
            variant: "destructive"
          });
          return false;
        }
        
        if (existingMember) {
          toast({
            title: "Already a member",
            description: `You are already a member of ${group.name}`,
          });
          return true;
        }
        
        const memberData = {
          group_id: groupId,
          user_id: currentUser.id
        };
        
        const { error } = await supabase.from('group_members').insert(memberData);
        
        if (error) {
          console.error('Error joining group:', error);
          toast({
            title: "Error joining group",
            description: error.message,
            variant: "destructive"
          });
          return false;
        }
        
        const { error: updateError } = await supabase
          .from('groups')
          .update({ members: group.members + 1 })
          .eq('id', groupId);
        
        if (updateError) {
          console.error('Error updating group members count:', updateError);
        }
        
        setGroups(prevGroups => 
          prevGroups.map(g => 
            g.id === groupId ? { ...g, members: g.members + 1 } : g
          )
        );
        
        toast({
          title: "Success!",
          description: `You've joined ${group.name}`,
        });
        
        return true;
      } catch (error: any) {
        console.error('Error joining group:', error);
        toast({
          title: "Error joining group",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }
    }

    return false;
  };

  const leaveGroup = async (groupId: string) => {
    if (!currentUser) return;

    try {
      const group = groups.find(g => g.id === groupId);
      if (!group) return;
      
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', currentUser.id);
      
      if (error) {
        console.error('Error leaving group:', error);
        toast({
          title: "Error leaving group",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      const { error: updateError } = await supabase
        .from('groups')
        .update({ members: Math.max(group.members - 1, 0) })
        .eq('id', groupId);
      
      if (updateError) {
        console.error('Error updating group members count:', updateError);
      }
      
      setGroups(prevGroups => 
        prevGroups.map(g => 
          g.id === groupId ? { ...g, members: Math.max(g.members - 1, 0) } : g
        )
      );
      
      toast({
        title: "You left the group",
        description: "You can rejoin at any time",
      });
    } catch (error: any) {
      console.error('Error leaving group:', error);
      toast({
        title: "Error leaving group",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const requestToJoinGroup = async (groupId: string) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to request joining this group",
        variant: "destructive"
      });
      return;
    }

    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    try {
      const requestData = {
        group_id: groupId,
        user_id: currentUser.id,
        user_name: currentUser.name,
        user_profile_image: currentUser.profileImage,
        status: 'pending'
      };
      
      const { data, error } = await supabase
        .from('join_requests')
        .insert(requestData)
        .select()
        .single();
      
      if (error) {
        console.error('Error requesting to join group:', error);
        toast({
          title: "Error requesting to join group",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      const { error: updateError } = await supabase
        .from('groups')
        .update({ pending_requests: (group.pendingRequests || 0) + 1 })
        .eq('id', groupId);
      
      if (updateError) {
        console.error('Error updating group pending requests count:', updateError);
      }
      
      const newRequest: JoinRequest = {
        id: data.id,
        groupId,
        userId: data.user_id,
        userName: data.user_name,
        userProfileImage: data.user_profile_image,
        status: 'pending',
        createdAt: new Date(data.created_at)
      };
      
      setJoinRequests(prev => [...prev, newRequest]);
      
      setGroups(prevGroups => 
        prevGroups.map(g => 
          g.id === groupId ? { ...g, pendingRequests: (g.pendingRequests || 0) + 1 } : g
        )
      );
      
      toast({
        title: "Request sent",
        description: "Your request to join this group is pending approval",
      });
    } catch (error: any) {
      console.error('Error requesting to join group:', error);
      toast({
        title: "Error requesting to join group",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleJoinRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    const request = joinRequests.find(r => r.id === requestId);
    if (!request) return;

    try {
      const { error } = await supabase
        .from('join_requests')
        .update({ status })
        .eq('id', requestId);
      
      if (error) {
        console.error('Error handling join request:', error);
        toast({
          title: "Error handling join request",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      setJoinRequests(prev => 
        prev.map(r => 
          r.id === requestId ? { ...r, status } : r
        )
      );
      
      if (status === 'approved') {
        const group = groups.find(g => g.id === request.groupId);
        if (!group) return;
        
        const memberData = {
          group_id: request.groupId,
          user_id: request.userId
        };
        
        await supabase.from('group_members').insert(memberData);
        
        const { error: updateError } = await supabase
          .from('groups')
          .update({ 
            members: group.members + 1,
            pending_requests: Math.max((group.pendingRequests || 0) - 1, 0)
          })
          .eq('id', request.groupId);
        
        if (updateError) {
          console.error('Error updating group counts:', updateError);
        }
        
        setGroups(prevGroups => 
          prevGroups.map(g => 
            g.id === request.groupId ? 
              { 
                ...g, 
                members: g.members + 1,
                pendingRequests: Math.max((g.pendingRequests || 0) - 1, 0)
              } : g
          )
        );
        
        toast({
          title: "Request approved",
          description: `${request.userName} has been added to the group`,
        });
      } else {
        const group = groups.find(g => g.id === request.groupId);
        if (!group) return;
        
        const { error: updateError } = await supabase
          .from('groups')
          .update({ pending_requests: Math.max((group.pendingRequests || 0) - 1, 0) })
          .eq('id', request.groupId);
        
        if (updateError) {
          console.error('Error updating group pending requests count:', updateError);
        }
        
        setGroups(prevGroups => 
          prevGroups.map(g => 
            g.id === request.groupId ? 
              { 
                ...g, 
                pendingRequests: Math.max((g.pendingRequests || 0) - 1, 0)
              } : g
          )
        );
        
        toast({
          title: "Request rejected",
          description: `${request.userName}'s request has been rejected`,
        });
      }
    } catch (error: any) {
      console.error('Error handling join request:', error);
      toast({
        title: "Error handling join request",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getGroupRequests = (groupId: string) => {
    return joinRequests.filter(request => request.groupId === groupId && request.status === 'pending');
  };

  const joinEvent = async (eventId: string) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to join this event",
        variant: "destructive"
      });
      return false;
    }

    const event = events.find(e => e.id === eventId);
    if (!event) return false;

    if (event.privacy === 'paid') {
      toast({
        title: "Paid ticket required",
        description: `This event requires a payment of $${event.price} to join`,
      });
      return false;
    }

    if (event.privacy === 'private') {
      return requestToJoinEvent(eventId).then(() => false);
    }

    try {
      if (event.attendees.includes(currentUser.id)) {
        toast({
          title: "Already attending",
          description: "You are already registered for this event",
        });
        return true;
      }

      const updatedAttendees = [...event.attendees, currentUser.id];
      
      setEvents(prevEvents => 
        prevEvents.map(e => 
          e.id === eventId ? { ...e, attendees: updatedAttendees } : e
        )
      );
      
      toast({
        title: "Success!",
        description: `You've registered for ${event.title}`,
      });
      
      return true;
    } catch (error: any) {
      console.error('Error joining event:', error);
      toast({
        title: "Error joining event",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const leaveEvent = async (eventId: string) => {
    if (!currentUser) return;

    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return;
      
      const updatedAttendees = event.attendees.filter(id => id !== currentUser.id);
      
      setEvents(prevEvents => 
        prevEvents.map(e => 
          e.id === eventId ? { ...e, attendees: updatedAttendees } : e
        )
      );
      
      toast({
        title: "You left the event",
        description: "You have been removed from the attendee list",
      });
    } catch (error: any) {
      console.error('Error leaving event:', error);
      toast({
        title: "Error leaving event",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const requestToJoinEvent = async (eventId: string) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to request joining this event",
        variant: "destructive"
      });
      return;
    }

    const event = events.find(e => e.id === eventId);
    if (!event) return;

    try {
      const requestData = {
        event_id: eventId,
        user_id: currentUser.id,
        user_name: currentUser.name,
        user_profile_image: currentUser.profileImage,
        status: 'pending'
      };
      
      const newRequest: JoinRequest = {
        id: `jr${Date.now()}`,
        eventId,
        userId: currentUser.id,
        userName: currentUser.name,
        userProfileImage: currentUser.profileImage,
        status: 'pending',
        createdAt: new Date()
      };
      
      setJoinRequests(prev => [...prev, newRequest]);
      
      setEvents(prevEvents => 
        prevEvents.map(e => 
          e.id === eventId ? { ...e, pendingRequests: (e.pendingRequests || 0) + 1 } : e
        )
      );
      
      toast({
        title: "Request sent",
        description: "Your request to join this event is pending approval",
      });
    } catch (error: any) {
      console.error('Error requesting to join event:', error);
      toast({
        title: "Error requesting to join event",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEventJoinRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    const request = joinRequests.find(r => r.id === requestId);
    if (!request || !request.eventId) return;

    try {
      setJoinRequests(prev => 
        prev.map(r => 
          r.id === requestId ? { ...r, status } : r
        )
      );
      
      if (status === 'approved') {
        const event = events.find(e => e.id === request.eventId);
        if (!event) return;
        
        const updatedAttendees = [...event.attendees, request.userId];
        
        setEvents(prevEvents => 
          prevEvents.map(e => 
            e.id === request.eventId ? 
              { 
                ...e, 
                attendees: updatedAttendees,
                pendingRequests: (e.pendingRequests || 0) - 1
              } : e
          )
        );
        
        toast({
          title: "Request approved",
          description: `${request.userName} has been added to the event`,
        });
      } else {
        setEvents(prevEvents => 
          prevEvents.map(e => 
            e.id === request.eventId ? 
              { 
                ...e, 
                pendingRequests: Math.max((e.pendingRequests || 0) - 1, 0)
              } : e
          )
        );
        
        toast({
          title: "Request rejected",
          description: `${request.userName}'s request has been rejected`,
        });
      }
    } catch (error: any) {
      console.error('Error handling event join request:', error);
      toast({
        title: "Error handling join request",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getEventRequests = (eventId: string) => {
    return joinRequests.filter(request => request.eventId === eventId && request.status === 'pending');
  };

  const removeGroupMember = async (groupId: string, userId: string) => {
    try {
      const group = groups.find(g => g.id === groupId);
      if (!group) return;
      
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error removing group member:', error);
        toast({
          title: "Error removing member",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      const { error: updateError } = await supabase
        .from('groups')
        .update({ members: Math.max(group.members - 1, 0) })
        .eq('id', groupId);
      
      if (updateError) {
        console.error('Error updating group members count:', updateError);
      }
      
      setGroups(prevGroups => 
        prevGroups.map(g => 
          g.id === groupId ? { ...g, members: Math.max(g.members - 1, 0) } : g
        )
      );
      
      toast({
        title: "Member removed",
        description: "The member has been removed from the group",
      });
    } catch (error: any) {
      console.error('Error removing group member:', error);
      toast({
        title: "Error removing member",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateGroupDetails = async (groupId: string, groupData: Partial<Group>) => {
    try {
      const group = groups.find(g => g.id === groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      const supabaseGroupData = {
        name: groupData.name !== undefined ? groupData.name : group.name,
        description: groupData.description !== undefined ? groupData.description : group.description,
        privacy: groupData.privacy !== undefined ? groupData.privacy : group.privacy,
        price: (groupData.privacy === 'paid' || group.privacy === 'paid') ? 
               (groupData.price !== undefined ? groupData.price : group.price) : null,
        image: groupData.image !== undefined ? groupData.image : group.image,
        rules: groupData.rules !== undefined ? groupData.rules : group.rules,
        member_limit: groupData.memberLimit !== undefined ? groupData.memberLimit : group.memberLimit
      };
      
      const { error } = await supabase
        .from('groups')
        .update(supabaseGroupData)
        .eq('id', groupId);
      
      if (error) {
        console.error('Error updating group:', error);
        throw new Error(error.message);
      }
      
      setGroups(prevGroups => 
        prevGroups.map(g => 
          g.id === groupId ? { ...g, ...groupData } : g
        )
      );
      
      toast({
        title: "Group updated",
        description: "Group details have been updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating group:', error);
      toast({
        title: "Error updating group",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const value = {
    posts,
    events,
    groups,
    services,
    messages,
    joinRequests,
    sessions,
    sessionEnrollments,
    loading,
    createPost,
    createEvent,
    createGroup,
    createService,
    createSession,
    updateSession,
    enrollInSession,
    cancelEnrollment,
    updateEnrollmentStatus,
    getUserSessions,
    getCoachSessions,
    getSessionEnrollments,
    getUserEnrollments,
    likePost,
    sendMessage,
    getGroupMessages,
    joinGroup,
    leaveGroup,
    requestToJoinGroup,
    handleJoinRequest,
    getGroupRequests,
    joinEvent,
    leaveEvent,
    requestToJoinEvent,
    handleEventJoinRequest,
    getEventRequests,
    removeGroupMember,
    updateGroupDetails
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

export default DataContext;
