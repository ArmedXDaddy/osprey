
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
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
      // Fetch followers (people who follow the userId)
      const { data: followerData, error: followerError } = await supabase
        .from('followers')
        .select(`
          follower_id,
          profiles:follower_id(
            id,
            name,
            profile_image,
            role
          )
        `)
        .eq('following_id', userId);
      
      if (followerError) throw followerError;
      
      // Fetch following (people userId follows)
      const { data: followingData, error: followingError } = await supabase
        .from('followers')
        .select(`
          following_id,
          profiles:following_id(
            id,
            name,
            profile_image,
            role
          )
        `)
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
      
      // Process followers data
      const processedFollowers = followerData
        .filter(item => item.profiles)
        .map(item => ({
          id: item.profiles.id,
          name: item.profiles.name,
          profileImage: item.profiles.profile_image,
          role: item.profiles.role,
          isFollowing: !!currentUserFollowingMap[item.follower_id]
        }));
      
      // Process following data
      const processedFollowing = followingData
        .filter(item => item.profiles)
        .map(item => ({
          id: item.profiles.id,
          name: item.profiles.name,
          profileImage: item.profiles.profile_image,
          role: item.profiles.role,
          isFollowing: true // The user is already following these people
        }));
      
      setFollowers(processedFollowers);
      setFollowing(processedFollowing);
      setFollowerCount(processedFollowers.length);
      setFollowingCount(processedFollowing.length);
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
