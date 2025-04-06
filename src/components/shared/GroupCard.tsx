
import React from 'react';
import { Link } from 'react-router-dom';
import { Group } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, UsersRound, Lock, LucideIcon } from 'lucide-react';

type GroupPrivacyTypes = 'public' | 'private' | 'paid';

const privacyIcons: Record<GroupPrivacyTypes, LucideIcon> = {
  public: UsersRound,
  private: Lock,
  paid: User,
};

interface GroupCardProps {
  group: Group;
  isJoined?: boolean;
  onClick?: (groupId: string) => void;
  onJoin?: (groupId: string) => void;
  onRequestJoin?: (groupId: string) => void;
  onLeave?: (groupId: string) => void;
  onDelete?: () => void;
  compact?: boolean;
}

const GroupCard: React.FC<GroupCardProps> = ({
  group,
  isJoined = false,
  onClick,
  onJoin,
  onRequestJoin,
  onLeave,
  onDelete,
  compact = false,
}) => {
  const { id, name, description, image, privacy, members, price } = group;
  const privacyType = privacy as GroupPrivacyTypes;
  const PrivacyIcon = privacyIcons[privacyType] || UsersRound;

  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  return (
    <Card className="overflow-hidden">
      {!compact && (
        <div className="aspect-video relative">
          {image ? (
            <img src={image} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>
      )}
      <CardContent className={`p-4 ${compact ? 'pt-4' : ''}`}>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{name}</h3>
          <Badge
            variant={privacy === 'public' ? 'default' : privacy === 'private' ? 'secondary' : 'destructive'}
            className="flex items-center gap-1"
          >
            <PrivacyIcon className="h-3 w-3" />
            <span>{privacy.charAt(0).toUpperCase() + privacy.slice(1)}</span>
          </Badge>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{description}</p>

        <div className="flex items-center text-sm text-gray-500 mb-1">
          <UsersRound className="h-4 w-4 mr-1" />
          <span>{members} member{members !== 1 ? 's' : ''}</span>
        </div>

        {privacy === 'paid' && price && (
          <div className="text-sm font-medium mb-2">${price.toFixed(2)} to join</div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between">
        {onDelete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
          >
            Delete
          </Button>
        )}
        {(onJoin || onRequestJoin || onLeave) && (
          <Button
            variant={isJoined ? "outline" : "default"}
            size="sm"
            onClick={() => {
              if (isJoined && onLeave) {
                onLeave(id);
              } else if (privacy === 'public' && onJoin) {
                onJoin(id);
              } else if (onRequestJoin) {
                onRequestJoin(id);
              }
            }}
          >
            {isJoined 
              ? 'Leave' 
              : privacy === 'public' 
                ? 'Join' 
                : privacy === 'private' 
                  ? 'Request to Join' 
                  : 'Subscribe'}
          </Button>
        )}
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleClick}
          asChild={!onClick}
        >
          {onClick ? (
            <span>View</span>
          ) : (
            <Link to={`/groups/${id}`}>View</Link>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GroupCard;
