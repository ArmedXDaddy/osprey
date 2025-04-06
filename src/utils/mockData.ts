
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

// Generate mock groups 
export const generateMockGroups = (): Group[] => {
  return [
    {
      id: 'mock-group-1',
      name: 'Fitness Enthusiasts',
      description: 'A community for people passionate about fitness and healthy living',
      creatorId: 'coach-1',
      creatorName: 'John Fitness',
      creatorRole: 'coach',
      members: 45,
      memberIds: [],
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      privacy: 'public',
      price: null,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      pendingRequests: 0,
      rules: ['Be respectful', 'No spam', 'Share your progress'],
      memberLimit: 100
    },
    {
      id: 'mock-group-2',
      name: 'Nutrition & Diet Support',
      description: 'Share tips and get support for your nutrition and diet goals',
      creatorId: 'coach-2',
      creatorName: 'Nutrition Expert',
      creatorRole: 'coach',
      members: 120,
      memberIds: [],
      image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      privacy: 'private',
      price: null,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      pendingRequests: 5,
      rules: ['Share evidence-based information', 'Be supportive', 'No promotion of extreme diets'],
      memberLimit: 150
    },
    {
      id: 'mock-group-3',
      name: 'Premium Workout Plans',
      description: 'Access to premium workout plans with weekly updates',
      creatorId: 'influencer-1',
      creatorName: 'Fitness Influencer',
      creatorRole: 'influencer',
      members: 75,
      memberIds: [],
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      privacy: 'paid',
      price: 9.99,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      pendingRequests: 0,
      rules: ['Members only content', 'No sharing outside the group', 'Ask questions anytime'],
      memberLimit: 200
    }
  ];
};

// Add other mock data generation functions to return actual arrays instead of empty arrays
export const generateMockEvents = (): Event[] => {
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
