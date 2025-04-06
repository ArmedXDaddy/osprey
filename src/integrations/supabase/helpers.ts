import { supabase } from './client';
import { BookingStatus, PaymentStatus, Product, Workshop, Booking, Service, Comment } from '@/types';

export const fetchPosts = async () => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
};

export const fetchPost = async (postId: string) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (error) {
      console.error("Error fetching post:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
};

export const createPost = async (
  userId: string,
  userName: string,
  userRole: string,
  userProfileImage: string | null | undefined,
  content: string,
  image?: string
) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          user_id: userId,
          user_name: userName,
          user_role: userRole,
          user_profile_image: userProfileImage,
          content: content,
          image: image,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating post:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error creating post:", error);
    return null;
  }
};

export const updatePost = async (
  postId: string,
  content: string,
  image?: string
) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .update({ content: content, image: image })
      .eq('id', postId)
      .select()
      .single();

    if (error) {
      console.error("Error updating post:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error updating post:", error);
    return null;
  }
};

export const deletePost = async (postId: string) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error("Error deleting post:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting post:", error);
    return false;
  }
};

export const likePost = async (postId: string, userId: string) => {
  try {
    // First, check if the user has already liked the post
    const { data: existingLike, error: existingLikeError } = await supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingLikeError) {
      throw existingLikeError;
    }

    if (existingLike) {
      // User has already liked the post, so unlike it
      const { error: deleteError } = await supabase
        .from('post_likes')
        .delete()
        .eq('id', existingLike.id);

      if (deleteError) {
        throw deleteError;
      }

      // Decrement the like count in the posts table
      const { error: decrementError } = await supabase.rpc('decrement_post_likes', { post_id: postId });

      if (decrementError) {
        throw decrementError;
      }

      return false; // Indicate that the post is now unliked
    } else {
      // User has not liked the post, so like it
      const { error: insertError } = await supabase
        .from('post_likes')
        .insert([{ post_id: postId, user_id: userId }]);

      if (insertError) {
        throw insertError;
      }

      // Increment the like count in the posts table
      const { error: incrementError } = await supabase.rpc('increment_post_likes', { post_id: postId });

      if (incrementError) {
        throw incrementError;
      }

      return true; // Indicate that the post is now liked
    }
  } catch (error) {
    console.error("Error liking/unliking post:", error);
    throw error;
  }
};

export const getPostLikes = async (postId: string) => {
  try {
    const { data, error } = await supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', postId);

    if (error) {
      console.error("Error fetching post likes:", error);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Error fetching post likes:", error);
    return [];
  }
};

export const createComment = async (
  postId: string,
  userId: string,
  userName: string,
  userRole: string,
  userProfileImage: string | null | undefined,
  content: string
) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          post_id: postId,
          user_id: userId,
          user_name: userName,
          user_role: userRole,
          user_profile_image: userProfileImage,
          content: content,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating comment:", error);
      return null;
    }

     // Increment the comment count in the posts table
     const { error: incrementError } = await supabase.rpc('increment_post_comments', { post_id: postId });

     if (incrementError) {
       throw incrementError;
     }

    return data;
  } catch (error) {
    console.error("Error creating comment:", error);
    return null;
  }
};

export const getComments = async (postId: string) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
};

export const updateComment = async (commentId: string, content: string) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .update({ content })
      .eq('id', commentId)
      .select()
      .single();

    if (error) {
      console.error("Error updating comment:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error updating comment:", error);
    return null;
  }
};

export const deleteComment = async (commentId: string, postId: string) => {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error("Error deleting comment:", error);
      return false;
    }

    // Decrement the comment count in the posts table
    const { error: decrementError } = await supabase.rpc('decrement_post_comments', { post_id: postId });

    if (decrementError) {
      throw decrementError;
    }

    return true;
  } catch (error) {
    console.error("Error deleting comment:", error);
    return false;
  }
};

export const fetchEvents = async () => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching events:", error);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
};

export const fetchEvent = async (eventId: string) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) {
      console.error("Error fetching event:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
};

export const createEvent = async (
  title: string,
  description: string,
  creatorId: string,
  creatorName: string,
  creatorRole: string,
  location: string,
  date: string,
  image: string | undefined,
  privacy: string,
  price: number | undefined,
  attendees: string[] | undefined,
  pendingRequests: number | undefined
) => {
  try {
    const { data, error } = await supabase.rpc('create_event', {
      title,
      description,
      creator_id: creatorId,
      creator_name: creatorName,
      creator_role: creatorRole,
      location,
      date,
      image: image || '',
      privacy,
      price: price || 0,
      attendees: attendees || [],
      pending_requests: pendingRequests || 0,
    });

    if (error) {
      console.error("Error creating event:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error creating event:", error);
    return null;
  }
};

export const updateEvent = async (
  eventId: string,
  title: string,
  description: string,
  location: string,
  date: string,
  image: string | undefined,
  privacy: string,
  price: number | undefined
) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .update({
        title,
        description,
        location,
        date,
        image,
        privacy,
        price,
      })
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      console.error("Error updating event:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error updating event:", error);
    return null;
  }
};

