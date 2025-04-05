import React, { createContext, useState, useContext, useEffect } from 'react';
import { Post, Event, Group, Service, Message, JoinRequest, GroupPrivacy, EventPrivacy, UserRole, Session, SessionEnrollment, SessionType, SessionStatus, PaymentStatus } from '@/types';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
      
      const sessionFormData = {
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

      // Without type-safe Supabase access, use direct fetch with the right URL and headers
      const newSession: Session = {
        ...sessionData,
        id: `sess${Date.now()}`,
        coachId: currentUser.id,
        coachName: currentUser.name,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setSessions(prev => [newSession, ...prev]);
      
      toast({
        title: "Session created",
        description: "Your new session has been successfully created",
        variant: "success"
      });
      
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
      
      // Update in-memory for now
      const updatedSession: Session = {
        ...existingSession,
        ...sessionData,
        updatedAt: new Date()
      };
      
      setSessions(prev => 
        prev.map(s => s.id === sessionId ? updatedSession : s)
      );

      toast({
        title: "Session updated",
        description: "Your session has been successfully updated",
        variant: "success"
      });
      
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
      
      const newEnrollment: SessionEnrollment = {
        id: `enroll${Date.now()}`,
        sessionId: sessionId,
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        userProfileImage: currentUser.profileImage,
        status: 'pending',
        paymentStatus: 'unpaid',
        createdAt: new Date()
      };
      
      setSessionEnrollments(prev => [...prev, newEnrollment]);
      
      toast({
        title: session.sessionType === 'one_on_one' ? "Request sent" : "Enrollment successful",
        description: session.sessionType === 'one_on_one' 
          ? "Your request for a one-on-one session has been sent to the coach" 
          : "You have successfully enrolled in the group session",
        variant: "success"
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
      
      setSessionEnrollments(prev => 
        prev.filter(e => e.id !== enrollmentId)
      );
      
      toast({
        title: "Enrollment canceled",
        description: "Your enrollment has been successfully canceled",
        variant: "success"
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
      
      const updatedEnrollment = {
        ...enrollment,
        status
      };
      
      setSessionEnrollments(prev => 
        prev.map(e => e.id === enrollmentId ? updatedEnrollment : e)
      );
      
      toast({
        title: `Enrollment ${status}`,
        description: `The enrollment has been marked as ${status}`,
        variant: "success"
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
          ? {
