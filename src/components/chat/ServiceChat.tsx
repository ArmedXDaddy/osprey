
// This file needs to be fixed because it's using toUserRole, but it should be using asUserRole
import React, { useState, useEffect, useRef } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, SendHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Message, UserRole } from '@/types';
import { asUserRole } from '@/utils/typeHelpers';

interface ServiceChatProps {
  serviceId: string;
  providerId: string;
}

const ServiceChat: React.FC<ServiceChatProps> = ({ serviceId, providerId }) => {
  const { getServiceMessages, sendServiceMessage } = useData();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const serviceMessages = await getServiceMessages(serviceId);
        setMessages(serviceMessages);
      } catch (error) {
        console.error('Error fetching service messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Setup subscription to service messages
    const messagesSub = supabase
      .channel('service_messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'service_messages',
          filter: `service_id=eq.${serviceId}`
        }, 
        (payload) => {
          console.log('New message:', payload);
          const newMsg = payload.new as any;
          
          const message: Message = {
            id: newMsg.id,
            serviceId: newMsg.service_id,
            content: newMsg.content,
            userId: newMsg.user_id,
            userName: newMsg.user_name,
            userProfileImage: newMsg.user_profile_image,
            userRole: asUserRole(newMsg.user_role || 'user'),
            createdAt: new Date(newMsg.created_at)
          };
          
          setMessages(prev => [...prev, message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesSub);
    };
  }, [serviceId, getServiceMessages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentUser) return;
    
    try {
      setSending(true);
      await sendServiceMessage({
        serviceId: serviceId,
        content: newMessage
      });
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const isOwner = currentUser && currentUser.id === providerId;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col h-[400px]">
          <div className="p-3 border-b">
            <h3 className="font-medium">Service Chat</h3>
          </div>
          
          <ScrollArea className="flex-1 p-3" ref={scrollAreaRef}>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((message) => {
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
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No messages yet. Start the conversation!</p>
              </div>
            )}
          </ScrollArea>
          
          <div className="p-3 border-t">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={sending || !currentUser}
              />
              <Button type="submit" size="icon" disabled={sending || !newMessage.trim() || !currentUser}>
                {sending ? 
                  <Loader2 className="h-4 w-4 animate-spin" /> : 
                  <SendHorizontal className="h-4 w-4" />
                }
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceChat;
