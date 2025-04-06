
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

interface AuthContextProps {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean; // Add this property
  updateProfile?: (userData: Partial<User>) => Promise<void>; // Add this property
}

const AuthContext = createContext<AuthContextProps>({
  currentUser: null,
  setCurrentUser: () => {},
  loading: true,
  isLoading: true, // Initialize the property
  login: async () => false,
  register: async () => {},
  logout: async () => {},
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };
  
  const register = async (email: string, password: string, name: string, role: string) => {
    try {
      // Fix: Add password to the signup call
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { 
          emailRedirectTo: `${window.location.origin}/profile`,
          data: {
            name,
            role
          }
        } 
      });
      if (error) throw error;
      alert('Check your email to confirm your registration!');
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };
  
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setCurrentUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  // Add updateProfile function
  const updateProfile = async (userData: Partial<User>) => {
    try {
      if (!currentUser) throw new Error("No user logged in");
      
      const { error } = await supabase
        .from('profiles')
        .update({
          name: userData.name,
          bio: userData.bio,
          location: userData.location,
          profile_image: userData.profileImage,
          // No cover_image in the profiles table
          interests: userData.interests,
          social_links: userData.socialLinks ? JSON.stringify(userData.socialLinks) : null,
        })
        .eq('id', currentUser.id);
        
      if (error) throw error;
      
      // Update local user state
      setCurrentUser(prev => prev ? { ...prev, ...userData } : null);
      
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        setLoading(true);
        setIsLoading(true);
        const { data: sessionData, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (sessionData?.session) {
          // User is authenticated
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sessionData.session.user.id)
            .single();
            
          if (userError) {
            throw userError;
          }
          
          if (userData) {
            // Fix: Parse social_links properly or default to an empty object
            let socialLinks = { instagram: null, twitter: null, website: null };
            
            if (userData.social_links) {
              try {
                // If it's already an object, use it, otherwise try to parse it
                if (typeof userData.social_links === 'object' && !Array.isArray(userData.social_links)) {
                  socialLinks = {
                    instagram: userData.social_links.instagram || null,
                    twitter: userData.social_links.twitter || null,
                    website: userData.social_links.website || null
                  };
                } else if (typeof userData.social_links === 'string') {
                  const parsed = JSON.parse(userData.social_links);
                  socialLinks = {
                    instagram: parsed.instagram || null,
                    twitter: parsed.twitter || null,
                    website: parsed.website || null
                  };
                }
              } catch (e) {
                console.error('Error parsing social links:', e);
              }
            }
            
            setCurrentUser({
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role as any, // Fix: Cast to UserRole
              profileImage: userData.profile_image,
              coverImage: null, // Fix: No cover_image in profiles table
              bio: userData.bio,
              location: userData.location,
              interests: userData.interests,
              following: userData.following,
              followers: userData.followers,
              verified: userData.verified,
              socialLinks,
              createdAt: new Date(userData.created_at)
            });
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };
    
    checkSession().catch(error => {
      console.error("Failed to check session:", error);
      setLoading(false);
      setIsLoading(false);
    });
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // User signed in
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (userError) {
            console.error('Error fetching user data:', userError);
            return;
          }
          
          if (userData) {
            // Fix: Parse social_links properly or default to an empty object
            let socialLinks = { instagram: null, twitter: null, website: null };
            
            if (userData.social_links) {
              try {
                // If it's already an object, use it, otherwise try to parse it
                if (typeof userData.social_links === 'object' && !Array.isArray(userData.social_links)) {
                  socialLinks = {
                    instagram: userData.social_links.instagram || null,
                    twitter: userData.social_links.twitter || null,
                    website: userData.social_links.website || null
                  };
                } else if (typeof userData.social_links === 'string') {
                  const parsed = JSON.parse(userData.social_links);
                  socialLinks = {
                    instagram: parsed.instagram || null,
                    twitter: parsed.twitter || null,
                    website: parsed.website || null
                  };
                }
              } catch (e) {
                console.error('Error parsing social links:', e);
              }
            }
            
            setCurrentUser({
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role as any, // Fix: Cast to UserRole
              profileImage: userData.profile_image,
              coverImage: null, // Fix: No cover_image in profiles table
              bio: userData.bio,
              location: userData.location,
              interests: userData.interests,
              following: userData.following,
              followers: userData.followers,
              verified: userData.verified,
              socialLinks,
              createdAt: new Date(userData.created_at)
            });
          }
        } else if (event === 'SIGNED_OUT') {
          // User signed out
          setCurrentUser(null);
        }
      }
    );
    
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const value: AuthContextProps = {
    currentUser,
    setCurrentUser,
    loading,
    isLoading,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
