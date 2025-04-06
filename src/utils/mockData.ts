import { Service, ServiceType, Post, Event, Group, Session, SessionEnrollment, Message, JoinRequest } from '@/types';

// Generate mock services
export const generateMockServices = (): Service[] => {
  return [
    {
      id: '1',
      title: 'Personal Training Session',
      description: 'One-on-one personal training session with a certified trainer.',
      providerId: 'provider-1',
      providerName: 'Jane Smith',
      price: 75,
      duration: 60, // Changed from string to number
      available: true,
      createdAt: new Date('2023-01-15'),
      isOnline: false,
      location: 'Downtown Fitness Center',
      capacity: 1,
      serviceType: 'one_on_one'
    },
    {
      id: '2',
      title: 'Group Fitness Class',
      description: 'High-energy group fitness class for all levels.',
      providerId: 'provider-2',
      providerName: 'Mike Johnson',
      price: 25,
      duration: 45, // Changed from string to number
      available: true,
      createdAt: new Date('2023-02-10'),
      isOnline: false,
      location: 'Riverside Gym',
      capacity: 20,
      serviceType: 'group'
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
