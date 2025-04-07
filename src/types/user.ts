
export type UserRole = 'user' | 'admin' | 'coach' | 'influencer' | 'company';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
  coverImage?: string;
  bio?: string;
  location?: string;
  interests?: string[];
  followers?: number;
  following?: string[];
  verified?: boolean;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  createdAt: Date;
}
