import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { Message } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface ServiceChatProps {
  serviceId: string;
  userId: string;
  isProvider: boolean;
}

const ServiceChat: React.FC<ServiceChatProps> = ({ serviceId, userId, isProvider }) => {
  const { currentUser } = useAuth();
  const { sendServiceMessage, getServiceMessages } = useData();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const messagesData = await getServiceMessages(serviceId);
        setMessages(messagesData);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, [serviceId, getServiceMessages]);
  
  useEffect(() => {
    const channel = supabase
      .channel('public:service_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'service_messages',
        filter: `service_id=eq.${serviceId}`,
      }, (payload) => {
        console.log('New message received:', payload);
        const newMsg = payload.new as any;
        
        const message: Message = {
          id: newMsg.id,
          content: newMsg.content,
          userId: newMsg.user_id,
          userName: newMsg.user_name,
          userProfileImage: newMsg.user_profile_image,
          userRole: newMsg.user_role || 'user',
          createdAt: new Date(newMsg.created_at),
          serviceId: newMsg.service_id
        };
        
        setMessages(prev => [...prev, message]);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [serviceId]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !currentUser) return;
    
    try {
      setSendingMessage(true);
      await sendServiceMessage(serviceId, message);
      setMessage('');
      
      const updatedMessages = await getServiceMessages(serviceId);
      setMessages(updatedMessages);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error sending message",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setSendingMessage(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading messages...</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="animate-pulse">Loading conversation...</div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Chat</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
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
                      <AvatarImage src={message.userProfileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.userName)}&background=random`} />
                      <AvatarFallback>{message.userName[0]}</AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div 
                        className={`px-3 py-2 rounded-lg ${
                          message.userId === currentUser?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <div 
                        className={`text-xs text-muted-foreground mt-1 ${
                          message.userId === currentUser?.id ? 'text-right' : ''
                        }`}
                      >
                        {message.userName} • {formatDistanceToNow(message.createdAt, { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="border-t p-3">
        <div className="flex w-full items-center space-x-2">
          <Textarea 
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[40px] flex-1"
            rows={1}
          />
          <Button 
            size="icon" 
            onClick={handleSendMessage} 
            disabled={!message.trim() || sendingMessage}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ServiceChat;
