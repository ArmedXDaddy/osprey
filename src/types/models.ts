
import { UserRole } from './user';
import { EventPrivacy, AttendeeDetail, EventRegistration } from './event';
import { GroupPrivacy } from './group';
import { ServiceType, BookingStatus, PaymentStatus, Workshop, Product, SessionStatus } from './service';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
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

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  date: Date;
  image?: string;
  privacy: EventPrivacy;
  price?: number;
  attendees?: string[];
  createdAt: Date;
  creatorId: string;
  creatorName: string;
  creatorRole: string;
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
  userLikes?: string[];
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
  privacy: GroupPrivacy;
  price?: number;
  createdAt: Date;
  pendingRequests?: number;
  rules?: string[];
  memberLimit?: number;
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
  isOnline?: boolean;
  location?: string;
  capacity?: number;
  serviceType?: ServiceType;
  coverImage?: string;
  meetingUrl?: string;
}

export interface Session {
  id: string;
  title: string;
  description: string;
  coachId: string;
  coachName: string;
  sessionType: string;
  capacity?: number;
  price: number;
  duration: string;
  startTime: Date;
  location?: string;
  meetingUrl?: string;
  isOnline: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionEnrollment {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  userProfileImage?: string;
  status: string;
  paymentStatus: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  content: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userProfileImage?: string;
  createdAt: Date;
  groupId?: string;
  serviceId?: string;
}

export interface JoinRequest {
  id: string;
  entityId: string;
  entityType: 'group' | 'event';
  userId: string;
  userName: string;
  userProfileImage?: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export interface Booking {
  id: string;
  serviceId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: Date;
  serviceTitle?: string;
  coachName?: string;
  price?: number;
  duration?: string;
  isOnline?: boolean;
  serviceType?: string;
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

export interface Announcement {
  id: string;
  eventId: string;
  creatorId: string;
  creatorName: string;
  content: string;
  createdAt: Date;
}

export interface JobPosting {
  id: string;
  title: string;
  description: string;
  companyId: string;
  companyName: string;
  location: string;
  salary?: string;
  requirements: string[];
  isRemote: boolean;
  postedAt: Date;
  deadline?: Date;
}
