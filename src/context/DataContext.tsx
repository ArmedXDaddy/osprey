import React, { createContext, useState, useEffect, useContext } from 'react';
import { Event, Post, UserProfile, Comment } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { 
  supabase, 
  uploadImage, 
  createEventInDb,
  uploadEventImage,
  fetchProducts,
  fetchWorkshops,
} from '@/integrations/supabase/helpers';

interface DataContextType {
  events: Event[];
  completedEvents: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  createPost: (content: string, image: File | null) => Promise<void>;
  createEvent: (eventData: any) => Promise<any>;
  fetchUserProfile: (userId: string) => Promise<UserProfile | null>;
  updateUserProfile: (userId: string, updates: Partial<UserProfile>) => Promise<void>;
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

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
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

      return data as UserProfile;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  };

  const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<void> => {
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
        createdAt: new Date().toISOString(),
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
        pending_requests: 0
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
        createdAt: new Date().toISOString(),
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
              commentsCount: (post.commentsCount || 1) - 1,
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
