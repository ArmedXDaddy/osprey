
import { Service, ServiceType, Post, Event, Group, Session, SessionEnrollment, Message, JoinRequest } from '@/types';

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
  // Let's create some mock groups so they persist even when the app reloads
  return [
    {
      id: 'mock-group-1',
      name: 'Fitness Enthusiasts',
      description: 'A community for fitness lovers to share tips and motivation.',
      creatorId: 'coach-1',
      creatorName: 'John Fitness',
      creatorRole: 'coach',
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
      members: 42,
      memberIds: ['coach-1'],
      memberLimit: 100,
      privacy: 'public',
      price: null,
      pendingRequests: 0,
      rules: ['Be respectful', 'No spam', 'Stay on topic'],
      createdAt: new Date()
    },
    {
      id: 'mock-group-2',
      name: 'Tech Innovators',
      description: 'Discussing the latest in technology and innovation.',
      creatorId: 'influencer-1',
      creatorName: 'Tech Guru',
      creatorRole: 'influencer',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
      members: 156,
      memberIds: ['influencer-1'],
      memberLimit: 500,
      privacy: 'public',
      price: null,
      pendingRequests: 0,
      rules: ['Share knowledge', 'Be constructive', 'Cite sources when possible'],
      createdAt: new Date()
    },
    {
      id: 'mock-group-3',
      name: 'Premium Business Network',
      description: 'Exclusive group for business professionals to network and share opportunities.',
      creatorId: 'company-1',
      creatorName: 'Business Solutions Inc',
      creatorRole: 'company',
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1674&q=80',
      members: 76,
      memberIds: ['company-1'],
      memberLimit: 200,
      privacy: 'paid',
      price: 19.99,
      pendingRequests: 5,
      rules: ['Professional conduct only', 'No soliciting', 'Respect confidentiality'],
      createdAt: new Date()
    }
  ];
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
