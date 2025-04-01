
import React from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarNavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onMobileClick?: () => void;
}

const SidebarNavLink: React.FC<SidebarNavLinkProps> = ({ to, icon, label, onMobileClick }) => (
  <NavLink 
    to={to} 
    onClick={onMobileClick}
    className={({ isActive }) => 
      `flex items-center gap-2 py-2 px-3 rounded-md transition-colors ${
        isActive ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'
      }`
    }
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </NavLink>
);

export default SidebarNavLink;
