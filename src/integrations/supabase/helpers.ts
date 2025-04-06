import { supabase, runQuery } from './client';
import { Booking, BookingStatus, PaymentStatus, Product, Workshop } from '@/types';

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
 * Create a new product
 * @param productData Product data to create
 * @returns Created product data
 */
export const createProduct = async (productData: any): Promise<Product> => {
  try {
    // Use the runQuery helper to work around TypeScript limitations
    const { data, error } = await runQuery(`
      INSERT INTO products (
        title, description, company_id, company_name, company_logo, 
        price, category, tags, image, website_url, demo_url, release_date,
        long_description, features, use_cases, pricing_tiers
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
      ) RETURNING *
    `, [
      productData.title,
      productData.description,
      productData.company_id,
      productData.company_name,
      productData.company_logo,
      productData.price,
      productData.category,
      productData.tags,
      productData.image,
      productData.website_url,
      productData.demo_url,
      productData.release_date,
      productData.long_description || null,
      productData.features || null,
      productData.use_cases || null,
      productData.pricing_tiers ? JSON.stringify(productData.pricing_tiers) : null
    ]);
      
    if (error) {
      console.error('Error creating product:', error);
      throw new Error(error.message || 'Failed to create product');
    }
    
    return data[0] as unknown as Product;
  } catch (error: any) {
    console.error('Error in createProduct:', error);
    throw new Error(error.message || 'Failed to create product');
  }
};

/**
 * Create a new workshop
 * @param workshopData Workshop data to create
 * @returns Created workshop data
 */
export const createWorkshop = async (workshopData: any): Promise<Workshop> => {
  try {
    // Use the runQuery helper to work around TypeScript limitations
    const { data, error } = await runQuery(`
      INSERT INTO workshops (
        title, description, company_id, company_name, company_logo, 
        price, date, duration, capacity, location, is_online, 
        meeting_url, category, image, start_time, end_time,
        long_description, topics, prerequisites, includes, tags, instructors
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22
      ) RETURNING *
    `, [
      workshopData.title,
      workshopData.description,
      workshopData.company_id,
      workshopData.company_name,
      workshopData.company_logo,
      workshopData.price,
      workshopData.date,
      workshopData.duration,
      workshopData.capacity,
      workshopData.location,
      workshopData.is_online,
      workshopData.meeting_url,
      workshopData.category,
      workshopData.image,
      workshopData.start_time || null,
      workshopData.end_time || null,
      workshopData.long_description || null,
      workshopData.topics || null,
      workshopData.prerequisites || null,
      workshopData.includes || null,
      workshopData.tags || null,
      workshopData.instructors ? JSON.stringify(workshopData.instructors) : null
    ]);
      
    if (error) {
      console.error('Error creating workshop:', error);
      throw new Error(error.message || 'Failed to create workshop');
    }
    
    return data[0] as unknown as Workshop;
  } catch (error: any) {
    console.error('Error in createWorkshop:', error);
    throw new Error(error.message || 'Failed to create workshop');
  }
};

/**
 * Get products with optional filters
 * @param companyId Optional company ID to filter by
 * @returns Array of products
 */
