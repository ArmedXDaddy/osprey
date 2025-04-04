import React, { createContext, useState, useContext, useEffect } from 'react';
import { Post, Event, Group, Service, Message, JoinRequest, GroupPrivacy, EventPrivacy } from '@/types';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface DataContextType {
  posts: Post[];
  events: Event[];
  groups: Group[];
  services: Service[];
  messages: Message[];
  joinRequests: JoinRequest[];
  loading: boolean;
  createPost: (post: Omit<Post, 'id' | 'createdAt'>) => Promise<Post>;
  createEvent: (event: Omit<Event, 'id' | 'createdAt' | 'attendees' | 'pendingRequests'>) => Promise<Event>;
  createGroup: (group: Omit<Group, 'id' | 'createdAt' | 'members' | 'pendingRequests'>) => Promise<Group>;
  createService: (service: Omit<Service, 'id' | 'createdAt'>) => Promise<Service>;
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
    attendees: 34,
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
    attendees: 28,
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
    attendees: 120,
    privacy: 'paid',
    price: 49.99,
    createdAt: new Date('2023-09-10')
  }
];

const MOCK_GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'Strength Queens',
    description: 'A community for women who love strength training. Share tips, progress, and motivation!',
    creatorId: '3',
    creatorName: 'Alexandra Chen',
    creatorRole: 'coach',
    members: 437,
    privacy: 'public',
    image: 'https://images.unsplash.com/photo-1549476464-37392f717541?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    createdAt: new Date('2023-02-10'),
    rules: ['Be respectful to all members', 'No spam or self-promotion', 'Stay on topic'],
    memberLimit: 500
  },
  {
    id: 'g2',
    name: 'Mindful Movers',
    description: 'For those who believe in the connection between mind and body. Focus on yoga, pilates, and meditation.',
    creatorId: '2',
    creatorName: 'Sophia Williams',
    creatorRole: 'influencer',
    members: 892,
    privacy: 'public',
    image: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=826&q=80',
    createdAt: new Date('2023-04-22'),
    rules: ['Be kind and supportive', 'No promotional content', 'Respect privacy'],
    memberLimit: 1000
  },
  {
    id: 'g3',
    name: 'Elite Training Circle',
    description: 'Advanced training techniques and programs for serious athletes looking to reach peak performance.',
    creatorId: '3',
    creatorName: 'Alexandra Chen', 
    creatorRole: 'coach',
    members: 124,
    privacy: 'private',
    pendingRequests: 8,
    image: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1769&q=80',
    createdAt: new Date('2023-06-15'),
    rules: ['Serious athletes only', 'Share progress regularly', 'Participate in challenges'],
    memberLimit: 150
  },
  {
    id: 'g4',
    name: 'Pro Coaching Group',
    description: 'Premium coaching and personalized programs with weekly live sessions and exclusive content.',
    creatorId: '3',
    creatorName: 'Alexandra Chen',
    creatorRole: 'coach',
    members: 47,
    privacy: 'paid',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80',
    createdAt: new Date('2023-07-01'),
    rules: ['Attend weekly sessions', 'Follow program guidelines', 'Ask questions in the forum'],
    memberLimit: 50
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

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [groups, setGroups] = useState<Group[]>(MOCK_GROUPS);
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>(MOCK_JOIN_REQUESTS);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);

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
        attendees: 0,
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
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newGroup: Group = {
        ...groupData,
        id: `g${Date.now()}`,
        members: 1, // Creator is first member
        pendingRequests: 0,
        createdAt: new Date()
      };
      
      setGroups(prev => [newGroup, ...prev]);
      return newGroup;
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
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newMessage: Message = {
        ...messageData,
        id: `m${Date.now()}`,
        createdAt: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
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
    }

    return false;
  };

  const leaveGroup = async (groupId: string) => {
    if (!currentUser) return;

    setGroups(prevGroups => 
      prevGroups.map(g => 
        g.id === groupId ? { ...g, members: Math.max(g.members - 1, 0) } : g
      )
    );
    
    toast({
      title: "You left the group",
      description: "You can rejoin at any time",
    });
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

    await new Promise(resolve => setTimeout(resolve, 500));

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
    
    setGroups(prevGroups => 
      prevGroups.map(g => 
        g.id === groupId ? { ...g, pendingRequests: (g.pendingRequests || 0) + 1 } : g
      )
    );
    
    toast({
      title: "Request sent",
      description: "Your request to join this group is pending approval",
    });
  };

  const handleJoinRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    const request = joinRequests.find(r => r.id === requestId);
    if (!request) return;

    await new Promise(resolve => setTimeout(resolve, 500));

    setJoinRequests(prev => 
      prev.map(r => 
        r.id === requestId ? { ...r, status } : r
      )
    );

    if (status === 'approved') {
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

    if (event.privacy === 'public') {
      setEvents(prevEvents => 
        prevEvents.map(e => 
          e.id === eventId ? { ...e, attendees: e.attendees + 1 } : e
        )
      );
      
      toast({
        title: "Success!",
        description: `You're attending ${event.title}`,
      });
      
      return true;
    }

    return false;
  };

  const leaveEvent = async (eventId: string) => {
    if (!currentUser) return;

    setEvents(prevEvents => 
      prevEvents.map(e => 
        e.id === eventId ? { ...e, attendees: Math.max(e.attendees - 1, 0) } : e
      )
    );
    
    toast({
      title: "You left the event",
      description: "You can rejoin at any time",
    });
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

    await new Promise(resolve => setTimeout(resolve, 500));

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
  };

  const handleEventJoinRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    const request = joinRequests.find(r => r.id === requestId);
    if (!request || !request.eventId) return;

    await new Promise(resolve => setTimeout(resolve, 500));

    setJoinRequests(prev => 
      prev.map(r => 
        r.id === requestId ? { ...r, status } : r
      )
    );

    if (status === 'approved') {
      setEvents(prevEvents => 
        prevEvents.map(e => 
          e.id === request.eventId ? 
            { 
              ...e, 
              attendees: e.attendees + 1,
              pendingRequests: Math.max((e.pendingRequests || 0) - 1, 0)
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
  };

  const getEventRequests = (eventId: string) => {
    return joinRequests.filter(request => request.eventId === eventId && request.status === 'pending');
  };

  const removeGroupMember = async (groupId: string, userId: string) => {
    if (!currentUser) return;
    
    const group = groups.find(g => g.id === groupId);
    if (!group || group.creatorId !== currentUser.id) {
      toast({
        title: "Permission denied",
        description: "Only group creators can remove members",
        variant: "destructive"
      });
      return;
    }

    setGroups(prevGroups => 
      prevGroups.map(g => 
        g.id === groupId ? { ...g, members: Math.max(g.members - 1, 1) } : g
      )
    );
    
    toast({
      title: "Member removed",
      description: "The member has been removed from the group",
    });
  };

  const updateGroupDetails = async (groupId: string, groupData: Partial<Group>) => {
    if (!currentUser) return;
    
    const group = groups.find(g => g.id === groupId);
    if (!group || group.creatorId !== currentUser.id) {
      toast({
        title: "Permission denied",
        description: "Only group creators can update group details",
        variant: "destructive"
      });
      return;
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
  };

  const value = {
    posts,
    events,
    groups,
    services,
    messages,
    joinRequests,
    loading,
    createPost,
    createEvent,
    createGroup,
    createService,
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
