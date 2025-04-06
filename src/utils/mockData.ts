
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

// Generate mock sponsorships using the format matching the database
export const generateMockSponsorships = (): Sponsorship[] => {
  return [
    {
      id: 'sponsorship-1',
      title: 'Fitness Product Campaign',
      description: 'Looking for fitness influencers to promote our new line of home workout equipment',
      companyId: 'company-1',
      companyName: 'FitGear Pro',
      companyLogo: '/logos/fitgear.svg',
      requirements: ['Minimum 1000 followers', 'Fitness-focused content', 'Previous product promotion experience'],
      benefits: ['Free workout equipment', 'Commission on sales', 'Long-term partnership possibility'],
      compensation: '$500 per sponsored post',
      deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      status: 'active' as SponsorshipStatus,
      tags: ['fitness', 'workout', 'equipment'],
      createdAt: new Date()
    },
    {
      id: 'sponsorship-2',
      title: 'Health Food Brand Ambassador',
      description: 'Seeking influencers to become brand ambassadors for our organic food products',
      companyId: 'company-2',
      companyName: 'Organic Eats',
      companyLogo: '/logos/organic-eats.svg',
      requirements: ['Healthy lifestyle content', 'Engaging audience', 'Passion for organic food'],
      benefits: ['Monthly product shipments', 'Featured on our website', 'Exclusive events access'],
      compensation: 'Products + $300 monthly retainer',
      deadline: new Date(new Date().setMonth(new Date().getMonth() + 2)),
      status: 'active' as SponsorshipStatus,
      tags: ['food', 'organic', 'health'],
      createdAt: new Date()
    }
  ];
};
