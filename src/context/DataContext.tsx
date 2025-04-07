
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Event, Post, Comment, Message, JoinRequest, Booking, User } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { 
  uploadImage, 
  createEventInDb,
  uploadEventImage,
  fetchProducts,
  fetchWorkshops,
} from '@/integrations/supabase/helpers';
import { supabase } from '@/integrations/supabase/client';

interface DataContextType {
  events: Event[];
  completedEvents: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  createPost: (content: string, image: File | null) => Promise<void>;
  createEvent: (eventData: any) => Promise<any>;
  fetchUserProfile: (userId: string) => Promise<User | null>;
  updateUserProfile: (userId: string, updates: Partial<User>) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<Comment>;
  updateComment: (commentId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  likePost: (postId: string, userId: string) => Promise<void>;
  unlikePost: (postId: string, userId: string) => Promise<void>;
  loading: boolean;
  announcements: any[];
  postAnnouncement: (eventId: string, content: string) => Promise<void>;
  products: any[];
  workshops: any[];
  
  // Add the missing properties from the errors
  joinEvent: (eventId: string) => Promise<void>;
  leaveEvent: (eventId: string) => Promise<void>;
  deleteEvent: (eventId: string, status: string) => Promise<void>;
  
  // Group related properties
  groups: any[];
  createGroup: (groupData: any) => Promise<any>;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  requestToJoinGroup: (groupId: string) => Promise<void>;
  removeGroupMember: (groupId: string, userId: string) => Promise<void>;
  updateGroupDetails: (groupId: string, updates: any) => Promise<void>;
  getGroupRequests: (groupId: string) => Promise<any[]>;
  deleteGroup: (groupId: string) => Promise<void>;
  
  // Message related properties
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  sendMessage: (groupId: string, content: string) => Promise<void>;
  
  // Service related properties
  services: any[];
  createService: (serviceData: any) => Promise<any>;
  updateService: (serviceId: string, updates: any) => Promise<void>;
  getServiceById: (serviceId: string) => Promise<any>;
  getUserBookings: (userId: string) => Promise<any[]>;
  getUserBookingForService: (serviceId: string, userId: string) => Promise<Booking | null>;
  getServiceBookings: (serviceId: string) => Promise<any[]>;
  approveBooking: (bookingId: string) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
  bookService: (serviceId: string, userData: any) => Promise<void>;
  
  // Service Chat properties
  sendServiceMessage: (params: { serviceId: string, content: string }) => Promise<void>;
  getServiceMessages: (serviceId: string) => Promise<Message[]>;
  
  // Session related properties
  sessions: any[];
  sessionEnrollments: any[];
  createSession: (sessionData: any) => Promise<any>;
  getUserSessions: (userId: string) => Promise<any[]>;
  getCoachSessions: (coachId: string) => Promise<any[]>;
  getUserEnrollments: (userId: string) => Promise<any[]>;
  updateSession: (sessionId: string, updates: any) => Promise<void>;
  updateEnrollmentStatus: (enrollmentId: string, status: string) => Promise<void>;
  enrollInSession: (sessionId: string, userData: any) => Promise<void>;
  cancelEnrollment: (enrollmentId: string) => Promise<void>;
  
  // Join request properties
  joinRequests: JoinRequest[];
  approveEventRequest: (requestId: string, eventId: string, userId: string) => Promise<void>;
  rejectEventRequest: (requestId: string) => Promise<void>;
  handleJoinRequest: (requestId: string, status: 'approved' | 'rejected') => Promise<void>;
  
  // Comment related properties
  postComments: (postId: string) => Promise<Comment[]>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [completedEvents, setCompletedEvents] = useState<Event[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionEnrollments, setSessionEnrollments] = useState<any[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        // Fetch events from Supabase
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (eventsError) {
          console.error("Error fetching events:", eventsError);
        } else if (eventsData) {
          setEvents(eventsData);
        }
        
        // Fetch completed events from Supabase
        const { data: completedEventsData, error: completedEventsError } = await supabase
          .from('events')
          .select('*')
          .lte('date', new Date().toISOString())
          .order('created_at', { ascending: false });
        
        if (completedEventsError) {
          console.error("Error fetching completed events:", completedEventsError);
        } else if (completedEventsData) {
          setCompletedEvents(completedEventsData);
        }

        // Fetch posts from Supabase
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (postsError) {
          console.error("Error fetching posts:", postsError);
        } else if (postsData) {
          setPosts(postsData);
        }

        // Fetch announcements from Supabase
        const { data: announcementsData, error: announcementsError } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (announcementsError) {
          console.error("Error fetching announcements:", announcementsError);
        } else {
          setAnnouncements(announcementsData || []);
        }
        
        // Fetch products and workshops using the helper functions
        const fetchedProducts = await fetchProducts();
        setProducts(fetchedProducts);
        
        const fetchedWorkshops = await fetchWorkshops();
        setWorkshops(fetchedWorkshops);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }

      return data as User;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  };

