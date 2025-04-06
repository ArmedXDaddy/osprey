
import { UserRole, BookingStatus, PaymentStatus, SessionStatus } from '@/types';

/**
 * Helper function to convert string to UserRole type
 */
export const asUserRole = (role: string): UserRole => {
  if (['user', 'coach', 'influencer', 'company', 'admin'].includes(role)) {
    return role as UserRole;
  }
  return 'user'; // Default fallback
};

/**
 * Helper function to convert string to BookingStatus type
 */
export const asBookingStatus = (status: string): BookingStatus => {
  if (['pending', 'approved', 'rejected', 'completed', 'cancelled'].includes(status)) {
    return status as BookingStatus;
  }
  return 'pending'; // Default fallback
};

/**
 * Helper function to convert string to PaymentStatus type
 */
export const asPaymentStatus = (status: string): PaymentStatus => {
  if (['unpaid', 'paid', 'refunded'].includes(status)) {
    return status as PaymentStatus;
  }
  return 'unpaid'; // Default fallback
};

/**
 * Helper function to convert string to SessionStatus type
 */
export const asSessionStatus = (status: string): SessionStatus => {
  if (['scheduled', 'in_progress', 'completed', 'cancelled', 'approved', 'rejected'].includes(status)) {
    return status as SessionStatus;
  }
  return 'scheduled'; // Default fallback
};

/**
 * Helper function to convert string to number safely
 */
export const safeNumberConversion = (value: string | number): number => {
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};
