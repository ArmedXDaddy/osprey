import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { 
  Event, UserRole, EventPrivacy, Post, Group, Service, 
  Session, SessionEnrollment, Message, JoinRequest, 
  Booking, ServiceType, Comment, GroupPrivacy
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

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
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
        
        setEvents(generateMockEvents());
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
      
      const newEvent: Event = {
        id: Date.now().toString(),
        title: eventData.title,
        description: eventData.description,
        location: eventData.location,
        date: eventData.date,
        image: eventData.image || null,
        privacy: eventPrivacy,
        price: eventData.price || null,
        attendees: [currentUser.id],
        createdAt: new Date(),
        creatorId: currentUser.id,
        creatorName: currentUser.name,
        creatorRole: currentUser.role
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
      
      // Check if user is already attending
      if (eventToUpdate.attendees && eventToUpdate.attendees.includes(currentUser.id)) {
        return; // User is already attending
      }
      
      // Update attendees list
      const updatedAttendees = eventToUpdate.attendees ? [...eventToUpdate.attendees, currentUser.id] : [currentUser.id];
      
      // Update the events state
      setEvents(prev => prev.map(e => 
        e.id === eventId 
          ? { ...e, attendees: updatedAttendees } 
          : e
      ));
      
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
      
      // Remove user from attendees list
      const updatedAttendees = eventToUpdate.attendees 
        ? eventToUpdate.attendees.filter(id => id !== currentUser.id)
        : [];
      
      // Update the events state
      setEvents(prev => prev.map(e => 
        e.id === eventId 
          ? { ...e, attendees: updatedAttendees } 
          : e
      ));
      
    } catch (error: any) {
      console.error("Error leaving event:", error);
      throw new Error(error.message || 'Failed to leave event');
    }
  };
  
  const deleteEvent = async (eventId: string, reason: 'cancelled' | 'completed' = 'cancelled'): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to delete an event');
    
    try {
      const eventToDelete = events.find(e => e.id === eventId);
      if (!eventToDelete) throw new Error('Event not found');
      
      // Verify the user is the creator of the event
      if (eventToDelete.creatorId !== currentUser.id) {
        throw new Error('Only the event creator can delete this event');
      }
      
      // Remove the event from the state
      setEvents(prev => prev.filter(e => e.id !== eventId));
      
      // Here you would typically also delete from the database
      // For now we just log the reason
      console.log(`Event ${eventId} has been ${reason} by creator ${currentUser.id}`);
      
    } catch (error: any) {
      console.error(`Error ${reason} event:`, error);
      throw new Error(error.message || `Failed to ${reason} event`);
    }
  };
  
  const requestToJoinEvent = async (eventId: string): Promise<void> => {
    throw new Error('Not implemented');
  };
  
  const approveEventRequest = async (requestId: string, eventId: string, userId: string): Promise<void> => {
    throw new Error('Not implemented');
  };
  
  const rejectEventRequest = async (requestId: string): Promise<void> => {
    throw new Error('Not implemented');
  };
  
  const getEventRequests = async (eventId: string): Promise<JoinRequest[]> => {
    return [];
  };
  
  const handleEventJoinRequest = async (eventId: string, userId: string, status: 'approved' | 'rejected'): Promise<void> => {
    throw new Error('Not implemented');
  };
  
  const createService = async (serviceData: any): Promise<Service> => {
    if (!currentUser) throw new Error('You must be logged in to create a service');
    try {
      const { data, error } = await supabase
        .from('services')
        .insert({
          title: serviceData.title,
          description: serviceData.description,
          coach_id: currentUser.id,
          coach_name: currentUser.name,
          price: serviceData.price || 0,
          duration: serviceData.duration,
          is_active: serviceData.available !== undefined ? serviceData.available : true,
          is_online: serviceData.isOnline || false,
          location: serviceData.location,
          capacity: serviceData.capacity,
          service_type: serviceData.serviceType,
          cover_image: serviceData.coverImage,
          meeting_url: serviceData.meetingUrl
        })
        .select()
        .single();
      
      if (error) throw error;
      
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
    } catch (err: any) {
      console.error("Error creating service:", err);
      setError(err);
      throw err;
    }
  };
  
  const updateService = async (serviceId: string, updates: any): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to update a service');
    
    try {
      const { error } = await supabase
        .from('services')
        .update({
          title: updates.title,
          description: updates.description,
          price: updates.price,
          duration: updates.duration,
          is_active: updates.available,
          is_online: updates.isOnline,
          location: updates.location,
          capacity: updates.capacity,
          service_type: updates.serviceType,
          cover_image: updates.coverImage,
          meeting_url: updates.meetingUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', serviceId)
        .eq('coach_id', currentUser.id);
      
      if (error) throw error;
      
      setServices(prev => 
        prev.map(service => 
          service.id === serviceId 
            ? { 
                ...service, 
                title: updates.title,
                description: updates.description,
                price: updates.price,
                duration: updates.duration,
                available: updates.available,
                isOnline: updates.isOnline,
                location: updates.location,
                capacity: updates.capacity,
                serviceType: updates.serviceType,
                coverImage: updates.coverImage,
                meetingUrl: updates.meetingUrl
              } 
            : service
        )
      );
      
    } catch (err: any) {
      console.error("Error updating service:", err);
      throw new Error(err.message || 'Failed to update service');
    }
  };
  
  const deleteService = async (serviceId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to delete a service');
  };
  
  const sendServiceMessage = async (messageData: {serviceId: string; content: string}): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to send a service message');
    
    try {
      console.log("Sending service message:", messageData);
      
      const { data, error } = await supabase.rpc('send_service_chat_message', {
        p_service_id: messageData.serviceId,
        p_user_id: currentUser.id,
        p_content: messageData.content
      });
      
      if (error) throw error;
      
      console.log("Message sent successfully:", data);
    } catch (err: any) {
      console.error("Error sending service message:", err);
      throw new Error(err.message || 'Failed to send message');
    }
  };
  
  const getServiceMessages = async (serviceId: string): Promise<Message[]> => {
    try {
      console.log("Fetching messages for service:", serviceId);
      
      const { data, error } = await supabase.rpc('get_service_chat_messages', {
        p_service_id: serviceId
      });
      
      if (error) throw error;
      
      if (data) {
        const transformedMessages: Message[] = data.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          userId: msg.user_id,
          userName: msg.user_name,
          userRole: msg.user_role as UserRole,
          userProfileImage: msg.user_profile_image,
          createdAt: new Date(msg.created_at),
          groupId: null,
          serviceId: msg.service_id
        }));
        
        return transformedMessages;
      }
      
      return [];
    } catch (error: any) {
      console.error("Error fetching service messages:", error);
      throw new Error(error.message || 'Failed to fetch service messages');
    }
  };
  
  const fetchUserServices = async (userId: string): Promise<Service[]> => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('coach_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        return data.map((item: any) => ({
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
        }));
      }
      
      return [];
    } catch (error: any) {
      console.error("Error fetching user services:", error);
      return [];
    }
  };
  
  return (
    <DataContext.Provider value={{
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
      createPost: async () => { throw new Error('Not implemented'); },
      likePost: async () => { throw new Error('Not implemented'); },
      unlikePost: async () => { throw new Error('Not implemented'); },
      addComment: async () => { throw new Error('Not implemented'); },
      updateComment: async () => { throw new Error('Not implemented'); },
      deleteComment: async () => { throw new Error('Not implemented'); },
      createEvent,
      joinEvent,
      leaveEvent,
      deleteEvent,
      requestToJoinEvent: async () => { throw new Error('Not implemented'); },
      approveEventRequest: async () => { throw new Error('Not implemented'); },
      rejectEventRequest: async () => { throw new Error('Not implemented'); },
      getEventRequests: async () => { return []; },
      handleEventJoinRequest: async () => { throw new Error('Not implemented'); },
      createGroup: async () => { throw new Error('Not implemented'); },
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
      createService,
      updateService,
      deleteService,
      approveBooking: approveBookingImpl,
      sendServiceMessage,
      getServiceMessages,
      getUserBookingForService: getUserBookingForServiceImpl,
      fetchUserServices
    }}>
      {children}
    </DataContext.Provider>
  );
};
