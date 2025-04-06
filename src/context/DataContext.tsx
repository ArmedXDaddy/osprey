
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';
import { Group, Message, UserRole, GroupPrivacy, JoinRequest, Event, Service, Booking, SessionEnrollment } from '@/types';

interface DataContextType {
  groups: Group[];
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  createGroup: (group: Omit<Group, 'id' | 'createdAt' | 'creatorId' | 'creatorName' | 'creatorRole' | 'members' | 'memberIds'>) => Promise<Group>;
  updateGroupDetails: (groupId: string, updates: any) => Promise<void>;
  requestToJoinGroup: (groupId: string) => Promise<void>;
  approveJoinRequest: (requestId: string, groupId: string, userId: string) => Promise<void>;
  rejectJoinRequest: (requestId: string) => Promise<void>;
  removeGroupMember: (groupId: string, userId: string) => Promise<void>;
  getGroupRequests: (groupId: string) => Promise<JoinRequest[]>;
  createEvent: (event: Omit<Event, 'id' | 'createdAt' | 'creatorId' | 'creatorName' | 'creatorRole' | 'attendees'>) => Promise<Event>;
  updateEvent: (eventId: string, updates: any) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  
  // Add missing properties for components using DataContext
  services: Service[];
  sessions: any[];
  posts: any[];
  postComments: any[];
  sessionEnrollments: SessionEnrollment[];
  loading: boolean;
  joinRequests: JoinRequest[];
  