  const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) {
        console.error("Error updating profile:", error);
        throw new Error(error.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  const createPost = async (content: string, image: File | null) => {
    try {
      if (!currentUser) {
        throw new Error('User not authenticated. Please log in to create a post.');
      }

      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImage(image, `posts/${currentUser.id}`);
      }

      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('name, role, profileImage')
        .eq('id', currentUser.id)
        .single();

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        throw new Error('Failed to fetch user profile');
      }

      const { error } = await supabase
        .from('posts')
        .insert({
          content,
          image_url: imageUrl,
          user_id: currentUser.id,
          user_name: userProfile?.name,
          user_role: userProfile?.role || 'user',
          user_profile_image: userProfile?.profileImage,
          likes: [],
          comments_count: 0,
        });

      if (error) {
        console.error("Error creating post:", error);
        throw new Error(error.message || 'Failed to create post');
      }

      // Optimistically update the local state
      const newPost: Post = {
        id: Math.random().toString(), // Temporary ID, will be replaced on refresh
        content,
        imageUrl,
        userId: currentUser.id,
        userName: userProfile?.name,
        userRole: userProfile?.role || 'user',
        userProfileImage: userProfile?.profileImage,
        createdAt: new Date(),
        likes: [],
        commentsCount: 0,
      };

      setPosts(prevPosts => [newPost, ...prevPosts]);
    } catch (err: any) {
      console.error('Error creating post:', err);
      throw new Error(err.message || 'Failed to create post. Please try again.');
    }
  };

  const createEvent = async (eventData: any) => {
    try {
      // Start with getting the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        throw new Error('User not authenticated. Please log in to create an event.');
      }
      
      const userProfile = await fetchUserProfile(userData.user.id);
      if (!userProfile) {
        throw new Error('User profile not found');
      }
      
      // Upload image if provided
      let imageUrl = eventData.image;
      if (eventData.image && eventData.image instanceof File) {
        imageUrl = await uploadEventImage(eventData.image);
      }
      
      // Prepare event data
      const newEventData = {
        ...eventData,
        image: imageUrl,
        creatorId: userData.user.id,
        creatorName: userProfile.name,
        creatorRole: userProfile.role || 'user',
        createdAt: new Date(),
        attendees: [userData.user.id], // Creator is automatically an attendee
        pendingRequests: 0
      };
      
      // Create the event in the database
      const createdEvent = await createEventInDb(newEventData);
      console.log('Event created in database:', createdEvent);
      
      // Update local state
      setEvents(prev => [createdEvent, ...prev]);
      
      return createdEvent;
    } catch (err: any) {
      console.error('Error creating event:', err);
      throw new Error(err.message || 'Failed to create event. Please try again.');
    }
  };

  const addComment = async (postId: string, content: string): Promise<Comment> => {
    try {
      if (!currentUser) {
        throw new Error('User not authenticated. Please log in to add a comment.');
      }
  
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('name, role, profileImage')
        .eq('id', currentUser.id)
        .single();
  
      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        throw new Error('Failed to fetch user profile');
      }
  
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: currentUser.id,
          user_name: userProfile?.name,
          user_role: userProfile?.role || 'user',
          user_profile_image: userProfile?.profileImage,
          content,
        })
        .select()
        .single();
  
      if (error) {
        console.error("Error creating comment:", error);
        throw new Error(error.message || 'Failed to create comment');
      }
      
      // Increment post comments count using direct SQL query to work around TypeScript issues
      const client = supabase as any;
      const { error: rpcError } = await client.rpc('increment_post_comments', { post_id: postId });
      
      if (rpcError) {
        console.error('Error incrementing post comments count:', rpcError);
      }
  
      // Optimistically update the local state
      const newComment: Comment = {
        id: data.id,
        postId: postId,
        userId: currentUser.id,
        userName: userProfile?.name,
        userRole: userProfile?.role || 'user',
        userProfileImage: userProfile?.profileImage,
        content,
        createdAt: new Date(),
      };
  
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? { ...post, commentsCount: (post.commentsCount || 0) + 1 } : post
        )
      );
  
      return newComment;
    } catch (err: any) {
      console.error('Error creating comment:', err);
      throw new Error(err.message || 'Failed to create comment. Please try again.');
    }
  };

  const updateComment = async (commentId: string, content: string): Promise<void> => {
    try {
      await supabase.from('comments').update({ content }).eq('id', commentId);

      setPosts(prevPosts =>
        prevPosts.map(post => ({
          ...post,
          comments: post.comments?.map(comment =>
            comment.id === commentId ? { ...comment, content } : comment
          )
        }))
      );
    } catch (error: any) {
      console.error('Error updating comment:', error);
      throw new Error(error.message || 'Failed to update comment');
    }
  };

  const deleteComment = async (commentId: string): Promise<void> => {
    try {
      // First, decrement the comments count on the parent post
      const { data: comment } = await supabase
        .from('comments')
        .select('post_id')
        .eq('id', commentId)
        .single();
      
      if (comment?.post_id) {
        // Decrement post comments count using direct SQL query to work around TypeScript issues
        const client = supabase as any;
        const { error: rpcError } = await client.rpc('decrement_post_comments', { post_id: comment.post_id });
        
        if (rpcError) {
          console.error('Error decrementing post comments count:', rpcError);
        }
      }
      
      // Then delete the comment
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        console.error('Error deleting comment:', error);
        throw new Error(error.message || 'Failed to delete comment');
      }

      setPosts(prevPosts => {
        return prevPosts.map(post => {
          if (post.comments) {
            return {
              ...post,
              comments: post.comments.filter(comment => comment.id !== commentId),
              commentsCount: Math.max((post.commentsCount || 1) - 1, 0),
            };
          }
          return post;
        });
      });
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      throw new Error(error.message || 'Failed to delete comment');
    }
  };

  const likePost = async (postId: string, userId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ likes: supabase.raw(`array_append(likes, '${userId}')`) })
        .eq('id', postId);

      if (error) {
        console.error('Error liking post:', error);
        throw new Error(error.message || 'Failed to like post');
      }

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? { ...post, likes: [...(post.likes || []), userId] } : post
        )
      );
    } catch (error: any) {
      console.error('Error liking post:', error);
      throw new Error(error.message || 'Failed to like post');
    }
  };

  const unlikePost = async (postId: string, userId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ likes: supabase.raw(`array_remove(likes, '${userId}')`) })
        .eq('id', postId);

      if (error) {
        console.error('Error unliking post:', error);
        throw new Error(error.message || 'Failed to unlike post');
      }

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? { ...post, likes: (post.likes || []).filter(id => id !== userId) } : post
        )
      );
    } catch (error: any) {
      console.error('Error unliking post:', error);
      throw new Error(error.message || 'Failed to unlike post');
    }
  };

  const postAnnouncement = async (eventId: string, content: string): Promise<void> => {
    try {
      if (!currentUser) {
        throw new Error('User not authenticated. Please log in to post an announcement.');
      }
  
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('name, role')
        .eq('id', currentUser.id)
        .single();
  
      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        throw new Error('Failed to fetch user profile');
      }
  
      const { error } = await supabase
        .from('announcements')
        .insert({
          event_id: eventId,
          user_id: currentUser.id,
          user_name: userProfile?.name,
          user_role: userProfile?.role || 'user',
          content,
        });
  
      if (error) {
        console.error("Error creating announcement:", error);
        throw new Error(error.message || 'Failed to create announcement');
      }
  
      // Optimistically update the local state
      const newAnnouncement = {
        id: Math.random().toString(), // Temporary ID, will be replaced on refresh
        eventId: eventId,
        userId: currentUser.id,
        userName: userProfile?.name,
        userRole: userProfile?.role || 'user',
        content,
        createdAt: new Date().toISOString(),
      };
  
      setAnnouncements(prevAnnouncements => [newAnnouncement, ...prevAnnouncements]);
    } catch (err: any) {
      console.error('Error creating announcement:', err);
      throw new Error(err.message || 'Failed to create announcement. Please try again.');
    }
  };

  // Stub implementations for required functions
  const joinEvent = async (eventId: string): Promise<void> => {
    console.log("Join event function called with ID:", eventId);
  };

  const leaveEvent = async (eventId: string): Promise<void> => {
    console.log("Leave event function called with ID:", eventId);
  };

  const deleteEvent = async (eventId: string, status: string): Promise<void> => {
    console.log("Delete event function called with ID:", eventId, "Status:", status);
  };

  // Group related functions
  const createGroup = async (groupData: any): Promise<any> => {
    console.log("Create group function called with data:", groupData);
    return { id: "dummy-group-id", ...groupData };
  };

  const joinGroup = async (groupId: string): Promise<void> => {
    console.log("Join group function called with ID:", groupId);
  };

  const leaveGroup = async (groupId: string): Promise<void> => {
    console.log("Leave group function called with ID:", groupId);
  };

  const requestToJoinGroup = async (groupId: string): Promise<void> => {
    console.log("Request to join group function called with ID:", groupId);
  };

  const removeGroupMember = async (groupId: string, userId: string): Promise<void> => {
    console.log("Remove group member function called with group ID:", groupId, "and user ID:", userId);
  };

  const updateGroupDetails = async (groupId: string, updates: any): Promise<void> => {
    console.log("Update group details function called with ID:", groupId, "and updates:", updates);
  };

  const getGroupRequests = async (groupId: string): Promise<any[]> => {
    console.log("Get group requests function called with ID:", groupId);
    return [];
  };

  const deleteGroup = async (groupId: string): Promise<void> => {
    console.log("Delete group function called with ID:", groupId);
  };

  // Message related functions
  const sendMessage = async (groupId: string, content: string): Promise<void> => {
    console.log("Send message function called with group ID:", groupId, "and content:", content);
  };

  // Service related functions
  const createService = async (serviceData: any): Promise<any> => {
    console.log("Create service function called with data:", serviceData);
    return { id: "dummy-service-id", ...serviceData };
  };

  const updateService = async (serviceId: string, updates: any): Promise<void> => {
    console.log("Update service function called with ID:", serviceId, "and updates:", updates);
  };

  const getServiceById = async (serviceId: string): Promise<any> => {
    console.log("Get service by ID function called with ID:", serviceId);
    return null;
  };

  const getUserBookings = async (userId: string): Promise<any[]> => {
    console.log("Get user bookings function called with user ID:", userId);
    return [];
  };

  const getUserBookingForService = async (serviceId: string, userId: string): Promise<Booking | null> => {
    console.log("Get user booking for service function called with service ID:", serviceId, "and user ID:", userId);
    return null;
  };

  const getServiceBookings = async (serviceId: string): Promise<any[]> => {
    console.log("Get service bookings function called with service ID:", serviceId);
    return [];
  };

  const approveBooking = async (bookingId: string): Promise<void> => {
    console.log("Approve booking function called with ID:", bookingId);
  };

  const cancelBooking = async (bookingId: string): Promise<void> => {
    console.log("Cancel booking function called with ID:", bookingId);
  };

  const bookService = async (serviceId: string, userData: any): Promise<void> => {
    console.log("Book service function called with service ID:", serviceId, "and user data:", userData);
  };

  // Service Chat functions
  const sendServiceMessage = async (params: { serviceId: string, content: string }): Promise<void> => {
    console.log("Send service message function called with params:", params);
  };

  const getServiceMessages = async (serviceId: string): Promise<Message[]> => {
    console.log("Get service messages function called with service ID:", serviceId);
    return [];
  };

  // Session related functions
  const createSession = async (sessionData: any): Promise<any> => {
    console.log("Create session function called with data:", sessionData);
    return { id: "dummy-session-id", ...sessionData };
  };

  const getUserSessions = async (userId: string): Promise<any[]> => {
    console.log("Get user sessions function called with user ID:", userId);
    return [];
  };

  const getCoachSessions = async (coachId: string): Promise<any[]> => {
    console.log("Get coach sessions function called with coach ID:", coachId);
    return [];
  };

  const getUserEnrollments = async (userId: string): Promise<any[]> => {
    console.log("Get user enrollments function called with user ID:", userId);
    return [];
  };

  const updateSession = async (sessionId: string, updates: any): Promise<void> => {
    console.log("Update session function called with ID:", sessionId, "and updates:", updates);
  };

  const updateEnrollmentStatus = async (enrollmentId: string, status: string): Promise<void> => {
    console.log("Update enrollment status function called with ID:", enrollmentId, "and status:", status);
  };

  const enrollInSession = async (sessionId: string, userData: any): Promise<void> => {
    console.log("Enroll in session function called with session ID:", sessionId, "and user data:", userData);
  };

  const cancelEnrollment = async (enrollmentId: string): Promise<void> => {
    console.log("Cancel enrollment function called with ID:", enrollmentId);
  };

  // Join request functions
  const approveEventRequest = async (requestId: string, eventId: string, userId: string): Promise<void> => {
    console.log("Approve event request function called with request ID:", requestId, "event ID:", eventId, "and user ID:", userId);
  };

  const rejectEventRequest = async (requestId: string): Promise<void> => {
    console.log("Reject event request function called with request ID:", requestId);
  };

  const handleJoinRequest = async (requestId: string, status: 'approved' | 'rejected'): Promise<void> => {
    console.log("Handle join request function called with request ID:", requestId, "and status:", status);
  };

  // Comment related functions
  const postComments = async (postId: string): Promise<Comment[]> => {
    console.log("Post comments function called with post ID:", postId);
    return [];
  };

  const value: DataContextType = {
    events,
    completedEvents,
    setEvents,
    posts,
    setPosts,
    createPost,
    createEvent,
    fetchUserProfile,
    updateUserProfile,
    addComment,
    updateComment,
    deleteComment,
    likePost,
    unlikePost,
    loading,
    announcements,
    postAnnouncement,
    products,
    workshops,
    
    // Add the rest of the properties
    joinEvent,
    leaveEvent,
    deleteEvent,
    
    // Group related properties
    groups,
    createGroup,
    joinGroup,
    leaveGroup,
    requestToJoinGroup,
    removeGroupMember,
    updateGroupDetails,
    getGroupRequests,
    deleteGroup,
    
    // Message related properties
    messages,
    setMessages,
    sendMessage,
    
    // Service related properties
    services,
    createService,
    updateService,
    getServiceById,
    getUserBookings,
    getUserBookingForService,
    getServiceBookings,
    approveBooking,
    cancelBooking,
    bookService,
    
    // Service Chat properties
    sendServiceMessage,
    getServiceMessages,
    
    // Session related properties
    sessions,
    sessionEnrollments,
    createSession,
    getUserSessions,
    getCoachSessions,
    getUserEnrollments,
    updateSession,
    updateEnrollmentStatus,
    enrollInSession,
    cancelEnrollment,
    
    // Join request properties
    joinRequests,
    approveEventRequest,
    rejectEventRequest,
    handleJoinRequest,
    
    // Comment related properties
    postComments,
  };

  return (
    <DataContext.Provider value={value}>
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
