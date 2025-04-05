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

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
  coverImage?: string;
  bio?: string;
  location?: string;
  followers?: number;
  verified?: boolean;
  interests?: string[];
  socialLinks?: Record<string, string>;
  createdAt?: Date;
}

export type UserRole = 'user' | 'coach' | 'admin' | 'influencer' | 'company';

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
  updatedAt?: Date;
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
  // Backward compatibility properties
  userId?: string;
  userName?: string;
  userProfileImage?: string;
  userRole?: UserRole;
  image?: string;
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
  // For backward compatibility
  date?: Date;
  attendees: string[]; // Changed from number to string[] for consistency
  pendingRequests?: number;
}

export type EventPrivacy = 'public' | 'private' | 'paid';

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
  // For backward compatibility
  memberIds?: string[];
}

export type GroupPrivacy = 'public' | 'private' | 'paid';

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

export interface ServiceBooking {
  id: string;
  serviceId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userProfileImage?: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  amount: number;
  createdAt: Date;
  notes?: string;
  preferredTime?: string;
}

export type BookingStatus = 'pending' | 'approved' | 'rejected';
