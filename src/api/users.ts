
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types';

// Fetch a user by ID
export const fetchUserById = async (id: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    if (!data) return null;

    // Handle the social links object properly
    const socialLinksObj = data.social_links as Record<string, string> | null;
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role as UserRole,
      profileImage: data.profile_image,
      bio: data.bio,
      location: data.location,
      interests: data.interests,
      following: data.following,
      followers: data.followers,
      verified: data.verified,
      socialLinks: socialLinksObj ? {
        instagram: socialLinksObj.instagram,
        twitter: socialLinksObj.twitter,
        website: socialLinksObj.website
      } : undefined,
      createdAt: new Date(data.created_at)
    };
  } catch (error) {
    console.error('Error in fetchUserById:', error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (id: string, userData: Partial<User>): Promise<User | null> => {
  try {
    const updateData: any = {};
    
    if (userData.name !== undefined) updateData.name = userData.name;
    if (userData.bio !== undefined) updateData.bio = userData.bio;
    if (userData.location !== undefined) updateData.location = userData.location;
    if (userData.interests !== undefined) updateData.interests = userData.interests;
    if (userData.profileImage !== undefined) updateData.profile_image = userData.profileImage;
    if (userData.socialLinks !== undefined) updateData.social_links = userData.socialLinks;
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
    
    if (!data) return null;
    
    // Handle the social links object properly
    const socialLinksObj = data.social_links as Record<string, string> | null;
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role as UserRole,
      profileImage: data.profile_image,
      bio: data.bio,
      location: data.location,
      interests: data.interests,
      following: data.following,
      followers: data.followers,
      verified: data.verified,
      socialLinks: socialLinksObj ? {
        instagram: socialLinksObj.instagram,
        twitter: socialLinksObj.twitter,
        website: socialLinksObj.website
      } : undefined,
      createdAt: new Date(data.created_at)
    };
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return null;
  }
};

// Check if a user is following another user
export const isFollowing = async (followerId: string, followingId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('followers')
      .select('*')
      .eq('follower_id', followerId)
      .eq('following_id', followingId);
    
    if (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error('Error in isFollowing:', error);
    return false;
  }
};
