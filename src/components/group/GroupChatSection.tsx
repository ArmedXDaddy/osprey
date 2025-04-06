
import React, { useState, useEffect, useRef } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { Send } from 'lucide-react';
import { Group, Message } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface GroupChatSectionProps {
  group: Group;
}

const GroupChatSection: React.FC<GroupChatSectionProps> = ({ group }) => {
  const { messages, sendMessage } = useData();
  const { currentUser } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch group messages on component mount
  useEffect(() => {
    const fetchGroupMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('group_id', group.id)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        if (data) {
          const formattedMessages: Message[] = data.map(msg => ({
            id: msg.id,
            groupId: msg.group_id,
            userId: msg.user_id,
            userName: msg.user_name,
            userRole: msg.user_role,
            userProfileImage: msg.user_profile_image,
            content: msg.content,
            createdAt: new Date(msg.created_at)
          }));
          
          setChatMessages(formattedMessages);
        }
      } catch (error) {
        console.error("Error fetching group messages:", error);
      }
    };
    
    fetchGroupMessages();
    
    // Set up real-time updates for messages
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `group_id=eq.${group.id}` },
        (payload) => {
          const newMsg = payload.new as any;
          const message: Message = {
            id: newMsg.id,
            groupId: newMsg.group_id,
            userId: newMsg.user_id,
            userName: newMsg.user_name,
            userRole: newMsg.user_role,
            userProfileImage: newMsg.user_profile_image,
            content: newMsg.content,
            createdAt: new Date(newMsg.created_at)
          };
          
          setChatMessages(prev => [...prev, message]);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [group.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentUser) return;
    
    try {
      setIsSubmitting(true);
      await sendMessage({
        groupId: group.id,
        content: newMessage
      });
      setNewMessage('');
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {chatMessages.length > 0 ? (
          <div className="space-y-4">
            {chatMessages.map((message) => {
              const isCurrentUser = currentUser?.id === message.userId;
              
              return (
                <div 
                  key={message.id} 
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} max-w-[80%] gap-2`}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.userProfileImage} />
                      <AvatarFallback>{message.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} items-center gap-2 mb-1`}>
                        <span className="text-sm font-medium">{message.userName}</span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <div 
                        className={`p-3 rounded-lg ${
                          isCurrentUser 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        )}
      </ScrollArea>
      
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={isSubmitting}
          />
          <Button type="submit" size="icon" disabled={isSubmitting}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default GroupChatSection;
