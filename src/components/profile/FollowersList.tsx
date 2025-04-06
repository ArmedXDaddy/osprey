
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link } from 'react-router-dom';
import { User, UserRole } from '@/types';
import FollowButton from './FollowButton';

type UserWithFollowStatus = {
  id: string;
  name: string;
  profileImage?: string;
  role: UserRole;
  isFollowing?: boolean;
};

interface FollowersListProps {
  users: UserWithFollowStatus[];
  emptyMessage?: string;
  isOwnProfile: boolean;
  onClose?: () => void;
}

const FollowersList: React.FC<FollowersListProps> = ({
  users,
  emptyMessage = "No users found",
  isOwnProfile,
  onClose
}) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-[60vh]">
      <div className="space-y-3 py-2">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between py-3">
            <Link 
              to={`/profile/${user.id}`} 
              className="flex items-center gap-3"
              onClick={onClose}
            >
              <Avatar>
                <AvatarImage src={user.profileImage} />
                <AvatarFallback>
                  {user.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500 capitalize">{user.role}</p>
              </div>
            </Link>
            
            {isOwnProfile ? (
              <FollowButton targetUserId={user.id} initialIsFollowing={user.isFollowing} />
            ) : null}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default FollowersList;
