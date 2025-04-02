
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for development purposes
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Emma Johnson',
    email: 'user@example.com',
    role: 'user',
    profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    bio: 'Fitness enthusiast and hiking lover',
    location: 'Seattle, WA',
    interests: ['Hiking', 'Yoga', 'Nutrition'],
    followers: 85,
    verified: true,
    createdAt: new Date('2023-01-15')
  },
  {
    id: '2',
    name: 'Sophia Williams',
    email: 'influencer@example.com',
    role: 'influencer',
    profileImage: 'https://randomuser.me/api/portraits/women/68.jpg',
    bio: 'Fitness influencer | Wellness advocate | 200k+ on Instagram',
    location: 'Los Angeles, CA',
    interests: ['HIIT', 'Strength Training', 'Plant-based Nutrition'],
    followers: 12500,
    following: ['3', '5'],
    verified: true,
    socialLinks: {
      instagram: '@sophia_fit',
      twitter: '@sophia_will',
      website: 'sophiafitness.com'
    },
    createdAt: new Date('2022-10-05')
  },
  {
    id: '3',
    name: 'Alexandra Chen',
    email: 'coach@example.com',
    role: 'coach',
    profileImage: 'https://randomuser.me/api/portraits/women/33.jpg',
    bio: "Certified Personal Trainer | 10+ years experience | Specializing in women's strength",
    location: 'Chicago, IL',
    interests: ['Strength Training', 'Mobility', 'Nutrition Coaching'],
    followers: 2800,
    verified: true,
    socialLinks: {
      instagram: '@alex_strength',
      website: 'alexstrength.fit'
    },
    createdAt: new Date('2022-08-22')
  },
  {
    id: '4',
    name: 'FitTech Apparel',
    email: 'company@example.com',
    role: 'company',
    profileImage: 'https://via.placeholder.com/150?text=FT',
    bio: 'Premium fitness apparel for women. Designed by athletes for athletes.',
    location: 'New York, NY',
    followers: 8700,
    verified: true,
    socialLinks: {
      instagram: '@fittechapparel',
      twitter: '@fittech',
      website: 'fittechapparel.com'
    },
    createdAt: new Date('2022-05-10')
  },
  {
    id: '5',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    verified: true,
    createdAt: new Date('2022-01-01')
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading user data on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('osprey_user');
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setCurrentUser(userData);
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('osprey_user');
      }
    }
    
    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('osprey_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const user = MOCK_USERS.find(u => u.email === email);
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      setCurrentUser(user);
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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if email exists
      const exists = MOCK_USERS.some(u => u.email === email);
      if (exists) {
        throw new Error('Email already in use');
      }
      
      // Create new user
      const newUser: User = {
        id: Math.random().toString(36).substring(2, 9),
        name,
        email,
        role,
        followers: 0,
        verified: role === 'user', // Auto verify users, other roles need verification
        createdAt: new Date()
      };
      
      // In a real app, we would save this to the database
      // For now, we'll just set as current user
      setCurrentUser(newUser);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    localStorage.removeItem('osprey_user');
    setCurrentUser(null);
    setIsLoading(false);
  };

  const updateProfile = async (userData: Partial<User>) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (!currentUser) {
        throw new Error('No user logged in');
      }
      
      const updatedUser = { ...currentUser, ...userData };
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
