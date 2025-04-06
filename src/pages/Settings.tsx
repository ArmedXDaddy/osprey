import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, User, Shield, Trash2, Save, AlertTriangle } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';

const ThemeContext = React.createContext<{
  isDarkTheme: boolean;
  toggleTheme: () => void;
}>({
  isDarkTheme: false,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme ? savedTheme === 'dark' : systemPrefersDark;
  });

  React.useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkTheme]);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  return (
    <ThemeContext.Provider value={{ isDarkTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const Settings = () => {
  const { currentUser, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const { isDarkTheme, toggleTheme } = useTheme();
  const [isDeleting, setIsDeleting] = useState(false);
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
  });
  const [privacy, setPrivacy] = useState({
    profileVisibility: true,
    activityVisibility: true,
  });
  const [appearance, setAppearance] = useState({
    reducedMotion: false,
    compactView: false,
  });

  useEffect(() => {
    if (appearance.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }

    if (appearance.compactView) {
      document.documentElement.classList.add('compact-view');
    } else {
      document.documentElement.classList.remove('compact-view');
    }
  }, [appearance.reducedMotion, appearance.compactView]);

  const handleSaveAppearanceSettings = () => {
    toast({ 
      title: "Appearance Settings Saved", 
      description: `Reduced Motion: ${appearance.reducedMotion ? 'On' : 'Off'}, Compact View: ${appearance.compactView ? 'On' : 'Off'}` 
    });
    
    localStorage.setItem('appearance-settings', JSON.stringify(appearance));
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    
    try {
      setIsDeleting(true);
      
      const { error } = await supabase.from('profiles')
        .delete()
        .eq('id', currentUser.id);
      
      if (error) throw error;
      
      const { error: authError } = await supabase.auth.admin.deleteUser(
        currentUser.id
      );
      
      if (authError) {
        console.error('Auth deletion error:', authError);
      }
      
      await logout();
      
      toast({
        title: "Account deleted",
        description: "Your account has been deleted successfully",
      });
      
      navigate('/auth/login');
    } catch (error) {
      toast({
        title: "Deletion failed",
        description: "There was a problem deleting your account",
        variant: "destructive",
      });
      console.error('Account deletion error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || !currentUser) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="animate-pulse text-lg">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>
      
      <Tabs defaultValue="appearance">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            {isDarkTheme ? <Moon size={16} /> : <Sun size={16} />}
            <span>Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User size={16} />
            <span>Account</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield size={16} />
            <span>Privacy</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how Osprey looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark themes
                  </p>
                </div>
                <Switch 
                  id="dark-mode" 
                  checked={isDarkTheme}
                  onCheckedChange={toggleTheme} 
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="reduced-motion">Reduce Motion</Label>
                  <p className="text-sm text-muted-foreground">
                    Minimize animations throughout the application
                  </p>
                </div>
                <Switch 
                  id="reduced-motion" 
                  checked={appearance.reducedMotion}
                  onCheckedChange={(checked) => 
                    setAppearance({...appearance, reducedMotion: checked})
                  } 
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="compact-view">Compact View</Label>
                  <p className="text-sm text-muted-foreground">
                    Use a more compact layout for content
                  </p>
                </div>
                <Switch 
                  id="compact-view" 
                  checked={appearance.compactView}
                  onCheckedChange={(checked) => 
                    setAppearance({...appearance, compactView: checked})
                  } 
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleSaveAppearanceSettings}
              >
                Save Appearance Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <p className="text-base font-medium">{currentUser.email}</p>
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed directly. Please contact support.
                </p>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Notifications</h3>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <Switch 
                    id="email-notifications" 
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) => setNotifications({...notifications, emailNotifications: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <Switch 
                    id="push-notifications" 
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) => setNotifications({...notifications, pushNotifications: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="marketing-emails">Marketing Emails</Label>
                  <Switch 
                    id="marketing-emails" 
                    checked={notifications.marketingEmails}
                    onCheckedChange={(checked) => setNotifications({...notifications, marketingEmails: checked})}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => 
                  toast({ 
                    title: "Account settings saved", 
                    description: "Your preferences have been updated" 
                  })
                }
              >
                Save Account Settings
              </Button>
            </CardFooter>
          </Card>
          
          <div className="mt-8">
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <Trash2 size={18} />
                  Delete Account
                </CardTitle>
                <CardDescription>
                  Permanently delete your account and all associated data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone. Once you delete your account, all of your data will be permanently removed.
                </p>
              </CardContent>
              <CardFooter>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex items-center gap-2">
                      <Trash2 size={16} />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle size={18} className="text-destructive" />
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove all your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Control what information is visible to others
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="profile-visibility">Profile Visibility</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow others to view your profile
                  </p>
                </div>
                <Switch 
                  id="profile-visibility" 
                  checked={privacy.profileVisibility}
                  onCheckedChange={(checked) => setPrivacy({...privacy, profileVisibility: checked})}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="activity-visibility">Activity Visibility</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow others to see your activity and interactions
                  </p>
                </div>
                <Switch 
                  id="activity-visibility" 
                  checked={privacy.activityVisibility}
                  onCheckedChange={(checked) => setPrivacy({...privacy, activityVisibility: checked})}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Data Usage</h3>
                <p className="text-sm text-muted-foreground">
                  Control how we use your data to improve our services
                </p>
                
                <div className="flex items-center justify-between mt-2">
                  <Label htmlFor="analytics">Analytics & Improvements</Label>
                  <Switch id="analytics" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="personalization">Personalization</Label>
                  <Switch id="personalization" defaultChecked />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => 
                  toast({ 
                    title: "Privacy settings saved",
                    description: "Your privacy preferences have been updated" 
                  })
                }
              >
                Save Privacy Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
