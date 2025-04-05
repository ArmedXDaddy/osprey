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

export const bookService = async (serviceId: string, isPaid: boolean = false): Promise<any> => {
  try {
    console.log("bookService called with:", { serviceId, isPaid });
    
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
      console.error('Service not found with ID:', serviceId);
      throw new Error('Service not found');
    }
    
    console.log("Service found:", service);
    
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user data:', userError);
      throw new Error(userError.message);
    }
    
    if (!user?.user) {
      console.error('User not found in auth');
      throw new Error('User not found');
    }
    
    console.log("User found:", user.user.id);
    
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
      console.error('Profile not found for user:', user.user.id);
      throw new Error('Profile not found');
    }
    
    console.log("Profile found:", profile);
    
    const enrollmentStatus = isPaid ? 'approved' : 'pending';
    const paymentStatus = isPaid ? 'paid' : 'unpaid';
    
    console.log("Setting status:", { enrollmentStatus, paymentStatus });
    
    const { data: existingBooking, error: existingBookingError } = await supabase
      .from('service_enrollments')
      .select('*')
      .eq('service_id', serviceId)
      .eq('user_id', user.user.id)
      .maybeSingle();
      
    if (existingBookingError) {
      console.error('Error checking existing booking:', existingBookingError);
      throw new Error(existingBookingError.message);
    }
    
    if (existingBooking) {
      console.log("Existing booking found:", existingBooking);
      
      if (
        (existingBooking.status === 'pending' && enrollmentStatus === 'approved') ||
        (existingBooking.payment_status === 'unpaid' && paymentStatus === 'paid')
      ) {
        console.log("Updating existing booking");
        
        const { data: updatedBooking, error: updateError } = await supabase
          .from('service_enrollments')
          .update({
            status: enrollmentStatus,
            payment_status: paymentStatus
          })
          .eq('id', existingBooking.id)
          .select('*')
          .single();
          
        if (updateError) {
          console.error('Error updating booking:', updateError);
          throw new Error(updateError.message);
        }
        
        console.log("Booking updated successfully:", updatedBooking);
        
        if (updatedBooking) {
          return {
            id: updatedBooking.id,
            serviceId: updatedBooking.service_id,
            userId: updatedBooking.user_id,
            userName: updatedBooking.user_name,
            userEmail: updatedBooking.user_email,
            userProfileImage: updatedBooking.user_profile_image,
            status: updatedBooking.status,
            paymentStatus: updatedBooking.payment_status,
            amount: updatedBooking.amount,
            createdAt: new Date(updatedBooking.created_at),
          };
        }
      }
      
      return {
        id: existingBooking.id,
        serviceId: existingBooking.service_id,
        userId: existingBooking.user_id,
        userName: existingBooking.user_name,
        userEmail: existingBooking.user_email,
        userProfileImage: existingBooking.user_profile_image,
        status: existingBooking.status,
        paymentStatus: existingBooking.payment_status,
        amount: existingBooking.amount,
        createdAt: new Date(existingBooking.created_at),
      };
    }
    
    console.log("Creating new booking");
    
    const { data: newBooking, error } = await supabase
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
      })
      .select('*')
      .single();
      
    if (error) {
      console.error('Error booking service:', error);
      throw new Error(error.message);
    }
    
    console.log("New booking created:", newBooking);
    
    if (!newBooking) {
      console.error('No booking data returned after insert');
      throw new Error('Failed to create booking');
    }
    
    return {
      id: newBooking.id,
      serviceId: newBooking.service_id,
      userId: newBooking.user_id,
      userName: newBooking.user_name,
      userEmail: newBooking.user_email,
      userProfileImage: newBooking.user_profile_image,
      status: newBooking.status,
      paymentStatus: newBooking.payment_status,
      amount: newBooking.amount,
      createdAt: new Date(newBooking.created_at),
    };
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
