
import { Product, Workshop, UserRole, Message, SessionStatus, GroupPrivacy } from '@/types';

/**
 * Map database product entries to Product type
 */
export function mapDbProductToProduct(dbProduct: any): Product {
  return {
    id: dbProduct.id,
    title: dbProduct.title,
    description: dbProduct.description,
    longDescription: dbProduct.long_description,
    price: dbProduct.price,
    image: dbProduct.image,
    companyId: dbProduct.company_id,
    companyName: dbProduct.company_name,
    companyLogo: dbProduct.company_logo,
    category: dbProduct.category,
    features: dbProduct.features || [],
    useCases: dbProduct.use_cases || [],
    tags: dbProduct.tags || [],
    pricingTiers: dbProduct.pricing_tiers,
    websiteUrl: dbProduct.website_url,
    demoUrl: dbProduct.demo_url,
    releaseDate: new Date(dbProduct.release_date),
    createdAt: new Date(dbProduct.created_at)
  };
}

/**
 * Map database workshop entries to Workshop type
 */
export function mapDbWorkshopToWorkshop(dbWorkshop: any): Workshop {
  return {
    id: dbWorkshop.id,
    title: dbWorkshop.title,
    description: dbWorkshop.description,
    longDescription: dbWorkshop.long_description,
    companyId: dbWorkshop.company_id,
    companyName: dbWorkshop.company_name,
    companyLogo: dbWorkshop.company_logo,
    date: new Date(dbWorkshop.date),
    duration: dbWorkshop.duration,
    price: dbWorkshop.price,
    capacity: dbWorkshop.capacity,
    location: dbWorkshop.location,
    isOnline: dbWorkshop.is_online,
    meetingUrl: dbWorkshop.meeting_url,
    image: dbWorkshop.image,
    category: dbWorkshop.category,
    topics: dbWorkshop.topics || [],
    prerequisites: dbWorkshop.prerequisites || [],
    includes: dbWorkshop.includes || [],
    instructors: dbWorkshop.instructors || [],
    tags: dbWorkshop.tags || [],
    startTime: dbWorkshop.start_time,
    endTime: dbWorkshop.end_time
  };
}

/**
 * Convert string to UserRole type safely
 */
export function toUserRole(role: string): UserRole {
  if (
    role === 'user' ||
    role === 'coach' ||
    role === 'influencer' ||
    role === 'company' ||
    role === 'admin'
  ) {
    return role as UserRole;
  }
  return 'user'; // Default fallback
}

/**
 * Convert string to SessionStatus safely
 */
export function toSessionStatus(status: string): SessionStatus {
  if (
    status === 'scheduled' ||
    status === 'in_progress' ||
    status === 'completed' ||
    status === 'cancelled' ||
    status === 'approved' ||
    status === 'rejected'
  ) {
    return status as SessionStatus;
  }
  return 'scheduled'; // Default fallback
}

/**
 * Convert string to GroupPrivacy safely
 */
export function toGroupPrivacy(privacy: string): GroupPrivacy {
  if (
    privacy === 'public' ||
    privacy === 'private' ||
    privacy === 'paid'
  ) {
    return privacy as GroupPrivacy;
  }
  return 'public'; // Default fallback
}

/**
 * Map database message to Message type
 */
export function mapDbMessageToMessage(dbMessage: any): Message {
  return {
    id: dbMessage.id,
    content: dbMessage.content,
    userId: dbMessage.user_id,
    userName: dbMessage.user_name,
    userRole: toUserRole(dbMessage.user_role || 'user'),
    userProfileImage: dbMessage.user_profile_image,
    createdAt: new Date(dbMessage.created_at),
    groupId: dbMessage.group_id,
    serviceId: dbMessage.service_id
  };
}
