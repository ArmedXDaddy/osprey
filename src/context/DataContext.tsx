import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { 
  Event, UserRole, EventPrivacy, Post, Group, Service, 
  Session, SessionEnrollment, Message, JoinRequest, 
  Booking, ServiceType, Comment, GroupPrivacy, Announcement,
  Sponsorship, SponsorshipApplication, ApplicationStatus, SponsorshipStatus
} from '@/types';
import { 
  createServiceBooking, getUserBookings, getServiceBookings, 
  getUserBookingForService, cancelBooking, approveBooking, 
  uploadImage, updateComment, deleteComment, deleteGroupFromDB,
  deleteEventFromDB, deleteServiceFromDB, deleteProduct,
  deleteWorkshop, deleteJobPosting, deleteSponsorshipFromDB
} from '@/integrations/supabase/helpers';
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
  addComment: (postId: string) => Promise<void>;
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
  sponsorships: Sponsorship[];
  getSponsorships: () => Sponsorship[];
  getSponsorshipById: (id: string) => Sponsorship;
  createSponsorship: (sponsorshipData: Omit<Sponsorship, 'id' | 'createdAt'>) => Promise<Sponsorship>;
  updateSponsorship: (id: string, updatedData: Partial<Sponsorship>) => Sponsorship;
  deleteSponsorship: (id: string) => void;
  getSponsorshipApplications: (sponsorshipId: string) => SponsorshipApplication[];
  getUserApplicationForSponsorship: (sponsorshipId: string, userId: string) => SponsorshipApplication | null;
  applyForSponsorship: (applicationData: {
    sponsorshipId: string;
    userId: string;
    motivation: string;
    experience: string;
    socialLinks?: {
      instagram?: string;
      twitter?: string;
      website?: string;
    };
  }) => Promise<SponsorshipApplication>;
  updateApplicationStatus: (applicationId: string, status: ApplicationStatus) => { success: boolean };
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

