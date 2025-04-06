import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, UserRole } from '@/types';
import { AuthError, Session } from '@supabase/supabase-js';

type AuthCredentials = {
  email: string;
  password: string;
  confirmPassword?: string;
  name?: string;
  role?: UserRole;
};

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: AuthCredentials) => Promise<{ success: boolean; error: string | null }>;
  register: (credentials: AuthCredentials) => Promise<{ success: boolean; error: string | null }>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<{ success: boolean; error: string | null }>;
  deleteAccount: () => Promise<{ success: boolean; error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (credentials: AuthCredentials) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      return { success: true, error: null };
    } catch (error: any) {
      console.error("Login error:", error);
      return { success: false, error: error.message || "Failed to login" };
    }
  };

  const register = async (credentials: AuthCredentials) => {
    if (credentials.password !== credentials.confirmPassword) {
      return { success: false, error: "Passwords do not match" };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name,
            role: credentials.role || 'user'
          }
        }
      });

      if (error) throw error;

      return { success: true, error: null };
    } catch (error: any) {
      console.error("Registration error:", error);
      return { success: false, error: error.message || "Failed to register" };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setIsAuthenticated(false);
    } catch (error: any) {
      console.error("Logout error:", error);
      return Promise.reject(error);
    }
  };

  const updateProfile = async (profile: Partial<UserProfile>): Promise<{ success: boolean; error: string | null }> => {
    if (!currentUser) {
      throw new Error("No user is currently logged in");
    }

    try {
      const dbUpdates: any = {};
      
      if (profile.name) dbUpdates.name = profile.name;
      if (profile.bio) dbUpdates.bio = profile.bio;
      if (profile.location) dbUpdates.location = profile.location;
      if (profile.profileImage) dbUpdates.profile_image = profile.profileImage;
      if (profile.socialLinks) dbUpdates.social_links = profile.socialLinks;

      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', currentUser.id);

      if (error) throw error;

      setCurrentUser(prev => prev ? { ...prev, ...profile } : null);
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error("Error updating profile:", error.message);
      return { success: false, error: "Failed to update profile" };
    }
  };

  const deleteAccount = async (): Promise<{ success: boolean; error: string | null }> => {
    try {
      await supabase.auth.deleteUser();
      setCurrentUser(null);
      setIsAuthenticated(false);
      return { success: true, error: null };
    } catch (error: any) {
      console.error("Error deleting account:", error);
      return { success: false, error: "Failed to delete account" };
    }
  };

  const contextValue: AuthContextType = {
    currentUser,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
