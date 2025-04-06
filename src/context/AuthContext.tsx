import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, UserCredentials } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  profileImage: string;
  bio: string;
  location: string;
  socialLinks: Record<string, string>;
  createdAt: Date;
}

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const setUserFromProfile = (profile: any): UserProfile => {
    console.log("Setting current user with data:", {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      profileImage: profile.profile_image,
      bio: profile.bio,
      location: profile.location,
      socialLinks: profile.social_links,
      createdAt: new Date(profile.created_at)
    });
    
    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      profileImage: profile.profile_image,
      bio: profile.bio,
      location: profile.location,
      socialLinks: profile.social_links || {},
      createdAt: new Date(profile.created_at)
    };
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        if (session?.user) {
          setTimeout(async () => {
            try {
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();
                
              console.log("Fetched profile data:", profileData);
              
              const userData = setUserFromProfile(profileData);
              
              setCurrentUser(userData);
              setIsAuthenticated(true);
            } catch (error) {
              console.error("Error fetching profile data:", error);
              
              const userData = setUserFromProfile({
                id: session.user.id,
                email: session.user.email!,
                name: session.user.user_metadata.name || 'User',
                role: session.user.user_metadata.role || 'user',
                profileImage: session.user.user_metadata.profileImage,
                coverImage: session.user.user_metadata.coverImage,
                bio: session.user.user_metadata.bio || '',
                location: session.user.user_metadata.location || '',
                socialLinks: session.user.user_metadata.socialLinks || {},
                createdAt: new Date(session.user.created_at)
              });
              
              setCurrentUser(userData);
            }
          }, 0);
        } else {
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      }
    );
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Got existing session:", session?.user?.id);
      
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle()
          .then(({ data: profileData, error: profileError }) => {
            console.log("Profile data on init:", profileData);
            
            const userData = setUserFromProfile(profileData);
            
            setCurrentUser(userData);
            setIsAuthenticated(true);
            setLoading(false);
            setIsLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching profile data on init:", error);
            
            const userData = setUserFromProfile({
              id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata.name || 'User',
              role: session.user.user_metadata.role || 'user',
              profileImage: session.user.user_metadata.profileImage,
              coverImage: session.user.user_metadata.coverImage,
              bio: session.user.user_metadata.bio || '',
              location: session.user.user_metadata.location || '',
              socialLinks: session.user.user_metadata.socialLinks || {},
              createdAt: new Date(session.user.created_at)
            });
            
            setCurrentUser(userData);
            setIsAuthenticated(false);
            setLoading(false);
            setIsLoading(false);
          });
      } else {
        setLoading(false);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return !!data.session;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });
      
      if (error) throw error;
      
      return !!data.session;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!currentUser) {
      throw new Error("No user is currently logged in");
    }

    try {
      setLoading(true);

      const dbUpdates: any = {};
      
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.bio) dbUpdates.bio = updates.bio;
      if (updates.location) dbUpdates.location = updates.location;
      if (updates.profileImage) dbUpdates.profile_image = updates.profileImage;
      if (updates.socialLinks) dbUpdates.social_links = updates.socialLinks;

      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', currentUser.id);

      if (error) throw error;

      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
      
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Error updating profile:", error.message);
      toast.error("Failed to update profile");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setCurrentUser(null);
      setIsAuthenticated(false);
      
      toast.success("Logged out successfully");
    } catch (error: any) {
      console.error("Error logging out:", error.message);
      toast.error("Failed to log out");
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    isLoading,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
