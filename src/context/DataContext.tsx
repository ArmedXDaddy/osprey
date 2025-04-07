import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { 
  Event, UserRole, EventPrivacy, Post, Group, Service, 
  Session, SessionEnrollment, Message, JoinRequest, 
  Booking, ServiceType, Comment, GroupPrivacy, Announcement
} from '@/types';
import { 
  createServiceBooking, getUserBookings, getServiceBookings, 
  getUserBookingForService, cancelBooking, approveBooking, 
  uploadImage, updateComment, deleteComment 
} from '@/integrations/supabase/helpers';
import { generateMockServices, generateMockPosts, generateMockEvents, 
  generateMockGroups, generateMockSessions, generateMockSessionEnrollments, 
  generateMockMessages, generateMockJoinRequests 
} from '@/utils/mockData';
import { useToast } from "@/hooks/use-toast";

interface DataContextType {
  posts: Post[];
  events: Event[];
  groups: Group[];
  services: Service[];
  sessions: Session[];
  sessionEnrollments: SessionEnrollment[];
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  joinRequests: JoinRequest[];
  loading: boolean;
  error: Error | null;
  postComments: Record<string, Comment[]>;
  completedEvents: Event[];
  announcements: Announcement[];
  postAnnouncement: (eventId: string, content: string) => Promise<void>;
  createPost: (content: string, imageFile?: File | null) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  updateComment: (commentId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  createEvent: (eventData: any) => Promise<Event>;
  joinEvent: (eventId: string) => Promise<void>;
  leaveEvent: (eventId: string) => Promise<void>;
  deleteEvent: (eventId: string, reason?: 'cancelled' | 'completed') => Promise<void>;
  requestToJoinEvent: (eventId: string) => Promise<void>;
  approveEventRequest: (requestId: string, eventId: string, userId: string) => Promise<void>;
  rejectEventRequest: (requestId: string) => Promise<void>;
  getEventRequests: (eventId: string) => Promise<JoinRequest[]>;
  handleEventJoinRequest: (eventId: string, userId: string, status: 'approved' | 'rejected') => Promise<void>;
  createGroup: (groupData: any) => Promise<Group>;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  requestToJoinGroup: (groupId: string) => Promise<void>;
  approveGroupRequest: (requestId: string, groupId: string, userId: string) => Promise<void>;
  rejectGroupRequest: (requestId: string) => Promise<void>;
  getGroupRequests: (groupId: string) => Promise<JoinRequest[]>;
  handleJoinRequest: (groupId: string, userId: string, status: 'approved' | 'rejected') => Promise<void>;
  removeGroupMember: (groupId: string, userId: string) => Promise<void>;
  updateGroupDetails: (groupId: string, updates: any) => Promise<void>;
  createSession: (sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'coachId' | 'coachName'>) => Promise<Session>;
  enrollInSession: (sessionId: string) => Promise<void>;
  cancelEnrollment: (enrollmentId: string) => Promise<void>;
  approveEnrollment: (enrollmentId: string) => Promise<void>;
  rejectEnrollment: (enrollmentId: string) => Promise<void>;
  getUserSessions: (userId: string) => Promise<Session[]>;
  getCoachSessions: (coachId: string) => Promise<Session[]>;
  getUserEnrollments: (userId: string) => Promise<SessionEnrollment[]>;
  updateSession: (sessionId: string, updates: any) => Promise<void>;
  updateEnrollmentStatus: (enrollmentId: string, status: string) => Promise<void>;
  sendMessage: (messageData: {groupId: string; content: string}) => Promise<void>;
  getServiceById: (serviceId: string) => Promise<Service | null>;
  bookService: (serviceId: string, paymentStatus?: string) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
  getUserBookings: (userId: string) => Promise<Booking[]>;
  getServiceBookings: (serviceId: string) => Promise<Booking[]>;
  createService: (serviceData: any) => Promise<Service>;
  updateService: (serviceId: string, updates: any) => Promise<void>;
  deleteService: (serviceId: string) => Promise<void>;
  approveBooking: (bookingId: string) => Promise<void>;
  sendServiceMessage: (messageData: {serviceId: string; content: string}) => Promise<void>;
  getServiceMessages: (serviceId: string) => Promise<Message[]>;
  getUserBookingForService: (serviceId: string, userId: string) => Promise<Booking | null>;
  fetchUserServices: (userId: string) => Promise<Service[]>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionEnrollments, setSessionEnrollments] = useState<SessionEnrollment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [mockServices, setMockServices] = useState<Service[]>([]);
  const [postComments, setPostComments] = useState<Record<string, Comment[]>>({});
  const [completedEvents, setCompletedEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  React.useEffect(() => {
    const loadMockData = async () => {
      try {
        setLoading(true);
        
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (postsError) {
          console.error("Error fetching posts:", postsError);
          setPosts(generateMockPosts());
        } else if (postsData && postsData.length > 0) {
          const transformedPosts: Post[] = postsData.map((post: any) => ({
            id: post.id,
            userId: post.user_id,
            userName: post.user_name,
            userRole: post.user_role,
            userProfileImage: post.user_profile_image,
            content: post.content,
            image: post.image,
            likes: post.likes_count || 0,
            comments: post.comments_count || 0,
            userLikes: [],
            createdAt: new Date(post.created_at)
          }));
          
          for (const post of transformedPosts) {
            const { data: likesData, error: likesError } = await supabase
              .from('post_likes')
              .select('user_id')
              .eq('post_id', post.id);
              
            if (!likesError && likesData) {
              post.userLikes = likesData.map((like: any) => like.user_id);
            }
          }
          
          setPosts(transformedPosts);
          
          fetchCommentsForPosts(postsData.map((post: any) => post.id));
        } else {
          setPosts(generateMockPosts());
        }
        
        const { data: groupsData, error: groupsError } = await supabase
          .from('groups')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (groupsError) {
          console.error("Error fetching groups:", groupsError);
          setGroups(generateMockGroups());
        } else if (groupsData && groupsData.length > 0) {
          const transformedGroups: Group[] = groupsData.map((group: any) => ({
            id: group.id,
            name: group.name,
            description: group.description,
            creatorId: group.creator_id,
            creatorName: group.creator_name,
            creatorRole: group.creator_role as UserRole,
            members: group.members,
            memberIds: [],
            image: group.image,
            privacy: group.privacy as GroupPrivacy,
            price: group.price,
            createdAt: new Date(group.created_at),
            pendingRequests: group.pending_requests || 0,
            rules: group.rules || [],
            memberLimit: group.member_limit
          }));
          
          setGroups(transformedGroups);
        } else {
          setGroups(generateMockGroups());
        }
        
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (eventsError) {
          console.error("Error fetching events:", eventsError);
          setEvents(generateMockEvents());
        } else if (eventsData && eventsData.length > 0) {
          const transformedEvents: Event[] = eventsData.map((event: any) => ({
            id: event.id,
            title: event.title,
            description: event.description,
            location: event.location,
            date: new Date(event.date),
            image: event.image,
            privacy: event.privacy as EventPrivacy,
            price: event.price,
            attendees: event.attendees || [],
            createdAt: new Date(event.created_at),
            creatorId: event.creator_id,
            creatorName: event.creator_name,
            creatorRole: event.creator_role
          }));
          
          setEvents(transformedEvents);
        } else {
          setEvents(generateMockEvents());
        }
        
        setSessions(generateMockSessions());
        setSessionEnrollments(generateMockSessionEnrollments());
        setMessages(generateMockMessages());
        setJoinRequests(generateMockJoinRequests());
        setLoading(false);
      } catch (err: any) {
        setError(err);
        setLoading(false);
      }
    };
    loadMockData();
    
    const postsChannel = supabase.channel('public:posts');
    const commentsChannel = supabase.channel('public:comments');
    const likesChannel = supabase.channel('public:post_likes');
    
    postsChannel
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'posts' }, 
        async (payload) => {
          console.log('New post:', payload);
          const newPost = payload.new as any;
          
          const post: Post = {
            id: newPost.id,
            userId: newPost.user_id,
            userName: newPost.user_name,
            userRole: newPost.user_role,
            userProfileImage: newPost.user_profile_image,
            content: newPost.content,
            image: newPost.image,
            likes: newPost.likes_count || 0,
            comments: newPost.comments_count || 0,
            userLikes: [],
            createdAt: new Date(newPost.created_at)
          };
          
          setPosts(prevPosts => [post, ...prevPosts]);
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'posts' },
        (payload) => {
          console.log('Updated post:', payload);
          const updatedPost = payload.new as any;
          
          setPosts(prevPosts => prevPosts.map(post => {
            if (post.id === updatedPost.id) {
              return {
                ...post,
                content: updatedPost.content,
                image: updatedPost.image,
                likes: updatedPost.likes_count || post.likes,
                comments: updatedPost.comments_count || post.comments,
              };
            }
            return post;
          }));
        }
      )
      .subscribe();
      
    commentsChannel
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments' },
        (payload) => {
          console.log('New comment:', payload);
          const newComment = payload.new as any;
          
          const comment: Comment = {
            id: newComment.id,
            postId: newComment.post_id,
            userId: newComment.user_id,
            userName: newComment.user_name,
            userRole: newComment.user_role,
            userProfileImage: newComment.user_profile_image,
            content: newComment.content,
            createdAt: new Date(newComment.created_at)
          };
          
          setPostComments(prev => {
            const updatedComments = { ...prev };
            if (!updatedComments[comment.postId]) {
              updatedComments[comment.postId] = [];
            }
            updatedComments[comment.postId] = [comment, ...updatedComments[comment.postId]];
            return updatedComments;
          });
          
          setPosts(prevPosts => 
            prevPosts.map(post => 
              post.id === comment.postId 
                ? { ...post, comments: post.comments + 1 } 
                : post
            )
          );
        }
      )
      .subscribe();
      
