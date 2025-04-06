
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { User as AppUser, UserRole } from '@/types';

interface AuthContextType {
  currentUser: AppUser | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<AppUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Set up auth state change listener and fetch initial session
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          fetchUserProfile(newSession.user.id);
        } else {
          setCurrentUser(null);
        }
      }
    );

    // THEN check for existing session
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        
        if (initialSession?.user) {
          await fetchUserProfile(initialSession.user.id);
        }
      } catch (error) {
        console.error("Error during auth initialization:", error);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Fetch user from profiles table (instead of trying to access the auth.users table directly)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }

      if (data) {
        const userProfile: AppUser = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role as UserRole,
          profileImage: data.profile_image || undefined,
          coverImage: data.cover_image || undefined,
          bio: data.bio || undefined,
          location: data.location || undefined,
          interests: data.interests || [],
          following: data.following || [],
          followers: data.followers || 0,
          verified: data.verified || false,
          socialLinks: data.social_links as any || undefined,
          createdAt: new Date(data.created_at),
        };
        
        setCurrentUser(userProfile);
      }
    } catch (err) {
      console.error("Error in fetchUserProfile:", err);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
      
      // We don't need to setCurrentUser here since the onAuthStateChange handler will do that
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      setLoading(true);
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });
      
      if (authError) {
        throw authError;
      }
      
      // The profile will be created by the database trigger
      // We don't need to manually create it
      
      // onAuthStateChange will update the current user
    } catch (error: any) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setCurrentUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<AppUser>) => {
    try {
      if (!currentUser) {
        throw new Error("No authenticated user");
      }
      
      setLoading(true);
      
      // Convert from AppUser structure to database structure
      const profileUpdates: any = {};
      
      if (updates.name) profileUpdates.name = updates.name;
      if (updates.profileImage) profileUpdates.profile_image = updates.profileImage;
      if (updates.coverImage) profileUpdates.cover_image = updates.coverImage;
      if (updates.bio) profileUpdates.bio = updates.bio;
      if (updates.location) profileUpdates.location = updates.location;
      if (updates.interests) profileUpdates.interests = updates.interests;
      if (updates.socialLinks) profileUpdates.social_links = updates.socialLinks;
      
      // Update the profile in the database
      const { error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', currentUser.id);
      
      if (error) {
        throw error;
      }
      
      // Update the current user state
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    currentUser,
    session,
    loading,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