  // Missing methods referenced in components
  sendServiceMessage: (serviceId: string, message: string) => Promise<void>;
  getServiceMessages: (serviceId: string) => Promise<any[]>;
  approveEventRequest: (requestId: string, eventId: string, userId: string) => Promise<void>;
  rejectEventRequest: (requestId: string) => Promise<void>;
  handleJoinRequest: (requestId: string, status: string) => Promise<void>;
  sendMessage: (message: any) => Promise<void>;
  bookService: (serviceId: string, data: any) => Promise<void>;
  getUserBookings: (userId: string) => Promise<Booking[]>;
  getServiceById: (serviceId: string) => Promise<Service | null>;
  cancelBooking: (bookingId: string) => Promise<void>;
  getUserSessions: (userId: string) => Promise<any[]>;
  getCoachSessions: (coachId: string) => Promise<any[]>;
  getUserEnrollments: (userId: string) => Promise<any[]>;
  createService: (service: any) => Promise<void>;
  updateService: (serviceId: string, updates: any) => Promise<void>;
  getUserBookingForService: (serviceId: string, userId: string) => Promise<Booking | null>;
  addComment: (postId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  updateComment: (commentId: string, content: string) => Promise<void>;
  createPost: (post: any) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  enrollInSession: (sessionId: string) => Promise<void>;
  cancelEnrollment: (enrollmentId: string) => Promise<void>;
  updateSession: (sessionId: string, updates: any) => Promise<void>;
  updateEnrollmentStatus: (enrollmentId: string, status: string) => Promise<void>;
  createSession: (session: any) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: React.ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [currentUser, setCurrentUser] = useState<Session['user'] | null>(null);
  
  // Initialize the missing states used by other components
  const [services, setServices] = useState<Service[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [postComments, setPostComments] = useState<any[]>([]);
  const [sessionEnrollments, setSessionEnrollments] = useState<SessionEnrollment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchGroups();
      await fetchEvents();
    };

    fetchInitialData();
  }, []);

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*');

      if (error) {
        console.error("Error fetching groups:", error);
        return;
      }

      const transformedGroups: Group[] = data.map(group => ({
        id: group.id,
        name: group.name,
        description: group.description,
        image: group.image,
        privacy: group.privacy as GroupPrivacy,
        price: group.price,
        createdAt: new Date(group.created_at),
        creatorId: group.creator_id,
        creatorName: group.creator_name,
        creatorRole: group.creator_role as UserRole, // Cast to UserRole type
        members: group.members,
        memberIds: group.member_ids || [], // Use empty array if null
        rules: group.rules,
        memberLimit: group.member_limit,
        pendingRequests: group.pending_requests
      }));

      setGroups(transformedGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };
  
  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*');
        
      if (error) {
        console.error("Error fetching events:", error);
        return;
      }
      
      const transformedEvents: Event[] = data.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        image: event.image,
        date: new Date(event.date),
        location: event.location,
        createdAt: new Date(event.created_at),
        creatorId: event.creator_id,
        creatorName: event.creator_name,
        creatorRole: event.creator_role as UserRole, // Cast to UserRole type
        attendees: event.attendees,
        privacy: event.privacy || 'public', // Add missing privacy property
      }));
      
      setEvents(transformedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const joinGroup = async (groupId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to join a group');

    try {
      // Optimistically update the local state
      setGroups(prevGroups =>
        prevGroups.map(group =>
          group.id === groupId
            ? { ...group, members: group.members + 1, memberIds: [...(group.memberIds || []), currentUser.id] }
            : group
        )
      );

      // Update the group_members table
      const { error: insertError } = await supabase
        .from('group_members')
        .insert({ 
          group_id: groupId, 
          user_id: currentUser.id, 
          joined_at: new Date().toISOString() // Convert Date to string
        });

      if (insertError) throw insertError;

      // Update the groups table
      const { error: updateError } = await supabase
        .from('groups')
        .update({ 
          members: supabase.rpc("increment", { val: 1, row_id: groupId, column_name: 'members' }),
        })
        .eq('id', groupId);

      if (updateError) throw updateError;

      // Refetch groups to ensure state is up-to-date
      await fetchGroups();
    } catch (error: any) {
      console.error("Error joining group:", error);
      // Revert the optimistic update if there was an error
      setGroups(prevGroups =>
        prevGroups.map(group =>
          group.id === groupId
            ? {
              ...group,
              members: Math.max(0, group.members - 1),
              memberIds: group.memberIds ? group.memberIds.filter(id => id !== currentUser?.id) : []
            }
            : group
        )
      );
      throw error;
    }
  };

  const leaveGroup = async (groupId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to leave a group');

    try {
      // Optimistically update the local state
      setGroups(prevGroups =>
        prevGroups.map(group =>
          group.id === groupId
            ? {
              ...group,
              members: Math.max(0, group.members - 1),
              memberIds: group.memberIds ? group.memberIds.filter(id => id !== currentUser.id) : []
            }
            : group
        )
      );

      // Delete the member from the group_members table
      const { error: deleteError } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', currentUser.id);

      if (deleteError) throw deleteError;

      // Update the groups table
      const { error: updateError } = await supabase
        .from('groups')
        .update({ 
          members: supabase.rpc("increment", { val: -1, row_id: groupId, column_name: 'members' }),
        })
        .eq('id', groupId);

      if (updateError) throw updateError;

      // Refetch groups to ensure state is up-to-date
      await fetchGroups();
    } catch (error: any) {
      console.error("Error leaving group:", error);
      // Revert the optimistic update if there was an error
      setGroups(prevGroups =>
        prevGroups.map(group =>
          group.id === groupId
            ? { ...group, members: group.members + 1, memberIds: [...(group.memberIds || []), currentUser.id] }
            : group
        )
      );
      throw error;
    }
  };

  const createGroup = async (group: Omit<Group, 'id' | 'createdAt' | 'creatorId' | 'creatorName' | 'creatorRole' | 'members' | 'memberIds'>): Promise<Group> => {
    if (!currentUser) throw new Error('You must be logged in to create a group');

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name, role')
        .eq('id', currentUser.id)
        .single();

      if (profileError) throw profileError;

      // Prepare data for database insert - convert to snake_case and handle date conversion
      const groupData = {
        name: group.name,
        description: group.description,
        image: group.image,
        privacy: group.privacy,
        price: group.price,
        rules: group.rules,
        member_limit: group.memberLimit,
        creator_id: currentUser.id,
        creator_name: profileData?.name,
        creator_role: profileData?.role,
        members: 1,
        created_at: new Date().toISOString(), // Convert Date to string
        pending_requests: 0
      };

      const { data, error } = await supabase
        .from('groups')
        .insert(groupData)
        .select()
        .single();

      if (error) throw error;

      const newGroup: Group = {
        id: data.id,
        name: data.name,
        description: data.description,
        image: data.image,
        privacy: data.privacy as GroupPrivacy,
        price: data.price,
        createdAt: new Date(data.created_at),
        creatorId: data.creator_id,
        creatorName: data.creator_name,
        creatorRole: data.creator_role as UserRole, // Cast to UserRole
        members: data.members,
        memberIds: data.member_ids || [],
        rules: data.rules,
        memberLimit: data.member_limit,
        pendingRequests: data.pending_requests
      };

      setGroups(prevGroups => [...prevGroups, newGroup]);
      return newGroup;
    } catch (error: any) {
      console.error("Error creating group:", error);
      throw error;
    }
  };

  const requestToJoinGroup = async (groupId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to request to join a group');

    try {
      // Optimistically update the local state
      setGroups(prevGroups =>
        prevGroups.map(group =>
          group.id === groupId ? { ...group, pendingRequests: (group.pendingRequests || 0) + 1 } : group
        )
      );

      // Get user profile data for the request
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name, profile_image')
        .eq('id', currentUser.id)
        .single();
        
      if (profileError) throw profileError;

      // Insert a join request into the join_requests table
      const { error: insertError } = await supabase
        .from('join_requests')
        .insert({
          group_id: groupId,
          user_id: currentUser.id,
          user_name: profileData?.name || 'User',
          user_profile_image: profileData?.profile_image,
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      // Increment the pending_requests count in the groups table
      const { error: updateError } = await supabase
        .from('groups')
        .update({ 
          pending_requests: supabase.rpc("increment", { val: 1, row_id: groupId, column_name: 'pending_requests' }) 
        })
        .eq('id', groupId);

      if (updateError) throw updateError;

      // Refetch groups to ensure state is up-to-date
      await fetchGroups();
    } catch (error: any) {
      console.error("Error requesting to join group:", error);
      // Revert the optimistic update if there was an error
      setGroups(prevGroups =>
        prevGroups.map(group =>
          group.id === groupId ? { ...group, pendingRequests: Math.max(0, (group.pendingRequests || 0) - 1) } : group
        )
      );
      throw error;
    }
  };

  const approveJoinRequest = async (requestId: string, groupId: string, userId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to approve a join request');

    try {
      // Optimistically update the local state
      setGroups(prevGroups =>
        prevGroups.map(group => {
          if (group.id === groupId) {
            return {
              ...group,
              members: group.members + 1,
              memberIds: [...(group.memberIds || []), userId],
              pendingRequests: Math.max(0, (group.pendingRequests || 0) - 1)
            };
          }
          return group;
        })
      );

      // Delete the join request from the join_requests table
      const { error: deleteError } = await supabase
        .from('join_requests')
        .delete()
        .eq('id', requestId);

      if (deleteError) throw deleteError;

      // Insert the user into the group_members table
      const { error: insertError } = await supabase
        .from('group_members')
        .insert({ 
          group_id: groupId, 
          user_id: userId, 
          joined_at: new Date().toISOString() 
        });

      if (insertError) throw insertError;

      // Update the groups table - decrement pending_requests and increment members
      const { error: updateError } = await supabase
        .from('groups')
        .update({
          members: supabase.rpc("increment", { val: 1, row_id: groupId, column_name: 'members' }),
          pending_requests: supabase.rpc("increment", { val: -1, row_id: groupId, column_name: 'pending_requests' })
        })
        .eq('id', groupId);

      if (updateError) throw updateError;

      // Refetch groups to ensure state is up-to-date
      await fetchGroups();
    } catch (error: any) {
      console.error("Error approving join request:", error);
      // Revert the optimistic update if there was an error
      setGroups(prevGroups =>
        prevGroups.map(group => {
          if (group.id === groupId) {
            return {
              ...group,
              members: Math.max(0, group.members - 1),
              memberIds: group.memberIds ? group.memberIds.filter(id => id !== userId) : [],
              pendingRequests: (group.pendingRequests || 0) + 1
            };
          }
          return group;
        })
      );
      throw error;
    }
  };

  const rejectJoinRequest = async (requestId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to reject a join request');

    try {
      // Get the group_id from the request before deleting it
      const { data: requestData, error: requestError } = await supabase
        .from('join_requests')
        .select('group_id')
        .eq('id', requestId)
        .single();

      if (requestError) throw requestError;

      const groupId = requestData?.group_id;

      // Optimistically update the local state
      setGroups(prevGroups =>
        prevGroups.map(group => 
          group.id === groupId 
            ? { ...group, pendingRequests: Math.max(0, (group.pendingRequests || 0) - 1) }
            : group
        )
      );

      // Delete the join request from the join_requests table
      const { error: deleteError } = await supabase
        .from('join_requests')
        .delete()
        .eq('id', requestId);

      if (deleteError) throw deleteError;

      // Update the groups table - decrement pending_requests
      const { error: updateError } = await supabase
        .from('groups')
        .update({ 
          pending_requests: supabase.rpc("increment", { val: -1, row_id: groupId, column_name: 'pending_requests' }) 
        })
        .eq('id', groupId);

      if (updateError) throw updateError;

      // Refetch groups to ensure state is up-to-date
      await fetchGroups();
    } catch (error: any) {
      console.error("Error rejecting join request:", error);
      // Revert the optimistic update will be handled on refetch
      await fetchGroups();
      throw error;
    }
  };

  const removeGroupMember = async (groupId: string, userId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to remove a group member');
    
    try {
      // First check if the current user is the creator of the group
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('creator_id')
        .eq('id', groupId)
        .single();
        
      if (groupError) throw groupError;
      
      if (groupData.creator_id !== currentUser.id) {
        throw new Error('Only the group creator can remove members');
      }
      
      // Delete the member from the group_members table
      const { error: deleteError } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);
        
      if (deleteError) throw deleteError;
      
      // Get the current member count
      const { data: groupInfo, error: countError } = await supabase
        .from('groups')
        .select('members')
        .eq('id', groupId)
        .single();
        
      if (countError) throw countError;
      
      // Update the member count in the groups table
      const newMemberCount = Math.max(1, groupInfo.members - 1); // Ensure we don't go below 1
      
      const { error: updateError } = await supabase
        .from('groups')
        .update({ members: newMemberCount })
        .eq('id', groupId);
        
      if (updateError) throw updateError;
      
      // Update local state
      setGroups(prevGroups => 
        prevGroups.map(group => {
          if (group.id === groupId) {
            return {
              ...group,
              members: Math.max(1, group.members - 1),
              memberIds: group.memberIds ? group.memberIds.filter(id => id !== userId) : []
            };
          }
          return group;
        })
      );
      
    } catch (error: any) {
      console.error("Error removing group member:", error);
      throw error;
    }
  };

  const getGroupRequests = async (groupId: string): Promise<JoinRequest[]> => {
    try {
      const { data, error } = await supabase
        .from('join_requests')
        .select('*')
        .eq('group_id', groupId);

      if (error) {
        console.error("Error fetching join requests:", error);
        return [];
      }

      const transformedRequests: JoinRequest[] = data.map(request => ({
        id: request.id,
        groupId: request.group_id,
        userId: request.user_id,
        userName: request.user_name,
        userProfileImage: request.user_profile_image,
        status: request.status,
        createdAt: new Date(request.created_at),
        requestedAt: new Date(request.created_at)
      }));

      return transformedRequests;
    } catch (error) {
      console.error("Error fetching join requests:", error);
      return [];
    }
  };

  const createEvent = async (event: Omit<Event, 'id' | 'createdAt' | 'creatorId' | 'creatorName' | 'creatorRole' | 'attendees'>): Promise<Event> => {
    if (!currentUser) throw new Error('You must be logged in to create an event');
    
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name, role')
        .eq('id', currentUser.id)
        .single();
        
      if (profileError) throw profileError;
      
      // Prepare data for database insert - convert to snake_case and handle date conversion
      const eventData = {
        title: event.title,
        description: event.description,
        image: event.image,
        location: event.location,
        date: event.date.toISOString(), // Convert Date to string
        privacy: event.privacy,
        price: event.price,
        creator_id: currentUser.id,
        creator_name: profileData?.name,
        creator_role: profileData?.role,
        created_at: new Date().toISOString(), // Convert Date to string
        attendees: [],
        pending_requests: 0
      };
      
      const { data, error } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single();
        
      if (error) throw error;
      
      const newEvent: Event = {
        id: data.id,
        title: data.title,
        description: data.description,
        image: data.image,
        date: new Date(data.date),
        location: data.location,
        createdAt: new Date(data.created_at),
        creatorId: data.creator_id,
        creatorName: data.creator_name,
        creatorRole: data.creator_role as UserRole, // Cast to UserRole
        attendees: data.attendees,
        privacy: data.privacy,
      };
      
      setEvents(prevEvents => [...prevEvents, newEvent]);
      return newEvent;
    } catch (error: any) {
      console.error("Error creating event:", error);
      throw error;
    }
  };
  
  const updateEvent = async (eventId: string, updates: any): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to update an event');
    
    try {
      // First check if the current user is the creator of the event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('creator_id')
        .eq('id', eventId)
        .single();
        
      if (eventError) throw eventError;
      
      if (eventData.creator_id !== currentUser.id) {
        throw new Error('Only the event creator can update event details');
      }
      
      // Prepare the update object with the correct field names for Supabase
      const updateData: any = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.image !== undefined) updateData.image = updates.image;
      if (updates.date !== undefined) updateData.date = updates.date instanceof Date ? updates.date.toISOString() : updates.date;
      if (updates.location !== undefined) updateData.location = updates.location;
      if (updates.privacy !== undefined) updateData.privacy = updates.privacy;
      if (updates.price !== undefined) updateData.price = updates.price;
      
      // Update the event details
      const { error: updateError } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', eventId);
        
      if (updateError) throw updateError;
      
      // Update local state
      setEvents(prevEvents => 
        prevEvents.map(event => {
          if (event.id === eventId) {
            return {
              ...event,
              title: updates.title !== undefined ? updates.title : event.title,
              description: updates.description !== undefined ? updates.description : event.description,
              image: updates.image !== undefined ? updates.image : event.image,
              date: updates.date !== undefined ? (updates.date instanceof Date ? updates.date : new Date(updates.date)) : event.date,
              location: updates.location !== undefined ? updates.location : event.location,
              privacy: updates.privacy !== undefined ? updates.privacy : event.privacy,
              price: updates.price !== undefined ? updates.price : event.price
            };
          }
          return event;
        })
      );
      
    } catch (error: any) {
      console.error("Error updating event details:", error);
      throw error;
    }
  };
  
  const deleteEvent = async (eventId: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to delete an event');
    
    try {
      // First check if the current user is the creator of the event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('creator_id')
        .eq('id', eventId)
        .single();
        
      if (eventError) throw eventError;
      
      if (eventData.creator_id !== currentUser.id) {
        throw new Error('Only the event creator can delete the event');
      }
      
      // Delete the event
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);
        
      if (deleteError) throw deleteError;
      
      // Update local state
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      
    } catch (error: any) {
      console.error("Error deleting event:", error);
      throw error;
    }
  };

  const updateGroupDetails = async (groupId: string, updates: any): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to update a group');
    
    try {
      // First check if the current user is the creator of the group
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('creator_id')
        .eq('id', groupId)
        .single();
        
      if (groupError) throw groupError;
      
      if (groupData.creator_id !== currentUser.id) {
        throw new Error('Only the group creator can update group details');
      }
      
      // Prepare the update object with the correct field names for Supabase
      const updateData: any = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.image !== undefined) updateData.image = updates.image;
      if (updates.privacy !== undefined) updateData.privacy = updates.privacy;
      if (updates.price !== undefined) updateData.price = updates.price;
      if (updates.rules !== undefined) updateData.rules = updates.rules;
      if (updates.memberLimit !== undefined) updateData.member_limit = updates.memberLimit;
      
      // Update the group details
      const { error: updateError } = await supabase
        .from('groups')
        .update(updateData)
        .eq('id', groupId);
        
      if (updateError) throw updateError;
      
      // Update local state
      setGroups(prevGroups => 
        prevGroups.map(group => {
          if (group.id === groupId) {
            return {
              ...group,
              name: updates.name !== undefined ? updates.name : group.name,
              description: updates.description !== undefined ? updates.description : group.description,
              image: updates.image !== undefined ? updates.image : group.image,
              privacy: updates.privacy !== undefined ? updates.privacy : group.privacy,
              price: updates.price !== undefined ? updates.price : group.price,
              rules: updates.rules !== undefined ? updates.rules : group.rules,
              memberLimit: updates.memberLimit !== undefined ? updates.memberLimit : group.memberLimit
            };
          }
          return group;
        })
      );
      
    } catch (error: any) {
      console.error("Error updating group details:", error);
      throw error;
    }
  };

  // Stub implementations for the missing methods to fix TypeScript errors
  const sendServiceMessage = async (serviceId: string, message: string) => {
    console.log("Stub method: sendServiceMessage", serviceId, message);
  };

  const getServiceMessages = async (serviceId: string) => {
    console.log("Stub method: getServiceMessages", serviceId);
    return [];
  };

  const approveEventRequest = async (requestId: string, eventId: string, userId: string) => {
    console.log("Stub method: approveEventRequest", requestId, eventId, userId);
  };

  const rejectEventRequest = async (requestId: string) => {
    console.log("Stub method: rejectEventRequest", requestId);
  };

  const handleJoinRequest = async (requestId: string, status: string) => {
    console.log("Stub method: handleJoinRequest", requestId, status);
  };

  const sendMessage = async (message: any) => {
    console.log("Stub method: sendMessage", message);
  };

  const bookService = async (serviceId: string, data: any) => {
    console.log("Stub method: bookService", serviceId, data);
  };

  const getUserBookings = async (userId: string): Promise<Booking[]> => {
    console.log("Stub method: getUserBookings", userId);
    return [];
  };

  const getServiceById = async (serviceId: string): Promise<Service | null> => {
    console.log("Stub method: getServiceById", serviceId);
    return null;
  };

  const cancelBooking = async (bookingId: string) => {
    console.log("Stub method: cancelBooking", bookingId);
  };

  const getUserSessions = async (userId: string) => {
    console.log("Stub method: getUserSessions", userId);
    return [];
  };

  const getCoachSessions = async (coachId: string) => {
    console.log("Stub method: getCoachSessions", coachId);
    return [];
  };

  const getUserEnrollments = async (userId: string) => {
    console.log("Stub method: getUserEnrollments", userId);
    return [];
  };

  const createService = async (service: any) => {
    console.log("Stub method: createService", service);
  };

  const updateService = async (serviceId: string, updates: any) => {
    console.log("Stub method: updateService", serviceId, updates);
  };

  const getUserBookingForService = async (serviceId: string, userId: string): Promise<Booking | null> => {
    console.log("Stub method: getUserBookingForService", serviceId, userId);
    return null;
  };

  const addComment = async (postId: string, content: string) => {
    console.log("Stub method: addComment", postId, content);
  };

  const deleteComment = async (commentId: string) => {
    console.log("Stub method: deleteComment", commentId);
  };

  const updateComment = async (commentId: string, content: string) => {
    console.log("Stub method: updateComment", commentId, content);
  };

  const createPost = async (post: any) => {
    console.log("Stub method: createPost", post);
  };

  const likePost = async (postId: string) => {
    console.log("Stub method: likePost", postId);
  };

  const unlikePost = async (postId: string) => {
    console.log("Stub method: unlikePost", postId);
  };

  const enrollInSession = async (sessionId: string) => {
    console.log("Stub method: enrollInSession", sessionId);
  };

  const cancelEnrollment = async (enrollmentId: string) => {
    console.log("Stub method: cancelEnrollment", enrollmentId);
  };

  const updateSession = async (sessionId: string, updates: any) => {
    console.log("Stub method: updateSession", sessionId, updates);
  };

  const updateEnrollmentStatus = async (enrollmentId: string, status: string) => {
    console.log("Stub method: updateEnrollmentStatus", enrollmentId, status);
  };

  const createSession = async (session: any) => {
    console.log("Stub method: createSession", session);
  };

  const value: DataContextType = {
    groups,
    setGroups,
    messages,
    setMessages,
    events,
    setEvents,
    joinGroup,
    leaveGroup,
    createGroup,
    updateGroupDetails,
    requestToJoinGroup,
    approveJoinRequest,
    rejectJoinRequest,
    removeGroupMember,
    getGroupRequests,
    createEvent,
    updateEvent,
    deleteEvent,
    
    // Added missing properties and methods
    services,
    sessions,
    posts,
    postComments,
    sessionEnrollments,
    loading,
    joinRequests,
    sendServiceMessage,
    getServiceMessages,
    approveEventRequest,
    rejectEventRequest,
    handleJoinRequest,
    sendMessage,
    bookService,
    getUserBookings,
    getServiceById,
    cancelBooking,
    getUserSessions,
    getCoachSessions,
    getUserEnrollments,
    createService,
    updateService,
    getUserBookingForService,
    addComment,
    deleteComment,
    updateComment,
    createPost,
    likePost,
    unlikePost,
    enrollInSession,
    cancelEnrollment,
    updateSession,
    updateEnrollmentStatus,
    createSession
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
