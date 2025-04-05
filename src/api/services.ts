
import { Service } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const fetchServices = async (): Promise<Service[]> => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching services:', error);
      throw new Error(error.message);
    }
    
    if (!data) return [];
    
    return data.map(service => ({
      id: service.id,
      providerId: service.coach_id,
      providerName: service.coach_name,
      title: service.title,
      description: service.description || '',
      sessionType: service.service_type as "one_on_one" | "group",
      price: service.price,
      isFree: service.is_free,
      duration: service.duration || '',
      startTime: service.start_time ? new Date(service.start_time) : undefined,
      location: service.location || '',
      isOnline: service.is_online,
      meetingUrl: service.meeting_url || '',
      capacity: service.capacity || undefined,
      available: service.is_active,
      createdAt: new Date(service.created_at),
    }));
  } catch (error) {
    console.error('Error in fetchServices:', error);
    throw error;
  }
};

export const fetchServiceById = async (id: string): Promise<Service | null> => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error fetching service by ID:', error);
      throw new Error(error.message);
    }
    
    if (!data) return null;
    
    return {
      id: data.id,
      providerId: data.coach_id,
      providerName: data.coach_name,
      title: data.title,
      description: data.description || '',
      sessionType: data.service_type as "one_on_one" | "group",
      price: data.price,
      isFree: data.is_free,
      duration: data.duration || '',
      startTime: data.start_time ? new Date(data.start_time) : undefined,
      location: data.location || '',
      isOnline: data.is_online,
      meetingUrl: data.meeting_url || '',
      capacity: data.capacity || undefined,
      available: data.is_active,
      createdAt: new Date(data.created_at),
    };
  } catch (error) {
    console.error('Error in fetchServiceById:', error);
    throw error;
  }
};

export const createService = async (service: Omit<Service, 'id' | 'createdAt' | 'providerName' | 'providerId'>): Promise<Service> => {
  try {
    // Get current user data to use as provider
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      throw new Error('User not authenticated');
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.user.id)
      .single();
      
    if (profileError || !profile) {
      throw new Error('Failed to get user profile');
    }
    
    const { data, error } = await supabase
      .from('services')
      .insert({
        title: service.title,
        description: service.description,
        service_type: service.sessionType,
        price: service.price,
        is_free: service.isFree,
        duration: service.duration,
        start_time: service.startTime ? service.startTime.toISOString() : null,
        location: service.location,
        is_online: service.isOnline,
        meeting_url: service.meetingUrl,
        capacity: service.capacity,
        is_active: service.available,
        coach_id: userData.user.id,
        coach_name: profile.name,
      })
      .select('*')
      .single();
      
    if (error) {
      console.error('Error creating service:', error);
      throw new Error(error.message);
    }
    
    if (!data) {
      throw new Error('Failed to create service');
    }
    
    return {
      id: data.id,
      providerId: data.coach_id,
      providerName: data.coach_name,
      title: data.title,
      description: data.description || '',
      sessionType: data.service_type as "one_on_one" | "group",
      price: data.price,
      isFree: data.is_free,
      duration: data.duration || '',
      startTime: data.start_time ? new Date(data.start_time) : undefined,
      location: data.location || '',
      isOnline: data.is_online,
      meetingUrl: data.meeting_url || '',
      capacity: data.capacity || undefined,
      available: data.is_active,
      createdAt: new Date(data.created_at),
    };
  } catch (error) {
    console.error('Error in createService:', error);
    throw error;
  }
};

