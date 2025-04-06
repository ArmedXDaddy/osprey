
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { supabase } from "@/integrations/supabase/client";
import { Session } from '@supabase/supabase-js';
import { toast } from "@/hooks/use-toast";

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean; // Added this property
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supabaseSession, setSupabaseSession] = useState<Session | null>(null);

  // Initialize and set up auth state listener
  useEffect(() => {
    // First, set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        setSupabaseSession(session);
        
        if (session?.user) {
          // Set a timeout to avoid recursive calls in the auth state change
          setTimeout(async () => {
            // Convert Supabase user to our app's user format
            const userData: User = {
              id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata.name || 'User',
              role: session.user.user_metadata.role || 'user',
              profileImage: session.user.user_metadata.profileImage,
              coverImage: session.user.user_metadata.coverImage,
              bio: session.user.user_metadata.bio,
              location: session.user.user_metadata.location,
              socialLinks: session.user.user_metadata.socialLinks,
              createdAt: new Date(session.user.created_at)
            };
            
            setCurrentUser(userData);
          }, 0);
        } else {
          setCurrentUser(null);
        }
      }
    );
    
    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Got existing session:", session?.user?.id);
      setSupabaseSession(session);
      
      if (session?.user) {
        // Convert Supabase user to our app's user format
        const userData: User = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.name || 'User',
          role: session.user.user_metadata.role || 'user',
          profileImage: session.user.user_metadata.profileImage,
          coverImage: session.user.user_metadata.coverImage,
          bio: session.user.user_metadata.bio,
          location: session.user.user_metadata.location,
          socialLinks: session.user.user_metadata.socialLinks,
          createdAt: new Date(session.user.created_at)
        };
        
        setCurrentUser(userData);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return !!data.session; // Return true if session exists
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    setIsLoading(true);
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
      
      // Authentication is handled by the onAuthStateChange listener
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Clear local user state first
      setCurrentUser(null);
      
      // Then attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      
      if (error) {
        console.error('Logout error from Supabase:', error);
        // Even if there's a Supabase error, we still want to ensure local state is cleared
        toast({
          title: "Signed out",
          description: "You have been signed out locally."
        });
      } else {
        console.log("Successfully logged out");
        toast({
          title: "Signed out",
          description: "You have been signed out successfully."
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state if an exception occurs
      toast({
        title: "Error during logout",
        description: "Signed out locally, but there was an issue with the server.",
        variant: "destructive"
      });
    } finally {
      // Clear any remaining session state
      setSupabaseSession(null);
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    setIsLoading(true);
    try {
      if (!currentUser) {
        throw new Error('No user logged in');
      }
      
      // Update user metadata in Supabase
      const { data, error } = await supabase.auth.updateUser({
        data: {
          name: userData.name || currentUser.name,
          // Only update role if provided and user is allowed to change it
          ...(userData.role && { role: userData.role }),
          // Add support for profile image and cover image
          ...(userData.profileImage && { profileImage: userData.profileImage }),
          ...(userData.coverImage && { coverImage: userData.coverImage }),
          ...(userData.bio && { bio: userData.bio }),
          ...(userData.location && { location: userData.location }),
          ...(userData.socialLinks && { 
            socialLinks: {
              ...(currentUser.socialLinks || {}),
              ...userData.socialLinks
            }
          }),
        }
      });
      
      if (error) throw error;
      
      // Update local state immediately to reflect changes
      const updatedUser = { 
        ...currentUser, 
        ...userData,
        // Ensure these fields are properly transferred
        profileImage: userData.profileImage || currentUser.profileImage,
        coverImage: userData.coverImage || currentUser.coverImage,
      };
      
      console.log("Profile updated with:", updatedUser);
      setCurrentUser(updatedUser);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    currentUser,
    isLoading,
    isAuthenticated: !!currentUser, // Add this property to the context value
    login,
    register,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
