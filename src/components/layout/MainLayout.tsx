
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import DesktopSidebar from './DesktopSidebar';
import MobileHeader from './MobileHeader';
import MobileMenu from './MobileMenu';
import MobileActionButton from './MobileActionButton';
import LoadingState from './LoadingState';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { currentUser, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  // If no auth, redirect to auth pages
  React.useEffect(() => {
    if (!isLoading && !currentUser && !location.pathname.startsWith('/auth')) {
      navigate('/auth/login');
    }
  }, [currentUser, isLoading, location.pathname, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Check if we're on auth pages
  if (location.pathname.startsWith('/auth')) {
    return <>{children}</>;
  }

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <DesktopSidebar currentUser={currentUser} handleLogout={handleLogout} />
      
      {/* Mobile Header & Content */}
      <div className="flex flex-col flex-1">
        {/* Mobile Header */}
        <MobileHeader 
          currentUser={currentUser} 
          onMenuToggle={() => setMobileMenuOpen(true)} 
        />
        
        {/* Main Content */}
        <main className="flex-1">
          <div className="max-w-5xl mx-auto py-4 px-3 sm:px-4 md:py-5">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile Menu */}
      {isMobile && (
        <MobileMenu 
          isOpen={mobileMenuOpen} 
          onOpenChange={setMobileMenuOpen}
          currentUser={currentUser}
          handleLogout={handleLogout}
        />
      )}
      
      {/* Mobile Action Button - Floating */}
      <MobileActionButton />
    </div>
  );
};

export default MainLayout;
