
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { PlusCircle, Calendar, Users, FileText, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RoleBasedActionButton: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) return null;

  // Role-specific actions
  const getActions = () => {
    switch (currentUser.role) {
      case 'user':
        return [
          { label: 'Join Event', icon: <Calendar className="h-4 w-4 mr-2" />, action: () => navigate('/explore?tab=events') },
          { label: 'Join Group', icon: <Users className="h-4 w-4 mr-2" />, action: () => navigate('/explore?tab=groups') },
        ];
      
      case 'influencer':
        return [
          { label: 'Create Post', icon: <FileText className="h-4 w-4 mr-2" />, action: () => navigate('/create/post') },
          { label: 'Create Event', icon: <Calendar className="h-4 w-4 mr-2" />, action: () => navigate('/create-event') },
          { label: 'Create Group', icon: <Users className="h-4 w-4 mr-2" />, action: () => navigate('/create-group') },
        ];
      
      case 'coach':
        return [
          { label: 'Create Post', icon: <FileText className="h-4 w-4 mr-2" />, action: () => navigate('/create/post') },
          { label: 'Create Event', icon: <Calendar className="h-4 w-4 mr-2" />, action: () => navigate('/create-event') },
          { label: 'Create Group', icon: <Users className="h-4 w-4 mr-2" />, action: () => navigate('/create-group') },
          { label: 'Create Service', icon: <DollarSign className="h-4 w-4 mr-2" />, action: () => navigate('/services/create') },
          { label: 'Create Session', icon: <Calendar className="h-4 w-4 mr-2" />, action: () => navigate('/sessions/create') },
        ];
      
      case 'company':
        return [
          { label: 'Create Post', icon: <FileText className="h-4 w-4 mr-2" />, action: () => navigate('/create/post') },
          { label: 'Create Event', icon: <Calendar className="h-4 w-4 mr-2" />, action: () => navigate('/create-event') },
          { label: 'Create Group', icon: <Users className="h-4 w-4 mr-2" />, action: () => navigate('/create-group') },
        ];
        
      default:
        return [];
    }
  };

  const actions = getActions();

  if (actions.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="w-full gap-2">
          <PlusCircle className="h-5 w-5" />
          <span>Create</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {actions.map((action, index) => (
          <DropdownMenuItem 
            key={index} 
            onClick={action.action}
            className="cursor-pointer flex items-center"
          >
            {action.icon}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RoleBasedActionButton;
