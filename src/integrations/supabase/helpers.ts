import { supabase } from './client';
import { generateId } from '@/utils';
import { Service, Booking, Session, SessionEnrollment, Message, UserRole, BookingStatus, PaymentStatus, GroupPrivacy } from '@/types';

/**
 * Function to upload an image to Supabase storage
 * @param file The file to upload
 * @param filePath The path where the file should be stored
 * @returns The public URL of the uploaded image
 */
export const uploadImage = async (file: File, filePath: string): Promise<string> => {
  // Extract bucket name from filePath (usually the first segment)
  const bucketName = filePath.split('/')[0] || 'covers';

  // Upload the file to Supabase storage
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }

  // Get the public URL for the uploaded file
  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
};

export const createUserProfile = async (user: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([
      {
        id: user.id,
        email: user.email,
      },
    ]);

  if (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }

  return data;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }

  return data;
};

export const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }

  return data;
};

export const getPosts = async () => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }

  return data;
};

export const createPost = async (post: any) => {
  const { data, error } = await supabase
    .from('posts')
    .insert([post]);

  if (error) {
    console.error('Error creating post:', error);
    throw error;
  }

  return data;
};

export const updatePost = async (postId: string, updates: any) => {
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', postId);

  if (error) {
    console.error('Error updating post:', error);
    throw error;
  }

  return data;
};

export const deletePost = async (postId: string) => {
  const { data, error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);

  if (error) {
    console.error('Error deleting post:', error);
    throw error;
  }

  return data;
};

export const createComment = async (comment: any) => {
  const { data, error } = await supabase
    .from('comments')
    .insert([comment]);

  if (error) {
    console.error('Error creating comment:', error);
    throw error;
  }

  return data;
};

export const updateMessage = async (messageId: string, updates: any) => {
  const { data, error } = await supabase
    .from('messages')
    .update(updates)
    .eq('id', messageId);

  if (error) {
    console.error('Error updating message:', error);
    throw error;
  }

  return data;
};

export const deleteMessage = async (messageId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId);

  if (error) {
    console.error('Error deleting message:', error);
    throw error;
  }

  return data;
};

export const getMessages = async (senderId: string, receiverId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(senderId.eq.${senderId}, receiverId.eq.${receiverId}),and(senderId.eq.${receiverId}, receiverId.eq.${senderId})`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }

  return data;
};

export const createService = async (service: Service) => {
  const { data, error } = await supabase
    .from('services')
    .insert([service]);

  if (error) {
    console.error('Error creating service:', error);
    throw error;
  }

  return data;
};

export const getServices = async () => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching services:', error);
    throw error;
  }

  return data;
};

export const updateService = async (serviceId: string, updates: any) => {
  const { data, error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', serviceId);

  if (error) {
    console.error('Error updating service:', error);
    throw error;
  }

  return data;
};

export const deleteService = async (serviceId: string) => {
  const { data, error } = await supabase
    .from('services')
    .delete()
    .eq('id', serviceId);

  if (error) {
    console.error('Error deleting service:', error);
    throw error;
  }

  return data;
};

export const createProduct = async (product: Product) => {
  const { data, error } = await supabase
    .from('products')
    .insert([product]);

  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }

  return data;
};

export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  return data;
};

export const updateProduct = async (productId: string, updates: any) => {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productId);

  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }

  return data;
};

export const deleteProduct = async (productId: string) => {
  const { data, error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }

  return data;
};

export const createWorkshop = async (workshop: Workshop) => {
  const { data, error } = await supabase
    .from('workshops')
    .insert([workshop]);

  if (error) {
    console.error('Error creating workshop:', error);
    throw error;
  }

  return data;
};

export const getWorkshops = async () => {
  const { data, error } = await supabase
    .from('workshops')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching workshops:', error);
    throw error;
  }

  return data;
};

export const updateWorkshop = async (workshopId: string, updates: any) => {
  const { data, error } = await supabase
    .from('workshops')
    .update(updates)
    .eq('id', workshopId);

  if (error) {
    console.error('Error updating workshop:', error);
    throw error;
  }

  return data;
};

export const deleteWorkshop = async (workshopId: string) => {
  const { data, error } = await supabase
    .from('workshops')
    .delete()
    .eq('id', workshopId);

  if (error) {
    console.error('Error deleting workshop:', error);
    throw error;
  }

  return data;
};

export const createGroup = async (group: Group) => {
  const { data, error } = await supabase
    .from('groups')
    .insert([group]);

  if (error) {
    console.error('Error creating group:', error);
    throw error;
  }

  return data;
};

export const getGroups = async () => {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching groups:', error);
    throw error;
  }

  return data;
};

export const updateGroup = async (groupId: string, updates: any) => {
  const { data, error } = await supabase
    .from('groups')
    .update(updates)
    .eq('id', groupId);

  if (error) {
    console.error('Error updating group:', error);
    throw error;
  }

  return data;
};

export const deleteGroup = async (groupId: string) => {
  const { data, error } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId);

  if (error) {
    console.error('Error deleting group:', error);
    throw error;
  }

  return data;
};

export const createJoinRequest = async (joinRequest: any) => {
  const { data, error } = await supabase
    .from('join_requests')
    .insert([joinRequest]);

  if (error) {
    console.error('Error creating join request:', error);
    throw error;
  }

  return data;
};

export const getJoinRequests = async (groupId: string) => {
  const { data, error } = await supabase
    .from('join_requests')
    .select('*')
    .eq('groupId', groupId);

  if (error) {
    console.error('Error fetching join requests:', error);
    throw error;
  }

  return data;
};

export const updateJoinRequest = async (joinRequestId: string, updates: any) => {
  const { data, error } = await supabase
    .from('join_requests')
    .update(updates)
    .eq('id', joinRequestId);

  if (error) {
    console.error('Error updating join request:', error);
    throw error;
  }

  return data;
};

export const deleteJoinRequest = async (joinRequestId: string) => {
  const { data, error } = await supabase
    .from('join_requests')
    .delete()
    .eq('id', joinRequestId);

  if (error) {
    console.error('Error deleting join request:', error);
    throw error;
  }

  return data;
};
