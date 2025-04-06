
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User as UserIcon, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FollowButton from '@/components/profile/FollowButton';

interface UserCardProps {
  user: {
    id: string;
    name: string;
    role: string;
    followers?: number;
    location?: string;
    image?: string;
    profileImage?: string; // Support both image and profileImage
    bio?: string;
  };
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const navigate = useNavigate();
  
  const roleColors: Record<string, string> = {
    user: 'bg-gray-100 text-gray-800',
    influencer: 'bg-purple-100 text-purple-800',
    coach: 'bg-blue-100 text-blue-800',
    company: 'bg-green-100 text-green-800',
    admin: 'bg-red-100 text-red-800'
  };
  
  // Use profileImage if available, fall back to image
  const userImage = user.profileImage || user.image;
  
  // Generate fallback avatar URL based on user name
  const getFallbackAvatarUrl = (name: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
  };
  
  // Get user initials for the fallback
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="aspect-[3/1] bg-gradient-to-r from-indigo-500 to-purple-600" />
      <div className="relative px-4">
        <Avatar className="h-16 w-16 -mt-8 border-4 border-background">
          <AvatarImage 
            src={userImage} 
            alt={user.name} 
            fallbackSrc={getFallbackAvatarUrl(user.name)}
          />
          <AvatarFallback>
            {getUserInitials(user.name)}
          </AvatarFallback>
        </Avatar>
      </div>
      <CardContent className="mt-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{user.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className={roleColors[user.role] || roleColors.user}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
              {user.followers !== undefined && (
                <span className="text-xs text-muted-foreground">
                  {user.followers.toLocaleString()} followers
                </span>
              )}
            </div>
          </div>
        </div>
        {user.location && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {user.location}
          </p>
        )}
        {user.bio && (
          <p className="text-sm mt-2 line-clamp-2 text-gray-700">{user.bio}</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate(`/profile/${user.id}`)}
        >
          View Profile
        </Button>
        <FollowButton targetUserId={user.id} />
      </CardFooter>
    </Card>
  );
};

export default UserCard;
