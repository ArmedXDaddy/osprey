import React, { createContext, useState, useContext, useEffect } from 'react';
import { Post, Event, Group, Service, Session, SessionEnrollment, Message, JoinRequest, Comment } from '@/types';
import { generateMockPosts, generateMockEvents, generateMockGroups, generateMockServices, generateMockSessions, generateMockSessionEnrollments, generateMockMessages, generateMockJoinRequests, generateMockProfiles } from '@/utils/mockData';

interface DataContextType {
  posts: Post[];
  events: Event[];
  groups: Group[];
  services: Service[];
  sessions: Session[];
  sessionEnrollments: SessionEnrollment[];
  messages: Message[];
  joinRequests: JoinRequest[];
  postComments: Record<string, Comment[]>;
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionEnrollments, setSessionEnrollments] = useState<SessionEnrollment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [postComments, setPostComments] = useState<Record<string, Comment[]>>({});
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Initialize with mock data
  useEffect(() => {
    if (isInitialLoad) {
      const mockGroups = generateMockGroups();
      const mockEvents = generateMockEvents();
      const mockServices = generateMockServices();
      const mockPosts = generateMockPosts();
      const mockSessions = generateMockSessions();
      const mockSessionEnrollments = generateMockSessionEnrollments();
      const mockMessages = generateMockMessages();
      const mockJoinRequests = generateMockJoinRequests();
      const mockProfiles = generateMockProfiles();
      
      setGroups(mockGroups);
      setEvents(mockEvents);
      setServices(mockServices);
      setPosts(mockPosts);
      setSessions(mockSessions);
      setSessionEnrollments(mockSessionEnrollments);
      setMessages(mockMessages);
      setJoinRequests(mockJoinRequests);
      
      // Generate mock comments for each post
      const mockCommentsMap: Record<string, Comment[]> = {};
      mockPosts.forEach(post => {
        mockCommentsMap[post.id] = Array(post.commentsCount).fill(0).map((_, index) => {
          const randomProfileIndex = Math.floor(Math.random() * mockProfiles.length);
          const profile = mockProfiles[randomProfileIndex];
          
          return {
            id: `comment-${post.id}-${index}`,
            postId: post.id,
            userId: profile.id,
            userName: profile.name,
            userRole: profile.role,
            userProfileImage: profile.profileImage,
            content: [
              "Great post! Thanks for sharing.",
              "This is really helpful information.",
              "I've been trying this approach and it works wonders!",
              "Could you share more details about this?",
              "Looking forward to more content like this.",
              "I completely agree with your perspective.",
              "This changed my approach to fitness!",
              "Very insightful, thank you."
            ][Math.floor(Math.random() * 8)],
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time within last week
          };
        });
      });
      
      setPostComments(mockCommentsMap);
      setIsInitialLoad(false);
      setLoading(false);
    }
  }, [isInitialLoad]);

  const value: DataContextType = {
    posts,
    events,
    groups,
    services,
    sessions,
    sessionEnrollments,
    messages,
    joinRequests,
    postComments,
    loading,
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
