import React, { createContext, useState, useContext, useEffect } from 'react';
import { UserRole, Session, SessionEnrollment, Event } from '@/types';
import { supabase } from "@/integrations/supabase/client";

interface DataContextType {
  events: Event[];
  sessions: Session[];
  sessionEnrollments: SessionEnrollment[];
  loading: boolean;
  createSession: (sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Session | null>;
  updateSession: (sessionId: string, updates: Partial<Session>) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  enrollInSession: (sessionId: string, userId: string, userName: string, userEmail: string, userProfileImage?: string) => Promise<void>;
  updateEnrollmentStatus: (enrollmentId: string, status: 'pending' | 'approved' | 'rejected') => Promise<void>;
  cancelEnrollment: (enrollmentId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionEnrollments, setSessionEnrollments] = useState<SessionEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock events
    const mockEvents: Event[] = [
      // When creating mock events, use hostId, hostName, and hostRole instead of creatorId, creatorName, creatorRole
      {
        id: 'event-1',
        title: 'Yoga Session in the Park',
        description: 'Join us for a relaxing yoga session in the park.',
        hostId: 'coach-1', // Previously creatorId
        hostName: 'Sarah Johnson', // Previously creatorName
        hostRole: 'coach' as UserRole, // Previously creatorRole
        startDate: new Date('2023-06-15T10:00:00Z'),
        endDate: new Date('2023-06-15T11:30:00Z'),
        location: 'Central Park',
        isOnline: false,
        price: 0,
        capacity: 20,
        currentAttendees: 8,
        privacy: 'public',
        image: '/images/yoga-park.jpg',
        createdAt: new Date('2023-06-01'),
        attendees: [], // Add missing property
        date: new Date('2023-06-15T10:00:00Z'), // For backward compatibility
      },
      {
        id: 'event-2',
        title: 'Tech Meetup',
        description: 'A meetup for tech enthusiasts to share ideas and network.',
        hostId: 'influencer-1',
        hostName: 'Alex Williams',
        hostRole: 'influencer' as UserRole,
        startDate: new Date('2023-07-20T18:00:00Z'),
        endDate: new Date('2023-07-20T21:00:00Z'),
        location: 'Online',
        isOnline: true,
        meetingUrl: 'https://meet.google.com/techmeetup',
        price: 5,
        capacity: 50,
        currentAttendees: 35,
        privacy: 'public',
        image: '/images/tech-meetup.jpg',
        createdAt: new Date('2023-07-01'),
        attendees: [], // Add missing property
        date: new Date('2023-07-20T18:00:00Z'), // For backward compatibility
      },
      {
        id: 'event-3',
        title: 'Corporate Training',
        description: 'Training session for employees to enhance their skills.',
        hostId: 'company-1',
        hostName: 'Acme Corp',
        hostRole: 'company' as UserRole,
        startDate: new Date('2023-08-10T09:00:00Z'),
        endDate: new Date('2023-08-10T17:00:00Z'),
        location: 'Acme Corp HQ',
        isOnline: false,
        price: 100,
        capacity: 30,
        currentAttendees: 25,
        privacy: 'private',
        image: '/images/corporate-training.jpg',
        createdAt: new Date('2023-08-01'),
        attendees: [], // Add missing property
        date: new Date('2023-08-10T09:00:00Z'), // For backward compatibility
      },
    ];
    setEvents(mockEvents);

    // Mock sessions
    const mockSessions: Session[] = [
      {
        id: 'session-1',
        title: 'One-on-One Coaching',
        description: 'Personalized coaching session to help you achieve your goals.',
        coach: {
          id: 'coach-1',
          name: 'Sarah Johnson',
          role: 'coach',
          profileImage: '/images/coach-sarah.jpg',
        },
        coachId: 'coach-1',
        coachName: 'Sarah Johnson',
        type: 'one_on_one',
        status: 'scheduled',
        startTime: new Date('2023-06-20T14:00:00Z'),
        endTime: new Date('2023-06-20T15:00:00Z'),
        duration: '1 hour',
        price: 50,
        isFree: false,
        currentAttendees: 1,
        location: 'Online',
        isOnline: true,
        meetingUrl: 'https://meet.google.com/coaching',
        createdAt: new Date('2023-06-01'),
        updatedAt: new Date('2023-06-05'),
        sessionType: 'one_on_one',
        available: true,
        isActive: true,
      },
      {
        id: 'session-2',
        title: 'Group Fitness Class',
        description: 'A fun and energetic group fitness class to get you moving.',
        coach: {
          id: 'coach-2',
          name: 'Mike Davis',
          role: 'coach',
          profileImage: '/images/coach-mike.jpg',
        },
        coachId: 'coach-2',
        coachName: 'Mike Davis',
        type: 'group',
        status: 'upcoming',
        startTime: new Date('2023-07-05T17:30:00Z'),
        endTime: new Date('2023-07-05T18:30:00Z'),
        duration: '1 hour',
        price: 20,
        isFree: false,
        capacity: 10,
        currentAttendees: 5,
        location: 'Community Gym',
        isOnline: false,
        createdAt: new Date('2023-07-01'),
        updatedAt: new Date('2023-07-03'),
        sessionType: 'group',
        available: true,
        isActive: true,
      },
    ];
    setSessions(mockSessions);

    // Mock session enrollments
    // For enrollment objects, ensure they include the required fields
    const mockEnrollment: SessionEnrollment = {
      id: 'enrollment-1',
      sessionId: 'session-1',
      userId: 'user-1',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      userProfileImage: '/images/avatar.jpg',
      status: 'approved',
      paymentStatus: 'paid',
      paymentRequired: true,
      amount: 50,
      paymentCompleted: true,
      createdAt: new Date('2023-05-28'),
    };

    const mockEnrollments: SessionEnrollment[] = [
      mockEnrollment,
      {
        id: 'enrollment-2',
        sessionId: 'session-2',
        userId: 'user-2',
        userName: 'Jane Smith',
        userEmail: 'jane@example.com',
        userProfileImage: '/images/avatar-jane.jpg',
        status: 'pending',
        paymentStatus: 'unpaid',
        paymentRequired: true,
        amount: 20,
        paymentCompleted: false,
        createdAt: new Date('2023-07-02'),
      },
    ];
    setSessionEnrollments(mockEnrollments);

    setLoading(false);
  }, []);

  const createSession = async (sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Promise<Session | null> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create coach info object
      const coachInfo = {
        id: sessionData.coachId,
        name: sessionData.coachName,
        role: 'coach' as UserRole, // Add the missing role
        profileImage: sessionData.coach?.profileImage,
      };

      const newSession: Session = {
        id: `session-${Date.now()}`,
        ...sessionData,
        coach: coachInfo,
        createdAt: new Date(),
        updatedAt: new Date(),
        sessionType: sessionData.type,
        available: true,
        currentAttendees: 0,
        isActive: true,
      };

      setSessions(prevSessions => [...prevSessions, newSession]);
      return newSession;
    } catch (error) {
      console.error("Error creating session:", error);
      return null;
    }
  };

  const updateSession = async (sessionId: string, updates: Partial<Session>): Promise<void> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setSessions(prevSessions =>
        prevSessions.map(session =>
          session.id === sessionId ? { ...session, ...updates } : session
        )
      );
    } catch (error) {
      console.error("Error updating session:", error);
    }
  };

  const deleteSession = async (sessionId: string): Promise<void> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setSessions(prevSessions => prevSessions.filter(session => session.id !== sessionId));
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const enrollInSession = async (sessionId: string, userId: string, userName: string, userEmail: string, userProfileImage: string = ''): Promise<void> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const newEnrollment: SessionEnrollment = {
        id: `enrollment-${Date.now()}`,
        sessionId,
        userId,
        userName,
        userEmail,
        userProfileImage,
        status: 'pending',
        paymentStatus: 'unpaid',
        paymentRequired: true,
        amount: 50,
        paymentCompleted: false,
        createdAt: new Date(),
      };

      setSessionEnrollments(prevEnrollments => [...prevEnrollments, newEnrollment]);
    } catch (error) {
      console.error("Error enrolling in session:", error);
    }
  };

  const updateEnrollmentStatus = async (enrollmentId: string, status: 'pending' | 'approved' | 'rejected'): Promise<void> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setSessionEnrollments(prevEnrollments =>
        prevEnrollments.map(e =>
          e.id === enrollmentId ? { ...e, status } : e
        )
      );
    } catch (error) {
      console.error("Error updating enrollment status:", error);
    }
  };

  const cancelEnrollment = async (enrollmentId: string): Promise<void> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setSessionEnrollments(prevEnrollments =>
        prevEnrollments.filter(enrollment => enrollment.id !== enrollmentId)
      );
    } catch (error) {
      console.error("Error cancelling enrollment:", error);
    }
  };

  const value = {
    events,
    sessions,
    sessionEnrollments,
    loading,
    createSession,
    updateSession,
    deleteSession,
    enrollInSession,
    updateEnrollmentStatus,
    cancelEnrollment,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
