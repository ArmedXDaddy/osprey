
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
  coverImage?: string;
  isFree: boolean;
}

// Add other required type exports
export type UserRole = 'user' | 'admin' | 'coach' | 'company' | 'influencer';

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
  followers?: number;
  following?: string[];
  verified?: boolean;
  socialLinks?: Record<string, string>;
  createdAt?: Date;
}

export interface Post {
  id: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  createdAt: Date;
  // Backward compatibility fields
  userId?: string;
  userName?: string;
  userRole?: UserRole;
  userProfileImage?: string;
  // New fields
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorImage?: string;
  authorProfileImage?: string;
}

export type GroupPrivacy = 'public' | 'private' | 'paid';
export type EventPrivacy = 'public' | 'private' | 'paid';

export interface Event {
  id: string;
  title: string;
  description: string;
  location?: string;
  isOnline: boolean;
  meetingUrl?: string;
  startDate: Date;
  endDate?: Date;
  date?: Date;  // For backward compatibility
  price: number;
  capacity?: number;
  image?: string;
  createdAt: Date;
  attendees: string[];
  currentAttendees: number;
  pendingRequests?: number;
  // Creator information
  creatorId: string;
  creatorName: string; 
  creatorRole: UserRole;
  privacy: EventPrivacy;
  isFree?: boolean;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  image?: string;
  privacy: GroupPrivacy;
  price?: number;
  members: number;
  memberLimit?: number;
  createdAt: Date;
  creatorId: string;
  creatorName: string;
  creatorRole: UserRole;
  rules?: string[];
  pendingRequests?: number;
}

export interface Message {
  id: string;
  content: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userProfileImage?: string;
  groupId?: string;
  mediaUrl?: string;
  mediaType?: string;
  createdAt: Date;
}

export interface JoinRequest {
  id: string;
  userId: string;
  userName: string;
  userProfileImage?: string;
  groupId?: string;
  eventId?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'approved';
  createdAt: Date;
}

export type SessionType = 'one_on_one' | 'group';
export type SessionStatus = 'upcoming' | 'completed' | 'cancelled' | 'pending' | 'approved' | 'rejected';
export type PaymentStatus = 'paid' | 'unpaid' | 'refunded';

export interface Session {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  coach: {
    id: string;
    name: string;
    profileImage?: string;
  };
  coachId?: string;  // Adding this for backward compatibility
  coachName?: string; // Adding this for backward compatibility
  isOnline: boolean;
  meetingUrl?: string;
  location?: string;
  maxAttendees?: number;
  currentAttendees: number;
  price: number;
  isFree: boolean;
  status: SessionStatus;
  type: SessionType;
  sessionType?: SessionType; // Adding this for backward compatibility
  capacity?: number;
  duration?: string;
  isActive?: boolean;
  image?: string;
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
