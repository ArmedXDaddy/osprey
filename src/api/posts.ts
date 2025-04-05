
import { supabase } from '@/integrations/supabase/client';
import { Post } from '@/types';

// Fetch posts by user ID - using mock data for now
export const fetchPostsByUserId = async (userId: string): Promise<Post[]> => {
  try {
    // Mock data since posts table doesn't exist in Supabase yet
    return [
      {
        id: '1',
        userId: userId,
        userName: 'User Name',
        userRole: 'user',
        content: 'This is a sample post content',
        likes: 0,
        comments: 0,
        createdAt: new Date()
      }
    ];
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

// Create a new post - using mock implementation for now
export const createPost = async (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments'>): Promise<Post | null> => {
  try {
    // For now, returning a mock response
    return {
      id: Math.random().toString(36).substring(2, 9),
      userId: post.userId,
      userName: post.userName,
      userRole: post.userRole,
      userProfileImage: post.userProfileImage,
      content: post.content,
      image: post.image,
      likes: 0,
      comments: 0,
      createdAt: new Date()
    };
  } catch (error) {
    console.error('Error creating post:', error);
    return null;
  }
};

// Function to fetch posts for a user profile
export const fetchUserPosts = async (userId: string): Promise<Post[]> => {
  return fetchPostsByUserId(userId);
};
