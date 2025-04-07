
import { User } from './index';

export interface Sponsorship {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  title: string;
  description: string;
  requirements: string[];
  benefits: string[];
  compensation?: string;
  deadline?: Date;
  tags?: string[];
  status: 'active' | 'closed' | 'draft';
  createdAt: Date;
}

export interface SponsorshipApplication {
  id: string;
  sponsorshipId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userProfileImage?: string;
  experience: string;
  motivation: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}