    likesChannel
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'post_likes' },
        (payload) => {
          console.log('New like:', payload);
          const newLike = payload.new as any;
          
          setPosts(prevPosts => 
            prevPosts.map(post => {
              if (post.id === newLike.post_id) {
                const userLikes = post.userLikes || [];
                if (!userLikes.includes(newLike.user_id)) {
                  return {
                    ...post,
                    userLikes: [...userLikes, newLike.user_id],
                    likes: post.likes + 1
                  };
                }
              }
              return post;
            })
          );
        }
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'post_likes' },
        (payload) => {
          console.log('Deleted like:', payload);
          const deletedLike = payload.old as any;
          
          setPosts(prevPosts => 
            prevPosts.map(post => {
              if (post.id === deletedLike.post_id) {
                const userLikes = post.userLikes || [];
                return {
                  ...post,
                  userLikes: userLikes.filter(id => id !== deletedLike.user_id),
                  likes: Math.max(0, post.likes - 1)
                };
              }
              return post;
            })
          );
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(likesChannel);
    };
  }, []);
  
  const fetchCommentsForPosts = async (postIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .in('post_id', postIds)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching comments:", error);
        return;
      }
      
      if (data) {
        const commentsByPost: Record<string, Comment[]> = {};
        
        data.forEach((comment: any) => {
          const transformedComment: Comment = {
            id: comment.id,
            postId: comment.post_id,
            userId: comment.user_id,
            userName: comment.user_name,
            userRole: comment.user_role,
            userProfileImage: comment.user_profile_image,
            content: comment.content,
            createdAt: new Date(comment.created_at)
          };
          
          if (!commentsByPost[comment.post_id]) {
            commentsByPost[comment.postId] = [];
          }
          
          commentsByPost[comment.post_id].push(transformedComment);
        });
        
        setPostComments(commentsByPost);
      }
    } catch (err) {
      console.error("Error in fetchCommentsForPosts:", err);
    }
  };
  
  React.useEffect(() => {
    const fetchAllServices = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        if (data) {
          const servicesData = data.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            providerId: item.coach_id,
            providerName: item.coach_name,
            price: item.price,
            duration: item.duration,
            available: item.is_active,
            createdAt: new Date(item.created_at),
            isOnline: item.is_online,
            location: item.location,
            capacity: item.capacity,
            serviceType: item.service_type as ServiceType,
            coverImage: item.cover_image,
            meetingUrl: item.meeting_url
          })) as Service[];
          
          setServices(servicesData);
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching all services:", err);
        setError(err);
        setLoading(false);
      }
    };
    
    fetchAllServices();
  }, []);
  
  const createSession = async (sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'coachId' | 'coachName'>): Promise<Session> => {
    if (!currentUser) throw new Error('You must be logged in to create a session');
    console.log('Creating session:', sessionData);
    
    const newSession: Session = {
      id: Date.now().toString(),
      title: sessionData.title,
      description: sessionData.description,
      coachId: currentUser.id,
      coachName: currentUser.name,
      sessionType: sessionData.sessionType,
      capacity: sessionData.capacity,
      price: sessionData.price,
      duration: sessionData.duration,
      startTime: sessionData.startTime,
      location: sessionData.location,
      meetingUrl: sessionData.meetingUrl,
      isOnline: sessionData.isOnline,
      isActive: sessionData.isActive !== undefined ? sessionData.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setSessions(prev => [newSession, ...prev]);
    return newSession;
  };
  
  const enrollInSession = async (sessionId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to enroll in a session');
  };
  
  const cancelEnrollment = async (enrollmentId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to cancel an enrollment');
  };
  
  const approveEnrollment = async (enrollmentId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be a coach to approve an enrollment');
  };
  
  const rejectEnrollment = async (enrollmentId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be a coach to reject an enrollment');
  };
  
  const getUserSessions = async (userId: string): Promise<Session[]> => {
    return [];
  };
  
  const getCoachSessions = async (coachId: string): Promise<Session[]> => {
    return [];
  };
  
  const getUserEnrollments = async (userId: string): Promise<SessionEnrollment[]> => {
    return [];
  };
  
  const updateSession = async (sessionId: string, updates: any): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to update a session');
  };
  
  const updateEnrollmentStatus = async (enrollmentId: string, status: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to update enrollment status');
  };
  
  const joinGroup = async (groupId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to join a group');
    
    try {
      const { data: groupMemberData, error: memberCheckError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)
        .eq('user_id', currentUser.id);
        
      if (memberCheckError) throw memberCheckError;
      
      if (groupMemberData && groupMemberData.length > 0) {
        toast({
          title: "Already a member",
          description: "You are already a member of this group"
        });
        return;
      }
      
      const { error: joinError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: currentUser.id
        });
        
      if (joinError) throw joinError;
      
      const { data: groupData, error: getGroupError } = await supabase
        .from('groups')
        .select('members')
        .eq('id', groupId)
        .single();
        
      if (getGroupError) throw getGroupError;
      
      const newMemberCount = (groupData?.members || 1) + 1;
      
      const { error: updateError } = await supabase
        .from('groups')
        .update({ members: newMemberCount })
        .eq('id', groupId);
        
      if (updateError) throw updateError;
      
      setGroups(prevGroups => 
        prevGroups.map(group => 
          group.id === groupId 
            ? { 
                ...group, 
                members: newMemberCount,
                memberIds: group.memberIds ? [...group.memberIds, currentUser.id] : [currentUser.id]
              } 
            : group
        )
      );
      
      toast({
        title: "Group joined",
        description: "You have successfully joined the group"
      });
    } catch (error: any) {
      console.error("Error joining group:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to join group",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const leaveGroup = async (groupId: string): Promise<void> => {
    throw new Error('Not implemented');
  };
  
  const requestToJoinGroup = async (groupId: string): Promise<void> => {
    throw new Error('Not implemented');
  };
  
  const approveGroupRequest = async (requestId: string, groupId: string, userId: string): Promise<void> => {
    throw new Error('Not implemented');
  };
  
  const rejectGroupRequest = async (requestId: string): Promise<void> => {
    throw new Error('Not implemented');
  };
  
  const getGroupRequests = async (groupId: string): Promise<JoinRequest[]> => {
    return [];
  };
  
  const handleJoinRequest = async (groupId: string, userId: string, status: 'approved' | 'rejected'): Promise<void> => {
    throw new Error('Not implemented');
  };
  
  const removeGroupMember = async (groupId: string, userId: string): Promise<void> => {
    throw new Error('Not implemented');
  };
  
  const updateGroupDetails = async (groupId: string, updates: any): Promise<void> => {
    throw new Error('Not implemented');
  };
  
  const sendMessage = async (messageData: {groupId: string; content: string}): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to send a message');
    
    try {
      const newMessage = {
        group_id: messageData.groupId,
        user_id: currentUser.id,
        user_name: currentUser.name,
        user_role: currentUser.role,
        user_profile_image: currentUser.profileImage,
        content: messageData.content
      };
      
      const { data, error } = await supabase
        .from('messages')
        .insert(newMessage)
        .select()
        .single();
        
      if (error) throw error;
      
      console.log("Message sent successfully:", data);
      
      const transformedMessage: Message = {
        id: data.id,
        content: data.content,
        userId: data.user_id,
        userName: data.user_name,
        userRole: data.user_role as UserRole,
        userProfileImage: data.user_profile_image,
        createdAt: new Date(data.created_at),
        groupId: data.group_id
      };
      
      setMessages(prev => [...prev, transformedMessage]);
    } catch (error: any) {
      console.error("Error sending message:", error);
      throw new Error(error.message || 'Failed to send message');
    }
  };
  
  const getServiceById = async (serviceId: string): Promise<Service | null> => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();
      
      if (error) throw error;
      if (!data) return null;
      
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        providerId: data.coach_id,
        providerName: data.coach_name,
        price: data.price,
        duration: data.duration,
        available: data.is_active,
        createdAt: new Date(data.created_at),
        isOnline: data.is_online,
        location: data.location,
        capacity: data.capacity,
        serviceType: data.service_type as ServiceType,
        coverImage: data.cover_image,
        meetingUrl: data.meeting_url
      };
    } catch (err) {
      console.error("Error fetching service:", err);
      return null;
    }
  };
  
  const bookService = async (serviceId: string, paymentStatus?: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to book a service');
    
    try {
      const status = paymentStatus === 'paid' ? 'approved' : 'pending';
      
      await createServiceBooking(
        serviceId,
        currentUser.id,
        undefined,
        paymentStatus as any,
        status as any
      );
      
      toast({
        title: "Service booked successfully",
        description: paymentStatus === 'paid' 
          ? "Your booking has been confirmed" 
          : "Your booking request has been submitted"
      });
    } catch (err: any) {
      console.error("Error booking service:", err);
      toast({
        variant: "destructive",
        title: "Booking failed",
        description: err.message || "Failed to book service"
      });
      throw new Error(err.message || 'Failed to book service');
    }
  };
  
  const getUserBookingsImpl = async (userId: string): Promise<Booking[]> => {
    try {
      return await getUserBookings(userId);
    } catch (err: any) {
      console.error("Error fetching user bookings:", err);
      return [];
    }
  };
  
  const getServiceBookingsImpl = async (serviceId: string): Promise<Booking[]> => {
    try {
      return await getServiceBookings(serviceId);
    } catch (err: any) {
      console.error("Error fetching service bookings:", err);
      return [];
    }
  };
  
  const getUserBookingForServiceImpl = async (serviceId: string, userId: string): Promise<Booking | null> => {
    try {
      return await getUserBookingForService(serviceId, userId);
    } catch (err: any) {
      console.error("Error fetching user booking for service:", err);
      return null;
    }
  };
  
  const cancelBookingImpl = async (bookingId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to cancel a booking');
    
    try {
      await cancelBooking(bookingId);
    } catch (err: any) {
      console.error("Error cancelling booking:", err);
      throw new Error(err.message || 'Failed to cancel booking');
    }
  };
  
  const approveBookingImpl = async (bookingId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to approve a booking');
    
    try {
      await approveBooking(bookingId);
    } catch (err: any) {
      console.error("Error approving booking:", err);
      throw new Error(err.message || 'Failed to approve booking');
    }
  };
  
  const createEvent = async (eventData: any): Promise<Event> => {
    if (!currentUser) throw new Error('You must be logged in to create an event');
    
    try {
      const eventPrivacy = eventData.privacy as EventPrivacy;
      
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: eventData.title,
          description: eventData.description,
          location: eventData.location,
          date: eventData.date,
          image: eventData.image || null,
          privacy: eventPrivacy,
          price: eventData.price || null,
          attendees: [currentUser.id],
          creator_id: currentUser.id,
          creator_name: currentUser.name,
          creator_role: currentUser.role
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newEvent: Event = {
        id: data.id,
        title: data.title,
        description: data.description,
        location: data.location,
        date: new Date(data.date),
        image: data.image,
        privacy: data.privacy as EventPrivacy,
        price: data.price,
        attendees: data.attendees || [currentUser.id],
        createdAt: new Date(data.created_at),
        creatorId: data.creator_id,
        creatorName: data.creator_name,
        creatorRole: data.creator_role
      };
      
      setEvents(prev => [newEvent, ...prev]);
      
      toast({
        title: "Event created",
        description: "Your event has been created successfully",
      });
      
      return newEvent;
    } catch (error: any) {
      console.error("Error creating event:", error);
      toast({
        variant: "destructive",
        title: "Error creating event",
        description: error.message || "Failed to create event"
      });
      throw error;
    }
  };
  
  const joinEvent = async (eventId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to join an event');
    
    try {
      const eventToUpdate = events.find(e => e.id === eventId);
      if (!eventToUpdate) throw new Error('Event not found');
      
      if (eventToUpdate.attendees && eventToUpdate.attendees.includes(currentUser.id)) {
        return;
      }
      
      const updatedAttendees = eventToUpdate.attendees ? [...eventToUpdate.attendees, currentUser.id] : [currentUser.id];
      
      const { error } = await supabase
        .from('events')
        .update({ attendees: updatedAttendees })
        .eq('id', eventId);
        
      if (error) throw error;
      
      setEvents(prev => prev.map(e => 
        e.id === eventId 
          ? { ...e, attendees: updatedAttendees } 
          : e
      ));
      
      await postAnnouncement(eventId, `${currentUser.name} has joined the event!`);
      
    } catch (error: any) {
      console.error("Error joining event:", error);
      throw new Error(error.message || 'Failed to join event');
    }
  };
  
  const leaveEvent = async (eventId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to leave an event');
    
    try {
      const eventToUpdate = events.find(e => e.id === eventId);
      if (!eventToUpdate) throw new Error('Event not found');
      
      if (!eventToUpdate.attendees || !eventToUpdate.attendees.includes(currentUser.id)) {
        return; // User is not attending this event
      }
      
      const updatedAttendees = eventToUpdate.attendees.filter(id => id !== currentUser.id);
      
      const { error } = await supabase
        .from('events')
        .update({ attendees: updatedAttendees })
        .eq('id', eventId);
        
      if (error) throw error;
      
      setEvents(prev => prev.map(e => 
        e.id === eventId 
          ? { ...e, attendees: updatedAttendees } 
          : e
      ));
      
      toast({
        title: "Left event",
        description: "You have successfully left the event"
      });
    } catch (error: any) {
      console.error("Error leaving event:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to leave event"
      });
      throw new Error(error.message || 'Failed to leave event');
    }
  };
  
  const postAnnouncement = async (eventId: string, content: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to post an announcement');
    
    try {
      const { data, error } = await supabase
        .from('event_announcements')
        .insert({
          event_id: eventId,
          creator_id: currentUser.id,
          creator_name: currentUser.name,
          content: content
        })
        .select()
        .single();
        
      if (error) throw error;
      
      const announcement: Announcement = {
        id: data.id,
        eventId: data.event_id,
        creatorId: data.creator_id,
        creatorName: data.creator_name,
        content: data.content,
        createdAt: new Date(data.created_at)
      };
      
      setAnnouncements(prev => [announcement, ...prev]);
    } catch (error: any) {
      console.error("Error posting announcement:", error);
      throw new Error(error.message || 'Failed to post announcement');
    }
  };
  
  const deleteEvent = async (eventId: string, reason?: 'cancelled' | 'completed'): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to delete an event');
    
    try {
      const eventToDelete = events.find(e => e.id === eventId);
      if (!eventToDelete) throw new Error('Event not found');
      
      if (eventToDelete.creatorId !== currentUser.id) {
        throw new Error('Only the event creator can delete this event');
      }
      
      if (reason === 'completed') {
        // Mark as completed instead of deleting
        const { error } = await supabase
          .from('events')
          .update({ is_completed: true })
          .eq('id', eventId);
          
        if (error) throw error;
        
        // Move to completed events
        setCompletedEvents(prev => [...prev, eventToDelete]);
        setEvents(prev => prev.filter(e => e.id !== eventId));
      } else {
        // Actually delete the event
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', eventId);
          
        if (error) throw error;
        
        setEvents(prev => prev.filter(e => e.id !== eventId));
      }
    } catch (error: any) {
      console.error("Error deleting event:", error);
      throw new Error(error.message || 'Failed to delete event');
    }
  };
  
  const requestToJoinEvent = async (eventId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to request to join an event');
    
    try {
      // Check if user already requested to join
      const { data: existingRequests, error: checkError } = await supabase
        .from('join_requests')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', currentUser.id);
        
      if (checkError) throw checkError;
      
      if (existingRequests && existingRequests.length > 0) {
        toast({
          title: "Request already sent",
          description: "You have already requested to join this event"
        });
        return;
      }
      
      // Create new request
      const { error } = await supabase
        .from('join_requests')
        .insert({
          event_id: eventId,
          user_id: currentUser.id,
          user_name: currentUser.name,
          user_profile_image: currentUser.profileImage,
          status: 'pending'
        });
        
      if (error) throw error;
      
      // Increment pending_requests count
      const { error: updateError } = await supabase
        .from('events')
        .update({ 
          pending_requests: supabase.rpc('increment', { row_id: eventId, table_name: 'events', column_name: 'pending_requests' }) 
        })
        .eq('id', eventId);
        
      if (updateError) throw updateError;
      
      toast({
        title: "Request sent",
        description: "Your request to join the event has been sent"
      });
      
    } catch (error: any) {
      console.error("Error requesting to join event:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send join request"
      });
      throw new Error(error.message || 'Failed to request to join event');
    }
  };
  
  const getEventRequests = async (eventId: string): Promise<JoinRequest[]> => {
    try {
      const { data, error } = await supabase
        .from('join_requests')
        .select('*')
        .eq('event_id', eventId)
        .eq('status', 'pending');
        
      if (error) throw error;
      
      return (data || []).map(request => ({
        id: request.id,
        userId: request.user_id,
        userName: request.user_name,
        userProfileImage: request.user_profile_image,
        status: request.status,
        createdAt: new Date(request.created_at),
        eventId: request.event_id,
        groupId: request.group_id
      }));
    } catch (error: any) {
      console.error("Error fetching event requests:", error);
      return [];
    }
  };
  
  const approveEventRequest = async (requestId: string, eventId: string, userId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to approve a request');
    
    try {
      // Update the request status
      const { error: updateError } = await supabase
        .from('join_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);
        
      if (updateError) throw updateError;
      
      // Get the event and update attendees
      const { data: eventData, error: getEventError } = await supabase
        .from('events')
        .select('attendees')
        .eq('id', eventId)
        .single();
        
      if (getEventError) throw getEventError;
      
      const currentAttendees = eventData.attendees || [];
      const updatedAttendees = [...currentAttendees, userId];
      
      // Update the event with the new attendee
      const { error: eventUpdateError } = await supabase
        .from('events')
        .update({ 
          attendees: updatedAttendees,
          pending_requests: supabase.rpc('decrement', { row_id: eventId, table_name: 'events', column_name: 'pending_requests' }) 
        })
        .eq('id', eventId);
        
      if (eventUpdateError) throw eventUpdateError;
      
      // Update local state
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, attendees: updatedAttendees } 
          : event
      ));
      
      toast({
        title: "Request approved",
        description: "The user has been added to the event"
      });
    } catch (error: any) {
      console.error("Error approving event request:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to approve request"
      });
      throw new Error(error.message || 'Failed to approve event request');
    }
  };
  
  const rejectEventRequest = async (requestId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to reject a request');
    
    try {
      const { data, error } = await supabase
        .from('join_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId)
        .select('event_id')
        .single();
        
      if (error) throw error;
      
      // Decrement pending_requests count
      if (data?.event_id) {
        const { error: updateError } = await supabase
          .from('events')
          .update({ 
            pending_requests: supabase.rpc('decrement', { row_id: data.event_id, table_name: 'events', column_name: 'pending_requests' }) 
          })
          .eq('id', data.event_id);
          
        if (updateError) console.error("Error updating pending requests count:", updateError);
      }
      
      toast({
        title: "Request rejected",
        description: "The join request has been rejected"
      });
    } catch (error: any) {
      console.error("Error rejecting event request:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to reject request"
      });
      throw new Error(error.message || 'Failed to reject event request');
    }
  };
  
  const handleEventJoinRequest = async (eventId: string, userId: string, status: 'approved' | 'rejected'): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to handle join requests');
    
    try {
      const { data, error } = await supabase
        .from('join_requests')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();
        
      if (error) throw error;
      
      if (status === 'approved') {
        await approveEventRequest(data.id, eventId, userId);
      } else {
        await rejectEventRequest(data.id);
      }
    } catch (error: any) {
      console.error("Error handling event join request:", error);
      throw new Error(error.message || 'Failed to handle join request');
    }
  };
  
  const createGroup = async (groupData: any): Promise<Group> => {
    if (!currentUser) throw new Error('You must be logged in to create a group');
    
    try {
      const { data, error } = await supabase
        .from('groups')
        .insert({
          name: groupData.name,
          description: groupData.description,
          creator_id: currentUser.id,
          creator_name: currentUser.name,
          creator_role: currentUser.role,
          members: [currentUser.id],
          image: groupData.image,
          privacy: groupData.privacy,
          price: groupData.price,
          member_limit: groupData.member_limit
        })
        .select()
        .single();
        
      if (error) throw error;
      
      const newGroup: Group = {
        id: data.id,
        name: data.name,
        description: data.description,
        creatorId: data.creator_id,
        creatorName: data.creator_name,
        creatorRole: data.creator_role as UserRole,
        members: data.members,
        memberIds: [currentUser.id],
        image: data.image,
        privacy: data.privacy as GroupPrivacy,
        price: data.price,
        createdAt: new Date(data.created_at),
        pendingRequests: 0,
        rules: [],
        memberLimit: data.member_limit
      };
      
      setGroups(prev => [...prev, newGroup]);
      
      toast({
        title: "Group created",
        description: "Your group has been created successfully",
      });
      
      return newGroup;
    } catch (error: any) {
      console.error("Error creating group:", error);
      toast({
        variant: "destructive",
        title: "Error creating group",
        description: error.message || "Failed to create group"
      });
      throw error;
    }
  };
  
  const joinGroup = async (groupId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to join a group');
    
    try {
      const { data: groupMemberData, error: memberCheckError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)
        .eq('user_id', currentUser.id);
        
      if (memberCheckError) throw memberCheckError;
      
      if (groupMemberData && groupMemberData.length > 0) {
        toast({
          title: "Already a member",
          description: "You are already a member of this group"
        });
        return;
      }
      
      const { error: joinError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: currentUser.id
        });
        
      if (joinError) throw joinError;
      
      const { data: groupData, error: getGroupError } = await supabase
        .from('groups')
        .select('members')
        .eq('id', groupId)
        .single();
        
      if (getGroupError) throw getGroupError;
      
      const newMemberCount = (groupData?.members || 1) + 1;
      
      const { error: updateError } = await supabase
        .from('groups')
        .update({ members: newMemberCount })
        .eq('id', groupId);
        
      if (updateError) throw updateError;
      
      setGroups(prevGroups => 
        prevGroups.map(group => 
          group.id === groupId 
            ? { 
                ...group, 
                members: newMemberCount,
                memberIds: group.memberIds ? [...group.memberIds, currentUser.id] : [currentUser.id]
              } 
            : group
        )
      );
      
      toast({
        title: "Group joined",
        description: "You have successfully joined the group"
      });
    } catch (error: any) {
      console.error("Error joining group:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to join group",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const leaveGroup = async (groupId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to leave a group');
    
    try {
      const { data: groupMemberData, error: memberCheckError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)
        .eq('user_id', currentUser.id);
        
      if (memberCheckError) throw memberCheckError;
      
      if (!groupMemberData || groupMemberData.length === 0) {
        toast({
          title: "Not a member",
          description: "You are not a member of this group"
        });
        return;
      }
      
      const { error: deleteError } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', currentUser.id);
        
      if (deleteError) throw deleteError;
      
      const { data: groupData, error: getGroupError } = await supabase
        .from('groups')
        .select('members')
        .eq('id', groupId)
        .single();
        
      if (getGroupError) throw getGroupError;
      
      const newMemberCount = (groupData?.members || 1) - 1;
      
      const { error: updateError } = await supabase
        .from('groups')
        .update({ members: newMemberCount })
        .eq('id', groupId);
        
      if (updateError) throw updateError;
      
      setGroups(prevGroups => 
        prevGroups.map(group => 
          group.id === groupId 
            ? { 
                ...group, 
                members: newMemberCount,
                memberIds: group.memberIds ? group.memberIds.filter(id => id !== currentUser.id) : []
              } 
            : group
        )
      );
      
      toast({
        title: "Group left",
        description: "You have successfully left the group"
      });
    } catch (error: any) {
      console.error("Error leaving group:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to leave group",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const requestToJoinGroup = async (groupId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to request to join a group');
    
    try {
      // Check if user already requested to join
      const { data: existingRequests, error: checkError } = await supabase
        .from('join_requests')
        .select('*')
        .eq('group_id', groupId)
        .eq('user_id', currentUser.id);
        
      if (checkError) throw checkError;
      
      if (existingRequests && existingRequests.length > 0) {
        toast({
          title: "Request already sent",
          description: "You have already requested to join this group"
        });
        return;
      }
      
      // Create new request
      const { error } = await supabase
        .from('join_requests')
        .insert({
          group_id: groupId,
          user_id: currentUser.id,
          user_name: currentUser.name,
          user_profile_image: currentUser.profileImage,
          status: 'pending'
        });
        
      if (error) throw error;
      
      // Increment pending_requests count
      const { error: updateError } = await supabase
        .from('groups')
        .update({ 
          pending_requests: supabase.rpc('increment', { row_id: groupId, table_name: 'groups', column_name: 'pending_requests' }) 
        })
        .eq('id', groupId);
        
      if (updateError) throw updateError;
      
      toast({
        title: "Request sent",
        description: "Your request to join the group has been sent"
      });
      
    } catch (error: any) {
      console.error("Error requesting to join group:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send join request"
      });
      throw new Error(error.message || 'Failed to request to join group');
    }
  };
  
  const approveGroupRequest = async (requestId: string, groupId: string, userId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to approve a request');
    
    try {
      // Update the request status
      const { error: updateError } = await supabase
        .from('join_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);
        
      if (updateError) throw updateError;
      
      // Get the group and update members
      const { data: groupData, error: getGroupError } = await supabase
        .from('groups')
        .select('members')
        .eq('id', groupId)
        .single();
        
      if (getGroupError) throw getGroupError;
      
      const currentMembers = groupData.members || [];
      const updatedMembers = [...currentMembers, userId];
      
      // Update the group with the new member
      const { error: groupUpdateError } = await supabase
        .from('groups')
        .update({ members: updatedMembers })
        .eq('id', groupId);
        
      if (groupUpdateError) throw groupUpdateError;
      
      // Update local state
      setGroups(prevGroups => 
        prevGroups.map(group => 
          group.id === groupId 
            ? { 
                ...group, 
                members: updatedMembers
              } 
            : group
        )
      );
      
      toast({
        title: "Request approved",
        description: "The user has been added to the group"
      });
    } catch (error: any) {
      console.error("Error approving group request:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to approve request"
      });
      throw new Error(error.message || 'Failed to approve group request');
    }
  };
  
  const rejectGroupRequest = async (requestId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to reject a request');
    
    try {
      const { data, error } = await supabase
        .from('join_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId)
        .select('group_id')
        .single();
        
      if (error) throw error;
      
      // Decrement pending_requests count
      if (data?.group_id) {
        const { error: updateError } = await supabase
          .from('groups')
          .update({ 
            pending_requests: supabase.rpc('decrement', { row_id: data.group_id, table_name: 'groups', column_name: 'pending_requests' }) 
          })
          .eq('id', data.group_id);
          
        if (updateError) console.error("Error updating pending requests count:", updateError);
      }
      
      toast({
        title: "Request rejected",
        description: "The join request has been rejected"
      });
    } catch (error: any) {
      console.error("Error rejecting group request:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to reject request"
      });
      throw new Error(error.message || 'Failed to reject group request');
    }
  };
  
  const getGroupRequests = async (groupId: string): Promise<JoinRequest[]> => {
    try {
      const { data, error } = await supabase
        .from('join_requests')
        .select('*')
        .eq('group_id', groupId)
        .eq('status', 'pending');
        
      if (error) throw error;
      
      return (data || []).map(request => ({
        id: request.id,
        userId: request.user_id,
        userName: request.user_name,
        userProfileImage: request.user_profile_image,
        status: request.status,
        createdAt: new Date(request.created_at),
        eventId: request.event_id,
        groupId: request.group_id
      }));
    } catch (error: any) {
      console.error("Error fetching group requests:", error);
      return [];
    }
  };
  
  const handleJoinRequest = async (groupId: string, userId: string, status: 'approved' | 'rejected'): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to handle join requests');
    
    try {
      const { data, error } = await supabase
        .from('join_requests')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single();
        
      if (error) throw error;
      
      if (status === 'approved') {
        await approveGroupRequest(data.id, groupId, userId);
      } else {
        await rejectGroupRequest(data.id);
      }
    } catch (error: any) {
      console.error("Error handling group join request:", error);
      throw new Error(error.message || 'Failed to handle join request');
    }
  };
  
  const removeGroupMember = async (groupId: string, userId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to remove a group member');
    
    try {
      const { data: groupMemberData, error: memberCheckError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)
        .eq('user_id', userId);
        
      if (memberCheckError) throw memberCheckError;
      
      if (!groupMemberData || groupMemberData.length === 0) {
        toast({
          title: "Not a member",
          description: "You are not a member of this group"
        });
        return;
      }
      
      const { error: deleteError } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);
        
      if (deleteError) throw deleteError;
      
      const { data: groupData, error: getGroupError } = await supabase
        .from('groups')
        .select('members')
        .eq('id', groupId)
        .single();
        
      if (getGroupError) throw getGroupError;
      
      const newMemberCount = (groupData?.members || 1) - 1;
      
      const { error: updateError } = await supabase
        .from('groups')
        .update({ members: newMemberCount })
        .eq('id', groupId);
        
      if (updateError) throw updateError;
      
      setGroups(prevGroups => 
        prevGroups.map(group => 
          group.id === groupId 
            ? { 
                ...group, 
                members: newMemberCount,
                memberIds: group.memberIds ? group.memberIds.filter(id => id !== userId) : []
              } 
            : group
        )
      );
      
      toast({
        title: "Member removed",
        description: "The user has been removed from the group"
      });
    } catch (error: any) {
      console.error("Error removing group member:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove group member",
        variant: "destructive"
      });
      throw new Error(error.message || 'Failed to remove group member');
    }
  };
  
  const updateGroupDetails = async (groupId: string, updates: any): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to update group details');
    
    try {
      const { error } = await supabase
        .from('groups')
        .update(updates)
        .eq('id', groupId);
        
      if (error) throw error;
      
      setGroups(prevGroups => 
        prevGroups.map(group => 
          group.id === groupId 
            ? { ...group, ...updates } 
            : group
        )
      );
      
      toast({
        title: "Group updated",
        description: "Your group details have been updated successfully"
      });
    } catch (error: any) {
      console.error("Error updating group details:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update group details"
      });
      throw new Error(error.message || 'Failed to update group details');
    }
  };
  
  return (
    <DataContext.Provider
      value={{
        posts,
        events,
        groups,
        services,
        sessions,
        sessionEnrollments,
        messages,
        setMessages,
        joinRequests,
        loading,
        error,
        postComments,
        completedEvents,
        announcements,
        postAnnouncement,
        createPost: async () => { throw new Error('Not implemented'); },
        likePost: async () => { throw new Error('Not implemented'); },
        unlikePost: async () => { throw new Error('Not implemented'); },
        addComment: async () => { throw new Error('Not implemented'); },
        updateComment: async (commentId: string, content: string) => updateComment(commentId, content),
        deleteComment: async (commentId: string) => deleteComment(commentId),
        createEvent,
        joinEvent,
        leaveEvent,
        deleteEvent,
        requestToJoinEvent,
        approveEventRequest,
        rejectEventRequest,
        getEventRequests,
        handleEventJoinRequest,
        createGroup,
        joinGroup,
        leaveGroup,
        requestToJoinGroup,
        approveGroupRequest,
        rejectGroupRequest,
        getGroupRequests,
        handleJoinRequest,
        removeGroupMember,
        updateGroupDetails,
        createSession,
        enrollInSession,
        cancelEnrollment,
        approveEnrollment,
        rejectEnrollment,
        getUserSessions,
        getCoachSessions,
        getUserEnrollments,
        updateSession,
        updateEnrollmentStatus,
        sendMessage,
        getServiceById,
        bookService,
        cancelBooking: cancelBookingImpl,
        getUserBookings: getUserBookingsImpl,
        getServiceBookings: getServiceBookingsImpl,
        createService: async () => { throw new Error('Not implemented'); },
        updateService: async () => { throw new Error('Not implemented'); },
        deleteService: async () => { throw new Error('Not implemented'); },
        approveBooking: approveBookingImpl,
        sendServiceMessage: async () => { throw new Error('Not implemented'); },
        getServiceMessages: async () => { return []; },
        getUserBookingForService: getUserBookingForServiceImpl,
        fetchUserServices: async () => { return []; }
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
