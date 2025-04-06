
// Update the existing types file to include the Booking type
import { type } from "os";

export type ServiceType = 'one_on_one' | 'group' | 'course' | 'webinar';
export type SponsorshipStatus = 'active' | 'inactive' | 'completed';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

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
  isOnline: boolean;
  location: string | null;
  capacity: number | null;
  serviceType: ServiceType;
  coverImage?: string;
  meetingUrl: string | null;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
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
  creatorRole: string;
  location: string;
  date: Date | string;
  image?: string;
  attendees?: string[];
  price?: number;
  createdAt: Date;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  privacy: string;
  image?: string;
  creatorId: string;
  creatorName: string;
  creatorRole: string;
  members: number;
  memberLimit?: number;
  rules?: string[];
  price?: number;
  createdAt: Date;
}

export interface Session {
  id: string;
  title: string;
  description: string;
  coachId: string;
  coachName: string;
  startTime: Date | string;
  endTime: Date | string;
  isOnline: boolean;
  location?: string;
  meetingUrl?: string;
  price: number;
  capacity: number;
  enrolled: number;
  createdAt: Date;
}

export interface SessionEnrollment {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userProfileImage?: string;
  status: string;
  paymentStatus: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  groupId?: string;
  userId: string;
  userName: string;
  userRole: string;
  userProfileImage?: string;
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  createdAt: Date;
}

export interface JoinRequest {
  id: string;
  groupId?: string;
  eventId?: string;
  userId: string;
  userName: string;
  userProfileImage?: string;
  status: string;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  bio?: string;
  followers: number;
  createdAt: Date;
}

export interface Sponsorship {
  id: string;
  title: string;
  description: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  requirements: string[];
  benefits: string[];
  compensation: string;
  deadline?: Date;
  tags?: string[];
  status: SponsorshipStatus;
  createdAt: Date;
}

export interface SponsorshipApplication {
  id: string;
  sponsorshipId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userProfileImage?: string;
  motivation: string;
  experience: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    website?: string;
    [key: string]: string | undefined;
  };
  status: ApplicationStatus;
  createdAt: Date;
}

export interface Booking {
  id: string;
  serviceId: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: string;
  paymentStatus: string;
  notes?: string;
  createdAt: Date;
  serviceTitle?: string;
  coachName?: string;
  price?: number;
  duration?: string;
  isOnline?: boolean;
  serviceType?: string;
}

export interface Announcement {
  id: string;
  eventId: string;
  content: string;
  creatorId: string;
  creatorName: string;
  creatorRole: string;
  creatorProfileImage?: string;
  createdAt: Date;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userRole: string;
  userProfileImage?: string;
  content: string;
  createdAt: Date;
}
