
export type ServiceType = 'one-on-one' | 'group' | 'course' | 'consultation' | 'other';

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'failed';

export interface Workshop {
  id: string;
  title: string;
  description: string;
  companyId: string;
  companyName: string;
  date: Date;
  location: string;
  capacity: number;
  price: number;
  isOnline: boolean;
  meetingUrl?: string;
  coverImage?: string;
  registrations: number;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  companyId: string;
  companyName: string;
  imageUrl?: string;
  category: string;
  createdAt: Date;
}

export type SessionStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