export const updateService = async (id: string, service: Partial<Omit<Service, 'id' | 'createdAt' | 'providerName' | 'providerId'>>): Promise<Service> => {
  try {
    const updateData: any = {};
    
    if (service.title !== undefined) updateData.title = service.title;
    if (service.description !== undefined) updateData.description = service.description;
    if (service.sessionType !== undefined) updateData.service_type = service.sessionType;
    if (service.price !== undefined) updateData.price = service.price;
    if (service.isFree !== undefined) updateData.is_free = service.isFree;
    if (service.duration !== undefined) updateData.duration = service.duration;
    if (service.startTime !== undefined) updateData.start_time = service.startTime ? service.startTime.toISOString() : null;
    if (service.location !== undefined) updateData.location = service.location;
    if (service.isOnline !== undefined) updateData.is_online = service.isOnline;
    if (service.meetingUrl !== undefined) updateData.meeting_url = service.meetingUrl;
    if (service.capacity !== undefined) updateData.capacity = service.capacity;
    if (service.available !== undefined) updateData.is_active = service.available;
    
    const { data, error } = await supabase
      .from('services')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();
      
    if (error) {
      console.error('Error updating service:', error);
      throw new Error(error.message);
    }
    
    if (!data) {
      throw new Error('Service not found or update failed');
    }
    
    return {
      id: data.id,
      providerId: data.coach_id,
      providerName: data.coach_name,
      title: data.title,
      description: data.description || '',
      sessionType: data.service_type as "one_on_one" | "group",
      price: data.price,
      isFree: data.is_free,
      duration: data.duration || '',
      startTime: data.start_time ? new Date(data.start_time) : undefined,
      location: data.location || '',
      isOnline: data.is_online,
      meetingUrl: data.meeting_url || '',
      capacity: data.capacity || undefined,
      available: data.is_active,
      createdAt: new Date(data.created_at),
    };
  } catch (error) {
    console.error('Error in updateService:', error);
    throw error;
  }
};

export const deleteService = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting service:', error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error in deleteService:', error);
    throw error;
  }
};

// Fetch service enrollments
export const fetchServiceEnrollments = async (serviceId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('service_enrollments')
      .select('*')
      .eq('service_id', serviceId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching service enrollments:', error);
      throw new Error(error.message);
    }
    
    if (!data) return [];
    
    return data.map(enrollment => ({
      id: enrollment.id,
      serviceId: enrollment.service_id,
      userId: enrollment.user_id,
      userName: enrollment.user_name,
      userEmail: enrollment.user_email,
      userProfileImage: enrollment.user_profile_image,
      status: enrollment.status,
      paymentStatus: enrollment.payment_status,
      createdAt: new Date(enrollment.created_at),
      amount: enrollment.amount
    }));
  } catch (error) {
    console.error('Error in fetchServiceEnrollments:', error);
    throw error;
  }
};

// Update enrollment status
export const updateEnrollmentStatus = async (enrollmentId: string, status: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('service_enrollments')
      .update({ status })
      .eq('id', enrollmentId);
      
    if (error) {
      console.error('Error updating enrollment status:', error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error in updateEnrollmentStatus:', error);
    throw error;
  }
};

export const bookService = async (serviceId: string, isPaid: boolean = false): Promise<void> => {
  try {
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single();
      
    if (serviceError) {
      console.error('Error fetching service:', serviceError);
      throw new Error(serviceError.message);
    }
    
    if (!service) {
      throw new Error('Service not found');
    }
    
    // Get current user data
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user data:', userError);
      throw new Error(userError.message);
    }
    
    if (!user?.user) {
      throw new Error('User not found');
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.user.id)
      .single();
      
    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw new Error(profileError.message);
    }
    
    if (!profile) {
      throw new Error('Profile not found');
    }
    
    // For a paid service that's been paid, auto-approve booking
    // For free services, set the status to pending (requiring approval)
    const enrollmentStatus = isPaid ? 'approved' : (service.is_free ? 'pending' : 'pending');
    const paymentStatus = isPaid ? 'paid' : 'pending';
    
    const { error } = await supabase
      .from('service_enrollments')
      .insert({
        service_id: serviceId,
        user_id: user.user.id,
        user_name: profile.name,
        user_email: user.user.email,
        user_profile_image: profile.profile_image,
        status: enrollmentStatus,
        payment_status: paymentStatus,
        amount: service.price,
      });
      
    if (error) {
      console.error('Error booking service:', error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error in bookService:', error);
    throw error;
  }
};

export const cancelServiceBooking = async (enrollmentId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('service_enrollments')
      .delete()
      .eq('id', enrollmentId);
      
    if (error) {
      console.error('Error canceling service booking:', error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error in cancelServiceBooking:', error);
    throw error;
  }
};
