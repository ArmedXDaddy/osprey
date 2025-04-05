import React, { createContext, useState, useContext, useEffect } from 'react';
import { Post, Event, Group, Service, Message, JoinRequest, GroupPrivacy, EventPrivacy, UserRole } from '@/types';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [groups, setGroups] = useState<Group[]>([]);
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>(MOCK_JOIN_REQUESTS);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { toast } = useToast();

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
  }, [toast]);

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
        group_id: messageData.groupId,
        user_id: currentUser.id,
        user_name: currentUser.name,
        user_role: currentUser.role,
        user_profile_image: currentUser.profileImage,
        content: messageData.content
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
        userRole: data.user_role as UserRole, // Cast to UserRole
        userProfileImage: data.user_profile_image,
        content: data.content,
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

    if (event.privacy === 'public') {
      setEvents(prevEvents => 
        prevEvents.map(e => 
          e.id === eventId ? { ...e, attendees: e.attendees + 1 } : e
        )
      );
      
      toast({
        title: "Success!",
        description: `You're attending this event`,
      });
    }

    return false;
  };

  const leaveEvent = async (eventId: string) => {
    if (!currentUser) return;

    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return;
      
      // Since we don't have an 'events' table in Supabase, let's use the mock data instead
      /* 
      const { error } = await supabase
        .from('events')
        .update({ attendees: event.attendees - 1 })
        .eq('id', eventId);
      
      if (error) {
        console.error('Error leaving event:', error);
        toast({
          title: "Error leaving event",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      */
      
      // Update local state
      setEvents(prevEvents => 
        prevEvents.map(e => 
          e.id === eventId ? { ...e, attendees: Math.max(e.attendees - 1, 0) } : e
        )
      );
      
      toast({
        title: "You left the event",
        description: "You can rejoin at any time",
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
      
      const { data, error } = await supabase
        .from('join_requests')
        .insert(requestData)
        .select()
        .single();
      
      if (error) {
        console.error('Error requesting to join event:', error);
        toast({
          title: "Error requesting to join event",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      // Here, we won't try to update the events table since it doesn't exist in Supabase
      /*
      const { error: updateError } = await supabase
        .from('events')
        .update({ pending_requests: (event.pendingRequests || 0) + 1 })
        .eq('id', eventId);
      
      if (updateError) {
        console.error('Error updating event pending requests count:', updateError);
      }
      */
      
      const newRequest: JoinRequest = {
        id: data.id,
        eventId,
        userId: data.user_id,
        userName: data.user_name,
        userProfileImage: data.user_profile_image,
        status: 'pending',
        createdAt: new Date(data.created_at)
      };
      
      setJoinRequests(prev => [...prev, newRequest]);
      
      // Update local state only
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
    if (!request) return;

    try {
      const { error } = await supabase
        .from('join_requests')
        .update({ status })
        .eq('id', requestId);
      
      if (error) {
        console.error('Error handling event join request:', error);
        toast({
          title: "Error handling event join request",
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
        const event = events.find(e => e.id === request.eventId);
        if (!event) return;
        
        // Don't try to update the events table since it doesn't exist in Supabase
        /*
        const { error: updateError } = await supabase
          .from('events')
          .update({ 
            attendees: event.attendees + 1,
            pending_requests: Math.max((event.pendingRequests || 0) - 1, 0)
          })
          .eq('id', request.eventId);
        
        if (updateError) {
          console.error('Error updating event counts:', updateError);
        }
        */
        
        // Update local state only
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
        const event = events.find(e => e.id === request.eventId);
        if (!event) return;
        
        // Don't try to update the events table since it doesn't exist in Supabase
        /*
        const { error: updateError } = await supabase
          .from('events')
          .update({ pending_requests: Math.max((event.pendingRequests || 0) - 1, 0) })
          .eq('id', request.eventId);
        
        if (updateError) {
          console.error('Error updating event pending requests count:', updateError);
        }
        */
        
        // Update local state only
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
        title: "Error handling event join request",
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
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error removing group member:', error);
        toast({
          title: "Error removing group member",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      const { error: updateError } = await supabase
        .from('groups')
        .update({ members: Math.max(groups.find(g => g.id === groupId)?.members || 0 - 1, 0) })
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
        title: "Group member removed",
        description: "The member has been successfully removed from the group",
      });
    } catch (error: any) {
      console.error('Error removing group member:', error);
      toast({
        title: "Error removing group member",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateGroupDetails = async (groupId: string, groupData: Partial<Group>) => {
    try {
      const { error } = await supabase
        .from('groups')
        .update(groupData)
        .eq('id', groupId);
      
      if (error) {
        console.error('Error updating group details:', error);
        toast({
          title: "Error updating group details",
          description: error.message,
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
        title: "Group details updated",
        description: "The group details have been successfully updated",
      });
    } catch (error: any) {
      console.error('Error updating group details:', error);
      toast({
        title: "Error updating group details",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <DataContext.Provider
      value={{
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
        updateGroupDetails,
      }}
    >
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
