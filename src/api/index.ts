
// Export all API functions here
import { fetchServices, fetchServiceById, fetchServicesByProviderId, createService, updateService, deleteService, bookService } from './services';

// Placeholder API functions for Profile component
export const fetchProfile = async (userId: string) => {
  try {
    // Fetch user profile from Supabase
    const { data, error } = await fetch(`/api/profiles/${userId}`).then(res => res.json());
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data || null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

export const fetchPosts = async () => {
  try {
    // Fetch posts
    const { data, error } = await fetch('/api/posts').then(res => res.json());
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

export const fetchEvents = async () => {
  try {
    // Fetch events
    const { data, error } = await fetch('/api/events').then(res => res.json());
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

export const fetchGroups = async () => {
  try {
    // Fetch groups
    const { data, error } = await fetch('/api/groups').then(res => res.json());
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching groups:', error);
    return [];
  }
};

export {
  fetchServices,
  fetchServiceById,
  fetchServicesByProviderId,
  createService,
  updateService,
  deleteService,
  bookService
};
