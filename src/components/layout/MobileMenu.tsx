
import React from 'react';
import { User } from '@/types';
import { X, Home, Search, Calendar, Users, Settings, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import SidebarNavLink from './SidebarNavLink';
import RoleBasedActionButton from '@/components/shared/RoleBasedActionButton';
import UserProfileSection from './UserProfileSection';

interface MobileMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: User | null;
  handleLogout: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ 
  isOpen, 
  onOpenChange, 
  currentUser,
  handleLogout
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[75%] sm:w-[350px] p-0">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold gradient-text">Osprey</h2>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X size={18} />
              </Button>
            </div>
            
            {currentUser && (
              <div className="flex items-center gap-3 py-2">
                <img 
                  src={currentUser.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random`} 
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-sm">{currentUser.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{currentUser.role}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-auto p-4">
            <nav className="space-y-1">
              <SidebarNavLink 
                to="/" 
                icon={<Home size={18} />} 
                label="Home" 
                onMobileClick={() => onOpenChange(false)}
              />
              <SidebarNavLink 
                to="/explore" 
                icon={<Search size={18} />} 
                label="Explore" 
                onMobileClick={() => onOpenChange(false)}
              />
              <SidebarNavLink 
                to="/events" 
                icon={<Calendar size={18} />} 
                label="Events" 
                onMobileClick={() => onOpenChange(false)}
              />
              <SidebarNavLink 
                to="/groups" 
                icon={<Users size={18} />} 
                label="Groups" 
                onMobileClick={() => onOpenChange(false)}
              />
              <SidebarNavLink 
                to="/profile" 
                icon={<UserIcon size={18} />} 
                label="Profile" 
                onMobileClick={() => onOpenChange(false)}
              />
              {currentUser?.role === 'admin' && (
                <SidebarNavLink 
                  to="/admin" 
                  icon={<Settings size={18} />} 
                  label="Admin" 
                  onMobileClick={() => onOpenChange(false)}
                />
              )}
            </nav>
            
            <div className="mt-6">
              <RoleBasedActionButton />
            </div>
          </div>
          
          <UserProfileSection currentUser={currentUser} handleLogout={handleLogout} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
