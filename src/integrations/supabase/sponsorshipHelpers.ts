
import { supabase } from './client';
import { Sponsorship, SponsorshipApplication } from '@/types/sponsorship';

/**
 * Fetch all sponsorships
 */
export const fetchSponsorships = async (): Promise<Sponsorship[]> => {
  try {
    const { data, error } = await supabase
      .from('sponsorships')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Map database columns to our Sponsorship interface
    return data.map(item => ({
      id: item.id,
      companyId: item.company_id,
      companyName: item.company_name,
      companyLogo: item.company_logo,
      title: item.title,
      description: item.description,
      requirements: item.requirements || [],
      benefits: item.benefits || [],
      compensation: item.compensation,
      deadline: item.deadline ? new Date(item.deadline) : undefined,
      tags: item.tags || [],
      status: item.status as Sponsorship['status'],
      createdAt: new Date(item.created_at)
    }));
  } catch (error) {
    console.error('Error fetching sponsorships:', error);
    return [];
  }
};

/**
 * Create a new sponsorship
 */
export const createSponsorship = async (sponsorshipData: Partial<Sponsorship>): Promise<Sponsorship | null> => {
  try {
    // Convert Date objects to ISO strings for Supabase
    const formattedDeadline = sponsorshipData.deadline ? sponsorshipData.deadline.toISOString() : null;
    
    const { data, error } = await supabase
      .from('sponsorships')
      .insert({
        company_id: sponsorshipData.companyId,
        company_name: sponsorshipData.companyName,
        company_logo: sponsorshipData.companyLogo,
        title: sponsorshipData.title,
        description: sponsorshipData.description,
        requirements: sponsorshipData.requirements,
        benefits: sponsorshipData.benefits,
        compensation: sponsorshipData.compensation,
        deadline: formattedDeadline,
        tags: sponsorshipData.tags,
        status: sponsorshipData.status || 'active'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      companyId: data.company_id,
      companyName: data.company_name,
      companyLogo: data.company_logo,
      title: data.title,
      description: data.description,
      requirements: data.requirements || [],
      benefits: data.benefits || [],
      compensation: data.compensation,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      tags: data.tags || [],
      status: data.status as Sponsorship['status'],
      createdAt: new Date(data.created_at)
    };
  } catch (error) {
    console.error('Error creating sponsorship:', error);
    return null;
  }
};

/**
 * Fetch a single sponsorship by ID
 */
export const fetchSponsorshipById = async (id: string): Promise<Sponsorship | null> => {
  try {
    const { data, error } = await supabase
      .from('sponsorships')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      companyId: data.company_id,
      companyName: data.company_name,
      companyLogo: data.company_logo,
      title: data.title,
      description: data.description,
      requirements: data.requirements || [],
      benefits: data.benefits || [],
      compensation: data.compensation,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      tags: data.tags || [],
      status: data.status as Sponsorship['status'],
      createdAt: new Date(data.created_at)
    };
  } catch (error) {
    console.error('Error fetching sponsorship:', error);
    return null;
  }
};

/**
 * Apply for a sponsorship
 */
export const applyForSponsorship = async (
  sponsorshipId: string,
  applicationData: Partial<SponsorshipApplication>
): Promise<SponsorshipApplication | null> => {
  try {
    const { data, error } = await supabase
      .from('sponsorship_applications')
      .insert({
        sponsorship_id: sponsorshipId,
        user_id: applicationData.userId,
        user_name: applicationData.userName,
        user_email: applicationData.userEmail,
        user_profile_image: applicationData.userProfileImage,
        experience: applicationData.experience,
        motivation: applicationData.motivation,
        social_links: applicationData.socialLinks || {},
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      sponsorshipId: data.sponsorship_id,
      userId: data.user_id,
      userName: data.user_name,
      userEmail: data.user_email,
      userProfileImage: data.user_profile_image,
      experience: data.experience,
      motivation: data.motivation,
      socialLinks: data.social_links ? data.social_links as SponsorshipApplication['socialLinks'] : undefined,
      status: data.status as SponsorshipApplication['status'],
      createdAt: new Date(data.created_at)
    };
  } catch (error) {
    console.error('Error applying for sponsorship:', error);
    return null;
  }
};

/**
 * Get applications for a specific sponsorship
 */
export const getSponsorshipApplications = async (sponsorshipId: string): Promise<SponsorshipApplication[]> => {
  try {
    const { data, error } = await supabase
      .from('sponsorship_applications')
      .select('*')
      .eq('sponsorship_id', sponsorshipId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      sponsorshipId: item.sponsorship_id,
      userId: item.user_id,
      userName: item.user_name,
      userEmail: item.user_email,
      userProfileImage: item.user_profile_image,
      experience: item.experience,
      motivation: item.motivation,
      socialLinks: item.social_links ? item.social_links as SponsorshipApplication['socialLinks'] : undefined,
      status: item.status as SponsorshipApplication['status'],
      createdAt: new Date(item.created_at)
    }));
  } catch (error) {
    console.error('Error fetching sponsorship applications:', error);
    return [];
  }
};

/**
 * Get user's applications for sponsorships
 */
export const getUserSponsorshipApplications = async (userId: string): Promise<SponsorshipApplication[]> => {
  try {
    const { data, error } = await supabase
      .from('sponsorship_applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      sponsorshipId: item.sponsorship_id,
      userId: item.user_id,
      userName: item.user_name,
      userEmail: item.user_email,
      userProfileImage: item.user_profile_image,
      experience: item.experience,
      motivation: item.motivation,
      socialLinks: item.social_links ? item.social_links as SponsorshipApplication['socialLinks'] : undefined,
      status: item.status as SponsorshipApplication['status'],
      createdAt: new Date(item.created_at)
    }));
  } catch (error) {
    console.error('Error fetching user sponsorship applications:', error);
    return [];
  }
};

/**
 * Update application status
 */
export const updateApplicationStatus = async (
  applicationId: string, 
  status: 'approved' | 'rejected'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('sponsorship_applications')
      .update({ status })
      .eq('id', applicationId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating application status:', error);
    return false;
  }
};