export const deleteEvent = async (eventId: string) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error("Error deleting event:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting event:", error);
    return false;
  }
};

export const fetchGroups = async () => {
  try {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching groups:", error);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Error fetching groups:", error);
    return [];
  }
};

export const fetchGroup = async (groupId: string) => {
  try {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (error) {
      console.error("Error fetching group:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching group:", error);
    return null;
  }
};

export const createGroup = async (
  name: string,
  description: string,
  creatorId: string,
  creatorName: string,
  creatorRole: string,
  image: string | undefined,
  privacy: string,
  price: number | undefined,
  rules: string[] | undefined
) => {
  try {
    const { data, error } = await supabase
      .from('groups')
      .insert([
        {
          name,
          description,
          creator_id: creatorId,
          creator_name: creatorName,
          creator_role: creatorRole,
          image,
          privacy,
          price,
          rules,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating group:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error creating group:", error);
    return null;
  }
};

export const updateGroup = async (
  groupId: string,
  name: string,
  description: string,
  image: string | undefined,
  privacy: string,
  price: number | undefined,
  rules: string[] | undefined
) => {
  try {
    const { data, error } = await supabase
      .from('groups')
      .update({
        name,
        description,
        image,
        privacy,
        price,
        rules,
      })
      .eq('id', groupId)
      .select()
      .single();

    if (error) {
      console.error("Error updating group:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error updating group:", error);
    return null;
  }
};

export const deleteGroup = async (groupId: string) => {
  try {
    const { data, error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);

    if (error) {
      console.error("Error deleting group:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting group:", error);
    return false;
  }
};

export const joinGroup = async (groupId: string, userId: string, userName: string, userProfileImage: string | null | undefined) => {
  try {
    // Check if the user is already a member of the group
    const { data: existingMember, error: existingMemberError } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingMemberError) {
      throw existingMemberError;
    }

    if (existingMember) {
      // User is already a member
      console.log("User is already a member of the group.");
      return false;
    }

    // Add the user to the group_members table
    const { error: addMemberError } = await supabase
      .from('group_members')
      .insert([{ group_id: groupId, user_id: userId }]);

    if (addMemberError) {
      throw addMemberError;
    }

    // Increment the member count in the groups table
    const { error: incrementError } = await supabase.rpc('increment_group_members', { group_id: groupId });

    if (incrementError) {
      throw incrementError;
    }

    return true;
  } catch (error) {
    console.error("Error joining group:", error);
    throw error;
  }
};

export const leaveGroup = async (groupId: string, userId: string) => {
  try {
    // Remove the user from the group_members table
    const { error: removeMemberError } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (removeMemberError) {
      throw removeMemberError;
    }

    // Decrement the member count in the groups table
    const { error: decrementError } = await supabase.rpc('decrement_group_members', { group_id: groupId });

    if (decrementError) {
      throw decrementError;
    }

    return true;
  } catch (error) {
    console.error("Error leaving group:", error);
    throw error;
  }
};

export const getGroupMembers = async (groupId: string) => {
  try {
    const { data, error } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId);

    if (error) {
      console.error("Error fetching group members:", error);
      return [];
    }

    return data.map(member => member.user_id);
  } catch (error) {
    console.error("Error fetching group members:", error);
    return [];
  }
};

export const createServiceBooking = async (
  serviceId: string,
  userId: string,
  notes?: string,
  paymentStatus: PaymentStatus = 'unpaid',
  status: BookingStatus = 'pending'
): Promise<string> => {
  try {
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('name, email, profile_image')
      .eq('id', userId)
      .single();
    
    if (userError) throw userError;
    
    const booking = {
      service_id: serviceId,
      user_id: userId,
      notes,
      payment_status: paymentStatus,
      status
    };
    
    const { data, error } = await supabase
      .from('service_bookings')
      .insert(booking)
      .select()
      .single();
      
    if (error) throw error;
    
    return data.id;
  } catch (error) {
    console.error('Error creating service booking:', error);
    throw error;
  }
};

export const getUserBookings = async (userId: string): Promise<Booking[]> => {
  try {
    const { data, error } = await supabase.rpc('get_user_bookings', {
      p_user_id: userId,
    });

    if (error) {
      console.error("Error fetching user bookings:", error);
      return [];
    }

    return data.map((item: any) => ({
      id: item.id,
      serviceId: item.service_id,
      userId: item.user_id,
      userName: item.user_name,
      userEmail: item.user_email,
      status: item.status as BookingStatus,
      paymentStatus: item.payment_status as PaymentStatus,
      notes: item.notes,
      createdAt: new Date(item.created_at),
      serviceTitle: item.service_title,
      coachName: item.coach_name,
      price: item.price,
      duration: item.duration,
      isOnline: item.is_online,
      serviceType: item.service_type as ServiceType,
    }));
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return [];
  }
};

export const getServiceBookings = async (serviceId: string): Promise<Booking[]> => {
  try {
    const { data, error } = await supabase.rpc('get_service_bookings', {
      p_service_id: serviceId,
    });

    if (error) {
      console.error("Error fetching service bookings:", error);
      return [];
    }

    return data.map((item: any) => ({
      id: item.id,
      serviceId: item.service_id,
      userId: item.user_id,
      userName: item.user_name,
      userEmail: item.user_email,
      status: item.status as BookingStatus,
      paymentStatus: item.payment_status as PaymentStatus,
      notes: item.notes,
      createdAt: new Date(item.created_at),
    }));
  } catch (error) {
    console.error("Error fetching service bookings:", error);
    return [];
  }
};

export const getUserBookingForService = async (serviceId: string, userId: string): Promise<Booking | null> => {
  try {
    const { data, error } = await supabase.rpc('get_user_booking_for_service', {
      p_service_id: serviceId,
      p_user_id: userId,
    });

    if (error) {
      console.error("Error fetching user booking for service:", error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    // Assuming the function returns a single booking, take the first element
    const item = data[0];

    return {
      id: item.id,
      serviceId: item.service_id,
      userId: item.user_id,
      userName: item.user_name,
      userEmail: item.user_email,
      status: item.status as BookingStatus,
      paymentStatus: item.payment_status as PaymentStatus,
      notes: item.notes,
      createdAt: new Date(item.created_at),
    };
  } catch (error) {
    console.error("Error fetching user booking for service:", error);
    return null;
  }
};

export const cancelBooking = async (bookingId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('service_bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (error) {
      console.error("Error cancelling booking:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return false;
  }
};

export const approveBooking = async (bookingId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('service_bookings')
      .update({ status: 'approved' })
      .eq('id', bookingId);

    if (error) {
      console.error("Error approving booking:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error approving booking:", error);
    return false;
  }
};

export const sendServiceChatMessage = async (serviceId: string, userId: string, content: string): Promise<string | null> => {
  try {
    // Call the Supabase function
    const { data, error } = await supabase.rpc('send_service_chat_message', {
      p_service_id: serviceId,
      p_user_id: userId,
      p_content: content,
    });

    if (error) {
      console.error("Error sending service chat message:", error);
      return null;
    }

    // The function should return the ID of the new message
    return data;
  } catch (error) {
    console.error("Error sending service chat message:", error);
    return null;
  }
};

export const getServiceChatMessages = async (serviceId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase.rpc('get_service_chat_messages', {
      p_service_id: serviceId,
    });

    if (error) {
      console.error("Error fetching service chat messages:", error);
      return [];
    }

    // Map the data to the Message interface
    return data.map((item: any) => ({
      id: item.id,
      serviceId: item.service_id,
      userId: item.user_id,
      userName: item.user_name,
      userProfileImage: item.user_profile_image,
      content: item.content,
      createdAt: new Date(item.created_at),
      userRole: item.user_role,
    }));
  } catch (error) {
    console.error("Error fetching service chat messages:", error);
    return [];
  }
};

export const uploadImage = async (file: File, folderName: string): Promise<string | null> => {
  try {
    const timestamp = new Date().getTime();
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}.${fileExt}`;
    const filePath = `${folderName}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('covers') // Replace 'your_bucket_name' with your actual bucket name
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    // Construct public URL
    const publicUrl = `https://zovddtldwqxlgjpprddb.supabase.co/storage/v1/object/public/covers/${filePath}`;
    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      companyId: item.company_id,
      companyName: item.company_name,
      companyLogo: item.company_logo,
      price: item.price,
      category: item.category,
      tags: item.tags,
      image: item.image,
      features: item.features,
      demoUrl: item.demo_url,
      websiteUrl: item.website_url,
      releaseDate: new Date(item.release_date),
      createdAt: new Date(item.created_at)
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const fetchWorkshops = async (): Promise<Workshop[]> => {
  try {
    const { data, error } = await supabase
      .from('workshops')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      longDescription: item.long_description,
      companyId: item.company_id,
      companyName: item.company_name,
      companyLogo: item.company_logo,
      date: new Date(item.date),
      duration: item.duration,
      startTime: item.start_time,
      endTime: item.end_time,
      price: item.price,
      category: item.category,
      topics: item.topics,
      prerequisites: item.prerequisites,
      includes: item.includes,
      tags: item.tags,
      image: item.image,
      capacity: item.capacity,
      isOnline: item.is_online,
      location: item.location,
      meetingUrl: item.meeting_url,
      instructors: item.instructors,
      createdAt: new Date(item.created_at)
    }));
  } catch (error) {
    console.error('Error fetching workshops:', error);
    return [];
  }
};
