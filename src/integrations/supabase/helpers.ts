
import { supabase } from './client';
import { Booking, BookingStatus, PaymentStatus, Message } from '@/types';

/**
 * Uploads an image to Supabase storage
 * @param file File to upload
 * @param path Path to store the file at in the bucket
 * @returns URL of the uploaded file
 */
export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `${path}/${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { error: uploadError, data } = await supabase.storage
      .from('covers')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw new Error('Error uploading file');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('covers')
      .getPublicUrl(filePath);
      
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadImage:', error);
    // Fallback to local URL for development
    return URL.createObjectURL(file);
  }
};

/**
 * Book a service with direct database insert instead of stored procedure
 * @param serviceId Service ID to book
 * @param userId User ID making the booking
 * @param notes Optional notes for the booking
 * @param paymentStatus Payment status (paid/unpaid)
 * @param status Booking status (pending/approved)
 * @returns ID of the created booking
 */
export const createServiceBooking = async (
  serviceId: string,
  userId: string,
  notes?: string,
  paymentStatus: string = 'unpaid',
  status: string = 'pending'
): Promise<string> => {
  try {
    // Insert directly into the service_bookings table
    const { data, error } = await supabase
      .from('service_bookings')
      .insert({
        service_id: serviceId,
        user_id: userId,
        notes: notes || null,
        payment_status: paymentStatus,
        status: status
      })
      .select()
      .single();

    if (error) {
      console.error('Error booking service:', error);
      throw new Error(error.message || 'Failed to book service');
    }

    return data.id;
  } catch (error: any) {
    console.error('Error in createServiceBooking:', error);
    throw new Error(error.message || 'Failed to book service');
  }
};

/**
 * Get bookings for a user with direct SQL query
 * @param userId User ID to get bookings for
 * @returns Array of bookings
 */
export const getUserBookings = async (userId: string): Promise<Booking[]> => {
  try {
    // Using stored procedure to get bookings
    const { data, error } = await supabase.rpc(
      'get_user_bookings' as any, // Type cast to avoid TypeScript errors
      {
        p_user_id: userId
      }
    );

    if (error) {
      console.error('Error fetching user bookings:', error);
      throw new Error(error.message || 'Failed to fetch bookings');
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      serviceId: item.service_id,
      userId: item.user_id,
      userName: item.user_name || '',
      userEmail: item.user_email || '',
      status: item.status as BookingStatus,
      paymentStatus: item.payment_status as PaymentStatus,
      notes: item.notes || undefined,
      preferredTime: undefined, // This field is not currently in our database
      scheduledTime: undefined,
      isPaid: item.payment_status === 'paid',
      createdAt: new Date(item.created_at),
      serviceName: item.service_title || '',
      providerName: item.coach_name || '',
    }));
  } catch (error: any) {
    console.error('Error in getUserBookings:', error);
    return [];
  }
};

/**
 * Get bookings for a service with direct SQL query
 * @param serviceId Service ID to get bookings for
 * @returns Array of bookings
 */
export const getServiceBookings = async (serviceId: string): Promise<Booking[]> => {
  try {
    // Using stored procedure to get bookings
    const { data, error } = await supabase.rpc(
      'get_service_bookings' as any, // Type cast to avoid TypeScript errors
      {
        p_service_id: serviceId
      }
    );

    if (error) {
      console.error('Error fetching service bookings:', error);
      throw new Error(error.message || 'Failed to fetch bookings');
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      serviceId: item.service_id,
      userId: item.user_id,
      userName: item.user_name || '',
      userEmail: item.user_email || '',
      status: item.status as BookingStatus,
      paymentStatus: item.payment_status as PaymentStatus,
      notes: item.notes || undefined,
      preferredTime: undefined, // This field is not currently in our database
      scheduledTime: undefined,
      isPaid: item.payment_status === 'paid',
      createdAt: new Date(item.created_at)
    }));
  } catch (error: any) {
    console.error('Error in getServiceBookings:', error);
    return [];
  }
};

/**
 * Get a user's booking for a specific service
 * @param serviceId Service ID to check booking for
 * @param userId User ID making the booking
 * @returns Booking object or null if not found
 */
export const getUserBookingForService = async (serviceId: string, userId: string): Promise<Booking | null> => {
  try {
    // Query the booking directly from the database table instead of using the stored procedure
    const { data, error } = await supabase
      .from('service_bookings')
      .select(`
        id,
        service_id,
        user_id,
        status,
        payment_status,
        notes,
        created_at,
        profiles:user_id (
          name,
          email
        )
      `)
      .eq('service_id', serviceId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user booking for service:', error);
      throw new Error(error.message || 'Failed to fetch booking');
    }

    if (!data) return null;
    
    return {
      id: data.id,
      serviceId: data.service_id,
      userId: data.user_id,
      userName: data.profiles?.name || '',
      userEmail: data.profiles?.email || '',
      status: data.status as BookingStatus,
      paymentStatus: data.payment_status as PaymentStatus,
      notes: data.notes || undefined,
      preferredTime: undefined,
      scheduledTime: undefined,
      isPaid: data.payment_status === 'paid',
      createdAt: new Date(data.created_at)
    };
  } catch (error: any) {
    console.error('Error in getUserBookingForService:', error);
    return null;
  }
};

/**
 * Cancel a booking
 * @param bookingId Booking ID to cancel
 * @returns void
 */
export const cancelBooking = async (bookingId: string): Promise<void> => {
  try {
    // Update the status directly in the database
    const { error } = await supabase
      .from('service_bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (error) {
      console.error('Error cancelling booking:', error);
      throw new Error(error.message || 'Failed to cancel booking');
    }
  } catch (error: any) {
    console.error('Error in cancelBooking:', error);
    throw new Error(error.message || 'Failed to cancel booking');
  }
};

/**
 * Approve a booking
 * @param bookingId Booking ID to approve
 * @returns void
 */
export const approveBooking = async (bookingId: string): Promise<void> => {
  try {
    // Update the status directly in the database
    const { error } = await supabase
      .from('service_bookings')
      .update({ status: 'approved' })
      .eq('id', bookingId);

    if (error) {
      console.error('Error approving booking:', error);
      throw new Error(error.message || 'Failed to approve booking');
    }
  } catch (error: any) {
    console.error('Error in approveBooking:', error);
    throw new Error(error.message || 'Failed to approve booking');
  }
};

/**
 * Send a message to a service chat
 * @param serviceId Service ID to send message to
 * @param userId User ID sending the message
 * @param content Message content
 * @returns ID of the created message
 */
export const sendServiceChatMessage = async (
  serviceId: string,
  userId: string,
  content: string
): Promise<string> => {
  try {
    // Using stored procedure to send a message
    const { data, error } = await supabase.rpc(
      'send_service_chat_message' as any, // Type cast to avoid TypeScript errors
      {
        p_service_id: serviceId,
        p_user_id: userId,
        p_content: content
      }
    );

    if (error) {
      console.error('Error sending message:', error);
      throw new Error(error.message || 'Failed to send message');
    }

    return data as string;
  } catch (error: any) {
    console.error('Error in sendServiceChatMessage:', error);
    throw new Error(error.message || 'Failed to send message');
  }
};

/**
 * Get messages for a service chat
 * @param serviceId Service ID to get messages for
 * @returns Array of messages
 */
export const getServiceChatMessages = async (serviceId: string): Promise<Message[]> => {
  try {
    // Using stored procedure to get messages
    const { data, error } = await supabase.rpc(
      'get_service_chat_messages' as any, // Type cast to avoid TypeScript errors
      {
        p_service_id: serviceId
      }
    );

    if (error) {
      console.error('Error fetching service messages:', error);
      throw new Error(error.message || 'Failed to fetch messages');
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      serviceId: item.service_id,
      userId: item.user_id,
      userName: item.user_name,
      userProfileImage: item.user_profile_image,
      content: item.content,
      createdAt: new Date(item.created_at)
    })) as Message[];
  } catch (error: any) {
    console.error('Error in getServiceChatMessages:', error);
    return [];
  }
};
