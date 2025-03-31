
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Calendar, 
  Users, 
  Bell, 
  PlusCircle, 
  LogOut, 
  Settings,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import RoleBasedActionButton from '@/components/shared/RoleBasedActionButton';
import { Skeleton } from '@/components/ui/skeleton';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { currentUser, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md p-4">
          <Skeleton className="h-12 w-full rounded-full" />
          <Skeleton className="h-[80vh] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Top Nav */}
      <div className="md:hidden bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold gradient-text">Osprey</h1>
        <div className="flex gap-3 items-center">
          <Bell className="h-5 w-5 text-gray-600" />
          {currentUser && (
            <img 
              src={currentUser.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random`} 
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
        </div>
      </div>
      
      {/* Sidebar - desktop */}
      <div className="hidden md:flex flex-col justify-between w-64 bg-white h-screen border-r border-gray-200 px-4 py-6 sticky top-0">
        <div>
          <h1 className="text-2xl font-bold mb-10 gradient-text">Osprey</h1>
          
          <nav className="space-y-1">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </NavLink>
            
            <NavLink 
              to="/explore" 
              className={({ isActive }) => 
                `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Search className="h-5 w-5" />
              <span>Explore</span>
            </NavLink>
            
            <NavLink 
              to="/events" 
              className={({ isActive }) => 
                `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Calendar className="h-5 w-5" />
              <span>Events</span>
            </NavLink>
            
            <NavLink 
              to="/groups" 
              className={({ isActive }) => 
                `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Users className="h-5 w-5" />
              <span>Groups</span>
            </NavLink>
            
            {currentUser?.role === 'admin' && (
              <NavLink 
                to="/admin" 
                className={({ isActive }) => 
                  `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <Settings className="h-5 w-5" />
                <span>Admin</span>
              </NavLink>
            )}

            <NavLink 
              to="/profile" 
              className={({ isActive }) => 
                `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <User className="h-5 w-5" />
              <span>Profile</span>
            </NavLink>
          </nav>
          
          <div className="mt-6">
            <RoleBasedActionButton />
          </div>
        </div>
        
        <div className="space-y-4">
          {currentUser && (
            <div className="flex items-center gap-3 p-2">
              <img 
                src={currentUser.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random`} 
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{currentUser.name}</p>
                <p className="text-xs text-gray-500 truncate capitalize">{currentUser.role}</p>
              </div>
            </div>
          )}
          
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2" 
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto py-4 px-4 sm:px-6 md:py-6">
          {children}
        </div>
      </main>
      
      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around items-center p-3 z-10">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-gray-600'}`
          }
        >
          <Home className="h-5 w-5" />
          <span className="text-xs">Home</span>
        </NavLink>
        
        <NavLink 
          to="/explore" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-gray-600'}`
          }
        >
          <Search className="h-5 w-5" />
          <span className="text-xs">Explore</span>
        </NavLink>
        
        <div className="-mt-10 bg-gradient-to-r from-primary to-accent rounded-full p-3 shadow-lg">
          <PlusCircle className="h-6 w-6 text-white" />
        </div>
        
        <NavLink 
          to="/events" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-gray-600'}`
          }
        >
          <Calendar className="h-5 w-5" />
          <span className="text-xs">Events</span>
        </NavLink>
        
        <NavLink 
          to="/profile" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-gray-600'}`
          }
        >
          <User className="h-5 w-5" />
          <span className="text-xs">Profile</span>
        </NavLink>
      </div>
    </div>
  );
};

export default MainLayout;
