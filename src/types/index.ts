// User related types
export type UserRole = 'user' | 'coach' | 'admin' | 'influencer' | 'company';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profileImage?: string;
  bio?: string;
  following?: string[];
  followers?: number;
  location?: string;
  interests?: string[];
  verified?: boolean;
  socialLinks?: Record<string, string>;
  coverImage?: string;
  createdAt?: Date;
}

// Service related types
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
  coach?: {
    id: string;
    name: string;
    role: UserRole;
    profileImage?: string;
  };
  coachId?: string;
  coachName?: string;
  type?: SessionType;
  status?: SessionStatus;
  isActive?: boolean;
  currentAttendees?: number;
}

// Post related types
export interface Post {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorImage?: string;
  authorRole: UserRole;
  createdAt: Date;
  likes: number;
  comments: number;
  images?: string[];
  liked?: boolean;
  
  // Additional properties used in components
  userId?: string;
  userName?: string;
  userRole?: UserRole;
  userProfileImage?: string;
  image?: string;
}

// Group related types
export type GroupPrivacy = 'public' | 'private' | 'paid';

export interface Group {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  creatorName: string;
  creatorRole: UserRole;
  members: number;
  memberLimit?: number;
  privacy: GroupPrivacy;
  price?: number;
  createdAt: Date;
  image?: string;
  pendingRequests?: number;
  rules?: string[];
}

// Event related types
export type EventPrivacy = 'public' | 'private' | 'group_only' | 'paid';

export interface Event {
  id: string;
  title: string;
  description: string;
  hostId: string;
  hostName: string;
  hostRole: UserRole;
  startDate: Date;
  endDate: Date;
  location?: string;
  isOnline: boolean;
  meetingUrl?: string;
  price?: number;
  capacity?: number;
  currentAttendees: number;
  privacy: EventPrivacy;
  groupId?: string;
  groupName?: string;
  createdAt: Date;
  image?: string;
  tags?: string[];
  
  // Additional properties used for compatibility
  date?: Date;
  creatorId?: string;
  creatorName?: string;
  creatorRole?: UserRole;
  attendees?: any[];
  pendingRequests?: number;
}

// Message related types
export interface Message {
  id: string;
  content: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userProfileImage?: string;
  groupId?: string;
  createdAt: Date;
  mediaUrl?: string;
  mediaType?: string;
}

// Join Request related types
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

// Session related types
export type SessionType = 'one_on_one' | 'group';
export type SessionStatus = 'scheduled' | 'canceled' | 'completed' | 'upcoming' | 'pending' | 'approved' | 'rejected';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface Session {
  id: string;
  title: string;
  description: string;
  coach: {
    id: string;
    name: string;
    role: UserRole;
    profileImage?: string;
  };
  coachId: string;
  coachName: string;
  type: SessionType;
  status: SessionStatus;
  startTime: Date;
  endTime: Date;
  duration: string;
  price: number;
  isFree: boolean;
  capacity?: number;
  currentAttendees: number;
  location?: string;
  isOnline: boolean;
  meetingUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  sessionType: SessionType;
  available: boolean;
  isActive?: boolean;
  
  // Added for compatibility with Service
  providerId?: string;
  providerName?: string;
}

export interface SessionEnrollment {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userProfileImage?: string;
  status: 'pending' | 'approved' | 'rejected';
  paymentStatus: PaymentStatus;
  paymentRequired: boolean;
  amount: number;
  paymentCompleted: boolean;
  createdAt: Date;
}

// Service Booking interface for the ManageServiceBookings page
export interface ServiceBooking {
  id: string;
  serviceName: string;
  serviceId: string;
  userName: string;
  userEmail: string;
  userProfileImage?: string;
  status: 'pending' | 'approved' | 'rejected';
  paymentStatus: 'paid' | 'unpaid' | 'refunded';
  amount: number;
  createdAt: Date;
}