export const getProducts = async (companyId?: string): Promise<Product[]> => {
  try {
    let query = `SELECT * FROM products`;
    const params = [];
      
    if (companyId) {
      query += ` WHERE company_id = $1`;
      params.push(companyId);
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const { data, error } = await runQuery(query, params);
    
    if (error) {
      console.error('Error fetching products:', error);
      throw new Error(error.message || 'Failed to fetch products');
    }
    
    return (data || []) as unknown as Product[];
  } catch (error: any) {
    console.error('Error in getProducts:', error);
    return [];
  }
};

/**
 * Get workshops with optional filters
 * @param companyId Optional company ID to filter by
 * @returns Array of workshops
 */
export const getWorkshops = async (companyId?: string): Promise<Workshop[]> => {
  try {
    let query = `SELECT * FROM workshops`;
    const params = [];
      
    if (companyId) {
      query += ` WHERE company_id = $1`;
      params.push(companyId);
    }
    
    query += ` ORDER BY date ASC`;
    
    const { data, error } = await runQuery(query, params);
    
    if (error) {
      console.error('Error fetching workshops:', error);
      throw new Error(error.message || 'Failed to fetch workshops');
    }
    
    return (data || []) as unknown as Workshop[];
  } catch (error: any) {
    console.error('Error in getWorkshops:', error);
    return [];
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
    console.log(`Creating booking with: serviceId=${serviceId}, userId=${userId}, notes=${notes}, paymentStatus=${paymentStatus}, status=${status}`);
    
    // Using direct SQL query with custom PostgreSQL function
    const { data, error } = await supabase.rpc(
      'create_service_booking' as any, // Type cast to avoid TypeScript errors
      {
        p_service_id: serviceId,
        p_user_id: userId,
        p_notes: notes || null,
        p_payment_status: paymentStatus,
        p_status: status
      }
    );

    if (error) {
      console.error('Error booking service:', error);
      throw new Error(error.message || 'Failed to book service');
    }

    return data as string;
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
    console.log(`Checking booking for: serviceId=${serviceId}, userId=${userId}`);
    // Using stored procedure to get a specific booking
    const { data, error } = await supabase.rpc(
      'get_user_booking_for_service' as any, // Type cast to avoid TypeScript errors
      {
        p_service_id: serviceId,
        p_user_id: userId
      }
    );

    if (error) {
      console.error('Error fetching user booking for service:', error);
      throw new Error(error.message || 'Failed to fetch booking');
    }

    console.log("Booking data received:", data);
    
    if (!data || data.length === 0) {
      console.log("No booking found");
      return null;
    }
    
    const item = data[0];
    return {
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
    const { error } = await supabase.rpc(
      'cancel_booking' as any, // Type cast to avoid TypeScript errors
      {
        p_booking_id: bookingId
      }
    );

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
    const { error } = await supabase.rpc(
      'approve_booking' as any, // Type cast to avoid TypeScript errors
      {
        p_booking_id: bookingId
      }
    );

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
 * Update a comment
 * @param commentId Comment ID to update
 * @param content New content for the comment
 * @returns void
 */
export const updateComment = async (commentId: string, content: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('comments')
      .update({ content })
      .eq('id', commentId);

    if (error) {
      console.error('Error updating comment:', error);
      throw new Error(error.message || 'Failed to update comment');
    }
  } catch (error: any) {
    console.error('Error in updateComment:', error);
    throw new Error(error.message || 'Failed to update comment');
  }
};

/**
 * Delete a comment
 * @param commentId Comment ID to delete
 * @returns void
 */
export const deleteComment = async (commentId: string): Promise<void> => {
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
  } catch (error: any) {
    console.error('Error in deleteComment:', error);
    throw new Error(error.message || 'Failed to delete comment');
  }
};

/**
 * Fetch products
 * @returns Array of products
 */
export const fetchProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Map the snake_case database columns to camelCase properties expected by Product type
    const mappedProducts = data.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      longDescription: item.long_description,
      companyId: item.company_id,
      companyName: item.company_name,
      companyLogo: item.company_logo,
      price: item.price,
      category: item.category,
      tags: item.tags,
      image: item.image,
      websiteUrl: item.website_url,
      demoUrl: item.demo_url,
      releaseDate: new Date(item.release_date),
      createdAt: new Date(item.created_at),
      features: item.features,
      useCases: item.use_cases,
      pricingTiers: item.pricing_tiers
    }));
    
    return mappedProducts as Product[];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

/**
 * Fetch workshops
 * @returns Array of workshops
 */
export const fetchWorkshops = async () => {
  try {
    const { data, error } = await supabase
      .from('workshops')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) throw error;
    
    // Map the snake_case database columns to camelCase properties expected by Workshop type
    const mappedWorkshops = data.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      longDescription: item.long_description,
      companyId: item.company_id,
      companyName: item.company_name,
      companyLogo: item.company_logo,
      price: item.price,
      date: new Date(item.date),
      startTime: item.start_time,
      endTime: item.end_time,
      duration: item.duration,
      capacity: item.capacity,
      location: item.location,
      isOnline: item.is_online,
      meetingUrl: item.meeting_url,
      category: item.category,
      image: item.image,
      createdAt: new Date(item.created_at),
      topics: item.topics,
      prerequisites: item.prerequisites,
      includes: item.includes,
      tags: item.tags,
      instructors: item.instructors
    }));
    
    return mappedWorkshops as Workshop[];
  } catch (error) {
    console.error('Error fetching workshops:', error);
    return [];
  }
};
