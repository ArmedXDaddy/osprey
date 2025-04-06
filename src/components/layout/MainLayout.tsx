
import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoonIcon, SunIcon, HomeIcon, UsersIcon, CalendarIcon, BookOpenIcon, SettingsIcon, MessageSquareIcon, UserIcon, LogOutIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const MainLayout = () => {
  const { currentUser, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Error',
        description: 'Failed to log out',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">CommunityHub</Link>
          
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOutIcon className="h-4 w-4 mr-2" />
                  Logout
                </Button>
                
                <Link to="/profile">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.profileImage} />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Link>
              </>
            ) : (
              <Link to="/login">
                <Button>Login</Button>
              </Link>
            )}
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex">
        <aside className="hidden md:block w-64 border-r p-4">
          <nav className="space-y-2">
            <Link to="/" className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100">
              <HomeIcon className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link to="/explore" className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100">
              <BookOpenIcon className="h-5 w-5" />
              <span>Explore</span>
            </Link>
            <Link to="/events" className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100">
              <CalendarIcon className="h-5 w-5" />
              <span>Events</span>
            </Link>
            <Link to="/groups" className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100">
              <UsersIcon className="h-5 w-5" />
              <span>Groups</span>
            </Link>
            <Link to="/services" className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100">
              <MessageSquareIcon className="h-5 w-5" />
              <span>Services</span>
            </Link>
            <Link to="/profile" className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100">
              <UserIcon className="h-5 w-5" />
              <span>Profile</span>
            </Link>
            <Link to="/settings" className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100">
              <SettingsIcon className="h-5 w-5" />
              <span>Settings</span>
            </Link>
          </nav>
        </aside>
        
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
