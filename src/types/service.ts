
export type ServiceType = 'one_on_one' | 'group' | 'course' | 'consultation' | 'webinar' | 'other';

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'failed';

export type SessionStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'approved' | 'rejected' | 'pending';

export interface Workshop {
  id: string;
  title: string;
  description: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  date: Date;
  location: string;
  capacity: number;
  price: number;
  duration: string;
  isOnline: boolean;
  meetingUrl?: string;
  coverImage?: string;
  image?: string;
  category?: string;
  tags?: string[];
  registrations?: number;
  createdAt: Date;
}

export interface Product {
  id: string;
  title: string;
  name?: string;
  description: string;
  price: number | string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  imageUrl?: string;
  image?: string;
  category?: string;
  tags?: string[];
  createdAt: Date;
}
