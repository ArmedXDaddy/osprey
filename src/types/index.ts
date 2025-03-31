
export type UserRole = 'user' | 'influencer' | 'coach' | 'company' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
  bio?: string;
  location?: string;
  interests?: string[];
  following?: string[];
  followers?: number;
  verified?: boolean;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  createdAt: Date;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userProfileImage?: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  createdAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  creatorRole: UserRole;
  location: string;
  date: Date;
  image?: string;
  attendees: number;
  createdAt: Date;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  creatorName: string;
  creatorRole: UserRole;
  members: number;
  image?: string;
  createdAt: Date;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  providerId: string;
  providerName: string;
  price: number;
  duration: string;
  available: boolean;
  createdAt: Date;
}
