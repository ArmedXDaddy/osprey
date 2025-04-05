
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types';
import { Session } from '@supabase/supabase-js';
import { Json } from '@/integrations/supabase/types';

// Helper function to safely convert Json to a Record object
const jsonToRecord = (json: Json | null): Record<string, string> | undefined => {
  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    return undefined;
  }
  return json as Record<string, string>;
};

interface AuthContextType {
  currentUser: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  register: (email: string, password: string, userData: Partial<User>) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>; // alias for logout for backward compatibility
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => ({ error: null }),
  register: async () => ({ error: null }),
  logout: async () => {},
  signOut: async () => {}
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          setSession(currentSession);
          
          // Fetch user profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();
            
          if (profile) {
            // Properly handle social_links as a potential JSON object
            const socialLinksObj = jsonToRecord(profile.social_links);
            
            const user: User = {
              id: profile.id,
              name: profile.name,
              email: profile.email,
              role: profile.role as UserRole,
              profileImage: profile.profile_image,
              bio: profile.bio,
              location: profile.location,
              interests: profile.interests,
              following: profile.following,
              followers: profile.followers,
              verified: profile.verified,
              socialLinks: socialLinksObj ? {
                instagram: socialLinksObj.instagram,
                twitter: socialLinksObj.twitter,
                website: socialLinksObj.website
              } : undefined,
              createdAt: new Date(profile.created_at)
            };
            setCurrentUser(user);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        
        if (newSession) {
          try {
            // Fetch user profile data
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', newSession.user.id)
              .single();
              
            if (profile) {
              // Properly handle social_links as a potential JSON object
              const socialLinksObj = jsonToRecord(profile.social_links);
              
              const user: User = {
                id: profile.id,
                name: profile.name,
                email: profile.email,
                role: profile.role as UserRole,
                profileImage: profile.profile_image,
                bio: profile.bio,
                location: profile.location,
                interests: profile.interests,
                following: profile.following,
                followers: profile.followers,
                verified: profile.verified,
                socialLinks: socialLinksObj ? {
                  instagram: socialLinksObj.instagram,
                  twitter: socialLinksObj.twitter,
                  website: socialLinksObj.website
                } : undefined,
                createdAt: new Date(profile.created_at)
              };
              setCurrentUser(user);
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
          }
        } else {
          setCurrentUser(null);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      return { error };
    } catch (error) {
      console.error('Error during login:', error);
      return { error };
    }
  };
  
  const register = async (email: string, password: string, userData: Partial<User>) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role || 'user'
          }
        }
      });
      
      return { error };
    } catch (error) {
      console.error('Error during registration:', error);
      return { error };
    }
  };
  
  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setSession(null);
  };
  
  // Alias for logout for backward compatibility
  const signOut = logout;
  
  return (
    <AuthContext.Provider
      value={{
        currentUser,
        session,
        isLoading,
        isAuthenticated: !!currentUser,
        login,
        register,
        logout,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
