
export type UserRole = 'user' | 'influencer' | 'coach' | 'company' | 'admin';

export type GroupPrivacy = 'public' | 'private' | 'paid';
export type EventPrivacy = 'public' | 'private' | 'paid';
export type SessionType = 'one_on_one' | 'group';
export type SessionStatus = 'pending' | 'approved' | 'rejected' | 'completed';
export type PaymentStatus = 'unpaid' | 'paid';
export type ServiceType = 'one_on_one' | 'group' | 'webinar' | 'course';
export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
  coverImage?: string; 
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
  userLikes?: string[]; // Array of user IDs who liked the post
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
  attendees: string[]; // Changed from number to string[] to support includes()
  privacy: EventPrivacy;
  price?: number;
  pendingRequests?: number;
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
  memberIds?: string[]; // Added memberIds property
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
  sessionId?: string; // Reference to a session if linked
  meetingUrl?: string; // Added for online services
  coverImage?: string; // Added for service image
}

export interface Booking {
  id: string;
  serviceId: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  preferredTime?: Date;
  scheduledTime?: Date;
  isPaid: boolean;
  createdAt: Date;
}

export interface Session {
  id: string;
  title: string;
  description: string;
  coachId: string;
  coachName: string;
  sessionType: SessionType;
  capacity?: number;
  price: number;
  duration: string;
  startTime?: Date;
  location?: string;
  isOnline: boolean;
  meetingUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionEnrollment {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userProfileImage?: string;
  status: SessionStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
}

export interface Message {
  id: string;
  groupId?: string;
  serviceId?: string; // Make sure this property exists
  userId: string;
  userName: string;
  userRole: UserRole;
  userProfileImage?: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'file';
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
