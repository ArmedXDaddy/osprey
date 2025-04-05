import { Service } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// Fetch all services
export const fetchServices = async (): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching services:', error);
    throw new Error(error.message);
  }
  
  // Transform Supabase data to match our Service type
  return data.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description || '',
    providerId: item.coach_id,
    providerName: item.coach_name,
    price: item.price,
    duration: item.duration || '1 hour',
    available: item.is_active,
    createdAt: new Date(item.created_at),
    sessionType: item.service_type as 'one_on_one' | 'group',
    capacity: item.capacity,
    startTime: undefined, // The database doesn't have start_time field
    location: item.location,
    isOnline: item.is_online,
    meetingUrl: item.meeting_url,
    image: item.image,
    isFree: item.is_free,
    coverImage: item.cover_image,
  }));
};

// Fetch a single service by ID
export const fetchServiceById = async (id: string): Promise<Service> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error('Error fetching service:', error);
    throw new Error(error.message);
  }
  
  // Transform Supabase data to match our Service type
  return {
    id: data.id,
    title: data.title,
    description: data.description || '',
    providerId: data.coach_id,
    providerName: data.coach_name,
    price: data.price,
    duration: data.duration || '1 hour',
    available: data.is_active,
    createdAt: new Date(data.created_at),
    sessionType: data.service_type as 'one_on_one' | 'group',
    capacity: data.capacity,
    startTime: undefined, // The database doesn't have start_time field
    location: data.location,
    isOnline: data.is_online,
    meetingUrl: data.meeting_url,
    image: data.image,
    isFree: data.is_free,
    coverImage: data.cover_image,
  };
};

// Fetch services by provider ID
export const fetchServicesByProviderId = async (providerId: string): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('coach_id', providerId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching provider services:', error);
    throw new Error(error.message);
  }
  
  // Transform Supabase data to match our Service type
  return data.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description || '',
    providerId: item.coach_id,
    providerName: item.coach_name,
    price: item.price,
    duration: item.duration || '1 hour',
    available: item.is_active,
    createdAt: new Date(item.created_at),
    sessionType: item.service_type as 'one_on_one' | 'group',
    capacity: item.capacity,
    startTime: undefined, // The database doesn't have start_time field
    location: item.location,
    isOnline: item.is_online,
    meetingUrl: item.meeting_url,
    image: item.image,
    isFree: item.is_free,
    coverImage: item.cover_image,
  }));
};

// Create a new service
export const createService = async (serviceData: Partial<Service>): Promise<Service> => {
  // Transform our Service type to match Supabase schema
  const supabaseData = {
    title: serviceData.title,
    description: serviceData.description,
    coach_id: serviceData.providerId,
    coach_name: serviceData.providerName,
    price: serviceData.price || 0,
    duration: serviceData.duration,
    is_active: true,
    service_type: serviceData.sessionType,
    capacity: serviceData.capacity,
    is_online: serviceData.isOnline,
    location: serviceData.location,
    meeting_url: serviceData.meetingUrl,
    is_free: serviceData.isFree || false,
    image: serviceData.image,
    cover_image: serviceData.coverImage,
  };
  
  const { data, error } = await supabase
    .from('services')
    .insert(supabaseData)
    .select()
    .single();
    
  if (error) {
    console.error('Error creating service:', error);
    throw new Error(error.message);
  }
  
  // Return the created service
  return {
    id: data.id,
    title: data.title,
    description: data.description || '',
    providerId: data.coach_id,
    providerName: data.coach_name,
    price: data.price,
    duration: data.duration || '1 hour',
    available: data.is_active,
    createdAt: new Date(data.created_at),
    sessionType: data.service_type as 'one_on_one' | 'group',
    capacity: data.capacity,
    startTime: undefined, // The database doesn't have start_time field
    location: data.location,
    isOnline: data.is_online,
    meetingUrl: data.meeting_url,
    image: data.image,
    isFree: data.is_free,
    coverImage: data.cover_image,
  };
};

// Update an existing service
export const updateService = async (id: string, serviceData: Partial<Service>): Promise<Service> => {
  // Transform our Service type to match Supabase schema
  const supabaseData: any = {};
  
  if (serviceData.title !== undefined) supabaseData.title = serviceData.title;
  if (serviceData.description !== undefined) supabaseData.description = serviceData.description;
  if (serviceData.price !== undefined) supabaseData.price = serviceData.price;
  if (serviceData.duration !== undefined) supabaseData.duration = serviceData.duration;
  if (serviceData.available !== undefined) supabaseData.is_active = serviceData.available;
  if (serviceData.sessionType !== undefined) supabaseData.service_type = serviceData.sessionType;
  if (serviceData.capacity !== undefined) supabaseData.capacity = serviceData.capacity;
  if (serviceData.location !== undefined) supabaseData.location = serviceData.location;
  if (serviceData.isOnline !== undefined) supabaseData.is_online = serviceData.isOnline;
  if (serviceData.meetingUrl !== undefined) supabaseData.meeting_url = serviceData.meetingUrl;
  if (serviceData.image !== undefined) supabaseData.image = serviceData.image;
  if (serviceData.isFree !== undefined) supabaseData.is_free = serviceData.isFree;
  if (serviceData.coverImage !== undefined) supabaseData.cover_image = serviceData.coverImage;
  
  const { data, error } = await supabase
    .from('services')
    .update(supabaseData)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating service:', error);
    throw new Error(error.message);
  }
  
  // Return the updated service
  return {
    id: data.id,
    title: data.title,
    description: data.description || '',
    providerId: data.coach_id,
    providerName: data.coach_name,
    price: data.price,
    duration: data.duration || '1 hour',
    available: data.is_active,
    createdAt: new Date(data.created_at),
    sessionType: data.service_type as 'one_on_one' | 'group',
    capacity: data.capacity,
    startTime: undefined, // The database doesn't have start_time field
    location: data.location,
    isOnline: data.is_online,
    meetingUrl: data.meeting_url,
    image: data.image,
    isFree: data.is_free,
    coverImage: data.cover_image,
  };
};

// Delete a service
export const deleteService = async (id: string): Promise<void> => {
  console.log('Attempting to delete service with ID:', id);
  
  try {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting service:', error);
      throw new Error(error.message);
    }
    
    console.log('Service deleted successfully');
  } catch (error) {
    console.error('Deletion error:', error);
    throw error;
  }
};

// Book a service
export const bookService = async (bookingData: {
  serviceId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userProfileImage?: string;
}): Promise<void> => {
  const { error } = await supabase
    .from('service_enrollments')
    .insert({
      service_id: bookingData.serviceId,
      user_id: bookingData.userId,
      user_name: bookingData.userName,
      user_email: bookingData.userEmail,
      user_profile_image: bookingData.userProfileImage,
      status: 'pending',
      payment_status: 'unpaid',
    });
    
  if (error) {
    console.error('Error booking service:', error);
    throw new Error(error.message);
  }
};
