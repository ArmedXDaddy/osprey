
import React from 'react';
import { User } from '@/types';
import { Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileHeaderProps {
  currentUser: User | null;
  onMenuToggle: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ currentUser, onMenuToggle }) => {
  return (
    <header className="md:hidden bg-white border-b border-gray-100 p-3 sticky top-0 z-10 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onMenuToggle}>
          <Menu size={18} />
        </Button>
        <h1 className="text-lg font-semibold gradient-text">Osprey</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell size={18} />
        </Button>
        {currentUser && (
          <img 
            src={currentUser.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random`} 
            alt={currentUser.name}
            className="w-7 h-7 rounded-full object-cover"
          />
        )}
      </div>
    </header>
  );
};

export default MobileHeader;
