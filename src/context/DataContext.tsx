import React, { createContext, useState, useContext, useEffect } from 'react';
import { Post, Event, Group, Service, Message, JoinRequest, GroupPrivacy, EventPrivacy } from '@/types';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';
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

  // Fetch groups from Supabase on component mount
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
          // Transform the data to match the Group type
          const formattedGroups: Group[] = data.map(group => ({
            id: group.id,
            name: group.name,
            description: group.description,
            creatorId: group.creator_id,
            creatorName: group.creator_name,
            creatorRole: group.creator_role,
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
    // Load messages, join requests, etc.
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
      
      // Format data for Supabase
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
      
      // Also insert the creator as a member
      const memberData = {
        group_id: data.id,
        user_id: currentUser.id
      };
      
      await supabase.from('group_members').insert(memberData);
      
      // Format the returned data to match Group type
      const newGroup: Group = {
        id: data.id,
        name: data.name,
        description: data.description,
        creatorId: data.creator_id,
        creatorName: data.creator_name,
        creatorRole: data.creator_role,
        members: data.members,
        privacy: data.privacy as GroupPrivacy,
        price: data.price || undefined,
        image: data.image || undefined,
        createdAt: new Date(data.created_at),
        rules: data.rules || [],
        memberLimit: data.member_limit,
        pendingRequests: 0
      };
      
      // Update local state
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

      // Format data for Supabase
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
      
      // Format the returned data to match Message type
      const newMessage: Message = {
        id: data.id,
        groupId: data.group_id,
        userId: data.user_id,
        userName: data.user_name,
        userRole: data.user_role,
        userProfileImage: data.user_profile_image,
        content: data.content,
        createdAt: new Date(data.created_at)
      };
      
      // Update local state
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
        // Add member to the group_members table
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
        
        // Update the members count in the groups table
        const { error: updateError } = await supabase
          .from('groups')
          .update({ members: group.members + 1 })
          .eq('id', groupId);
        
        if (updateError) {
          console.error('Error updating group members count:', updateError);
        }
        
        // Update local state
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
      
      // Remove member from the group_members table
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
      
      // Update the members count in the groups table
      const { error: updateError } = await supabase
        .from('groups')
        .update({ members: Math.max(group.members - 1, 0) })
        .eq('id', groupId);
      
      if (updateError) {
        console.error('Error updating group members count:', updateError);
      }
      
      // Update local state
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
      // Add request to the join_requests table
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
      
      // Update the pending_requests count in the groups table
      const { error: updateError } = await supabase
        .from('groups')
        .update({ pending_requests: (group.pendingRequests || 0) + 1 })
        .eq('id', groupId);
      
      if (updateError) {
        console.error('Error updating group pending requests count:', updateError);
      }
      
      // Format the returned data to match JoinRequest type
      const newRequest: JoinRequest = {
        id: data.id,
        groupId,
        userId: data.user_id,
        userName: data.user_name,
        userProfileImage: data.user_profile_image,
        status: 'pending',
        createdAt: new Date(data.created_at)
      };
      
      // Update local state
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
      // Update the status in the join_requests table
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
      
      // Update local state
      setJoinRequests(prev => 
        prev.map(r => 
          r.id === requestId ? { ...r, status } : r
        )
      );
      
      if (status === 'approved') {
        const group = groups.find(g => g.id === request.groupId);
        if (!group) return;
        
        // Add member to the group_members table
        const memberData = {
          group_id: request.groupId,
          user_id: request.userId
        };
        
        await supabase.from('group_members').insert(memberData);
        
        // Update the members and pending_requests counts in the groups table
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
        
        // Update the pending_requests count in the groups table
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
        description: `You're attending
