
import { supabase } from './client';
import { Booking } from '@/types';

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
 * Book a service with direct SQL query to work around TypeScript issues
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
    // Using RPC to execute a function that inserts the booking
    // This avoids TypeScript issues with the table structure
    const { data, error } = await supabase.rpc('create_service_booking', {
      p_service_id: serviceId,
      p_user_id: userId,
      p_notes: notes || null,
      p_payment_status: paymentStatus,
      p_status: status
    });

    if (error) {
      console.error('Error booking service:', error);
      throw new Error(error.message || 'Failed to book service');
    }

    return data;
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
    const { data, error } = await supabase.rpc('get_user_bookings', {
      p_user_id: userId
    });

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
      status: item.status,
      paymentStatus: item.payment_status,
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
    const { data, error } = await supabase.rpc('get_service_bookings', {
      p_service_id: serviceId
    });

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
      status: item.status,
      paymentStatus: item.payment_status,
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
    // Using stored procedure to get a specific booking
    const { data, error } = await supabase.rpc('get_user_booking_for_service', {
      p_service_id: serviceId,
      p_user_id: userId
    });

    if (error) {
      console.error('Error fetching user booking for service:', error);
      throw new Error(error.message || 'Failed to fetch booking');
    }

    if (!data || data.length === 0) return null;
    
    const item = data[0];
    return {
      id: item.id,
      serviceId: item.service_id,
      userId: item.user_id,
      userName: item.user_name || '',
      userEmail: item.user_email || '',
      status: item.status,
      paymentStatus: item.payment_status,
      notes: item.notes || undefined,
      preferredTime: undefined, // This field is not currently in our database
      scheduledTime: undefined,
      isPaid: item.payment_status === 'paid',
      createdAt: new Date(item.created_at)
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
    // Using stored procedure to cancel a booking
    const { error } = await supabase.rpc('cancel_booking', {
      p_booking_id: bookingId
    });

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
    // Using stored procedure to approve a booking
    const { error } = await supabase.rpc('approve_booking', {
      p_booking_id: bookingId
    });

    if (error) {
      console.error('Error approving booking:', error);
      throw new Error(error.message || 'Failed to approve booking');
    }
  } catch (error: any) {
    console.error('Error in approveBooking:', error);
    throw new Error(error.message || 'Failed to approve booking');
  }
};
