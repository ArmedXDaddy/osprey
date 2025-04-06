import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, Lock, Globe, DollarSign } from 'lucide-react';
import { Group, GroupPrivacy, GroupPrivacyString } from '@/types';

interface GroupCardProps {
  group: Group;
  onClick: () => void;
}

const GroupCard: React.FC<GroupCardProps> = ({ group, onClick }) => {
  // Helper function to check group privacy
  const isPrivacyType = (privacy: GroupPrivacy | GroupPrivacyString, type: string): boolean => {
    if (typeof privacy === 'string') {
      return privacy === type;
    } else {
      return privacy[type as keyof GroupPrivacy];
    }
  };

  // Get privacy badge
  const getPrivacyBadge = () => {
    if (isPrivacyType(group.privacy, 'private')) {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <Lock className="h-3 w-3" />
          Private
        </Badge>
      );
    } else if (isPrivacyType(group.privacy, 'paid')) {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <DollarSign className="h-3 w-3" />
          Paid
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <Globe className="h-3 w-3" />
          Public
        </Badge>
      );
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{group.name}</CardTitle>
        <CardDescription>{group.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1">
        <div className="relative w-full aspect-video mb-4 rounded-md overflow-hidden bg-muted">
          {group.image ? (
            <img
              src={group.image}
              alt={group.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              No Image
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={group.creatorId} />
              <AvatarFallback>{group.creatorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{group.creatorName}</span>
          </div>
          {getPrivacyBadge()}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Users className="h-4 w-4" />
          <span>{group.members} Members</span>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button variant="secondary" className="w-full" onClick={onClick}>
          View Group
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GroupCard;
