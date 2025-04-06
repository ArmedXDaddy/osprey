
import { Service, ServiceType, Post, Event, Group, Session, SessionEnrollment, Message, JoinRequest, User, Sponsorship, SponsorshipStatus } from '@/types';

// Generate mock services
export const generateMockServices = (): Service[] => {
  return [
    {
      id: 'mock-service-1',
      title: 'Personal Training Session',
      description: 'One-on-one fitness coaching',
      providerId: 'coach-1',
      providerName: 'John Fitness',
      price: 50,
      duration: '1 hour',
      available: true,
      createdAt: new Date(),
      isOnline: false,
      location: 'Fitness Center',
      capacity: 1,
      serviceType: 'one_on_one' as ServiceType,
      coverImage: '/path/to/cover-image.jpg',
      meetingUrl: null
    },
    {
      id: 'mock-service-2', 
      title: 'Online Nutrition Consultation',
      description: 'Personalized nutrition advice',
      providerId: 'coach-2',
      providerName: 'Nutrition Expert',
      price: 75,
      duration: '45 minutes',
      available: true,
      createdAt: new Date(),
      isOnline: true,
      location: null,
      capacity: 1,
      serviceType: 'one_on_one' as ServiceType,
      coverImage: '/path/to/nutrition-cover.jpg',
      meetingUrl: 'https://meet.example.com/nutrition'
    }
  ];
};

// Add other mock data generation functions to return actual arrays instead of empty arrays
export const generateMockPosts = (): Post[] => {
  return [];
};

export const generateMockEvents = (): Event[] => {
  return [];
};

export const generateMockGroups = (): Group[] => {
  return [];
};

export const generateMockSessions = (): Session[] => {
  return [];
};

export const generateMockSessionEnrollments = (): SessionEnrollment[] => {
  return [];
};

export const generateMockMessages = (): Message[] => {
  return [];
};

export const generateMockJoinRequests = (): JoinRequest[] => {
  return [];
};

// Add mock users for application and sponsorship functionality
export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'influencer',
    profileImage: '/placeholder.svg',
    bio: 'Content creator and influencer',
    followers: 1200,
    createdAt: new Date()
  },
  {
    id: 'user-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'influencer',
    profileImage: '/placeholder.svg',
    bio: 'Lifestyle blogger',
    followers: 850,
    createdAt: new Date()
  }
];

// Generate mock sponsorships - this is the function that was missing
export const generateMockSponsorships = (): Sponsorship[] => {
  return [
    {
      id: 'mock-sponsorship-1',
      title: 'Brand Ambassador Program',
      description: 'Represent our fitness brand on social media',
      companyId: 'company-1',
      companyName: 'FitLife Inc',
      companyLogo: '/placeholder.svg',
      requirements: ['Minimum 1000 followers', 'Post at least twice weekly'],
      benefits: ['Free products', 'Commissions on sales'],
      compensation: '$500 per month',
      deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      tags: ['fitness', 'lifestyle'],
      status: 'active' as SponsorshipStatus,
      createdAt: new Date()
    },
    {
      id: 'mock-sponsorship-2',
      title: 'Product Review Partnership',
      description: 'Review our new line of protein supplements',
      companyId: 'company-2',
      companyName: 'NutriBoost',
      companyLogo: '/placeholder.svg',
      requirements: ['Experience with nutrition products', 'Detailed reviews'],
      benefits: ['Free products for 6 months', 'Exclusive discounts'],
      compensation: 'Free products + affiliate commissions',
      deadline: null,
      tags: ['nutrition', 'health'],
      status: 'active' as SponsorshipStatus,
      createdAt: new Date()
    }
  ];
};
