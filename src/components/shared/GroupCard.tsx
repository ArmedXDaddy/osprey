import React from 'react';
import { Group } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Lock, Globe, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface GroupCardProps {
  group: Group;
  compact?: boolean;
  onClick?: () => void;
}

const GroupCard: React.FC<GroupCardProps> = ({ group, compact = false, onClick }) => {
  const getPrivacyIcon = () => {
    switch (group.privacy) {
      case 'private':
        return <Lock className="h-3 w-3 mr-1" />;
      case 'paid':
        return <DollarSign className="h-3 w-3 mr-1" />;
      default:
        return <Globe className="h-3 w-3 mr-1" />;
    }
  };
  
  const getPrivacyLabel = () => {
    switch (group.privacy) {
      case 'private':
        return 'Private';
      case 'paid':
        return `Paid ($${group.price}/month)`;
      default:
        return 'Public';
    }
  };

  const cardContent = (
    <Card className={`overflow-hidden ${compact ? 'h-full' : ''}`}>
      <div className={`relative ${compact ? 'h-32' : 'h-48'}`}>
        <img 
          src={group.image || 'https://images.unsplash.com/photo-1576678927484-cc907957088c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'} 
          alt={group.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <p className="font-bold truncate">{group.name}</p>
          <div className="flex items-center gap-1 text-xs">
            <span className={`inline-block px-2 py-0.5 rounded-full capitalize
              ${group.creatorRole === 'influencer' ? 'bg-red-500' : 
                group.creatorRole === 'coach' ? 'bg-teal-500' : 
                group.creatorRole === 'company' ? 'bg-blue-500' : 
                'bg-purple-500'}`}
            >
              {group.creatorRole}
            </span>
            <span>by {group.creatorName}</span>
          </div>
        </div>
      </div>
      
      <CardContent className={compact ? 'p-3' : 'p-4'}>
        <Badge variant="outline" className="mb-2">
          {getPrivacyIcon()}
          {getPrivacyLabel()}
        </Badge>
        
        {!compact && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-4">{group.description}</p>
        )}
        
        <div className="flex items-center gap-2">
          <Users className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-gray-500`} />
          <span className={`${compact ? 'text-xs' : 'text-sm'} text-gray-700`}>
            {group.members} {group.members === 1 ? 'member' : 'members'}
          </span>
        </div>
      </CardContent>
      
      {!compact && (
        <CardFooter className="px-4 pt-0 pb-4">
          <Link to={`/groups/${group.id}`} className="w-full">
            <Button size="sm" className="w-full">View Group</Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );

  if (onClick) {
    return <div onClick={onClick}>{cardContent}</div>;
  }

  return cardContent;
};

export default GroupCard;
