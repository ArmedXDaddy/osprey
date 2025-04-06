
// Add or update type definitions as needed

export type UserRole = 'user' | 'coach' | 'influencer' | 'company';
export type SessionStatus = 'pending' | 'approved' | 'rejected';
export type ServiceType = 'one_on_one' | 'group' | 'webinar' | 'course';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
  bio?: string;
  location?: string;
  followers?: number;
  verified?: boolean;
  createdAt?: Date;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    website?: string;
    youtube?: string;
    tiktok?: string;
  };
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userProfileImage?: string;
  content: string;
  image?: string;
  createdAt: Date;
  commentsCount: number;
  comments?: number;
  likesCount?: number;
  likes?: number;
  userLikes?: string[];
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userProfileImage?: string;
  content: string;
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
  memberIds?: string[];
  image?: string;
  privacy: 'public' | 'private' | 'paid';
  price?: number | null;
  createdAt: Date;
  pendingRequests?: number;
  rules?: string[];
  memberLimit?: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  creatorRole: UserRole;
  date: Date;
  location: string;
  image?: string;
  privacy: 'public' | 'private' | 'paid';
  price?: number | null;
  attendees: string[];
  pendingRequests?: number;
  createdAt: Date;
}

export interface Service {
  id: string;
  title: string;
  description?: string;
  providerId: string;
  providerName: string;
  price: number;
  duration: string;
  available: boolean;
  createdAt: Date;
  isOnline: boolean;
  location?: string | null;
  capacity?: number | null;
  serviceType: ServiceType;
  coverImage?: string | null;
  image?: string | null;
  meetingUrl?: string | null;
}

export interface Session {
  id: string;
  serviceId?: string;
  coachId: string;
  coachName: string;
  title: string;
  description: string;
  date?: Date;
  startTime: Date | string;
  endTime?: string;
  location?: string | null;
  isOnline: boolean;
  meetingUrl?: string | null;
  capacity?: number | null;
  enrolled?: number;
  price: number;
  isAvailable?: boolean;
  isActive?: boolean;
  createdAt: Date;
  sessionType?: 'one_on_one' | 'group';
  duration?: string;
}

export interface SessionEnrollment {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userProfileImage?: string;
  status: SessionStatus;
  paymentStatus: 'paid' | 'unpaid';
  amount?: number;
  createdAt: Date;
}

export interface Message {
  id: string;
  groupId?: string;
  serviceId?: string;
  userId: string;
  userName: string;
  userRole?: UserRole;
  userProfileImage?: string;
  content: string;
  createdAt: Date;
}

export interface JoinRequest {
  id: string;
  groupId?: string;
  eventId?: string;
  userId: string;
  userName: string;
  userProfileImage?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export interface Booking {
  id: string;
  serviceId: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  paymentStatus: 'paid' | 'unpaid';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
