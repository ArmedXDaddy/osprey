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
    content: 'Just finished my morning HIIT session! Who else loves to start their day with a high-intensity workout? 💪 #morningworkout #fitnessmotivation',
    authorId: '2',
    authorName: 'Sophia Williams',
    authorRole: 'influencer',
    authorImage: 'https://randomuser.me/api/portraits/women/68.jpg',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
    likes: 342,
    comments: 45,
    createdAt: new Date('2023-09-18T08:30:00'),
    // For backward compatibility
    userId: '2',
    userName: 'Sophia Williams',
    userRole: 'influencer',
    userProfileImage: 'https://randomuser.me/api/portraits/women/68.jpg'
  },
  {
    id: 'p2',
    content: "New strength program dropping next week! Perfect for beginners wanting to build a solid foundation. Who's in? 📝 #strengthtraining #womenlifting",
    authorId: '3',
    authorName: 'Alexandra Chen',
    authorRole: 'coach',
    authorImage: 'https://randomuser.me/api/portraits/women/33.jpg',
    likes: 128,
    comments: 23,
    createdAt: new Date('2023-09-17T14:45:00'),
    // For backward compatibility
    userId: '3',
    userName: 'Alexandra Chen',
    userRole: 'coach',
    userProfileImage: 'https://randomuser.me/api/portraits/women/33.jpg'
  },
  {
    id: 'p3',
    content: 'Our new performance leggings are finally here! Designed with sweat-wicking technology and a high-rise waistband for maximum comfort during your toughest workouts.',
    authorId: '4',
    authorName: 'FitTech Apparel',
    authorRole: 'company',
    authorImage: 'https://via.placeholder.com/150?text=FT',
    image: 'https://images.unsplash.com/photo-1506292926-9e0b21854fd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=826&q=80',
    likes: 215,
    comments: 31,
    createdAt: new Date('2023-09-16T11:20:00'),
    // For backward compatibility
    userId: '4',
    userName: 'FitTech Apparel',
    userRole: 'company',
    userProfileImage: 'https://via.placeholder.com/150?text=FT'
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
    isOnline: false,
    startDate: new Date('2023-10-02T09:00:00'),
    date: new Date('2023-10-02T09:00:00'),
    image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=775&q=80',
    attendees: ['3', '4', '5'],
    currentAttendees: 3,
    privacy: 'public',
    price: 0,
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
    isOnline: false,
    startDate: new Date('2023-11-10T16:00:00'),
    date: new Date('2023-11-10T16:00:00'),
    image: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
    attendees: ['1', '2', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28'],
    currentAttendees: 28,
    privacy: 'private',
    price: 0,
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
    isOnline: false,
    startDate: new Date('2023-10-15T18:00:00'),
    date: new Date('2023-10-15T18:00:00'),
    image: 'https://images.unsplash.com/photo-1543165796-35a3418c27df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    attendees: Array.from({ length: 120 }, (_, i) => `attendee-${i + 1}`),
    currentAttendees: 120,
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
    sessionType: 'one_on_one',
    isOnline: true,
    isFree: false,
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
    sessionType: 'one_on_one',
    isOnline: true,
    isFree: false,
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
    sessionType: 'one_on_one',
    isOnline: true,
    isFree: false,
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
    coach: {
      id: '3',
      name: 'Alexandra Chen',
      profileImage: undefined
    },
    coachId: '3',
    coachName: 'Alexandra Chen',
    sessionType: 'group',
    type: 'group',
    capacity: 10,
    price: 30,
    duration: '60 min',
    location: 'Fitness Studio, Downtown',
    isOnline: false,
    isActive: true,
    isFree: false,
    startTime: new Date('2023-06-10'),
    endTime: new Date('2023-06-10'),
    status: 'upcoming',
    currentAttendees: 0,
    createdAt: new Date('2023-06-10'),
    updatedAt: new Date('2023-06-10')
  },
  {
    id: 'sess2',
    title: 'Personal Training Session',
    description: 'One-on-one training tailored to your specific fitness goals.',
    coach: {
      id: '3',
      name: 'Alexandra Chen',
      profileImage: undefined
    },
    coachId: '3',
    coachName: 'Alexandra Chen',
    sessionType: 'one_on_one',
    type: 'one_on_one',
    price: 75,
    duration: '45 min',
    isOnline: false,
    location: 'Fitness Studio, Downtown',
    isActive: true,
    isFree: false,
    startTime: new Date('2023-07-15'),
    endTime: new Date('2023-07-15'),
    status: 'upcoming',
    currentAttendees: 0,
    createdAt: new Date('2023-07-15'),
    updatedAt: new Date('2023-07-15')
  },
  {
    id: 'sess3',
    title: 'Virtual HIIT Workout',
    description: 'High-intensity interval training session conducted via Zoom.',
    coach: {
      id: '2',
      name: 'Sophia Williams',
      profileImage: undefined
    },
    coachId: '2',
    coachName: 'Sophia Williams',
    sessionType: 'group',
    type: 'group',
    capacity: 20,
    price: 15,
    duration: '30 min',
    isOnline: true,
    meetingUrl: 'https://zoom.us/j/example',
    isActive: true,
    isFree: false,
    startTime: new Date('2023-05-22'),
    endTime: new Date('2023-05-22'),
    status: 'upcoming',
    currentAttendees: 0,
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
        createdAt: new Date(),
        // Ensure authorId, authorName, authorRole are set
        authorId: postData.userId || postData.authorId,
        authorName: postData.userName || postData.authorName,
        authorRole: postData.userRole || postData.authorRole,
        authorImage: postData.userProfileImage || postData.authorImage
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
        currentAttendees: 0,
        pendingRequests: 0,
        createdAt: new Date(),
        // Ensure date is set if not already
        date: eventData.date || eventData.startDate
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
        createdAt: new Date(),
        // Ensure these properties are set if not provided
        sessionType: serviceData.sessionType || 'one_on_one',
        isOnline: serviceData.isOnline !== undefined ? serviceData.isOnline : true,
        isFree: serviceData.price === 0
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
        session_type: sessionData.sessionType || sessionData.type,
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
        coach: {
          id: currentUser.id,
          name: currentUser.name,
          profileImage: currentUser.profileImage
        },
        startTime: sessionData.startTime || new Date(),
        endTime: sessionData.endTime || new Date(),
        status: 'upcoming',
        isFree: sessionData.price === 0,
        currentAttendees: 0,
        type: sessionData.sessionType || sessionData.type || 'one_on_one',
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
          ? { ...post, likes: post.likes + 1 }
          : post
      )
    );
  };
  
  const sendMessage = async (message: Omit<Message, 'id' | 'createdAt'>) => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newMessage: Message = {
        ...message,
        id: `m${Date.now()}`,
        createdAt: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } finally {
      setLoading(false);
    }
  };

  const getGroupMessages = (groupId: string) => {
    return messages.filter(message => message.groupId === groupId);
  };

  const joinGroup = async (groupId: string) => {
    setLoading(true);
    
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to join a group');
      }
      
      const group = groups.find(g => g.id === groupId);
      if (!group) {
        throw new Error('Group not found');
      }
      
      // Check if user is already a member
      const { data: existingMember, error: memberError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)
        .eq('user_id', currentUser.id)
        .maybeSingle();
      
      if (memberError) {
        console.error('Error checking membership:', memberError);
        throw new Error('Failed to check membership status');
      }
      
      if (existingMember) {
        throw new Error('You are already a member of this group');
      }
      
      // Add member to group
      const memberData = {
        group_id: groupId,
        user_id: currentUser.id
      };
      
      const { error: joinError } = await supabase
        .from('group_members')
        .insert(memberData);
      
      if (joinError) {
        console.error('Error joining group:', joinError);
        throw new Error(joinError.message);
      }
      
      // Update group members count
      const { error: updateError } = await supabase
        .from('groups')
        .update({ members: group.members + 1 })
        .eq('id', groupId);
      
      if (updateError) {
        console.error('Error updating group member count:', updateError);
      }
      
      // Update local state
      setGroups(prev => 
        prev.map(g => 
          g.id === groupId 
            ? { ...g, members: g.members + 1 }
            : g
        )
      );
      
      toast({
        title: "Success",
        description: `You have joined ${group.name}`,
        variant: "success"
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
    } finally {
      setLoading(false);
    }
  };

  const leaveGroup = async (groupId: string) => {
    setLoading(true);
    
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to leave a group');
      }
      
      const group = groups.find(g => g.id === groupId);
      if (!group) {
        throw new Error('Group not found');
      }
      
      // Check if user is a member
      const { data: existingMember, error: memberError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)
        .eq('user_id', currentUser.id)
        .maybeSingle();
      
      if (memberError) {
        console.error('Error checking membership:', memberError);
        throw new Error('Failed to check membership status');
      }
      
      if (!existingMember) {
        throw new Error('You are not a member of this group');
      }
      
      // Remove member from group
      const { error: leaveError } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', currentUser.id);
      
      if (leaveError) {
        console.error('Error leaving group:', leaveError);
        throw new Error(leaveError.message);
      }
      
      // Update group members count
      const { error: updateError } = await supabase
        .from('groups')
        .update({ members: Math.max(0, group.members - 1) })
        .eq('id', groupId);
      
      if (updateError) {
        console.error('Error updating group member count:', updateError);
      }
      
      // Update local state
      setGroups(prev => 
        prev.map(g => 
          g.id === groupId 
            ? { ...g, members: Math.max(0, g.members - 1) }
            : g
        )
      );
      
      toast({
        title: "Group left",
        description: `You have left ${group.name}`,
        variant: "success"
      });
    } catch (error: any) {
      console.error('Error leaving group:', error);
      toast({
        title: "Error leaving group",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const requestToJoinGroup = async (groupId: string) => {
    setLoading(true);
    
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to request to join a group');
      }
      
      const group = groups.find(g => g.id === groupId);
      if (!group) {
        throw new Error('Group not found');
      }
      
      // Check if request already exists
      const { data: existingRequest, error: requestError } = await supabase
        .from('join_requests')
        .select('*')
        .eq('group_id', groupId)
        .eq('user_id', currentUser.id)
        .maybeSingle();
      
      if (requestError) {
        console.error('Error checking request status:', requestError);
        throw new Error('Failed to check request status');
      }
      
      if (existingRequest) {
        throw new Error('You have already requested to join this group');
      }
      
      // Create join request
      const requestData = {
        group_id: groupId,
        user_id: currentUser.id,
        user_name: currentUser.name,
        user_profile_image: currentUser.profileImage,
        status: 'pending'
      };
      
      const { error: joinError } = await supabase
        .from('join_requests')
        .insert(requestData);
      
      if (joinError) {
        console.error('Error requesting to join group:', joinError);
        throw new Error(joinError.message);
      }
      
      // Update pending requests count
      const { error: updateError } = await supabase
        .from('groups')
        .update({ 
          pending_requests: (group.pendingRequests || 0) + 1 
        })
        .eq('id', groupId);
      
      if (updateError) {
        console.error('Error updating pending requests count:', updateError);
      }
      
      // Update local state
      setGroups(prev => 
        prev.map(g => 
          g.id === groupId 
            ? { 
                ...g, 
                pendingRequests: (g.pendingRequests || 0) + 1
              }
            : g
        )
      );
      
      // Add to local join requests
      const newRequest: JoinRequest = {
        id: `jr${Date.now()}`,
        groupId,
        userId: currentUser.id,
        userName: currentUser.name,
        userProfileImage: currentUser.profileImage,
        status: 'pending',
        createdAt: new Date()
      };
      
      setJoinRequests(prev => [...prev, newRequest]);
      
      toast({
        title: "Request sent",
        description: `Your request to join ${group.name} has been sent`,
        variant: "success"
      });
    } catch (error: any) {
      console.error('Error requesting to join group:', error);
      toast({
        title: "Error sending request",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    setLoading(true);
    
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to handle join requests');
      }
      
      // Find the request
      const request = joinRequests.find(req => req.id === requestId);
      if (!request) {
        throw new Error('Request not found');
      }
      
      if (!request.groupId) {
        throw new Error('Invalid request type');
      }
      
      // Find the group
      const group = groups.find(g => g.id === request.groupId);
      if (!group) {
        throw new Error('Group not found');
      }
      
      // Check if user is the group creator
      if (group.creatorId !== currentUser.id) {
        throw new Error('Only the group creator can handle join requests');
      }
      
      // Update request status
      const { error: updateError } = await supabase
        .from('join_requests')
        .update({ status })
        .eq('id', requestId);
      
      if (updateError) {
        console.error('Error updating request status:', updateError);
        throw new Error(updateError.message);
      }
      
      if (status === 'approved') {
        // Add member to group
        const memberData = {
          group_id: request.groupId,
          user_id: request.userId
        };
        
        const { error: joinError } = await supabase
          .from('group_members')
          .insert(memberData);
        
        if (joinError) {
          console.error('Error adding member to group:', joinError);
          throw new Error(joinError.message);
        }
        
        // Update group members count
        const { error: groupError } = await supabase
          .from('groups')
          .update({ 
            members: group.members + 1,
            pending_requests: Math.max(0, (group.pendingRequests || 0) - 1)
          })
          .eq('id', request.groupId);
        
        if (groupError) {
          console.error('Error updating group:', groupError);
        }
        
        // Update local state
        setGroups(prev => 
          prev.map(g => 
            g.id === request.groupId 
              ? { 
                  ...g, 
                  members: g.members + 1,
                  pendingRequests: Math.max(0, (g.pendingRequests || 0) - 1)
                }
              : g
          )
        );
      } else {
        // Update pending requests count for rejected requests
        const { error: groupError } = await supabase
          .from('groups')
          .update({ 
            pending_requests: Math.max(0, (group.pendingRequests || 0) - 1)
          })
          .eq('id', request.groupId);
        
        if (groupError) {
          console.error('Error updating group:', groupError);
        }
        
        // Update local state
        setGroups(prev => 
          prev.map(g => 
            g.id === request.groupId 
              ? { 
                  ...g,
                  pendingRequests: Math.max(0, (g.pendingRequests || 0) - 1)
                }
              : g
          )
        );
      }
      
      // Update local join requests
      setJoinRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status }
            : req
        )
      );
      
      toast({
        title: `Request ${status}`,
        description: `The join request has been ${status}`,
        variant: "success"
      });
    } catch (error: any) {
      console.error('Error handling join request:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getGroupRequests = (groupId: string) => {
    return joinRequests.filter(request => 
      request.groupId === groupId && request.status === 'pending'
    );
  };

  const joinEvent = async (eventId: string) => {
    setLoading(true);
    
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to join an event');
      }
      
      const event = events.find(e => e.id === eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      
      // Check if user is already attending
      if (Array.isArray(event.attendees) && event.attendees.includes(currentUser.id)) {
        throw new Error('You are already attending this event');
      }
      
      // Add attendee
      const updatedEvent = {
        ...event,
        attendees: Array.isArray(event.attendees) 
          ? [...event.attendees, currentUser.id] 
          : [currentUser.id],
        currentAttendees: event.currentAttendees + 1
      };
      
      setEvents(prev => 
        prev.map(e => e.id === eventId ? updatedEvent : e)
      );
      
      toast({
        title: "Success",
        description: `You have joined ${event.title}`,
        variant: "success"
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
    } finally {
      setLoading(false);
    }
  };

  const leaveEvent = async (eventId: string) => {
    setLoading(true);
    
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to leave an event');
      }
      
      const event = events.find(e => e.id === eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      
      // Check if user is attending
      if (!Array.isArray(event.attendees) || !event.attendees.includes(currentUser.id)) {
        throw new Error('You are not attending this event');
      }
      
      // Remove attendee
      const updatedEvent = {
        ...event,
        attendees: Array.isArray(event.attendees)
          ? event.attendees.filter(id => id !== currentUser.id)
          : [],
        currentAttendees: Math.max(0, event.currentAttendees - 1)
      };
      
      setEvents(prev => 
        prev.map(e => e.id === eventId ? updatedEvent : e)
      );
      
      toast({
        title: "Event left",
        description: `You have left ${event.title}`,
        variant: "success"
      });
    } catch (error: any) {
      console.error('Error leaving event:', error);
      toast({
        title: "Error leaving event",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const requestToJoinEvent = async (eventId: string) => {
    setLoading(true);
    
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to request to join an event');
      }
      
      const event = events.find(e => e.id === eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      
      // Check if request already exists
      const existingRequest = joinRequests.find(req => 
        req.eventId === eventId && req.userId === currentUser.id
      );
      
      if (existingRequest) {
        throw new Error('You have already requested to join this event');
      }
      
      // Create join request
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
      
      // Update pending requests count
      const updatedEvent = {
        ...event,
        pendingRequests: (event.pendingRequests || 0) + 1
      };
      
      setEvents(prev => 
        prev.map(e => e.id === eventId ? updatedEvent : e)
      );
      
      toast({
        title: "Request sent",
        description: `Your request to join ${event.title} has been sent`,
        variant: "success"
      });
    } catch (error: any) {
      console.error('Error requesting to join event:', error);
      toast({
        title: "Error sending request",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleEventJoinRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    setLoading(true);
    
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to handle join requests');
      }
      
      // Find the request
      const request = joinRequests.find(req => req.id === requestId);
      if (!request) {
        throw new Error('Request not found');
      }
      
      if (!request.eventId) {
        throw new Error('Invalid request type');
      }
      
      // Find the event
      const event = events.find(e => e.id === request.eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      
      // Check if user is the event creator
      if (event.creatorId !== currentUser.id) {
        throw new Error('Only the event creator can handle join requests');
      }
      
      // Update request status
      const updatedRequest = {
        ...request,
        status
      };
      
      setJoinRequests(prev => 
        prev.map(req => req.id === requestId ? updatedRequest : req)
      );
      
      // Update event
      let updatedEvent = {
        ...event,
        pendingRequests: Math.max(0, (event.pendingRequests || 0) - 1)
      };
      
      if (status === 'approved') {
        // Add attendee
        updatedEvent = {
          ...updatedEvent,
          attendees: [...(Array.isArray(event.attendees) ? event.attendees : []), request.userId],
          currentAttendees: event.currentAttendees + 1
        };
      }
      
      setEvents(prev => 
        prev.map(e => e.id === request.eventId ? updatedEvent : e)
      );
      
      toast({
        title: `Request ${status}`,
        description: `The join request has been ${status}`,
        variant: "success"
      });
    } catch (error: any) {
      console.error('Error handling event join request:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getEventRequests = (eventId: string) => {
    return joinRequests.filter(request => 
      request.eventId === eventId && request.status === 'pending'
    );
  };

  const removeGroupMember = async (groupId: string, userId: string) => {
    setLoading(true);
    
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to remove a member');
      }
      
      const group = groups.find(g => g.id === groupId);
      if (!group) {
        throw new Error('Group not found');
      }
      
      // Check if user is the group creator
      if (group.creatorId !== currentUser.id) {
        throw new Error('Only the group creator can remove members');
      }
      
      // Don't allow removing the creator
      if (userId === group.creatorId) {
        throw new Error('The group creator cannot be removed');
      }
      
      // Remove member from group
      const { error: removeError } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);
      
      if (removeError) {
        console.error('Error removing member:', removeError);
        throw new Error(removeError.message);
      }
      
      // Update group members count
      const { error: updateError } = await supabase
        .from('groups')
        .update({ members: Math.max(0, group.members - 1) })
        .eq('id', groupId);
      
      if (updateError) {
        console.error('Error updating group member count:', updateError);
      }
      
      // Update local state
      setGroups(prev => 
        prev.map(g => 
          g.id === groupId 
            ? { ...g, members: Math.max(0, g.members - 1) }
            : g
        )
      );
      
      toast({
        title: "Member removed",
        description: "The member has been removed from the group",
        variant: "success"
      });
    } catch (error: any) {
      console.error('Error removing group member:', error);
      toast({
        title: "Error removing member",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateGroupDetails = async (groupId: string, groupData: Partial<Group>) => {
    setLoading(true);
    
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to update a group');
      }
      
      const group = groups.find(g => g.id === groupId);
      if (!group) {
        throw new Error('Group not found');
      }
      
      // Check if user is the group creator
      if (group.creatorId !== currentUser.id) {
        throw new Error('Only the group creator can update the group');
      }
      
      // Prepare data for Supabase
      const updateData: any = {};
      
      if (groupData.name !== undefined) updateData.name = groupData.name;
      if (groupData.description !== undefined) updateData.description = groupData.description;
      if (groupData.privacy !== undefined) updateData.privacy = groupData.privacy;
      if (groupData.price !== undefined) updateData.price = groupData.price;
      if (groupData.image !== undefined) updateData.image = groupData.image;
      if (groupData.rules !== undefined) updateData.rules = groupData.rules;
      if (groupData.memberLimit !== undefined) updateData.member_limit = groupData.memberLimit;
      
      // Update group in Supabase
      const { error: updateError } = await supabase
        .from('groups')
        .update(updateData)
        .eq('id', groupId);
      
      if (updateError) {
        console.error('Error updating group:', updateError);
        throw new Error(updateError.message);
      }
      
      // Update local state
      setGroups(prev => 
        prev.map(g => 
          g.id === groupId 
            ? { ...g, ...groupData }
            : g
        )
      );
      
      toast({
        title: "Group updated",
        description: "The group details have been updated",
        variant: "success"
      });
    } catch (error: any) {
      console.error('Error updating group:', error);
      toast({
        title: "Error updating group",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <DataContext.Provider value={{
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
    }}>
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
