// Export any necessary types from the existing types file
export * from './badge.d';

// User roles
export type UserRole = 'user' | 'coach' | 'influencer' | 'company' | 'admin';

// Event privacy options
export type EventPrivacy = 'public' | 'private' | 'paid';

// Booking status and payment status
export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

// Session status
export type SessionStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

// Define the User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
  bio?: string;
  location?: string;
  followers?: number;
  following?: number;
  isFollowing?: boolean;
}

// User profile structure
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
  coverImage?: string;
}

// Post structure
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

// Comment structure
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

// Group privacy options as a string enum for better compatibility
export type GroupPrivacyString = 'public' | 'private' | 'paid';

// Group privacy structure (used in some places)
export interface GroupPrivacy {
  private: boolean;
  public: boolean;
}

// Group structure
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
  privacy: GroupPrivacy | GroupPrivacyString;
  price?: number;
  pendingRequests?: number;
  rules: string[];
  createdAt: Date;
}

// Event structure
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

// Service types
export type ServiceType = 'one_on_one' | 'group' | 'consultation' | 'program' | 'webinar' | 'course';

// Service structure
export interface Service {
  id: string;
  title: string;
  description: string;
  providerId: string;
  providerName: string;
  price: number;
  duration: number | string;
  available: boolean;
  createdAt: Date;
  isOnline: boolean;
  location?: string;
  capacity?: number;
  serviceType: ServiceType;
  coverImage?: string;
  meetingUrl?: string;
}

// Booking structure
export interface Booking {
  id: string;
  serviceId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userProfileImage?: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: Date;
  scheduledTime?: Date;
  preferredTime?: Date;
}

// Session structure
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

// Session enrollment structure
export interface SessionEnrollment {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userProfileImage?: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: Date;
}

// Message structure
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

// Join request structure
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

// Product structure for company products
export type Product = {
  id: string;
  title: string;
  description: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  price: string;
  category: string;
  tags?: string[];
  image?: string;
  features?: string[];
  useCases?: string[];
  demoUrl?: string;
  websiteUrl?: string;
  releaseDate: Date;
  createdAt: Date;
};

// Workshop structure for company workshops
export type Workshop = {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  date: Date;
  duration: string;
  startTime?: string;
  endTime?: string;
  price: number;
  category: string;
  topics?: string[];
  prerequisites?: string[];
  includes?: string[];
  tags?: string[];
  image?: string;
  capacity?: number;
  isOnline: boolean;
  location?: string;
  meetingUrl?: string;
  instructors?: { name: string; bio: string; image?: string; }[];
  createdAt: Date;
};

// Job posting structure for company job postings
export type JobPosting = {
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
};
