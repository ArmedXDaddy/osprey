
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { supabase } from "@/integrations/supabase/client";
import { Session } from '@supabase/supabase-js';
import { toast } from "@/hooks/use-toast";

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        setSupabaseSession(session);
        
        if (session?.user) {
          setTimeout(async () => {
            try {
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();
                
              console.log("Fetched profile data:", profileData);
              
              let socialLinks = {};
              if (profileData?.social_links) {
                try {
                  if (typeof profileData.social_links === 'string') {
                    socialLinks = JSON.parse(profileData.social_links);
                  } else if (typeof profileData.social_links === 'object') {
                    socialLinks = profileData.social_links;
                  }
                } catch (e) {
                  console.error("Error parsing social links:", e);
                }
              }
              
              const userData: User = {
                id: session.user.id,
                email: session.user.email!,
                name: profileData?.name || session.user.user_metadata.name || 'User',
                role: profileData?.role || session.user.user_metadata.role || 'user',
                profileImage: profileData?.profile_image || session.user.user_metadata.profileImage,
                coverImage: session.user.user_metadata.coverImage,
                bio: profileData?.bio || session.user.user_metadata.bio || '',
                location: profileData?.location || session.user.user_metadata.location || '',
                socialLinks: socialLinks,
                createdAt: new Date(session.user.created_at)
              };
              
              console.log("Setting current user with data:", userData);
              setCurrentUser(userData);
            } catch (error) {
              console.error("Error fetching profile data:", error);
              
              const userData: User = {
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
              };
              
              setCurrentUser(userData);
            }
          }, 0);
        } else {
          setCurrentUser(null);
        }
      }
    );
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Got existing session:", session?.user?.id);
      setSupabaseSession(session);
      
      if (session?.user) {
        // Fix: Use Promise chain properly with then() and catch()
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle()
          .then(({ data: profileData, error: profileError }) => {
            console.log("Profile data on init:", profileData);
            
            let socialLinks = {};
            if (profileData?.social_links) {
              try {
                if (typeof profileData.social_links === 'string') {
                  socialLinks = JSON.parse(profileData.social_links);
                } else if (typeof profileData.social_links === 'object') {
                  socialLinks = profileData.social_links;
                }
              } catch (e) {
                console.error("Error parsing social links:", e);
              }
            }
              
            const userData: User = {
              id: session.user.id,
              email: session.user.email!,
              name: profileData?.name || session.user.user_metadata.name || 'User',
              role: profileData?.role || session.user.user_metadata.role || 'user',
              profileImage: profileData?.profile_image || session.user.user_metadata.profileImage,
              coverImage: session.user.user_metadata.coverImage,
              bio: profileData?.bio || session.user.user_metadata.bio || '',
              location: profileData?.location || session.user.user_metadata.location || '',
              socialLinks: socialLinks,
              createdAt: new Date(session.user.created_at)
            };
            
            setCurrentUser(userData);
            setIsLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching profile data on init:", error);
            
            const userData: User = {
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
            };
            
            setCurrentUser(userData);
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

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return !!data.session;
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
      setCurrentUser(null);
      
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      
      if (error) {
        console.error('Logout error from Supabase:', error);
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
      toast({
        title: "Error during logout",
        description: "Signed out locally, but there was an issue with the server.",
        variant: "destructive"
      });
    } finally {
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
      
      const { data, error } = await supabase.auth.updateUser({
        data: {
          name: userData.name || currentUser.name,
          ...(userData.role && { role: userData.role }),
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
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: userData.name || currentUser.name,
          profile_image: userData.profileImage || currentUser.profileImage,
          bio: userData.bio || currentUser.bio,
          location: userData.location || currentUser.location,
          social_links: userData.socialLinks ? {
            ...(currentUser.socialLinks || {}),
            ...userData.socialLinks
          } : currentUser.socialLinks
        })
        .eq('id', currentUser.id);
      
      if (profileError) {
        console.error('Error updating public profile:', profileError);
      }
      
      const updatedUser = { 
        ...currentUser, 
        ...userData,
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
