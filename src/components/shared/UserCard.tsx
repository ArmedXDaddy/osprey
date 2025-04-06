
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User as UserIcon, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserCardProps {
  user: {
    id: string;
    name: string;
    role: string;
    followers?: number;
    location?: string;
    image?: string;
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
  
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[3/1] bg-gradient-to-r from-indigo-500 to-purple-600" />
      <div className="relative px-4">
        <Avatar className="h-16 w-16 -mt-8 border-4 border-background">
          <AvatarImage src={user.image} alt={user.name} />
          <AvatarFallback>
            <UserIcon className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
      </div>
      <CardContent className="mt-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{user.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className={roleColors[user.role]}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
              {user.followers && (
                <span className="text-xs text-muted-foreground">
                  {user.followers.toLocaleString()} followers
                </span>
              )}
            </div>
          </div>
        </div>
        {user.location && (
          <p className="text-xs text-muted-foreground mt-1">{user.location}</p>
        )}
        {user.bio && (
          <p className="text-sm mt-2 line-clamp-2">{user.bio}</p>
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
        <Button variant="default" size="sm">
          <UserPlus className="h-4 w-4 mr-1" />
          Follow
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserCard;
