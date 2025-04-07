
export type EventPrivacy = 'public' | 'private' | 'invite-only' | 'paid';
export type PaymentStatus = 'pending' | 'paid' | 'unpaid' | 'refunded' | 'not_required';

export interface AttendeeDetail {
  id: string;
  userId?: string;
  name?: string;
  profileImage?: string;
  userRole?: string;
  notes?: string;
  registeredAt?: Date;
}

export interface EventRegistration {
  id?: string;
  eventId?: string;
  userId: string;
  name: string;
  email: string;
  age?: number;
  gender?: string;
  phone?: string;
  emergencyContact?: string;
  instagram?: string;
  twitter?: string;
  additionalInfo?: string;
  status?: 'registered' | 'waitlisted' | 'cancelled';
  paymentStatus?: PaymentStatus;
  notes?: string;
  registeredAt?: Date;
  profileImage?: string;
}