export const DataProvider = ({ children }: DataProviderProps) => {
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
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);

  const { toast } = useToast();
  const { currentUser, isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (!isAuthenticated) return;

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
        setSponsorships(generateMockSponsorships());
        
        // Load user-created sponsorships from localStorage
        try {
          const storedSponsorships = localStorage.getItem('user_sponsorships');
          if (storedSponsorships) {
            const parsedSponsorships = JSON.parse(storedSponsorships);
            // Convert string dates back to Date objects
            const userSponsorships = parsedSponsorships.map((sponsorship: any) => ({
              ...sponsorship,
              createdAt: new Date(sponsorship.createdAt),
              deadline: sponsorship.deadline ? new Date(sponsorship.deadline) : undefined
            }));
            
            // Combine with initial mock data
            setSponsorships(prev => [...prev, ...userSponsorships]);
          }
        } catch (err) {
          console.error("Error loading user sponsorships from localStorage:", err);
        }
        
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
  }, [isAuthenticated]);
  
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
      
      const userRole = currentUser.role as UserRole;
      
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
        creatorRole: userRole
      };
      
      setEvents(prev => [newEvent, ...prev]);
      return newEvent;
    } catch (error: any) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  const createPost = async (content: string, imageFile?: File | null): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to create a post');
    
    try {
      const imagePath = imageFile ? 'posts' : undefined;
      const { data, error } = await supabase
        .from('posts')
        .insert({
          content,
          image: imageFile ? await uploadImage(imageFile, imagePath) : null,
          user_id: currentUser.id,
          user_name: currentUser.name,
          user_role: currentUser.role,
          user_profile_image: currentUser.profileImage
        })
        .select();
        
      if (error) throw error;
      
      const newPost: Post = {
        id: data[0].id,
        userId: data[0].user_id,
        userName: data[0].user_name,
        userRole: data[0].user_role as UserRole,
        userProfileImage: data[0].user_profile_image,
        content: data[0].content,
        image: data[0].image,
        likes: 0,
        comments: 0,
        userLikes: [],
        createdAt: new Date(data[0].created_at)
      };
      
      setPosts(prev => [newPost, ...prev]);
    } catch (error: any) {
      console.error('Error creating post:', error);
      throw error;
    }
  };

  const likePost = async (postId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to like a post');
    
    try {
      await supabase
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: currentUser.id
        });
    } catch (error: any) {
      console.error('Error liking post:', error);
      throw error;
    }
  };

  const unlikePost = async (postId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to unlike a post');
    
    try {
      await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', currentUser.id);
    } catch (error: any) {
      console.error('Error unliking post:', error);
      throw error;
    }
  };

  const addComment = async (postId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to add a comment');
    
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: currentUser.id,
          user_name: currentUser.name,
          user_role: currentUser.role,
          user_profile_image: currentUser.profileImage,
          content: ''
        })
        .select();
        
      if (error) throw error;
      
      const newComment: Comment = {
        id: data[0].id,
        postId: data[0].post_id,
        userId: data[0].user_id,
        userName: data[0].user_name,
        userRole: data[0].user_role,
        userProfileImage: data[0].user_profile_image,
        content: data[0].content,
        createdAt: new Date(data[0].created_at)
      };
      
      setPostComments(prev => {
        const updatedComments = { ...prev };
        if (!updatedComments[newComment.postId]) {
          updatedComments[newComment.postId] = [];
        }
        updatedComments[newComment.postId].push(newComment);
        return updatedComments;
      });
      
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === newComment.postId 
            ? { ...post, comments: post.comments + 1 } 
            : post
        )
      );
    } catch (error: any) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  const updateCommentImpl = async (commentId: string, content: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to update a comment');
    
    try {
      await updateComment(commentId, content);
    } catch (error: any) {
      console.error('Error updating comment:', error);
      throw error;
    }
  };

  const deleteCommentImpl = async (commentId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to delete a comment');
    
    try {
      await deleteComment(commentId);
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  };

  const joinEvent = async (eventId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to join an event');
    
    try {
      // Instead of using event_attendees, use join_requests table with proper status
      const { error } = await supabase
        .from('join_requests')
        .insert({
          event_id: eventId,
          user_id: currentUser.id,
          user_name: currentUser.name,
          user_profile_image: currentUser.profileImage,
          status: 'approved'
        });
        
      if (error) throw error;
      
      setEvents(prev => 
        prev.map(event => 
          event.id === eventId 
            ? { ...event, attendees: [...event.attendees, currentUser.id] }
            : event
        )
      );
    } catch (error: any) {
      console.error('Error joining event:', error);
      throw error;
    }
  };

  const leaveEvent = async (eventId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to leave an event');
    
    try {
      // Instead of using event_attendees, use join_requests table
      const { error } = await supabase
        .from('join_requests')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', currentUser.id);
        
      if (error) throw error;
      
      setEvents(prev => 
        prev.map(event => 
          event.id === eventId 
            ? { ...event, attendees: event.attendees.filter(id => id !== currentUser.id) }
            : event
        )
      );
    } catch (error: any) {
      console.error('Error leaving event:', error);
      throw error;
    }
  };

  const deleteEvent = async (eventId: string, reason?: 'cancelled' | 'completed'): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to delete an event');
    
    try {
      await deleteEventFromDB(eventId);
      
      setEvents(prev => prev.filter(event => event.id !== eventId));
      
      toast({
        title: "Event deleted",
        description: "The event has been permanently deleted"
      });
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete event",
        variant: "destructive"
      });
      throw error;
    }
  };

  const requestToJoinEvent = async (eventId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to request to join an event');
    
    try {
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
    } catch (error: any) {
      console.error('Error requesting to join event:', error);
      throw error;
    }
  };

  const approveEventRequest = async (requestId: string, eventId: string, userId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to approve an event request');
    
    try {
      const { error } = await supabase
        .from('join_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);
        
      if (error) throw error;
      
      setEvents(prev => 
        prev.map(event => 
          event.id === eventId 
            ? { ...event, attendees: [...event.attendees, userId] }
            : event
        )
      );
    } catch (error: any) {
      console.error('Error approving event request:', error);
      throw error;
    }
  };

  const rejectEventRequest = async (requestId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to reject an event request');
    
    try {
      const { error } = await supabase
        .from('join_requests')
        .delete()
        .eq('id', requestId);
        
      if (error) throw error;
    } catch (error: any) {
      console.error('Error rejecting event request:', error);
      throw error;
    }
  };

  const getEventRequests = async (eventId: string): Promise<JoinRequest[]> => {
    return [];
  };

  const handleEventJoinRequest = async (eventId: string, userId: string, status: 'approved' | 'rejected'): Promise<void> => {
    throw new Error('Not implemented');
  };

  const createGroup = async (groupData: any): Promise<Group> => {
    if (!currentUser) throw new Error('You must be logged in to create a group');
    
    try {
      const newGroup: Group = {
        id: Date.now().toString(),
        name: groupData.name,
        description: groupData.description,
        creatorId: currentUser.id,
        creatorName: currentUser.name,
        creatorRole: currentUser.role as UserRole,
        members: 1, // Initialize with 1 member (creator)
        memberIds: [currentUser.id],
        image: groupData.image,
        privacy: groupData.privacy as GroupPrivacy,
        price: groupData.price,
        createdAt: new Date(),
        pendingRequests: 0,
        rules: groupData.rules,
        memberLimit: groupData.memberLimit
      };
      
      setGroups(prev => [newGroup, ...prev]);
      return newGroup;
    } catch (error: any) {
      console.error('Error creating group:', error);
      throw error;
    }
  };

  const createService = async (serviceData: any): Promise<Service> => {
    if (!currentUser) throw new Error('You must be logged in to create a service');
    
    try {
      const newService: Service = {
        id: Date.now().toString(),
        title: serviceData.title,
        description: serviceData.description,
        providerId: currentUser.id,
        providerName: currentUser.name,
        price: serviceData.price,
        duration: serviceData.duration,
        available: true,
        createdAt: new Date(),
        isOnline: serviceData.isOnline,
        location: serviceData.location,
        capacity: serviceData.capacity,
        serviceType: serviceData.serviceType as ServiceType,
        coverImage: serviceData.coverImage,
        meetingUrl: serviceData.meetingUrl
      };
      
      setServices(prev => [newService, ...prev]);
      return newService;
    } catch (error: any) {
      console.error('Error creating service:', error);
      throw error;
    }
  };

  const updateService = async (serviceId: string, updates: any): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to update a service');
    
    try {
      await supabase
        .from('services')
        .update(updates)
        .eq('id', serviceId);
    } catch (error: any) {
      console.error('Error updating service:', error);
      throw error;
    }
  };

  const deleteService = async (serviceId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to delete a service');
    
    try {
      await deleteServiceFromDB(serviceId);
      
      setServices(prev => prev.filter(service => service.id !== serviceId));
      
      toast({
        title: "Service deleted",
        description: "The service has been permanently deleted"
      });
    } catch (error: any) {
      console.error('Error deleting service:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete service",
        variant: "destructive"
      });
      throw error;
    }
  };

  const sendServiceMessage = async (messageData: {serviceId: string; content: string}): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to send a service message');
    
    try {
      const newMessage = {
        service_id: messageData.serviceId,
        user_id: currentUser.id,
        user_name: currentUser.name,
        user_profile_image: currentUser.profileImage,
        content: messageData.content
      };
      
      const { data, error } = await supabase
        .from('service_messages')
        .insert(newMessage)
        .select()
        .single();
        
      if (error) throw error;
      
      console.log("Service message sent successfully:", data);
      
      const transformedMessage: Message = {
        id: data.id,
        content: data.content,
        userId: data.user_id,
        userName: data.user_name,
        userRole: currentUser.role as UserRole,
        userProfileImage: data.user_profile_image,
        createdAt: new Date(data.created_at),
        serviceId: data.service_id
      };
      
      setMessages(prev => [...prev, transformedMessage]);
    } catch (error: any) {
      console.error("Error sending service message:", error);
      throw new Error(error.message || 'Failed to send service message');
    }
  };

  const getServiceMessages = async (serviceId: string): Promise<Message[]> => {
    return [];
  };

  const fetchUserServices = async (userId: string): Promise<Service[]> => {
    return [];
  };

  const getSponsorships = (): Sponsorship[] => {
    return sponsorships;
  };

  const getSponsorshipById = (id: string): Sponsorship => {
    const sponsorship = sponsorships.find(s => s.id === id);
    if (!sponsorship) {
      throw new Error(`Sponsorship with ID ${id} not found`);
    }
    return sponsorship;
  };

  const createSponsorship = async (sponsorshipData: Omit<Sponsorship, 'id' | 'createdAt'>): Promise<Sponsorship> => {
    if (!currentUser) throw new Error('You must be logged in to create a sponsorship');
    
    const newSponsorship: Sponsorship = {
      id: Date.now().toString(),
      title: sponsorshipData.title,
      description: sponsorshipData.description,
      companyId: sponsorshipData.companyId || currentUser.id,
      companyName: sponsorshipData.companyName || currentUser.name,
      companyLogo: sponsorshipData.companyLogo,
      requirements: sponsorshipData.requirements || [],
      benefits: sponsorshipData.benefits || [],
      compensation: sponsorshipData.compensation,
      deadline: sponsorshipData.deadline,
      status: sponsorshipData.status || 'active' as SponsorshipStatus,
      tags: sponsorshipData.tags || [],
      createdAt: new Date()
    };
    
    setSponsorships(prev => [...prev, newSponsorship]);
    
    // Store in localStorage for persistence
    try {
      const storedSponsorships = localStorage.getItem('user_sponsorships');
      const parsedSponsorships = storedSponsorships ? JSON.parse(storedSponsorships) : [];
      localStorage.setItem('user_sponsorships', JSON.stringify([...parsedSponsorships, newSponsorship]));
    } catch (err) {
      console.error("Error storing sponsorship in localStorage:", err);
    }
    
    return newSponsorship;
  };

  const updateSponsorship = (id: string, updatedData: Partial<Sponsorship>): Sponsorship => {
    const updatedSponsorships = sponsorships.map(sponsorship => 
      sponsorship.id === id ? { ...sponsorship, ...updatedData } : sponsorship
    );
    
    setSponsorships(updatedSponsorships);
    
    // Update in localStorage
    try {
      localStorage.setItem('user_sponsorships', JSON.stringify(updatedSponsorships));
    } catch (err) {
      console.error("Error updating sponsorship in localStorage:", err);
    }
    
    return getSponsorshipById(id);
  };

  const deleteSponsorship = (id: string): void => {
    try {
      // Delete from database if it exists there
      deleteSponsorshipFromDB(id).catch(err => {
        console.error("Error deleting sponsorship from database:", err);
      });
      
      // Update local state
      const filteredSponsorships = sponsorships.filter(sponsorship => sponsorship.id !== id);
      setSponsorships(filteredSponsorships);
      
      // Update in localStorage
      try {
        localStorage.setItem('user_sponsorships', JSON.stringify(filteredSponsorships));
      } catch (err) {
        console.error("Error removing sponsorship from localStorage:", err);
      }
      
      toast({
        title: "Sponsorship deleted",
        description: "The sponsorship has been permanently deleted"
      });
    } catch (error: any) {
      console.error('Error deleting sponsorship:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete sponsorship",
        variant: "destructive"
      });
    }
  };

  const getSponsorshipApplications = (sponsorshipId: string): SponsorshipApplication[] => {
    // Mock implementation - would typically fetch from API/database
    return [];
  };

  const getUserApplicationForSponsorship = (sponsorshipId: string, userId: string): SponsorshipApplication | null => {
    // Mock implementation - would typically fetch from API/database
    return null;
  };

  const applyForSponsorship = async (applicationData: {
    sponsorshipId: string;
    userId: string;
    motivation: string;
    experience: string;
    socialLinks?: {
      instagram?: string;
      twitter?: string;
      website?: string;
    };
  }): Promise<SponsorshipApplication> => {
    if (!currentUser) throw new Error('You must be logged in to apply for a sponsorship');
    
    const newApplication: SponsorshipApplication = {
      id: Date.now().toString(),
      sponsorshipId: applicationData.sponsorshipId,
      userId: applicationData.userId,
      userName: currentUser.name,
      userEmail: currentUser.email || '',
      userProfileImage: currentUser.profileImage,
      motivation: applicationData.motivation,
      experience: applicationData.experience,
      socialLinks: applicationData.socialLinks,
      status: 'pending' as ApplicationStatus,
      createdAt: new Date()
    };
    
    // In a real implementation, would save to database
    return newApplication;
  };

  const updateApplicationStatus = (applicationId: string, status: ApplicationStatus): { success: boolean } => {
    // Mock implementation - would typically update in database
    return { success: true };
  };
  
  const postAnnouncement = async (eventId: string, content: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to post an announcement');
    
    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      eventId,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      content,
      createdAt: new Date()
    };
    
    setAnnouncements(prev => [...prev, newAnnouncement]);
  };
  
  const deleteGroupImplementation = async (groupId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to delete a group');
    
    setGroups(prev => prev.filter(group => group.id !== groupId));
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
      completedEvents,
      announcements,
      postAnnouncement,
      createPost,
      likePost,
      unlikePost,
      addComment,
      updateComment: updateCommentImpl,
      deleteComment: deleteCommentImpl,
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
      deleteGroup: deleteGroupImplementation,
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
      fetchUserServices,
      sponsorships,
      getSponsorships,
      getSponsorshipById,
      createSponsorship,
      updateSponsorship,
      deleteSponsorship,
      getSponsorshipApplications,
      getUserApplicationForSponsorship,
      applyForSponsorship,
      updateApplicationStatus
    }}>
      {children}
    </DataContext.Provider>
  );
};
