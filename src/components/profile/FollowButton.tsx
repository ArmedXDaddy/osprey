
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface FollowButtonProps {
  targetUserId: string;
  onFollowChange?: (isFollowing: boolean) => void;
  initialIsFollowing?: boolean;
  className?: string;
}

const FollowButton = ({ 
  targetUserId, 
  onFollowChange,
  initialIsFollowing = false,
  className 
}: FollowButtonProps) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      checkIfFollowing();
    }
  }, [currentUser, targetUserId]);

  const checkIfFollowing = async () => {
    try {
      if (!currentUser) return;
      
      const { data, error } = await supabase
        .from('followers')
        .select('*')
        .eq('follower_id', currentUser.id)
        .eq('following_id', targetUserId)
        .maybeSingle();
      
      if (error) throw error;
      
      const isCurrentlyFollowing = !!data;
      setIsFollowing(isCurrentlyFollowing);
      
      // Call the callback if provided
      if (onFollowChange) {
        onFollowChange(isCurrentlyFollowing);
      }
    } catch (error: any) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollowToggle = async () => {
    try {
      if (!currentUser) {
        toast({
          title: "Authentication required",
          description: "You need to be logged in to follow users",
          variant: "destructive"
        });
        return;
      }
      
      if (currentUser.id === targetUserId) {
        toast({
          title: "Action not allowed",
          description: "You cannot follow yourself",
          variant: "destructive"
        });
        return;
      }
      
      setIsLoading(true);
      
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('followers')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', targetUserId);
        
        if (error) throw error;
        
        setIsFollowing(false);
        toast({
          title: "Unfollowed",
          description: "You are no longer following this user"
        });
      } else {
        // Follow
        const { error } = await supabase
          .from('followers')
          .insert({
            follower_id: currentUser.id,
            following_id: targetUserId
          });
        
        if (error) throw error;
        
        setIsFollowing(true);
        toast({
          title: "Following",
          description: "You are now following this user"
        });
      }
      
      // Call the callback if provided
      if (onFollowChange) {
        onFollowChange(!isFollowing);
      }
    } catch (error: any) {
      console.error('Error toggling follow status:', error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while updating follow status",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser || currentUser.id === targetUserId) {
    return null;
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className={`gap-1 ${className}`}
      onClick={handleFollowToggle}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <UserCheck className="h-4 w-4" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
      <span>{isFollowing ? "Following" : "Follow"}</span>
    </Button>
  );
};

export default FollowButton;
