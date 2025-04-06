import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

interface AuthContextProps {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  loading: boolean;
  login: (email: string) => Promise<void>;
  register: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  currentUser: null,
  setCurrentUser: () => {},
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const login = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      alert('Check your email for the login link!');
    } catch (error) {
      console.error("Login error:", error);
      alert(error);
    }
  };
  
  const register = async (email: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, options: { emailRedirectTo: `${window.location.origin}/profile` } });
      if (error) throw error;
      alert('Check your email to confirm your registration!');
    } catch (error) {
      console.error("Registration error:", error);
      alert(error);
    }
  };
  
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setCurrentUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      alert(error);
    }
  };

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        setLoading(true);
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
            setCurrentUser({
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              profileImage: userData.profile_image,
              coverImage: userData.cover_image,
              bio: userData.bio,
              location: userData.location,
              interests: userData.interests,
              following: userData.following,
              followers: userData.followers,
              verified: userData.verified,
              socialLinks: userData.social_links,
              createdAt: new Date(userData.created_at)
            });
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession().catch(error => {
      console.error("Failed to check session:", error);
      setLoading(false);
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
            setCurrentUser({
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              profileImage: userData.profile_image,
              coverImage: userData.cover_image,
              bio: userData.bio,
              location: userData.location,
              interests: userData.interests,
              following: userData.following,
              followers: userData.followers,
              verified: userData.verified,
              socialLinks: userData.social_links,
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
    login,
    register,
    logout,
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
