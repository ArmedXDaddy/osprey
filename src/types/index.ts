
// Export any necessary types from the existing types file
export * from './badge.d';

// Update GroupPrivacy type to use string values instead of boolean properties
export type GroupPrivacy = 'public' | 'private' | 'paid';
export type GroupPrivacyString = 'public' | 'private' | 'paid';

// User role definitions
export type UserRole = 'user' | 'coach' | 'influencer' | 'company' | 'admin';

export type EventPrivacy = 'public' | 'private' | 'paid';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profileImage?: string;
  bio?: string;
  location?: string;
  socialLinks?: Record<string, string>;
  followers?: number;
  following?: number;
  createdAt: Date;
  interests?: string[];
  verified?: boolean;
  coverImage?: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  profileImage?: string;
  bio?: string;
  location?: string;
  followers?: number;
  following?: string[];
  createdAt?: Date;
  interests?: string[];
  socialLinks?: Record<string, string>;
  verified?: boolean;
  coverImage?: string;
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
  userLikes?: string[];
  createdAt: Date;
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

// Updated Group interface to use string type for privacy
export interface Group {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  creatorName: string;
  creatorRole: UserRole;
  image?: string;
  members: number;
  memberIds?: string[]; 
  memberLimit?: number;
  privacy: string;
  price?: number;
  pendingRequests?: number;
  rules: string[];
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
  attendees: string[];
  privacy: EventPrivacy;
  price?: number;
  pendingRequests?: number;
  createdAt: Date;
}

export type ServiceType = 'one_on_one' | 'group' | 'consultation' | 'program' | 'webinar' | 'course';

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
  location?: string;
  capacity?: number;
  serviceType: ServiceType;
  coverImage?: string;
  meetingUrl?: string;
}

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'approved' | 'rejected';

export interface Booking {
  id: string;
  serviceId: string;
  userId: string;
  userName: string;
  userProfileImage?: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: Date;
  scheduledTime?: Date;
  preferredTime?: Date;
  userEmail?: string;
}

export interface Session {
  id: string;
  title: string;
  description: string;
  coachId: string;
  coachName: string;
  sessionType: 'group' | 'one_on_one';
  capacity?: number;
  price: number;
  duration: number;
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
  userEmail?: string;
  userProfileImage?: string;
  status: BookingStatus | SessionStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  groupId?: string;
  serviceId?: string;
  content: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userProfileImage?: string;
  createdAt: Date;
}

export interface JoinRequest {
  id: string;
  userId: string;
  userName: string;
  userProfileImage?: string;
  groupId?: string;
  eventId?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  price: string;
  image?: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  category: string;
  features?: string[];
  useCases?: string[];
  tags?: string[];
  pricingTiers?: any[];
  websiteUrl?: string;
  demoUrl?: string;
  releaseDate: Date;
  createdAt: Date;
}

export interface Workshop {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  date: Date;
  duration: string;
  price: number;
  capacity?: number;
  location?: string;
  isOnline: boolean;
  meetingUrl?: string;
  image?: string;
  category: string;
  topics?: string[];
  prerequisites?: string[];
  includes?: string[];
  instructors?: any[];
  tags?: string[];
  startTime?: string;
  endTime?: string;
}

export interface JobPosting {
  id: string;
  title: string;
  description: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  companyDescription?: string;
  location?: string;
  jobType: string;
  salaryRange?: string;
  skills?: string[];
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  applicationUrl?: string;
  applicationEmail?: string;
  applicationDeadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}
