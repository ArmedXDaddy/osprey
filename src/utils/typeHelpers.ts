
import { UserRole, SessionStatus, GroupPrivacy, EventPrivacy } from '@/types';

// convert string to UserRole type safely
export const asUserRole = (role: string): UserRole => {
  const validRoles: UserRole[] = ['user', 'coach', 'influencer', 'company', 'admin'];
  
  // Check if the provided role is valid, default to 'user' if not
  return validRoles.includes(role as UserRole) ? (role as UserRole) : 'user';
};

// convert string to GroupPrivacy type safely
export const asGroupPrivacy = (privacy: string): GroupPrivacy => {
  const validPrivacySettings: GroupPrivacy[] = ['public', 'private', 'paid'];
  
  // Check if the provided privacy setting is valid, default to 'public' if not
  return validPrivacySettings.includes(privacy as GroupPrivacy) 
    ? (privacy as GroupPrivacy) 
    : 'public';
};

// convert string to EventPrivacy type safely
export const asEventPrivacy = (privacy: string): EventPrivacy => {
  const validPrivacySettings: EventPrivacy[] = ['public', 'private', 'paid'];
  
  // Check if the provided privacy setting is valid, default to 'public' if not
  return validPrivacySettings.includes(privacy as EventPrivacy) 
    ? (privacy as EventPrivacy) 
    : 'public';
};

// convert string to SessionStatus type safely
export const asSessionStatus = (status: string): SessionStatus => {
  const validStatuses: SessionStatus[] = [
    'scheduled', 'in_progress', 'completed', 'cancelled', 
    'approved', 'rejected', 'pending'
  ];
  
  // Check if the provided status is valid, default to 'pending' if not
  return validStatuses.includes(status as SessionStatus) 
    ? (status as SessionStatus) 
    : 'pending';
};
