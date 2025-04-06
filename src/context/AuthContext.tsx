import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  currentUser: User | null;
  session: any | null;
  isLoading: boolean;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);

        if (session) {
          await fetchCurrentUser(session.user.id);
        }
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session) {
        await fetchCurrentUser(session.user.id);
      } else {
        setCurrentUser(null);
      }
    });
  }, []);

  const fetchCurrentUser = async (userId: string) => {
    try {
      setIsLoading(true);
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      if (user) {
        setCurrentUser({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          coverImage: user.coverImage,
          bio: user.bio,
          location: user.location,
          interests: user.interests,
          following: user.following,
          followers: user.followers,
          verified: user.verified,
          socialLinks: user.socialLinks,
          createdAt: new Date(user.createdAt)
        });
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            profileImage: `https://ui-avatars.com/api/?name=${name}&background=random`,
            createdAt: new Date().toISOString(),
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            name,
            email,
            role,
            profileImage: `https://ui-avatars.com/api/?name=${name}&background=random`,
            createdAt: new Date().toISOString(),
          });

        if (userError) {
          throw userError;
        }
        
        toast({
          title: "Account created",
          description: "Your account has been created successfully. Please check your email to verify your account.",
        });
      }
    } catch (error: any) {
      console.error("Error signing up:", error);
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        await fetchCurrentUser(data.user.id);
        
        toast({
          title: "Signed in",
          description: "You have been signed in successfully.",
        });
      }
    } catch (error: any) {
      console.error("Error signing in:", error);
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setSession(null);
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!currentUser) throw new Error('No current user');

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', currentUser.id);

      if (error) {
        throw error;
      }

      setCurrentUser({ ...currentUser, ...updates });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteAccount = async () => {
    if (!currentUser) throw new Error('No current user');
    
    try {
      setIsLoading(true);
      
      // 1. Delete the user from the auth system
      const { error: authError } = await supabase.auth.admin.deleteUser(currentUser.id);
      
      if (authError) {
        throw authError;
      }
      
      // 2. Optionally, delete the user data from the public.users table
      const { error: dbError } = await supabase
        .from('users')
        .delete()
        .eq('id', currentUser.id);
        
      if (dbError) {
        throw dbError;
      }
      
      // 3. Clear the local user state
      setCurrentUser(null);
      setSession(null);
      
      toast({
        title: "Account deleted",
        description: "Your account has been successfully deleted.",
      });
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    currentUser,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
    updateUser,
    deleteAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
