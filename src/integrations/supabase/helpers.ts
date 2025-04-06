import { supabase } from './client';
import { generateId } from '@/utils';
import { UserRole, GroupPrivacy, ServiceType, BookingStatus, PaymentStatus, Product, Workshop, Group, Message, Service, Booking } from '@/types';
import { asUserRole } from '@/utils/typeHelpers';

// Function to create a user profile
export const createUserProfile = async (userId: string, email: string, name: string, role: string) => {
  const { data, error } = await supabase.from('profiles').insert([{
    id: userId,
    email,
    name,
    role
  }]).select();
  
  if (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
  return data;
};

/**
 * Function to upload an image to Supabase storage
 * @param file The file to upload
 * @param bucket The bucket where the file should be stored
 * @returns The public URL of the uploaded image
 */
export const uploadImage = async (file: File, bucket: string): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${bucket}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
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

export const updateComment = async (commentId: string, updates: any) => {
  const { data, error } = await supabase
    .from('comments')
    .update(updates)
    .eq('id', commentId);

  if (error) {
    console.error('Error updating comment:', error);
    throw error;
  }

  return data;
};

export const deleteComment = async (commentId: string) => {
  const { data, error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (error) {
    console.error('Error deleting comment:', error);
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
    .insert({
      id: service.id || generateId(),
      title: service.title,
      description: service.description,
      coach_id: service.providerId,
      coach_name: service.providerName,
      price: service.price,
      duration: service.duration,
      capacity: service.capacity,
      service_type: service.serviceType,
      is_online: service.isOnline,
      location: service.location,
      meeting_url: service.meetingUrl,
      cover_image: service.coverImage,
      is_active: true,
      is_free: service.price === 0
    });

  if (error) {
    console.error('Error creating service:', error);
    throw error;
  }

  return data || [];
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

export const createProduct = async (product: any) => {
  const { data, error } = await supabase
    .from('products')
    .insert([{
      id: generateId(),
      title: product.title,
      description: product.description,
      long_description: product.longDescription,
      price: product.price,
      image: product.image,
      company_id: product.companyId,
      company_name: product.companyName,
      company_logo: product.companyLogo,
      category: product.category,
      features: product.features,
      use_cases: product.useCases,
      tags: product.tags,
      pricing_tiers: product.pricingTiers,
      website_url: product.websiteUrl,
      demo_url: product.demoUrl,
      release_date: product.releaseDate
    }]);

  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }

  return data?.[0] || null;
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

  // Map DB products to Product type
  return data.map(mapDbProductToProduct);
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

export const createWorkshop = async (workshop: any) => {
  const { data, error } = await supabase
    .from('workshops')
    .insert([{
      id: generateId(),
      title: workshop.title,
      description: workshop.description,
      long_description: workshop.longDescription,
      company_id: workshop.companyId,
      company_name: workshop.companyName,
      company_logo: workshop.companyLogo,
      date: workshop.date,
      duration: workshop.duration,
      price: workshop.price,
      capacity: workshop.capacity,
      location: workshop.location,
      is_online: workshop.isOnline,
      meeting_url: workshop.meetingUrl,
      image: workshop.image,
      category: workshop.category,
      topics: workshop.topics,
      prerequisites: workshop.prerequisites,
      includes: workshop.includes,
      instructors: workshop.instructors,
      tags: workshop.tags,
      start_time: workshop.startTime,
      end_time: workshop.endTime
    }]);

  if (error) {
    console.error('Error creating workshop:', error);
    throw error;
  }

  return data?.[0] || null;
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

  // Map DB workshops to Workshop type
  return data.map(mapDbWorkshopToWorkshop);
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

export const createGroup = async (group: any) => {
  const { data, error } = await supabase
    .from('groups')
    .insert([{
      name: group.name,
      description: group.description,
      creator_id: group.creatorId,
      creator_name: group.creatorName,
      creator_role: group.creatorRole,
      image: group.image,
      members: 1,
      member_limit: group.memberLimit,
      privacy: group.privacy,
      price: group.price,
      pending_requests: 0,
      rules: group.rules || []
    }]);

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

export const createEvent = async (eventData: any) => {
  const { data, error } = await supabase.rpc('create_event', {
    title: eventData.title,
    description: eventData.description,
    creator_id: eventData.creatorId,
    creator_name: eventData.creatorName,
    creator_role: eventData.creatorRole,
    location: eventData.location,
    date: eventData.date,
    image: eventData.image,
    privacy: eventData.privacy,
    price: eventData.price,
    attendees: eventData.attendees || [],
    pending_requests: eventData.pendingRequests || 0
  });

  if (error) {
    console.error('Error creating event:', error);
    throw error;
  }

  return data;
};

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

export const updateEvent = async (eventId: string, updates: any) => {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', eventId);

  if (error) {
    console.error('Error updating event:', error);
    throw error;
  }

  return data;
};

export const deleteEvent = async (eventId: string) => {
  const { data, error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId);

  if (error) {
    console.error('Error deleting event:', error);
    throw error;
  }

  return data;
};

export const createMessage = async (messageData: any) => {
  const { data, error } = await supabase
    .from('messages')
    .insert([messageData]);

  if (error) {
    console.error('Error creating message:', error);
    throw error;
  }

  return data;
};

export const createServiceBooking = async (
  serviceId: string, 
  userId: string, 
  notes?: string, 
  paymentStatus: PaymentStatus = 'unpaid', 
  status: BookingStatus = 'pending'
) => {
  const { data, error } = await supabase
    .from('service_bookings')
    .insert([{
      id: generateId(),
      service_id: serviceId,
      user_id: userId,
      status: status,
      payment_status: paymentStatus,
      notes: notes
    }]);

  if (error) {
    console.error('Error creating service booking:', error);
    throw error;
  }

  return data;
};

export const getServiceBookings = async (serviceId: string): Promise<Booking[]> => {
  try {
    const { data, error } = await supabase.rpc('get_service_bookings', {
      p_service_id: serviceId
    });
    if (error) {
      console.error('Error fetching service bookings:', error);
      throw error;
    }
    
    // Map the data to the Booking type
    const bookings = data.map((item: any) => ({
      id: item.id,
      serviceId: item.service_id,
      userId: item.user_id,
      userName: item.user_name,
      userEmail: item.user_email,
      status: item.status as BookingStatus,
      paymentStatus: item.payment_status as PaymentStatus,
      notes: item.notes,
      createdAt: new Date(item.created_at),
      preferredTime: item.preferred_time ? new Date(item.preferred_time) : undefined
    }));
    
    return bookings;
  } catch (error) {
    console.error('Error in getServiceBookings:', error);
    throw error;
  }
};

export const getUserBookings = async (userId: string): Promise<Booking[]> => {
  try {
    const { data, error } = await supabase.rpc('get_user_bookings', {
      p_user_id: userId
    });
    
    if (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }
    
    // Map the data to the Booking type
    const bookings = data.map((item: any) => ({
      id: item.id,
      serviceId: item.service_id,
      userId: item.user_id,
      userName: item.user_name,
      userEmail: item.user_email,
      status: item.status as BookingStatus,
      paymentStatus: item.payment_status as PaymentStatus,
      notes: item.notes,
      createdAt: new Date(item.created_at),
      scheduledTime: item.created_at ? new Date(item.created_at) : undefined,
      preferredTime: item.preferred_time ? new Date(item.preferred_time) : undefined,
      serviceTitle: item.service_title,
      coachName: item.coach_name,
      price: item.price,
      duration: item.duration,
      isOnline: item.is_online,
      serviceType: item.service_type as ServiceType
    }));
    
    return bookings;
  } catch (error) {
    console.error('Error in getUserBookings:', error);
    throw error;
  }
};

export const getUserBookingForService = async (serviceId: string, userId: string): Promise<Booking | null> => {
  try {
    const { data, error } = await supabase.rpc('get_user_booking_for_service', {
      p_service_id: serviceId,
      p_user_id: userId
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
      createdAt: new Date(bookingData.created_at)
    };
    
    return booking;
  } catch (error) {
    console.error('Error in getUserBookingForService:', error);
    return null;
  }
};

export const approveBooking = async (bookingId: string) => {
  const { data, error } = await supabase
    .from('service_bookings')
    .update({ status: 'approved' })
    .eq('id', bookingId);

  if (error) {
    console.error('Error approving booking:', error);
    throw error;
  }

  return data;
};

export const cancelBooking = async (bookingId: string) => {
  const { data, error } = await supabase
    .from('service_bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId);

  if (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }

  return data;
};

export const sendServiceChatMessage = async (serviceId: string, userId: string, content: string) => {
  try {
    const { data, error } = await supabase.rpc('send_service_chat_message', {
      p_service_id: serviceId,
      p_user_id: userId,
      p_content: content
    });
    
    if (error) {
      console.error('Error sending service chat message:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in sendServiceChatMessage:', error);
    throw error;
  }
};

export const getServiceChatMessages = async (serviceId: string) => {
  try {
    const { data, error } = await supabase.rpc('get_service_chat_messages', {
      p_service_id: serviceId
    });
    
    if (error) {
      console.error('Error fetching service chat messages:', error);
      throw error;
    }
    
    // Map the data to the Message type
    const messages = data.map((item: any) => ({
      id: item.id,
      serviceId: item.service_id,
      userId: item.user_id,
      userName: item.user_name,
      userProfileImage: item.user_profile_image,
      content: item.content,
      createdAt: new Date(item.created_at),
      userRole: asUserRole(item.user_role || 'user')
    }));
    
    return messages;
  } catch (error) {
    console.error('Error in getServiceChatMessages:', error);
    throw error;
  }
};

export const mapDbServiceToService = (dbService: any): Service => {
  return {
    id: dbService.id,
    title: dbService.title,
    description: dbService.description,
    providerId: dbService.coach_id,
    providerName: dbService.coach_name,
    price: dbService.price,
    duration: dbService.duration,
    available: dbService.is_active,
    createdAt: new Date(dbService.created_at),
    isOnline: dbService.is_online,
    location: dbService.location,
    capacity: dbService.capacity,
    serviceType: dbService.service_type as ServiceType,
    coverImage: dbService.cover_image,
    meetingUrl: dbService.meeting_url
  };
};

export const mapDbProductToProduct = (dbProduct: any): Product => {
  return {
    id: dbProduct.id,
    title: dbProduct.title,
    description: dbProduct.description,
    price: Number(dbProduct.price),
    image: dbProduct.image,
    companyId: dbProduct.company_id,
    companyName: dbProduct.company_name,
    companyLogo: dbProduct.company_logo,
    category: dbProduct.category,
    features: dbProduct.features || [],
    useCases: dbProduct.use_cases || [],
    tags: dbProduct.tags || [],
    pricingTiers: dbProduct.pricing_tiers,
    websiteUrl: dbProduct.website_url,
    demoUrl: dbProduct.demo_url,
    releaseDate: new Date(dbProduct.release_date || dbProduct.created_at),
    createdAt: new Date(dbProduct.created_at)
  };
};

export const mapDbWorkshopToWorkshop = (dbWorkshop: any): Workshop => {
  return {
    id: dbWorkshop.id,
    title: dbWorkshop.title,
    description: dbWorkshop.description,
    longDescription: dbWorkshop.long_description,
    companyId: dbWorkshop.company_id,
    companyName: dbWorkshop.company_name,
    companyLogo: dbWorkshop.company_logo,
    date: new Date(dbWorkshop.date),
    duration: dbWorkshop.duration || "1 hour",
    price: dbWorkshop.price,
    capacity: dbWorkshop.capacity,
    location: dbWorkshop.location,
    isOnline: dbWorkshop.is_online,
    isFree: dbWorkshop.price === 0 || dbWorkshop.is_free,
    meetingUrl: dbWorkshop.meeting_url,
    image: dbWorkshop.image,
    category: dbWorkshop.category,
    topics: dbWorkshop.topics || [],
    prerequisites: dbWorkshop.prerequisites || [],
    includes: dbWorkshop.includes || [],
    instructors: dbWorkshop.instructors || [],
    tags: dbWorkshop.tags || [],
    startTime: dbWorkshop.start_time,
    endTime: dbWorkshop.end_time
  };
};

export const mapDbGroupToGroup = (dbGroup: any): Group => {
  return {
    id: dbGroup.id,
    name: dbGroup.name,
    description: dbGroup.description,
    creatorId: dbGroup.creator_id,
    creatorName: dbGroup.creator_name,
    creatorRole: asUserRole(dbGroup.creator_role || 'user'),
    image: dbGroup.image,
    members: dbGroup.members,
    memberIds: dbGroup.member_ids || [],
    memberLimit: dbGroup.member_limit,
    privacy: dbGroup.privacy as GroupPrivacy,
    price: dbGroup.price,
    pendingRequests: dbGroup.pending_requests || 0,
    rules: dbGroup.rules || [],
    createdAt: new Date(dbGroup.created_at)
  };
};

export const updateMessageData = async (messageId: string, updates: any) => {
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

export const deleteMessageData = async (messageId: string) => {
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
