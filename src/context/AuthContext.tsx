
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, AuthError, Session } from '@supabase/supabase-js';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapSupabaseUser = (supaUser: SupabaseUser | null, profileData?: any): User | null => {
  if (!supaUser) return null;
  
  return {
    id: supaUser.id,
    name: profileData?.name || supaUser.user_metadata.name || 'User',
    email: supaUser.email || '',
    role: profileData?.role || supaUser.user_metadata.role || 'user',
    profileImage: profileData?.profile_image || supaUser.user_metadata.avatar_url,
    bio: profileData?.bio,
    location: profileData?.location,
    interests: profileData?.interests || [],
    followers: profileData?.followers || 0,
    verified: profileData?.verified || false,
    socialLinks: profileData?.social_links || null,
    createdAt: profileData?.created_at ? new Date(profileData.created_at) : new Date()
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // Initialize and set up auth state listener
  useEffect(() => {
    setIsLoading(true);
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Fetch the user's profile data
          setTimeout(async () => {
            try {
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (error) throw error;
              setCurrentUser(mapSupabaseUser(session.user, profile));
            } catch (error) {
              console.error("Error fetching user profile", error);
              setCurrentUser(mapSupabaseUser(session.user));
            }
            setIsLoading(false);
          }, 0);
        } else {
          setCurrentUser(null);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error("Error fetching user profile", error);
              setCurrentUser(mapSupabaseUser(session.user));
            } else {
              setCurrentUser(mapSupabaseUser(session.user, data));
            }
            setIsLoading(false);
          });
      } else {
        setCurrentUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Auth state listener will update the current user
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
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
      // Auth state listener will update the current user
    } catch (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    setIsLoading(true);
    try {
      if (!currentUser?.id) {
        throw new Error('No user logged in');
      }

      // Update the profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          name: userData.name,
          bio: userData.bio,
          location: userData.location,
          interests: userData.interests,
          profile_image: userData.profileImage,
          social_links: userData.socialLinks
        })
        .eq('id', currentUser.id);

      if (error) throw error;
      
      // Update the current user
      setCurrentUser({ ...currentUser, ...userData });
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
