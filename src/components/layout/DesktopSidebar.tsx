
import React from 'react';
import { User } from '@/types';
import { Home, Search, Calendar, Users, Settings, User as UserIcon } from 'lucide-react';
import SidebarNavLink from './SidebarNavLink';
import UserProfileSection from './UserProfileSection';
import RoleBasedActionButton from '@/components/shared/RoleBasedActionButton';

interface DesktopSidebarProps {
  currentUser: User | null;
  handleLogout: () => void;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ currentUser, handleLogout }) => {
  return (
    <div className="hidden md:flex flex-col w-56 bg-white border-r border-gray-100 h-screen sticky top-0 shrink-0">
      <div className="p-4 flex flex-col h-full">
        <h1 className="text-xl font-semibold mb-8 gradient-text">Osprey</h1>
        
        <nav className="space-y-1 flex-1">
          <SidebarNavLink to="/" icon={<Home size={18} />} label="Home" />
          <SidebarNavLink to="/explore" icon={<Search size={18} />} label="Explore" />
          <SidebarNavLink to="/events" icon={<Calendar size={18} />} label="Events" />
          <SidebarNavLink to="/groups" icon={<Users size={18} />} label="Groups" />
          <SidebarNavLink to="/profile" icon={<UserIcon size={18} />} label="Profile" />
          {currentUser?.role === 'admin' && (
            <SidebarNavLink to="/admin" icon={<Settings size={18} />} label="Admin" />
          )}
        </nav>
        
        <div className="mt-4">
          <RoleBasedActionButton />
        </div>
        
        <UserProfileSection currentUser={currentUser} handleLogout={handleLogout} compact={true} />
      </div>
    </div>
  );
};

export default DesktopSidebar;
