
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FollowerUser {
  id: string;
  name: string;
  profileImage?: string;
  role: string;
  isFollowing?: boolean;
}

export const useFollowers = (userId: string | undefined, currentUserId: string | undefined) => {
  const [followers, setFollowers] = useState<FollowerUser[]>([]);
  const [following, setFollowing] = useState<FollowerUser[]>([]);
  const [followerCount, setFollowerCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchFollowerData();
    }
  }, [userId, currentUserId]);

  const fetchFollowerData = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Get followers (people who follow userId)
      const { data: followerData, error: followerError } = await supabase
        .from('followers')
        .select('follower_id')
        .eq('following_id', userId);
      
      if (followerError) throw followerError;
      
      // Get following (people userId follows)
      const { data: followingData, error: followingError } = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', userId);
      
      if (followingError) throw followingError;
      
      // If currentUserId is provided, check who the current user is following
      let currentUserFollowingMap: Record<string, boolean> = {};
      
      if (currentUserId) {
        const { data: currentUserFollowing, error: currentUserError } = await supabase
          .from('followers')
          .select('following_id')
          .eq('follower_id', currentUserId);
        
        if (!currentUserError && currentUserFollowing) {
          currentUserFollowingMap = currentUserFollowing.reduce((acc: Record<string, boolean>, item) => {
            acc[item.following_id] = true;
            return acc;
          }, {});
        }
      }
      
      // Process followers - we'll need to fetch their profile details separately
      const followerProfiles = await Promise.all(
        followerData.map(async (item) => {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, name, profile_image, role')
            .eq('id', item.follower_id)
            .single();
          
          if (profileError || !profileData) {
            console.error('Error fetching follower profile:', profileError);
            return null;
          }
          
          return {
            id: profileData.id,
            name: profileData.name,
            profileImage: profileData.profile_image,
            role: profileData.role,
            isFollowing: !!currentUserFollowingMap[profileData.id]
          };
        })
      );
      
      // Process following - we'll need to fetch their profile details separately
      const followingProfiles = await Promise.all(
        followingData.map(async (item) => {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, name, profile_image, role')
            .eq('id', item.following_id)
            .single();
          
          if (profileError || !profileData) {
            console.error('Error fetching following profile:', profileError);
            return null;
          }
          
          return {
            id: profileData.id,
            name: profileData.name,
            profileImage: profileData.profile_image,
            role: profileData.role,
            isFollowing: true // The user is already following these people
          };
        })
      );
      
      // Filter out any null values from failed profile fetches
      const validFollowerProfiles = followerProfiles.filter(profile => profile !== null) as FollowerUser[];
      const validFollowingProfiles = followingProfiles.filter(profile => profile !== null) as FollowerUser[];
      
      setFollowers(validFollowerProfiles);
      setFollowing(validFollowingProfiles);
      setFollowerCount(validFollowerProfiles.length);
      setFollowingCount(validFollowingProfiles.length);
    } catch (error: any) {
      console.error('Error fetching follower data:', error);
      toast({
        title: "Error fetching followers",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    followers,
    following,
    followerCount,
    followingCount,
    loading,
    refresh: fetchFollowerData
  };
};
