import React, { useState, useEffect, useRef } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { Send, MessageSquare, RefreshCw } from 'lucide-react';
import { Service, Booking, Message } from '@/types';
import { toast } from '@/hooks/use-toast';

interface ServiceChatProps {
  service: Service;
  booking: Booking | null;
  isProvider: boolean;
}

const ServiceChat: React.FC<ServiceChatProps> = ({ service, booking, isProvider }) => {
  const { currentUser } = useAuth();
  const { sendServiceMessage, getServiceMessages } = useData();
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Fetch service messages
  const fetchMessages = async () => {
    if (service?.id) {
      try {
        setIsLoading(true);
        const serviceMessages = await getServiceMessages(service.id);
        setMessages(serviceMessages);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        toast({
          variant: "destructive",
          title: "Failed to load messages",
          description: "There was an error loading the chat messages"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Setup real-time subscription
  useEffect(() => {
    if (!service?.id) return;

    // Initial fetch
    fetchMessages();

    // Real-time subscription
    const channel = supabase
      .channel('service_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'service_messages',
          filter: `service_id=eq.${service.id}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [service?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentUser || !service) return;
    
    try {
      setIsSubmitting(true);
      await sendServiceMessage({
        serviceId: service.id,
        content: newMessage,
      });
      setNewMessage('');
    } catch (error: any) {
      console.error("Failed to send message:", error);
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: error.message || "There was an error sending your message"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = () => {
    fetchMessages();
  };

  if (!service || !currentUser) return null;

  // Dynamic chat title and description
  const chatTitle = isProvider 
    ? "Service Chat" 
    : `${service.title} Chat`;
  
  const chatDescription = isProvider
    ? "Chat with users who have booked this service"
    : `Chat with ${service.providerName}`;

  return (
    <div className="flex flex-col h-[500px] border rounded-lg">
      <div className="bg-muted px-4 py-3 border-b flex justify-between items-center">
        <div>
          <h3 className="font-medium">{chatTitle}</h3>
          <p className="text-sm text-muted-foreground">{chatDescription}</p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="sr-only">Refresh</span>
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {messages.length > 0 ? (
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
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
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

export default ServiceChat;
