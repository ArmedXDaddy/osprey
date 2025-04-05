
import { supabase } from '@/integrations/supabase/client';
import { Post } from '@/types';

// Fetch posts by user ID
export const fetchPostsByUserId = async (userId: string): Promise<Post[]> => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }

  return data ? data.map(post => ({
    id: post.id,
    userId: post.user_id,
    userName: post.user_name,
    userRole: post.user_role,
    userProfileImage: post.user_profile_image,
    content: post.content,
    image: post.image,
    likes: post.likes,
    comments: post.comments,
    createdAt: new Date(post.created_at)
  })) : [];
};

// Create a new post
export const createPost = async (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments'>): Promise<Post | null> => {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: post.userId,
      user_name: post.userName,
      user_role: post.userRole,
      user_profile_image: post.userProfileImage,
      content: post.content,
      image: post.image,
      likes: 0,
      comments: 0
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating post:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    userName: data.user_name,
    userRole: data.user_role,
    userProfileImage: data.user_profile_image,
    content: data.content,
    image: data.image,
    likes: data.likes,
    comments: data.comments,
    createdAt: new Date(data.created_at)
  };
};
