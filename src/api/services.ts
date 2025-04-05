
import { supabase } from '@/integrations/supabase/client';
import { Service, ServiceEnrollment, ServiceType } from '@/types';

// Convert Supabase service data to our Service interface
const mapServiceFromDB = (serviceData: any): Service => ({
  id: serviceData.id,
  title: serviceData.title,
  description: serviceData.description,
  coachId: serviceData.coach_id,
  coachName: serviceData.coach_name,
  serviceType: serviceData.service_type as ServiceType,
  capacity: serviceData.capacity,
  price: serviceData.price,
  isFree: serviceData.is_free,
  duration: serviceData.duration,
  image: serviceData.image,
  location: serviceData.location,
  isOnline: serviceData.is_online,
  meetingUrl: serviceData.meeting_url,
  isActive: serviceData.is_active,
  createdAt: new Date(serviceData.created_at),
  updatedAt: new Date(serviceData.updated_at)
});

// Convert Supabase enrollment data to our ServiceEnrollment interface
const mapEnrollmentFromDB = (enrollmentData: any): ServiceEnrollment => ({
  id: enrollmentData.id,
  serviceId: enrollmentData.service_id,
  userId: enrollmentData.user_id,
  userName: enrollmentData.user_name,
  userEmail: enrollmentData.user_email,
  userProfileImage: enrollmentData.user_profile_image,
  status: enrollmentData.status,
  paymentStatus: enrollmentData.payment_status,
  createdAt: new Date(enrollmentData.created_at)
});

// Fetch all services
export const fetchServices = async (): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching services:', error);
    throw error;
  }

  return data ? data.map(mapServiceFromDB) : [];
};

// Fetch a specific service by ID
export const fetchServiceById = async (id: string): Promise<Service> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching service with id ${id}:`, error);
    throw error;
  }

  return mapServiceFromDB(data);
};

// Fetch services by coach ID
export const fetchServicesByCoachId = async (coachId: string): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('coach_id', coachId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching services for coach ${coachId}:`, error);
    throw error;
  }

  return data ? data.map(mapServiceFromDB) : [];
};

// Create a new service
export const createService = async (serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service> => {
  const dbData = {
    title: serviceData.title,
    description: serviceData.description,
    coach_id: serviceData.coachId,
    coach_name: serviceData.coachName,
    service_type: serviceData.serviceType,
    capacity: serviceData.serviceType === 'group' ? serviceData.capacity : null,
    price: serviceData.isFree ? 0 : serviceData.price,
    is_free: serviceData.isFree,
    duration: serviceData.duration,
    image: serviceData.image,
    location: serviceData.isOnline ? null : serviceData.location,
    is_online: serviceData.isOnline,
    meeting_url: serviceData.isOnline ? serviceData.meetingUrl : null,
    is_active: serviceData.isActive
  };

  // Use rpc (stored procedure) instead of direct table insertion to bypass Supabase TS issues
  const { data, error } = await supabase
    .rpc('create_service', dbData)
    .single();

  if (error) {
    console.error('Error creating service:', error);
    throw error;
  }

  return mapServiceFromDB(data);
};

// Update an existing service
export const updateService = async (id: string, serviceData: Partial<Service>): Promise<Service> => {
  const dbData: any = {};
  
  if (serviceData.title !== undefined) dbData.title = serviceData.title;
  if (serviceData.description !== undefined) dbData.description = serviceData.description;
  if (serviceData.serviceType !== undefined) dbData.service_type = serviceData.serviceType;
  if (serviceData.capacity !== undefined) dbData.capacity = serviceData.capacity;
  if (serviceData.price !== undefined) dbData.price = serviceData.price;
  if (serviceData.isFree !== undefined) dbData.is_free = serviceData.isFree;
  if (serviceData.duration !== undefined) dbData.duration = serviceData.duration;
  if (serviceData.image !== undefined) dbData.image = serviceData.image;
  if (serviceData.location !== undefined) dbData.location = serviceData.location;
  if (serviceData.isOnline !== undefined) dbData.is_online = serviceData.isOnline;
  if (serviceData.meetingUrl !== undefined) dbData.meeting_url = serviceData.meetingUrl;
  if (serviceData.isActive !== undefined) dbData.is_active = serviceData.isActive;
  
  dbData.updated_at = new Date().toISOString();

  // Use rpc (stored procedure) instead of direct table update to bypass Supabase TS issues
  const { data, error } = await supabase
    .rpc('update_service', { id, ...dbData })
    .single();

  if (error) {
    console.error(`Error updating service ${id}:`, error);
    throw error;
  }

  return mapServiceFromDB(data);
};

// Delete a service
export const deleteService = async (id: string): Promise<void> => {
  // Use rpc (stored procedure) instead of direct table deletion to bypass Supabase TS issues
  const { error } = await supabase
    .rpc('delete_service', { id });

  if (error) {
    console.error(`Error deleting service ${id}:`, error);
    throw error;
  }
};

// Fetch enrollments for a service
export const fetchServiceEnrollments = async (serviceId: string): Promise<ServiceEnrollment[]> => {
  // Use rpc (stored procedure) instead of direct table query to bypass Supabase TS issues
  const { data, error } = await supabase
    .rpc('get_service_enrollments', { service_id: serviceId });

  if (error) {
    console.error(`Error fetching enrollments for service ${serviceId}:`, error);
    throw error;
  }

  return data ? data.map(mapEnrollmentFromDB) : [];
};

// Fetch enrollments for a user
export const fetchUserEnrollments = async (userId: string): Promise<ServiceEnrollment[]> => {
  // Use rpc (stored procedure) instead of direct table query to bypass Supabase TS issues
  const { data, error } = await supabase
    .rpc('get_user_enrollments', { user_id: userId });

  if (error) {
    console.error(`Error fetching enrollments for user ${userId}:`, error);
    throw error;
  }

  return data ? data.map(mapEnrollmentFromDB) : [];
};

// Create a new enrollment
export const createEnrollment = async (enrollmentData: Omit<ServiceEnrollment, 'id' | 'createdAt'>): Promise<ServiceEnrollment> => {
  const dbData = {
    service_id: enrollmentData.serviceId,
    user_id: enrollmentData.userId,
    user_name: enrollmentData.userName,
    user_email: enrollmentData.userEmail,
    user_profile_image: enrollmentData.userProfileImage,
    status: enrollmentData.status,
    payment_status: enrollmentData.paymentStatus
  };

  // Use rpc (stored procedure) instead of direct table insertion to bypass Supabase TS issues
  const { data, error } = await supabase
    .rpc('create_service_enrollment', dbData)
    .single();

  if (error) {
    console.error('Error creating enrollment:', error);
    throw error;
  }

  return mapEnrollmentFromDB(data);
};

// Update an enrollment's status
export const updateEnrollmentStatus = async (id: string, status: string, paymentStatus?: string): Promise<ServiceEnrollment> => {
  const dbData: any = { id, status };
  if (paymentStatus) dbData.payment_status = paymentStatus;

  // Use rpc (stored procedure) instead of direct table update to bypass Supabase TS issues
  const { data, error } = await supabase
    .rpc('update_enrollment_status', dbData)
    .single();

  if (error) {
    console.error(`Error updating enrollment ${id}:`, error);
    throw error;
  }

  return mapEnrollmentFromDB(data);
};
