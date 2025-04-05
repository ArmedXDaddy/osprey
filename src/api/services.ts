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
      providerId: service.provider_id,
      providerName: service.provider_name,
      title: service.title,
      description: service.description,
      sessionType: service.session_type,
      price: service.price,
      isFree: service.is_free,
      duration: service.duration,
      startTime: service.start_time,
      location: service.location,
      isOnline: service.is_online,
      meetingUrl: service.meeting_url,
      capacity: service.capacity,
      available: service.available,
      createdAt: service.created_at,
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
      providerId: data.provider_id,
      providerName: data.provider_name,
      title: data.title,
      description: data.description,
      sessionType: data.session_type,
      price: data.price,
      isFree: data.is_free,
      duration: data.duration,
      startTime: data.start_time,
      location: data.location,
      isOnline: data.is_online,
      meetingUrl: data.meeting_url,
      capacity: data.capacity,
      available: data.available,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Error in fetchServiceById:', error);
    throw error;
  }
};

export const createService = async (service: Omit<Service, 'id' | 'createdAt' | 'providerName' | 'providerId'>, userId: string, userName: string): Promise<Service> => {
  try {
    const { data, error } = await supabase
      .from('services')
      .insert({
        ...service,
        provider_id: userId,
        provider_name: userName,
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
      providerId: data.provider_id,
      providerName: data.provider_name,
      title: data.title,
      description: data.description,
      sessionType: data.session_type,
      price: data.price,
      isFree: data.is_free,
      duration: data.duration,
      startTime: data.start_time,
      location: data.location,
      isOnline: data.is_online,
      meetingUrl: data.meeting_url,
      capacity: data.capacity,
      available: data.available,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Error in createService:', error);
    throw error;
  }
};

export const updateService = async (id: string, service: Omit<Service, 'id' | 'createdAt' | 'providerName' | 'providerId'>): Promise<Service> => {
  try {
    const { data, error } = await supabase
      .from('services')
      .update({
        ...service,
      })
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
      providerId: data.provider_id,
      providerName: data.provider_name,
      title: data.title,
      description: data.description,
      sessionType: data.session_type,
      price: data.price,
      isFree: data.is_free,
      duration: data.duration,
      startTime: data.start_time,
      location: data.location,
      isOnline: data.is_online,
      meetingUrl: data.meeting_url,
      capacity: data.capacity,
      available: data.available,
      createdAt: data.created_at,
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
      createdAt: enrollment.created_at,
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

export const bookService = async (serviceId: string, isPaid: boolean = false) => {
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
    
    const { error } = await supabase
      .from('service_enrollments')
      .insert({
        service_id: serviceId,
        user_id: user.user.id,
        user_name: profile.full_name,
        user_email: user.user.email,
        user_profile_image: profile.avatar_url,
        status: 'pending',
        payment_status: isPaid ? 'paid' : 'pending',
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

export const cancelServiceBooking = async (enrollmentId: string) => {
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
