
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

// Add mock sponsorships so they persist after reload
export const generateMockSponsorships = (): Sponsorship[] => {
  return [
    {
      id: 'sponsorship-1',
      title: 'Fitness Brand Ambassador',
      description: 'Looking for fitness enthusiasts to promote our new line of workout gear.',
      companyId: 'company-1',
      companyName: 'FitLife Gear',
      companyLogo: '/placeholder.svg',
      requirements: ['Minimum 1000 followers', 'Regular fitness content creator', 'Located in the US'],
      benefits: ['Free products', 'Commission on sales', 'Featured on our social media'],
      compensation: '$200 per month + commission',
      deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      status: 'active' as SponsorshipStatus,
      tags: ['fitness', 'lifestyle', 'sports'],
      createdAt: new Date()
    },
    {
      id: 'sponsorship-2',
      title: 'Tech Product Review',
      description: 'Seeking tech influencers to review our latest smartphone accessories.',
      companyId: 'company-2',
      companyName: 'TechGizmo',
      companyLogo: '/placeholder.svg',
      requirements: ['Tech-focused content', 'Minimum 5k followers'],
      benefits: ['Keep the products', 'Exclusive early access'],
      compensation: 'Products + $100 per review',
      deadline: new Date(new Date().setMonth(new Date().getMonth() + 2)),
      status: 'active' as SponsorshipStatus,
      tags: ['tech', 'gadgets', 'reviews'],
      createdAt: new Date()
    }
  ];
};
