
// This is a wrapper component for OriginalGroupChatSection
// It fetches the messages from Supabase and handles real-time updates
import React, { useEffect, useState } from 'react';
import { Group, Message, UserRole } from '@/types';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import OriginalGroupChatSection from './OriginalGroupChatSection';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

// Create a new interface for our component
interface GroupChatSectionProps {
  group: Group;
}

// Create a wrapper component that handles fetching messages and real-time updates
const GroupChatSection: React.FC<GroupChatSectionProps> = ({ group }) => {
  const { messages, setMessages } = useData();
  const { currentUser } = useAuth();
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if the current user is a member of the group
  useEffect(() => {
    const checkMembership = async () => {
      if (!currentUser) {
        setIsMember(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('group_members')
          .select('*')
          .eq('group_id', group.id)
          .eq('user_id', currentUser.id);

        if (error) throw error;
        setIsMember(data && data.length > 0);
      } catch (error) {
        console.error("Error checking group membership:", error);
      } finally {
        setLoading(false);
      }
    };

    checkMembership();
  }, [currentUser, group.id]);

  // Fetch messages for this group
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('group_id', group.id)
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (data) {
          const transformedMessages: Message[] = data.map(msg => ({
            id: msg.id,
            content: msg.content,
            userId: msg.user_id,
            userName: msg.user_name,
            userRole: msg.user_role as UserRole, // Fix: Type assertion to UserRole
            userProfileImage: msg.user_profile_image,
            createdAt: new Date(msg.created_at),
            groupId: msg.group_id
          }));

          setMessages(prev => {
            // Filter out existing messages for this group and add the new ones
            const filteredMessages = prev.filter(msg => msg.groupId !== group.id);
            return [...filteredMessages, ...transformedMessages];
          });
        }
      } catch (error) {
        console.error("Error fetching group messages:", error);
      }
    };

    if (isMember) {
      fetchMessages();
    }
  }, [group.id, isMember, setMessages]);

  // Subscribe to real-time updates for messages
  useEffect(() => {
    if (!isMember) return;

    const messagesChannel = supabase.channel('public:messages');
    
    messagesChannel
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `group_id=eq.${group.id}` }, 
        (payload) => {
          console.log('New message:', payload);
          const newMessage = payload.new as any;
          
          const message: Message = {
            id: newMessage.id,
            content: newMessage.content,
            userId: newMessage.user_id,
            userName: newMessage.user_name,
            userRole: newMessage.user_role as UserRole, // Fix: Type assertion to UserRole
            userProfileImage: newMessage.user_profile_image,
            createdAt: new Date(newMessage.created_at),
            groupId: newMessage.group_id
          };
          
          setMessages(prev => [...prev, message]);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [group.id, isMember, setMessages]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isMember) {
    return (
      <Card className="mt-4">
        <CardContent className="p-6 text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Join this group to access the chat</h3>
          <p className="text-sm text-gray-500 mb-4">
            You need to be a member of this group to view and participate in the group chat.
          </p>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </CardContent>
      </Card>
    );
  }

  // Pass the groupId to the original component
  return <OriginalGroupChatSection groupId={group.id} />;
};

export default GroupChatSection;
