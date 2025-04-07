
export type EventPrivacy = 'public' | 'private' | 'invite-only';

export interface AttendeeDetail {
  id: string;
  userId: string;
  userName: string;
  userProfileImage?: string;
  userRole: string;
  notes?: string;
  registeredAt: Date;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userProfileImage?: string;
  status: 'registered' | 'waitlisted' | 'cancelled';
  paymentStatus?: 'paid' | 'unpaid' | 'refunded';
  notes?: string;
  createdAt: Date;
}
