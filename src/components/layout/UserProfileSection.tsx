
import React from 'react';
import { User } from '@/types';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserProfileSectionProps {
  currentUser: User | null;
  handleLogout: () => void;
  compact?: boolean;
}

const UserProfileSection: React.FC<UserProfileSectionProps> = ({ currentUser, handleLogout, compact = false }) => {
  if (!currentUser) return null;

  return (
    <div className={`${compact ? 'mt-auto pt-4' : 'p-4'} border-t border-gray-100`}>
      <div className={`flex items-center gap-${compact ? '2' : '3'} mb-4`}>
        <img 
          src={currentUser.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random`} 
          alt={currentUser.name}
          className={`w-${compact ? '8' : '10'} h-${compact ? '8' : '10'} rounded-full object-cover`}
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{currentUser.name}</p>
          <p className="text-xs text-gray-500 truncate capitalize">{currentUser.role}</p>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        size={compact ? "sm" : "default"}
        className="w-full justify-start gap-2" 
        onClick={handleLogout}
      >
        <LogOut size={16} />
        <span className="text-sm">Logout</span>
      </Button>
    </div>
  );
};

export default UserProfileSection;
