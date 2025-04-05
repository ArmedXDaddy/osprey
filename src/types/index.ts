
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
  sessionType: 'one_on_one' | 'group';
  capacity?: number;
  startTime?: Date;
  location?: string;
  isOnline: boolean;
  meetingUrl?: string;
  image?: string;
  isFree: boolean;
}

// These types are needed by other components but were missing
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
  interests?: string[];
  socialLinks?: Record<string, string>;
}

export type UserRole = 'user' | 'coach' | 'admin';

export interface Session {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  coachId: string;
  coachName: string;
  isActive: boolean;
  capacity?: number;
  startTime?: Date;
  location?: string;
  isOnline: boolean;
  meetingUrl?: string;
  sessionType: 'one_on_one' | 'group';
  createdAt: Date;
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

export type SessionStatus = 'pending' | 'approved' | 'rejected';
export type PaymentStatus = 'paid' | 'unpaid' | 'refunded';
export type SessionType = 'one_on_one' | 'group';

export interface Post {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorImage?: string;
  likes: number;
  comments: number;
  createdAt: Date;
  mediaUrl?: string;
  mediaType?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location?: string;
  isOnline: boolean;
  meetingUrl?: string;
  startDate: Date;
  endDate?: Date;
  price: number;
  capacity?: number;
  currentAttendees: number;
  creatorId: string;
  creatorName: string;
  creatorRole: UserRole;
  creatorImage?: string;
  privacy: EventPrivacy;
  image?: string;
  createdAt: Date;
}

export type EventPrivacy = 'public' | 'private';

export interface Group {
  id: string;
  name: string;
  description: string;
  members: number;
  memberLimit?: number;
  pendingRequests?: number;
  creatorId: string;
  creatorName: string;
  creatorRole: UserRole;
  privacy: GroupPrivacy;
  image?: string;
  rules?: string[];
  price?: number;
  createdAt: Date;
}

export type GroupPrivacy = 'public' | 'private';

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

export interface Message {
  id: string;
  content: string;
  groupId?: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userProfileImage?: string;
  mediaUrl?: string;
  mediaType?: string;
  createdAt: Date;
}
