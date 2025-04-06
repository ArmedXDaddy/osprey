// Export any necessary types from the existing types file
export * from './badge.d';

// If the types from badge.d.ts don't include GroupPrivacy, Event, etc., we need to add them here
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

export interface GroupPrivacy {
  private: boolean;
  public: boolean;
}

// Because code expects these fields in the Group interface
export interface Group {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  creatorName: string;
  creatorRole: UserRole;
  image?: string;
  members: number;
  memberIds?: string[]; // Add this field which is expected by the code
  memberLimit?: number;
  privacy: GroupPrivacy;
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

export type ServiceType = 'one_on_one' | 'group' | 'consultation' | 'program';

export interface Service {
  id: string;
  title: string;
  description: string;
  providerId: string;
  providerName: string;
  price: number;
  duration: number;
  available: boolean;
  createdAt: Date;
  isOnline: boolean;
  location?: string;
  capacity?: number;
  serviceType: ServiceType;
  coverImage?: string;
  meetingUrl?: string;
}

export interface Booking {
  id: string;
  serviceId: string;
  userId: string;
  userName: string;
  userProfileImage?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  notes?: string;
  createdAt: Date;
  scheduledTime?: Date;
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
  userProfileImage?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
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
