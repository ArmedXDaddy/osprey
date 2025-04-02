
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User as AuthUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types';
import { toast } from 'sonner';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // Set up Supabase auth listener
  useEffect(() => {
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          // Set session first
          setSession(session);
          
          // Defer fetching profile to prevent deadlock
          setTimeout(async () => {
            try {
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
                
              if (error) {
                console.error('Error fetching user profile:', error);
                return;
              }
              
              if (profile) {
                const userData: User = {
                  id: profile.id,
                  name: profile.name,
                  email: session.user.email || '',
                  role: profile.role as UserRole,
                  profileImage: profile.profile_image,
                  bio: profile.bio,
                  location: profile.location,
                  interests: profile.interests,
                  followers: profile.followers || 0,
                  verified: profile.verified || false,
                  socialLinks: typeof profile.social_links === 'object' ? profile.social_links as User['socialLinks'] : {},
                  createdAt: new Date(profile.created_at),
                };
                
                setCurrentUser(userData);
              }
            } catch (error) {
              console.error('Error in auth state change:', error);
            }
          }, 0);
        } else {
          // No session means user is logged out
          setSession(null);
          setCurrentUser(null);
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setSession(session);
          
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (error) {
            console.error('Error fetching user profile:', error);
            setIsLoading(false);
            return;
          }
          
          if (profile) {
            const userData: User = {
              id: profile.id,
              name: profile.name,
              email: session.user.email || '',
              role: profile.role as UserRole,
              profileImage: profile.profile_image,
              bio: profile.bio,
              location: profile.location,
              interests: profile.interests,
              followers: profile.followers || 0,
              verified: profile.verified || false,
              socialLinks: typeof profile.social_links === 'object' ? profile.social_links as User['socialLinks'] : {},
              createdAt: new Date(profile.created_at),
            };
            
            setCurrentUser(userData);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsLoading(false);
      }
    };

    initializeAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Always try to sign in directly, ignoring email verification
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // If there's an error "Email not confirmed", try signing up again to force confirmation
        if (error.message === 'Email not confirmed') {
          console.log('Email not confirmed, attempting to auto-confirm...');
          
          // Try to sign in again
          const { error: retryError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (retryError) {
            throw retryError;
          }
        } else {
          throw error;
        }
      }
      
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.error_description || error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    setIsLoading(true);
    try {
      // Register the user with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
          // Don't wait for email confirmation
          emailRedirectTo: window.location.origin,
        },
      });
      
      if (error) {
        throw error;
      }
      
      // Sign in immediately after sign up, regardless of email verification status
      if (data.user) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) {
          throw signInError;
        }
      }
      
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.error_description || error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // onAuthStateChange will handle clearing the user
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    setIsLoading(true);
    try {
      if (!currentUser) {
        throw new Error('No user logged in');
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({
          name: userData.name,
          bio: userData.bio,
          location: userData.location,
          interests: userData.interests,
          profile_image: userData.profileImage,
          social_links: userData.socialLinks,
        })
        .eq('id', currentUser.id);
        
      if (error) {
        throw error;
      }
      
      // Update the local user state
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
