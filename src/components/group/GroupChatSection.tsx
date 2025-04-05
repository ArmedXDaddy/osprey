
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Send, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Message, UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface GroupChatSectionProps {
  groupId: string;
}

const GroupChatSection: React.FC<GroupChatSectionProps> = ({ groupId }) => {
  const { currentUser } = useAuth();
  const { sendMessage } = useData();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages from Supabase on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('group_id', groupId)
          .order('created_at', { ascending: true });
          
        if (error) {
          console.error('Error fetching messages:', error);
          return;
        }
        
        if (data) {
          // Transform the data to match the Message type
          const formattedMessages: Message[] = data.map(msg => ({
            id: msg.id,
            groupId: msg.group_id,
            userId: msg.user_id,
            userName: msg.user_name,
            userRole: msg.user_role as UserRole, // Cast to UserRole
            userProfileImage: msg.user_profile_image,
            content: msg.content,
            createdAt: new Date(msg.created_at)
          }));
          
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
    
    // Set up real-time subscription only while actively viewing the chat
    const setupSubscription = () => {
      if (subscribed) return;
      
      const channel = supabase
        .channel('public:messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `group_id=eq.${groupId}`
          },
          (payload) => {
            const newMsg = payload.new as any;
            
            // Transform the data to match the Message type
            const formattedMessage: Message = {
              id: newMsg.id,
              groupId: newMsg.group_id,
              userId: newMsg.user_id,
              userName: newMsg.user_name,
              userRole: newMsg.user_role as UserRole, // Cast to UserRole
              userProfileImage: newMsg.user_profile_image,
              content: newMsg.content,
              createdAt: new Date(newMsg.created_at)
            };
            
            setMessages(prev => [...prev, formattedMessage]);
          }
        )
        .subscribe(() => {
          setSubscribed(true);
          console.log("Subscribed to chat updates");
        });

      return channel;
    };

    const channel = setupSubscription();

    // Clean up subscription when component unmounts or groupId changes
    return () => {
      if (channel) {
        console.log("Unsubscribing from chat updates");
        supabase.removeChannel(channel);
        setSubscribed(false);
      }
    };
  }, [groupId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to send messages",
        variant: "destructive"
      });
      return;
    }
    
    if (!newMessage.trim()) return;
    
    setLoading(true);
    
    try {
      await sendMessage({
        groupId,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        userProfileImage: currentUser.profileImage,
        content: newMessage.trim()
      });
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error sending message",
        description: "Failed to send your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-center">
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24 mx-auto"></div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <AlertCircle className="h-12 w-12 mb-2" />
            <p className="text-center">No messages yet. Be the first to say something!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.userId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`flex max-w-[80%] ${
                  message.userId === currentUser?.id 
                    ? 'flex-row-reverse' 
                    : 'flex-row'
                }`}
              >
                <Avatar className={`h-8 w-8 ${message.userId === currentUser?.id ? 'ml-2' : 'mr-2'}`}>
                  <AvatarImage src={message.userProfileImage} />
                  <AvatarFallback>{message.userName.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div>
                  <div 
                    className={`px-3 py-2 rounded-lg ${
                      message.userId === currentUser?.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}
                  >
                    {message.userId !== currentUser?.id && (
                      <p className="text-xs font-medium">
                        {message.userName}
                        <span 
                          className={`ml-1 px-1 py-0.5 rounded-sm text-[10px] ${
                            message.userRole === 'influencer' ? 'bg-red-500' :
                            message.userRole === 'coach' ? 'bg-teal-500' :
                            message.userRole === 'company' ? 'bg-blue-500' :
                            'bg-purple-500'
                          } text-white`}
                        >
                          {message.userRole}
                        </span>
                      </p>
                    )}
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className={`text-xs text-gray-500 mt-1 ${message.userId === currentUser?.id ? 'text-right' : ''}`}>
                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t p-4">
        <div className="flex items-end space-x-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="min-h-[60px] resize-none flex-1"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!newMessage.trim() || loading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GroupChatSection;
