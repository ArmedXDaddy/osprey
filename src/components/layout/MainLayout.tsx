
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
  User,
  Menu,
  X,
  NetworkIcon,
  Briefcase,
  DollarSign,
  GraduationCap,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import RoleBasedActionButton from '@/components/shared/RoleBasedActionButton';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/components/ui/use-toast';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { currentUser, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  
  React.useEffect(() => {
    if (!isLoading && !currentUser && !location.pathname.startsWith('/auth')) {
      navigate('/auth/login');
    }
  }, [currentUser, isLoading, location.pathname, navigate]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still redirect to login page even if there was an error
      navigate('/auth/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (location.pathname.startsWith('/auth')) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md p-4">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-[80vh] w-full rounded-lg" />
        </div>
      </div>
    );
  }

  const isCompany = currentUser?.role === 'company';

  const NavigationLink = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
    <NavLink 
      to={to} 
      onClick={() => isMobile && setMobileMenuOpen(false)}
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

  const MobileMenu = () => (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetContent side="left" className="w-[75%] sm:w-[350px] p-0">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold gradient-text">Osprey</h2>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
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
              <NavigationLink to="/" icon={<Home size={18} />} label="Home" />
              <NavigationLink to="/explore" icon={<Search size={18} />} label="Explore" />
              <NavigationLink to="/networking" icon={<NetworkIcon size={18} />} label="Networking" />
              <NavigationLink to="/events" icon={<Calendar size={18} />} label="Events" />
              <NavigationLink to="/groups" icon={<Users size={18} />} label="Groups" />
              <NavigationLink to="/services" icon={<DollarSign size={18} />} label="Services" />
              
              {isCompany && (
                <>
                  <NavigationLink to="/company/jobs" icon={<Briefcase size={18} />} label="Job Postings" />
                  <NavigationLink to="/company/products" icon={<DollarSign size={18} />} label="Products" />
                  <NavigationLink to="/company/workshops" icon={<GraduationCap size={18} />} label="Workshops" />
                </>
              )}
              
              <NavigationLink to="/profile" icon={<User size={18} />} label="Profile" />
              {currentUser?.role === 'admin' && (
                <NavigationLink to="/admin" icon={<Settings size={18} />} label="Admin" />
              )}
            </nav>
            
            <div className="mt-6">
              <RoleBasedActionButton />
            </div>
          </div>
          
          <div className="p-4 border-t">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2" 
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut size={16} />
              <span>{isLoggingOut ? 'Signing out...' : 'Logout'}</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="hidden md:flex flex-col w-56 bg-white border-r border-gray-100 h-screen sticky top-0 shrink-0">
        <div className="p-4 flex flex-col h-full">
          <h1 className="text-xl font-semibold mb-8 gradient-text">Osprey</h1>
          
          <nav className="space-y-1 flex-1">
            <NavigationLink to="/" icon={<Home size={18} />} label="Home" />
            <NavigationLink to="/explore" icon={<Search size={18} />} label="Explore" />
            <NavigationLink to="/networking" icon={<NetworkIcon size={18} />} label="Networking" />
            <NavigationLink to="/events" icon={<Calendar size={18} />} label="Events" />
            <NavigationLink to="/groups" icon={<Users size={18} />} label="Groups" />
            <NavigationLink to="/services" icon={<DollarSign size={18} />} label="Services" />
            
            {isCompany && (
              <>
                <NavigationLink to="/company/jobs" icon={<Briefcase size={18} />} label="Job Postings" />
                <NavigationLink to="/company/products" icon={<DollarSign size={18} />} label="Products" />
                <NavigationLink to="/company/workshops" icon={<GraduationCap size={18} />} label="Workshops" />
              </>
            )}
            
            <NavigationLink to="/profile" icon={<User size={18} />} label="Profile" />
            {currentUser?.role === 'admin' && (
              <NavigationLink to="/admin" icon={<Settings size={18} />} label="Admin" />
            )}
          </nav>
          
          <div className="mt-4">
            <RoleBasedActionButton />
          </div>
          
          <div className="mt-auto pt-4 border-t border-gray-100">
            {currentUser && (
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src={currentUser.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random`} 
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{currentUser.name}</p>
                  <p className="text-xs text-gray-500 truncate capitalize">{currentUser.role}</p>
                </div>
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              className="w-full justify-start gap-2" 
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut size={16} />
              <span className="text-sm">{isLoggingOut ? 'Signing out...' : 'Logout'}</span>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col flex-1">
        <header className="md:hidden bg-white border-b border-gray-100 p-3 sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
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
        
        <main className="flex-1">
          <div className="max-w-5xl mx-auto py-4 px-3 sm:px-4 md:py-5">
            {children}
          </div>
        </main>
      </div>
      
      {isMobile && <MobileMenu />}
      
      <div className="md:hidden fixed bottom-5 right-5 rounded-full shadow-lg z-10">
        <Button variant="default" size="icon" className="h-12 w-12 rounded-full bg-primary shadow-md">
          <PlusCircle size={20} />
        </Button>
      </div>
    </div>
  );
};

export default MainLayout;
