import React, { createContext, useState, useEffect, useContext } from 'react';
import { Post, Event, Group, Service, Session, SessionEnrollment, Message, JoinRequest, User, ServiceType } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { generateMockPosts, generateMockEvents, generateMockGroups, generateMockServices, generateMockSessions, generateMockSessionEnrollments, generateMockMessages, generateMockJoinRequests } from '@/utils/mockData';

interface DataContextType {
  posts: Post[];
  events: Event[];
  groups: Group[];
  services: Service[];
  sessions: Session[];
  sessionEnrollments: SessionEnrollment[];
  messages: Message[];
  joinRequests: JoinRequest[];
  loading: boolean;
  error: string | null;
  createPost: (content: string, image?: string) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  createEvent: (eventData: Omit<Event, 'id' | 'createdAt' | 'creatorId' | 'creatorName' | 'creatorRole'>) => Promise<Event>;
  joinEvent: (eventId: string) => Promise<void>;
  leaveEvent: (eventId: string) => Promise<void>;
  requestToJoinEvent: (eventId: string) => Promise<void>;
  approveEventRequest: (requestId: string, eventId: string, userId: string) => Promise<void>;
  rejectEventRequest: (requestId: string) => Promise<void>;
  getEventRequests: (eventId: string) => Promise<JoinRequest[]>;
  handleEventJoinRequest: (eventId: string, userId: string, status: 'approved' | 'rejected') => Promise<void>;
  createGroup: (groupData: Omit<Group, 'id' | 'createdAt' | 'creatorId' | 'creatorName' | 'creatorRole' | 'members'>) => Promise<Group>;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  requestToJoinGroup: (groupId: string) => Promise<void>;
  approveGroupRequest: (requestId: string, groupId: string, userId: string) => Promise<void>;
  rejectGroupRequest: (requestId: string) => Promise<void>;
  getGroupRequests: (groupId: string) => Promise<JoinRequest[]>;
  handleJoinRequest: (groupId: string, userId: string, status: 'approved' | 'rejected') => Promise<void>;
  removeGroupMember: (groupId: string, userId: string) => Promise<void>;
  updateGroupDetails: (groupId: string, updates: Partial<Group>) => Promise<void>;
  createSession: (sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'coachId' | 'coachName'>) => Promise<Session>;
  enrollInSession: (sessionId: string) => Promise<void>;
  cancelEnrollment: (enrollmentId: string) => Promise<void>;
  approveEnrollment: (enrollmentId: string) => Promise<void>;
  rejectEnrollment: (enrollmentId: string) => Promise<void>;
  getUserSessions: (userId: string) => Promise<Session[]>;
  getCoachSessions: (coachId: string) => Promise<Session[]>;
  getUserEnrollments: (userId: string) => Promise<SessionEnrollment[]>;
  updateSession: (sessionId: string, updates: Partial<Session>) => Promise<void>;
  updateEnrollmentStatus: (enrollmentId: string, status: 'pending' | 'approved' | 'rejected' | 'completed') => Promise<void>;
  sendMessage: (messageData: Omit<Message, 'id' | 'createdAt' | 'userName' | 'userRole' | 'userProfileImage'>) => Promise<void>;
  getServiceById: (serviceId: string) => Promise<Service | null>;
  bookService: (serviceId: string, notes?: string, preferredTime?: Date) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
  getUserBookings: (userId: string) => Promise<any[]>;
  getServiceBookings: (serviceId: string) => Promise<any[]>;
  createService: (serviceData: Omit<Service, 'id' | 'createdAt'>) => Promise<Service>;
  updateService: (serviceId: string, updates: Partial<Service>) => Promise<void>;
  deleteService: (serviceId: string) => Promise<void>;
  approveBooking: (bookingId: string) => Promise<void>;
  sendServiceMessage: (messageData: Omit<Message, 'id' | 'createdAt' | 'userName' | 'userRole' | 'userProfileImage'>) => Promise<void>;
  getServiceMessages: (serviceId: string) => Promise<Message[]>;
  getUserBookingForService: (serviceId: string, userId: string) => Promise<any | null>;
  fetchUserServices: (userId: string) => Promise<Service[]>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionEnrollments, setSessionEnrollments] = useState<SessionEnrollment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mockServices, setMockServices] = useState<Service[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (mockServices.length === 0) {
      const generatedMockServices = generateMockServices();
      setMockServices(generatedMockServices);
    }
  }, [mockServices.length]);

  useEffect(() => {
    const loadMockData = async () => {
      try {
        setLoading(true);
        setPosts(mockPosts);
        setEvents(mockEvents);
        setGroups(mockGroups);
        setSessions(mockSessions);
        setSessionEnrollments(mockSessionEnrollments);
        setMessages(mockMessages);
        setJoinRequests(mockJoinRequests);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadMockData();
  }, []);

  useEffect(() => {
    const fetchAllServices = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        if (data) {
          const servicesData: Service[] = data.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            providerId: item.coach_id,
            providerName: item.coach_name,
            price: item.price,
            duration: item.duration,
            available: item.is_active,
            createdAt: new Date(item.created_at),
            isOnline: item.is_online,
            location: item.location,
            capacity: item.capacity,
            serviceType: item.service_type as ServiceType,
            coverImage: item.cover_image,
            meetingUrl: item.meeting_url,
          }));
          
          setServices(servicesData);
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching all services:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchAllServices();
  }, []);

  const createPost = async (content: string, image?: string) => {
    if (!currentUser) throw new Error('You must be logged in to create a post');

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .insert({
          content,
          image,
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          userProfileImage: currentUser.profileImage,
          likes: 0,
          comments: 0,
        })
        .select()
        .single();

      if (error) throw error;

      const newPost: Post = {
        id: data.id,
        userId: data.userId,
        userName: data.userName,
        userRole: data.userRole,
        userProfileImage: data.userProfileImage,
        content: data.content,
        image: data.image,
        likes: data.likes,
        comments: data.comments,
        createdAt: new Date(data.createdAt),
      };

      setPosts(prevPosts => [newPost, ...prevPosts]);
    } catch (err: any) {
      console.error("Error creating post:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const likePost = async (postId: string) => {
    if (!currentUser) throw new Error('You must be logged in to like a post');

    try {
      setLoading(true);
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? { ...post, likes: post.likes + 1 } : post
        )
      );

      const { error } = await supabase
        .from('posts')
        .update({ likes: () => 'likes + 1' })
        .eq('id', postId);

      if (error) {
        throw error;
      }
    } catch (err: any) {
      console.error("Error liking post:", err);
      setError(err.message);
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? { ...post, likes: post.likes - 1 } : post
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const unlikePost = async (postId: string) => {
    if (!currentUser) throw new Error('You must be logged in to unlike a post');

    try {
      setLoading(true);
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? { ...post, likes: post.likes - 1 } : post
        )
      );

      const { error } = await supabase
        .from('posts')
        .update({ likes: () => 'likes - 1' })
        .eq('id', postId);

      if (error) {
        throw error;
      }
    } catch (err: any) {
      console.error("Error unliking post:", err);
      setError(err.message);
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? { ...post, likes: post.likes + 1 } : post
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'creatorId' | 'creatorName' | 'creatorRole'>): Promise<Event> => {
    if (!currentUser) throw new Error('You must be logged in to create an event');

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: eventData.title,
          description: eventData.description,
          location: eventData.location,
          date: eventData.date.toISOString(),
          image: eventData.image,
          attendees: [],
          privacy: eventData.privacy,
          price: eventData.price,
          creatorId: currentUser.id,
          creatorName: currentUser.name,
          creatorRole: currentUser.role,
        })
        .select()
        .single();

      if (error) throw error;

      const newEvent: Event = {
        id: data.id,
        title: data.title,
        description: data.description,
        creatorId: data.creatorId,
        creatorName: data.creatorName,
        creatorRole: data.creatorRole,
        location: data.location,
        date: new Date(data.date),
        image: data.image,
        attendees: data.attendees,
        privacy: data.privacy,
        price: data.price,
        createdAt: new Date(data.createdAt),
      };

      setEvents(prevEvents => [newEvent, ...prevEvents]);
      return newEvent;
    } catch (err: any) {
      console.error("Error creating event:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const joinEvent = async (eventId: string) => {
    if (!currentUser) throw new Error('You must be logged in to join an event');

    try {
      setLoading(true);

      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('attendees')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      const currentAttendees = eventData?.attendees || [];

      if (currentAttendees.includes(currentUser.id)) {
        console.log('User already attending event');
        return;
      }

      const updatedAttendees = [...currentAttendees, currentUser.id];

      const { error } = await supabase
        .from('events')
        .update({ attendees: updatedAttendees })
        .eq('id', eventId);

      if (error) throw error;

      setEvents(prevEvents =>
        prevEvents.map(event =>
          event.id === eventId ? { ...event, attendees: updatedAttendees } : event
        )
      );
    } catch (err: any) {
      console.error("Error joining event:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const leaveEvent = async (eventId: string) => {
    if (!currentUser) throw new Error('You must be logged in to leave an event');

    try {
      setLoading(true);

      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('attendees')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      const currentAttendees = eventData?.attendees || [];

      if (!currentAttendees.includes(currentUser.id)) {
        console.log('User not attending event');
        return;
      }

      const updatedAttendees = currentAttendees.filter(attendeeId => attendeeId !== currentUser.id);

      const { error } = await supabase
        .from('events')
        .update({ attendees: updatedAttendees })
        .eq('id', eventId);

      if (error) throw error;

      setEvents(prevEvents =>
        prevEvents.map(event =>
          event.id === eventId ? { ...event, attendees: updatedAttendees } : event
        )
      );
    } catch (err: any) {
      console.error("Error leaving event:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const requestToJoinEvent = async (eventId: string) => {
    if (!currentUser) throw new Error('You must be logged in to request to join an event');

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('join_requests')
        .insert({
          eventId,
          userId: currentUser.id,
          userName: currentUser.name,
          userProfileImage: currentUser.profileImage,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      const newJoinRequest: JoinRequest = {
        id: data.id,
        eventId: data.eventId,
        userId: data.userId,
        userName: data.userName,
        userProfileImage: data.userProfileImage,
        status: data.status,
        createdAt: new Date(data.createdAt),
      };

      setJoinRequests(prevRequests => [newJoinRequest, ...prevRequests]);
    } catch (err: any) {
      console.error("Error requesting to join event:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const approveEventRequest = async (requestId: string, eventId: string, userId: string) => {
    try {
      setLoading(true);

      const { error: updateError } = await supabase
        .from('join_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('attendees')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      const currentAttendees = eventData?.attendees || [];

      if (currentAttendees.includes(userId)) {
        console.log('User already attending event');
        return;
      }

      const updatedAttendees = [...currentAttendees, userId];

      const { error: updateEventError } = await supabase
        .from('events')
        .update({ attendees: updatedAttendees })
        .eq('id', eventId);

      if (updateEventError) throw updateEventError;

      setEvents(prevEvents =>
        prevEvents.map(event =>
          event.id === eventId ? { ...event, attendees: updatedAttendees } : event
        )
      );

      setJoinRequests(prevRequests =>
        prevRequests.map(request =>
          request.id === requestId ? { ...request, status: 'approved' } : request
        )
      );
    } catch (err: any) {
      console.error("Error approving event request:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const rejectEventRequest = async (requestId: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('join_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      setJoinRequests(prevRequests =>
        prevRequests.map(request =>
          request.id === requestId ? { ...request, status: 'rejected' } : request
        )
      );
    } catch (err: any) {
      console.error("Error rejecting event request:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getEventRequests = async (eventId: string): Promise<JoinRequest[]> => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('join_requests')
        .select('*')
        .eq('eventId', eventId);

      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        eventId: item.eventId,
        userId: item.userId,
        userName: item.userName,
        userProfileImage: item.userProfileImage,
        status: item.status,
        createdAt: new Date(item.createdAt),
      }));
    } catch (err: any) {
      console.error("Error fetching event requests:", err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleEventJoinRequest = async (eventId: string, userId: string, status: 'approved' | 'rejected') => {
    if (!currentUser) throw new Error('You must be logged in to handle a join request');
    
    try {
      setLoading(true);
      
      const { data: requestData, error: requestError } = await supabase
        .from('join_requests')
        .select('id')
        .eq('eventId', eventId)
        .eq('userId', userId)
        .single();
        
      if (requestError) throw requestError;
      
      if (!requestData) {
        console.log('Join request not found');
        return;
      }
      
      if (status === 'approved') {
        await approveEventRequest(requestData.id, eventId, userId);
      } else {
        await rejectEventRequest(requestData.id);
      }
      
    } catch (err: any) {
      console.error("Error handling join request:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (groupData: Omit<Group, 'id' | 'createdAt' | 'creatorId' | 'creatorName' | 'creatorRole' | 'members'>): Promise<Group> => {
    if (!currentUser) throw new Error('You must be logged in to create a group');

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('groups')
        .insert({
          name: groupData.name,
          description: groupData.description,
          image: groupData.image,
          privacy: groupData.privacy,
          price: groupData.price,
          creatorId: currentUser.id,
          creatorName: currentUser.name,
          creatorRole: currentUser.role,
          members: 1,
          memberIds: [currentUser.id],
          rules: groupData.rules,
          memberLimit: groupData.memberLimit,
        })
        .select()
        .single();

      if (error) throw error;

      const newGroup: Group = {
        id: data.id,
        name: data.name,
        description: data.description,
        creatorId: data.creatorId,
        creatorName: data.creatorName,
        creatorRole: data.creatorRole,
        members: data.members,
        memberIds: data.memberIds,
        image: data.image,
        privacy: data.privacy,
        price: data.price,
        createdAt: new Date(data.createdAt),
        rules: data.rules,
        memberLimit: data.memberLimit,
      };

      setGroups(prevGroups => [newGroup, ...prevGroups]);
      return newGroup;
    } catch (err: any) {
      console.error("Error creating group:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async (groupId: string) => {
    if (!currentUser) throw new Error('You must be logged in to join a group');

    try {
      setLoading(true);

      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('members, memberIds, memberLimit')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      const currentMembers = groupData?.members || 0;
      const currentMemberIds = groupData?.memberIds || [];
      const memberLimit = groupData?.memberLimit || null;

      if (memberLimit !== null && currentMembers >= memberLimit) {
        throw new Error('Group is full');
      }

      if (currentMemberIds.includes(currentUser.id)) {
        console.log('User already a member of the group');
        return;
      }

      const updatedMemberIds = [...currentMemberIds, currentUser.id];

      const updatedMembers = currentMembers + 1;

      const { error } = await supabase
        .from('groups')
        .update({ members: updatedMembers, memberIds: updatedMemberIds })
        .eq('id', groupId);

      if (error) throw error;

      setGroups(prevGroups =>
        prevGroups.map(group =>
          group.id === groupId ? { ...group, members: updatedMembers, memberIds: updatedMemberIds } : group
        )
      );
    } catch (err: any) {
      console.error("Error joining group:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const leaveGroup = async (groupId: string) => {
    if (!currentUser) throw new Error('You must be logged in to leave a group');

    try {
      setLoading(true);

      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('members, memberIds')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      const currentMembers = groupData?.members || 0;
      const currentMemberIds = groupData?.memberIds || [];

      if (!currentMemberIds.includes(currentUser.id)) {
        console.log('User not a member of the group');
        return;
      }

      const updatedMemberIds = currentMemberIds.filter(memberId => memberId !== currentUser.id);

      const updatedMembers = currentMembers - 1;

      const { error } = await supabase
        .from('groups')
        .update({ members: updatedMembers, memberIds: updatedMemberIds })
        .eq('id', groupId);

      if (error) throw error;

      setGroups(prevGroups =>
        prevGroups.map(group =>
          group.id === groupId ? { ...group, members: updatedMembers, memberIds: updatedMemberIds } : group
        )
      );
    } catch (err: any) {
      console.error("Error leaving group:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const requestToJoinGroup = async (groupId: string) => {
    if (!currentUser) throw new Error('You must be logged in to request to join a group');

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('join_requests')
        .insert({
          groupId,
          userId: currentUser.id,
          userName: currentUser.name,
          userProfileImage: currentUser.profileImage,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      const newJoinRequest: JoinRequest = {
        id: data.id,
        groupId: data.groupId,
        userId: data.userId,
        userName: data.userName,
        userProfileImage: data.userProfileImage,
        status: data.status,
        createdAt: new Date(data.createdAt),
      };

      setJoinRequests(prevRequests => [newJoinRequest, ...prevRequests]);
    } catch (err: any) {
      console.error("Error requesting to join group:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const approveGroupRequest = async (requestId: string, groupId: string, userId: string) => {
    try {
      setLoading(true);

      const { error: updateError } = await supabase
        .from('join_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('members, memberIds, memberLimit')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      const currentMembers = groupData?.members || 0;
      const currentMemberIds = groupData?.memberIds || [];
      const memberLimit = groupData?.memberLimit || null;

      if (memberLimit !== null && currentMembers >= memberLimit) {
        throw new Error('Group is full');
      }

      if (currentMemberIds.includes(userId)) {
        console.log('User already a member of the group');
        return;
      }

      const updatedMemberIds = [...currentMemberIds, userId];

      const updatedMembers = currentMembers + 1;

      const { error: updateGroupError } = await supabase
        .from('groups')
        .update({ members: updatedMembers, memberIds: updatedMemberIds })
        .eq('id', groupId);

      if (updateGroupError) throw updateGroupError;

      setGroups(prevGroups =>
        prevGroups.map(group =>
          group.id === groupId ? { ...group, members: updatedMembers, memberIds: updatedMemberIds } : group
        )
      );

      setJoinRequests(prevRequests =>
        prevRequests.map(request =>
          request.id === requestId ? { ...request, status: 'approved' } : request
        )
      );
    } catch (err: any) {
      console.error("Error approving group request:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const rejectGroupRequest = async (requestId: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('join_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      setJoinRequests(prevRequests =>
        prevRequests.map(request =>
          request.id === requestId ? { ...request, status: 'rejected' } : request
        )
      );
    } catch (err: any) {
      console.error("Error rejecting group request:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getGroupRequests = async (groupId: string): Promise<JoinRequest[]> => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('join_requests')
        .select('*')
        .eq('groupId', groupId);

      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        groupId: item.groupId,
        userId: item.userId,
        userName: item.userName,
        userProfileImage: item.userProfileImage,
        status: item.status,
        createdAt: new Date(item.created_at),
      }));
    } catch (err: any) {
      console.error("Error fetching group requests:", err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async (groupId: string, userId: string, status: 'approved' | 'rejected') => {
    if (!currentUser) throw new Error('You must be logged in to handle a join request');
    
    try {
      setLoading(true);
      
      const { data: requestData, error: requestError } = await supabase
        .from('join_requests')
        .select('id')
        .eq('groupId', groupId)
        .eq('userId', userId)
        .single();
        
      if (requestError) throw requestError;
      
      if (!requestData) {
        console.log('Join request not found');
        return;
      }
      
      if (status === 'approved') {
        await approveGroupRequest(requestData.id, groupId, userId);
      } else {
        await rejectGroupRequest(requestData.id);
      }
      
    } catch (err: any) {
      console.error("Error handling join request:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeGroupMember = async (groupId: string, userId: string) => {
    if (!currentUser) throw new Error('You must be logged in to remove a group member');
    
    try {
      setLoading(true);
      
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('members, memberIds, creatorId')
        .eq('id', groupId)
        .single();
        
      if (groupError) throw groupError;
      
      if (groupData.creatorId !== currentUser.id) {
        throw new Error('Only the group creator can remove members');
      }
      
      const currentMembers = groupData?.members || 0;
      const currentMemberIds = groupData?.memberIds || [];
      
      if (!currentMemberIds.includes(userId)) {
        console.log('User not a member of the group');
        return;
      }
      
      const updatedMemberIds = currentMemberIds.filter(memberId => memberId !== userId);
      
      const updatedMembers = currentMembers - 1;
      
      const { error } = await supabase
        .from('groups')
        .update({ members: updatedMembers, memberIds: updatedMemberIds })
        .eq('id', groupId);
        
      if (error) throw error;
      
      setGroups(prevGroups =>
        prevGroups.map(group =>
          group.id === groupId ? { ...group, members: updatedMembers, memberIds: updatedMemberIds } : group
        )
      );
    } catch (err: any) {
      console.error("Error removing group member:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateGroupDetails = async (groupId: string, updates: Partial<Group>) => {
    if (!currentUser) throw new Error('You must be logged in to update a group');
    
    try {
      setLoading(true);
      
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('creatorId')
        .eq('id', groupId)
        .single();
        
      if (groupError) throw groupError;
      
      if (groupData.creatorId !== currentUser.id) {
        throw new Error('Only the group creator can update the group');
      }
      
      const { error } = await supabase
        .from('groups')
        .update(updates)
        .eq('id', groupId);
        
      if (error) throw error;
      
      setGroups(prevGroups =>
        prevGroups.map(group =>
          group.id === groupId ? { ...group, ...updates } : group
        )
      );
    } catch (err: any) {
      console.error("Error updating group details:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DataContext.Provider
      value={{
        posts,
        events,
        groups,
        services,
        sessions,
        sessionEnrollments,
        messages,
        joinRequests,
        loading,
        error,
        createPost,
        likePost,
        unlikePost,
        createEvent,
        joinEvent,
        leaveEvent,
        requestToJoinEvent,
        approveEventRequest,
        rejectEventRequest,
        getEventRequests,
        handleEventJoinRequest,
        createGroup,
        joinGroup,
        leaveGroup,
        requestToJoinGroup,
        approveGroupRequest,
        rejectGroupRequest,
        getGroupRequests,
        handleJoinRequest,
        removeGroupMember,
        updateGroupDetails,
        createSession,
        enrollInSession,
        cancelEnrollment,
        approveEnrollment,
        rejectEnrollment,
        getUserSessions,
        getCoachSessions,
        getUserEnrollments,
        updateSession,
        updateEnrollmentStatus,
        sendMessage,
        getServiceById,
        bookService,
        cancelBooking,
        getUserBookings,
        getServiceBookings,
        createService,
        updateService,
        deleteService,
        approveBooking,
        sendServiceMessage,
        getServiceMessages,
        getUserBookingForService,
        fetchUserServices,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
