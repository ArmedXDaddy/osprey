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
  uploadImage, updateComment as updateCommentHelper, 
  deleteComment as deleteCommentHelper 
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
  updateGroupDetails: (groupId: string, updatedData: Partial<Group>) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
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

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
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
          .eq('is_completed', false)
          .order('date', { ascending: true });
          
        if (eventsError) {
          console.error("Error fetching events:", eventsError);
          setEvents(generateMockEvents());
        } else if (eventsData && eventsData.length > 0) {
          const transformedEvents: Event[] = eventsData.map((event: any) => ({
            id: event.id,
            title: event.title,
            description: event.description,
            creatorId: event.creator_id,
            creatorName: event.creator_name,
            creatorRole: event.creator_role as UserRole,
            location: event.location,
            date: new Date(event.date),
            image: event.image,
            privacy: event.privacy as EventPrivacy,
            price: event.price,
            attendees: event.attendees || [],
            pendingRequests: event.pending_requests || 0,
            createdAt: new Date(event.created_at)
          }));
          
          setEvents(transformedEvents);
        } else {
          setEvents(generateMockEvents());
        }
        
        const { data: completedEventsData, error: completedEventsError } = await supabase
          .from('events')
          .select('*')
          .eq('is_completed', true)
          .order('date', { ascending: false });
          
        if (completedEventsError) {
          console.error("Error fetching completed events:", completedEventsError);
          setCompletedEvents([]);
        } else if (completedEventsData && completedEventsData.length > 0) {
          const transformedCompletedEvents: Event[] = completedEventsData.map((event: any) => ({
            id: event.id,
            title: event.title,
            description: event.description,
            creatorId: event.creator_id,
            creatorName: event.creator_name,
            creatorRole: event.creator_role as UserRole,
            location: event.location,
            date: new Date(event.date),
            image: event.image,
            privacy: event.privacy as EventPrivacy,
            price: event.price,
            attendees: event.attendees || [],
            pendingRequests: event.pending_requests || 0,
            createdAt: new Date(event.created_at)
          }));
          
          setCompletedEvents(transformedCompletedEvents);
        }
        
        const { data: announcementsData, error: announcementsError } = await supabase
          .from('event_announcements')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (announcementsError) {
          console.error("Error fetching announcements:", announcementsError);
          setAnnouncements([]);
        } else if (announcementsData && announcementsData.length > 0) {
          const transformedAnnouncements: Announcement[] = announcementsData.map((announcement: any) => ({
            id: announcement.id,
            eventId: announcement.event_id,
            creatorId: announcement.creator_id,
            creatorName: announcement.creator_name,
            content: announcement.content,
            createdAt: new Date(announcement.created_at)
          }));
          
          setAnnouncements(transformedAnnouncements);
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
      
    const eventsChannel = supabase.channel('public:events');
    eventsChannel
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'events' }, 
        (payload) => {
          console.log('New event:', payload);
          const newEvent = payload.new as any;
          
          const event: Event = {
            id: newEvent.id,
            title: newEvent.title,
            description: newEvent.description,
            creatorId: newEvent.creator_id,
            creatorName: newEvent.creator_name,
            creatorRole: newEvent.creator_role,
            location: newEvent.location,
            date: new Date(newEvent.date),
            image: newEvent.image,
            privacy: newEvent.privacy,
            price: newEvent.price,
            attendees: newEvent.attendees || [],
            pendingRequests: newEvent.pending_requests || 0,
            createdAt: new Date(newEvent.created_at)
          };
          
          if (newEvent.is_completed) {
            setCompletedEvents(prev => [event, ...prev]);
          } else {
            setEvents(prev => [event, ...prev]);
          }
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'events' },
        (payload) => {
          console.log('Updated event:', payload);
          const updatedEvent = payload.new as any;
          
          const event: Event = {
            id: updatedEvent.id,
            title: updatedEvent.title,
            description: updatedEvent.description,
            creatorId: updatedEvent.creator_id,
            creatorName: updatedEvent.creator_name,
            creatorRole: updatedEvent.creator_role,
            location: updatedEvent.location,
            date: new Date(updatedEvent.date),
            image: updatedEvent.image,
            privacy: updatedEvent.privacy,
            price: updatedEvent.price,
            attendees: updatedEvent.attendees || [],
            pendingRequests: updatedEvent.pending_requests || 0,
            createdAt: new Date(updatedEvent.created_at)
          };
          
          if (updatedEvent.is_completed) {
            setEvents(prev => prev.filter(e => e.id !== updatedEvent.id));
            setCompletedEvents(prev => [event, ...prev]);
          } else {
            setEvents(prev => prev.map(e => e.id === updatedEvent.id ? event : e));
          }
        }
      )
      .subscribe();
      
    const announcementsChannel = supabase.channel('public:event_announcements');
    announcementsChannel
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'event_announcements' },
        (payload) => {
          console.log('New announcement:', payload);
          const newAnnouncement = payload.new as any;
          
          const announcement: Announcement = {
            id: newAnnouncement.id,
            eventId: newAnnouncement.event_id,
            creatorId: newAnnouncement.creator_id,
            creatorName: newAnnouncement.creator_name,
            content: newAnnouncement.content,
            createdAt: new Date(newAnnouncement.created_at)
          };
          
          setAnnouncements(prev => [announcement, ...prev]);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(eventsChannel);
      supabase.removeChannel(announcementsChannel);
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
    if (!currentUser) throw new Error('You must be logged in to approve an enrollment');
  };
  
  const rejectEnrollment = async (enrollmentId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to reject an enrollment');
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
      throw new Error(error.message || 'Failed to join group');
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
  
  const updateGroupDetails = async (groupId: string, updatedData: Partial<Group>): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to update group details');
    
    try {
      const dataToUpdate = {
        name: updatedData.name,
        description: updatedData.description,
        image: updatedData.image,
        privacy: updatedData.privacy,
        rules: updatedData.rules,
        member_limit: updatedData.memberLimit
      };
      
      console.log('Updating group with data:', dataToUpdate);
      
      const { error } = await supabase
        .from('groups')
        .update(dataToUpdate)
        .eq('id', groupId);
      
      if (error) {
        console.error("Error from Supabase:", error);
        throw error;
      }
      
      setGroups(prevGroups => 
        prevGroups.map(group => 
          group.id === groupId 
            ? { 
                ...group, 
                ...updatedData
              } 
            : group
        )
      );
      
      toast({
        title: "Group updated",
        description: "Group details have been updated successfully."
      });
    } catch (err: any) {
      console.error("Error updating group details:", err);
      toast({
        title: "Update failed",
        description: err.message || 'Failed to update group details',
        variant: "destructive"
      });
      throw new Error(err.message || 'Failed to update group details');
    }
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
