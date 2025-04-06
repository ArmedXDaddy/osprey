import { supabase } from './client';
import { generateId } from '@/utils';
import { Service, Booking, Session, SessionEnrollment, Message, UserRole, BookingStatus, PaymentStatus, GroupPrivacy } from '@/types';

// Function to create a user profile
export const createUserProfile = async (userId: string, email: string, name: string, role: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([
      {
        id: userId,
        email: email,
        name: name,
        role: role,
      },
    ])
    .select()

  if (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }

  return data;
};

// Function to get user profile by ID
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

// Function to update user profile
export const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }

  return data;
};

// Function to get all posts
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

// Function to create a new post
export const createPost = async (postData: any) => {
  const { data, error } = await supabase
    .from('posts')
    .insert([
      {
        ...postData,
        id: generateId(),
        likes_count: 0,
        comments_count: 0
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating post:', error);
    throw error;
  }

  return data;
};

// Function to update an existing post
export const updatePost = async (postId: string, updates: any) => {
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', postId)
    .select()
    .single();

  if (error) {
    console.error('Error updating post:', error);
    throw error;
  }

  return data;
};

// Function to delete a post
export const deletePost = async (postId: string) => {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);

  if (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

// Function to get comments for a specific post
export const getComments = async (postId: string) => {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }

  return data;
};

// Function to create a new comment
export const createComment = async (commentData: any) => {
  const { data, error } = await supabase
    .from('comments')
    .insert([
      {
        ...commentData,
        id: generateId(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating comment:', error);
    throw error;
  }

  // Increment comments count on the post
  await incrementPostComments(commentData.postId);

  return data;
};

// Function to update an existing comment
export const updateComment = async (commentId: string, updates: any) => {
  const { data, error } = await supabase
    .from('comments')
    .update(updates)
    .eq('id', commentId)
    .select()
    .single();

  if (error) {
    console.error('Error updating comment:', error);
    throw error;
  }

  return data;
};

// Function to delete a comment
export const deleteComment = async (commentId: string, postId: string) => {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }

  // Decrement comments count on the post
  await decrementPostComments(postId);
};

// Function to increment likes count on a post
export const incrementPostLikes = async (postId: string) => {
  const { error } = await supabase.rpc('increment_post_likes', { post_id: postId });

  if (error) {
    console.error('Error incrementing post likes:', error);
    throw error;
  }
};

// Function to decrement likes count on a post
export const decrementPostLikes = async (postId: string) => {
  const { error } = await supabase.rpc('decrement_post_likes', { post_id: postId });

  if (error) {
    console.error('Error decrementing post likes:', error);
    throw error;
  }
};

// Function to increment comments count on a post
export const incrementPostComments = async (postId: string) => {
  const { error } = await supabase.rpc('increment_post_comments', { post_id: postId });

  if (error) {
    console.error('Error incrementing post comments:', error);
    throw error;
  }
};

// Function to decrement comments count on a post
export const decrementPostComments = async (postId: string) => {
  const { error } = await supabase.rpc('decrement_post_comments', { post_id: postId });

  if (error) {
    console.error('Error decrementing post comments:', error);
    throw error;
  }
};

// Function to get all events
export const getEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching events:', error);
    throw error;
  }

  return data;
};

// Function to create a new event
export const createEvent = async (eventData: any) => {
  const { data, error } = await supabase
    .from('events')
    .insert([
      {
        ...eventData,
        id: generateId(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error);
    throw error;
  }

  return data;
};

// Function to update an existing event
export const updateEvent = async (eventId: string, updates: any) => {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', eventId)
    .select()
    .single();

  if (error) {
    console.error('Error updating event:', error);
    throw error;
  }

  return data;
};

// Function to delete an event
export const deleteEvent = async (eventId: string) => {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId);

  if (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// Function to get all groups
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

// Function to create a new group
export const createGroup = async (groupData: any) => {
  const { data, error } = await supabase
    .from('groups')
    .insert([
      {
        ...groupData,
        id: generateId(),
        members: 1,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating group:', error);
    throw error;
  }

  return data;
};

// Function to update an existing group
export const updateGroup = async (groupId: string, updates: any) => {
  const { data, error } = await supabase
    .from('groups')
    .update(updates)
    .eq('id', groupId)
    .select()
    .single();

  if (error) {
    console.error('Error updating group:', error);
    throw error;
  }

  return data;
};

// Function to delete a group
export const deleteGroup = async (groupId: string) => {
  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId);

  if (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
};

// Function to get all services
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

// Function to create a new service
export const createService = async (serviceData: any) => {
  const { data, error } = await supabase
    .from('services')
    .insert([
      {
        ...serviceData,
        id: generateId(),
        coach_id: serviceData.providerId,
        coach_name: serviceData.providerName,
        is_active: true,
        is_free: false,
        updated_at: new Date(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating service:', error);
    throw error;
  }

  return data;
};

// Function to update an existing service
export const updateService = async (serviceId: string, updates: any) => {
  const { data, error } = await supabase
    .from('services')
    .update({
      ...updates,
      updated_at: new Date(),
    })
    .eq('id', serviceId)
    .select()
    .single();

  if (error) {
    console.error('Error updating service:', error);
    throw error;
  }

  return data;
};

// Function to delete a service
export const deleteService = async (serviceId: string) => {
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', serviceId);

  if (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
};

// Function to get all sessions
export const getSessions = async () => {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }

  return data;
};

// Function to create a new session
export const createSession = async (sessionData: any) => {
   const { data, error } = await supabase
    .from('sessions')
    .insert([
      {
        ...sessionData,
        id: generateId(),
        coach_id: sessionData.providerId,
        coach_name: sessionData.providerName,
        is_active: true,
        is_online: true,
        updated_at: new Date(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating session:', error);
    throw error;
  }

  return data;
};

// Function to update an existing session
export const updateSession = async (sessionId: string, updates: any) => {
  const { data, error } = await supabase
    .from('sessions')
    .update({
      ...updates,
      updated_at: new Date(),
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating session:', error);
    throw error;
  }

  return data;
};

// Function to delete a session
export const deleteSession = async (sessionId: string) => {
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', sessionId);

  if (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
};

// Function to get all session enrollments
export const getSessionEnrollments = async () => {
  const { data, error } = await supabase
    .from('session_enrollments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching session enrollments:', error);
    throw error;
  }

  return data;
};

// Function to create a new session enrollment
export const createSessionEnrollment = async (enrollmentData: any) => {
  const { data, error } = await supabase
    .from('session_enrollments')
    .insert([
      {
        ...enrollmentData,
        id: generateId(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating session enrollment:', error);
    throw error;
  }

  return data;
};

// Function to update an existing session enrollment
export const updateSessionEnrollment = async (enrollmentId: string, updates: any) => {
  const { data, error } = await supabase
    .from('session_enrollments')
    .update(updates)
    .eq('id', enrollmentId)
    .select()
    .single();

  if (error) {
    console.error('Error updating session enrollment:', error);
    throw error;
  }

  return data;
};

// Function to delete a session enrollment
export const deleteSessionEnrollment = async (enrollmentId: string) => {
  const { error } = await supabase
    .from('session_enrollments')
    .delete()
    .eq('id', enrollmentId);

  if (error) {
    console.error('Error deleting session enrollment:', error);
    throw error;
  }
};

// Function to get all messages
export const getMessages = async () => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }

  return data;
};

// Function to create a new message
export const createMessage = async (messageData: any) => {
  const { data, error } = await supabase
    .from('messages')
    .insert([
      {
        ...messageData,
        id: generateId(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating message:', error);
    throw error;
  }

  return data;
};

// Function to update an existing message
export const updateMessage = async (messageId: string, updates: any) => {
  const { data, error } = await supabase
    .from('messages')
    .update(updates)
    .eq('id', messageId)
    .select()
    .single();

  if (error) {
    console.error('Error updating message:', error);
    throw error;
  }

  return data;
};

// Function to delete a message
export const deleteMessage = async (messageId: string) => {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId);

  if (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

// Function to get all join requests
export const getJoinRequests = async () => {
  const { data, error } = await supabase
    .from('join_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching join requests:', error);
    throw error;
  }

  return data;
};

// Function to create a new join request
export const createJoinRequest = async (joinRequestData: any) => {
  const { data, error } = await supabase
    .from('join_requests')
    .insert([
      {
        ...joinRequestData,
        id: generateId(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating join request:', error);
    throw error;
  }

  return data;
};

// Function to update an existing join request
export const updateJoinRequest = async (joinRequestId: string, updates: any) => {
  const { data, error } = await supabase
    .from('join_requests')
    .update(updates)
    .eq('id', joinRequestId)
    .select()
    .single();

  if (error) {
    console.error('Error updating join request:', error);
    throw error;
  }

  return data;
};

// Function to delete a join request
export const deleteJoinRequest = async (joinRequestId: string) => {
  const { error } = await supabase
    .from('join_requests')
    .delete()
    .eq('id', joinRequestId);

  if (error) {
    console.error('Error deleting join request:', error);
    throw error;
  }
};

// Function to get all products
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

// Function to create a new product
export const createProduct = async (productData: any) => {
  const { data, error } = await supabase
    .from('products')
    .insert([
      {
        ...productData,
        id: generateId(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }

  return data;
};

// Function to update an existing product
export const updateProduct = async (productId: string, updates: any) => {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productId)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }

  return data;
};

// Function to delete a product
export const deleteProduct = async (productId: string) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Function to get all workshops
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

// Function to create a new workshop
export const createWorkshop = async (workshopData: any) => {
  const { data, error } = await supabase
    .from('workshops')
    .insert([
      {
        ...workshopData,
        id: generateId(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating workshop:', error);
    throw error;
  }

  return data;
};

// Function to update an existing workshop
export const updateWorkshop = async (workshopId: string, updates: any) => {
  const { data, error } = await supabase
    .from('workshops')
    .update(updates)
    .eq('id', workshopId)
    .select()
    .single();

  if (error) {
    console.error('Error updating workshop:', error);
    throw error;
  }

  return data;
};

// Function to delete a workshop
export const deleteWorkshop = async (workshopId: string) => {
  const { error } = await supabase
    .from('workshops')
    .delete()
    .eq('id', workshopId);

  if (error) {
    console.error('Error deleting workshop:', error);
    throw error;
  }
};

// Function to get all job postings
export const getJobPostings = async () => {
  const { data, error } = await supabase
    .from('job_postings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching job postings:', error);
    throw error;
  }

  return data;
};

// Function to create a new job posting
export const createJobPosting = async (jobPostingData: any) => {
  const { data, error } = await supabase
    .from('job_postings')
    .insert([
      {
        ...jobPostingData,
        id: generateId(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating job posting:', error);
    throw error;
  }

  return data;
};

// Function to update an existing job posting
export const updateJobPosting = async (jobPostingId: string, updates: any) => {
  const { data, error } = await supabase
    .from('job_postings')
    .update(updates)
    .eq('id', jobPostingId)
    .select()
    .single();

  if (error) {
    console.error('Error updating job posting:', error);
    throw error;
  }

  return data;
};

// Function to delete a job posting
export const deleteJobPosting = async (jobPostingId: string) => {
  const { error } = await supabase
    .from('job_postings')
    .delete()
    .eq('id', jobPostingId);

  if (error) {
    console.error('Error deleting job posting:', error);
    throw error;
  }
};

// Function to create a new booking
export const createBooking = async (bookingData: any) => {
  const booking: Booking = {
    id: generateId(),
    serviceId: bookingData.serviceId,
    userId: bookingData.userId,
    userName: bookingData.userName,
    userProfileImage: bookingData.userProfileImage,
    status: bookingData.status,
    paymentStatus: bookingData.paymentStatus,
    notes: bookingData.notes,
    createdAt: new Date(),
    scheduledTime: bookingData.scheduledTime,
    preferredTime: bookingData.preferredTime,
    userEmail: bookingData.userEmail,
  };

  const { data, error } = await supabase
    .from('service_bookings')
    .insert([
      {
        id: booking.id,
        service_id: booking.serviceId,
        user_id: booking.userId,
        status: booking.status,
        payment_status: booking.paymentStatus,
        notes: booking.notes,
        created_at: booking.createdAt.toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating booking:', error);
    throw error;
  }

  return data as Booking;
};

// Function to update an existing booking
export const updateBooking = async (bookingId: string, updates: any) => {
  const { data, error } = await supabase
    .from('service_bookings')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) {
    console.error('Error updating booking:', error);
    throw error;
  }

  return data;
};

// Function to delete a booking
export const deleteBooking = async (bookingId: string) => {
  const { error } = await supabase
    .from('service_bookings')
    .delete()
    .eq('id', bookingId);

  if (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }
};

export const getServiceBookings = async (serviceId: string): Promise<Booking[]> => {
  try {
    const { data, error } = await supabase.rpc('get_service_bookings', {
      p_service_id: serviceId,
    });

    if (error) {
      console.error('Error fetching service bookings:', error);
      throw error;
    }

    // Map the data to the Booking type
    const bookings: Booking[] = data.map((item: any) => ({
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

    return bookings;
  } catch (error: any) {
    console.error('Error in getServiceBookings:', error);
    throw error;
  }
};

export const getUserBookings = async (userId: string): Promise<Booking[]> => {
  try {
    const { data, error } = await supabase.rpc('get_user_bookings', {
      p_user_id: userId,
    });

    if (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }

    // Map the data to the Booking type
    const bookings: Booking[] = data.map((item: any) => ({
      id: item.id,
      serviceId: item.service_id,
      userId: item.user_id,
      userName: item.user_name,
      userEmail: item.user_email,
      status: item.status as BookingStatus,
      paymentStatus: item.payment_status as PaymentStatus,
      notes: item.notes,
      createdAt: new Date(item.created_at),
      scheduledTime: new Date(item.created_at),
      serviceTitle: item.service_title,
      coachName: item.coach_name,
      price: item.price,
      duration: item.duration,
      isOnline: item.is_online,
      serviceType: item.service_type,
    }));

    return bookings;
  } catch (error: any) {
    console.error('Error in getUserBookings:', error);
    throw error;
  }
};

export const getUserBookingForService = async (serviceId: string, userId: string): Promise<Booking | null> => {
    try {
        const { data, error } = await supabase.rpc('get_user_booking_for_service', {
            p_service_id: serviceId,
            p_user_id: userId,
        });

        if (error) {
            console.error('Error fetching user booking for service:', error);
            return null;
        }

        if (!data || data.length === 0) {
            return null;
        }

        // Map the data to the Booking type
        const bookingData = data[0];
        const booking: Booking = {
            id: bookingData.id,
            serviceId: bookingData.service_id,
            userId: bookingData.user_id,
            userName: bookingData.user_name,
            userEmail: bookingData.user_email,
            status: bookingData.status as BookingStatus,
            paymentStatus: bookingData.payment_status as PaymentStatus,
            notes: bookingData.notes,
            createdAt: new Date(bookingData.created_at),
        };

        return booking;
    } catch (error: any) {
        console.error('Error in getUserBookingForService:', error);
        return null;
    }
};

export const sendServiceChatMessage = async (serviceId: string, userId: string, content: string): Promise<string> => {
  try {
    const { data, error } = await supabase.rpc('send_service_chat_message', {
      p_service_id: serviceId,
      p_user_id: userId,
      p_content: content,
    });

    if (error) {
      console.error('Error sending service chat message:', error);
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('Error in sendServiceChatMessage:', error);
    throw error;
  }
};

export const getServiceChatMessages = async (serviceId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase.rpc('get_service_chat_messages', {
      p_service_id: serviceId,
    });

    if (error) {
      console.error('Error fetching service chat messages:', error);
      throw error;
    }

    // Map the data to the Message type
    const messages: Message[] = data.map((item: any) => ({
      id: item.id,
      serviceId: item.service_id,
      userId: item.user_id,
      userName: item.user_name,
      userProfileImage: item.user_profile_image,
      content: item.content,
      createdAt: new Date(item.created_at),
      userRole: item.user_role as UserRole,
    }));

    return messages;
  } catch (error: any) {
    console.error('Error in getServiceChatMessages:', error);
    throw error;
  }
};
