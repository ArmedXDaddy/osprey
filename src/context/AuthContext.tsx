
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  session: Session | null;
  currentUser: UserProfile | null;
  signUp: (email: string, password: string, userData: { name: string; role: UserRole }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  userLoading: boolean;
  updateCurrentUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  getProfileByUserId: (userId: string) => Promise<UserProfile | null>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userLoading, setUserLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUserLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setCurrentUser(null);
        setUserLoading(false);
      }
    });

    setLoading(false);
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchUserProfile(userId: string) {
    setUserLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const userProfile: UserProfile = {
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role as UserRole,
          profileImage: data.profile_image,
          bio: data.bio,
          location: data.location,
          interests: data.interests || [],
          socialLinks: data.social_links,
          followers: data.followers || 0,
          following: data.following || [],
          verified: data.verified || false,
          createdAt: new Date(data.created_at),
          coverImage: data.cover_image
        };
        setCurrentUser(userProfile);
      }
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user profile",
        variant: "destructive",
      });
    } finally {
      setUserLoading(false);
    }
  }

  async function getProfileByUserId(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        return {
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role as UserRole,
          profileImage: data.profile_image,
          bio: data.bio,
          location: data.location,
          interests: data.interests || [],
          socialLinks: data.social_links,
          followers: data.followers || 0,
          following: data.following || [],
          verified: data.verified || false,
          createdAt: new Date(data.created_at),
          coverImage: data.cover_image
        };
      }
      return null;
    } catch (error: any) {
      console.error('Error fetching user profile by ID:', error);
      return null;
    }
  }

  async function signUp(email: string, password: string, userData: { name: string; role: UserRole }) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role,
          }
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account.",
      });
      
      return;
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
      throw error;
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
      throw error;
    }
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setCurrentUser(null);
      toast({
        title: "Signed out successfully",
      });
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: "Sign out failed",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
      throw error;
    }
  }

  async function updateCurrentUserProfile(updates: Partial<UserProfile>) {
    if (!currentUser?.id) {
      throw new Error('No current user to update');
    }

    try {
      const updateData: any = {};
      
      if (updates.name) updateData.name = updates.name;
      if (updates.bio !== undefined) updateData.bio = updates.bio;
      if (updates.location !== undefined) updateData.location = updates.location;
      if (updates.interests !== undefined) updateData.interests = updates.interests;
      if (updates.profileImage !== undefined) updateData.profile_image = updates.profileImage;
      if (updates.socialLinks !== undefined) updateData.social_links = updates.socialLinks;
      if (updates.coverImage !== undefined) updateData.cover_image = updates.coverImage;

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', currentUser.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setCurrentUser({
          ...currentUser,
          ...updates,
        });

        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully",
        });
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
      throw error;
    }
  }

  const isLoading = loading || userLoading;

  const value = {
    session,
    currentUser,
    signUp,
    signIn,
    signOut,
    loading,
    userLoading,
    updateCurrentUserProfile,
    getProfileByUserId,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
