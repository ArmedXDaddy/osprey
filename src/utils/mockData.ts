
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

export const generateMockPosts = (): Post[] => {
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

// Return initial sample sponsorships data - no localStorage persistence
export const generateMockSponsorships = (): Sponsorship[] => {
  return [
    {
      id: 'sponsorship-1',
      title: 'Fitness Brand Ambassador',
      description: 'Looking for fitness enthusiasts to represent our new line of workout gear.',
      companyId: 'company-1',
      companyName: 'FitLife Apparel',
      companyLogo: '/placeholder.svg',
      requirements: [
        'At least 1000 followers on Instagram',
        'Regular fitness content creator',
        'Located in the United States'
      ],
      benefits: [
        'Free products monthly',
        'Commission on sales with your code',
        'Featured on our social media'
      ],
      compensation: '$500 per month',
      status: 'active' as SponsorshipStatus,
      tags: ['fitness', 'health', 'apparel'],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    },
    {
      id: 'sponsorship-2',
      title: 'Tech Reviewer Partnership',
      description: 'Seeking tech reviewers for our new smartphone accessories.',
      companyId: 'company-2',
      companyName: 'TechGadget Co',
      companyLogo: '/placeholder.svg',
      requirements: [
        'Technology-focused content creator',
        'Experience with product reviews',
        'At least 5K subscribers on YouTube'
      ],
      benefits: [
        'Keep all products you review',
        'Early access to new releases',
        'Affiliate partnership opportunity'
      ],
      status: 'active' as SponsorshipStatus,
      tags: ['technology', 'gadgets', 'reviews'],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
    }
  ];
};
