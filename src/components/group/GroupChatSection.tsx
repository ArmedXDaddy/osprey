import React, { useState, useRef, useEffect } from 'react';
import { Group, Message } from '@/types';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { Send, Image, Paperclip, Smile } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';

interface GroupChatSectionProps {
  group: Group;
}

const GroupChatSection: React.FC<GroupChatSectionProps> = ({ group }) => {
  const { messages, sendMessage } = useData();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [messageText, setMessageText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter messages for this group
  const groupMessages = messages.filter(message => message.groupId === group.id);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [groupMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to send messages.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await sendMessage(group.id, messageText.trim());
      setMessageText('');
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real app, you would upload the file to a server and get a URL back
    // For now, we'll simulate this with a fake URL
    try {
      const fakeImageUrl = URL.createObjectURL(file);
      await sendMessage(group.id, "", fakeImageUrl, "image");
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast({
        title: "Failed to upload image",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const formatMessageTime = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const renderMessage = (message: Message) => {
    const isCurrentUser = currentUser && message.userId === currentUser.id;
    
    return (
      <div 
        key={message.id} 
        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        {!isCurrentUser && (
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={message.userProfileImage} />
            <AvatarFallback>{message.userName.charAt(0)}</AvatarFallback>
          </Avatar>
        )}
        
        <div className={`max-w-[70%]`}>
          {!isCurrentUser && (
            <div className="text-xs text-gray-500 mb-1">{message.userName}</div>
          )}
          
          <div className="flex flex-col">
            {message.mediaUrl && message.mediaType === 'image' && (
              <img 
                src={message.mediaUrl} 
                alt="Shared image" 
                className={`rounded-lg mb-1 max-w-full ${isCurrentUser ? 'ml-auto' : ''}`}
              />
            )}
            
            {message.content && (
              <div 
                className={`rounded-lg py-2 px-3 ${
                  isCurrentUser 
                    ? 'bg-primary text-primary-foreground ml-auto' 
                    : 'bg-muted'
                }`}
              >
                {message.content}
              </div>
            )}
            
            <div 
              className={`text-xs text-gray-500 mt-1 ${
                isCurrentUser ? 'text-right' : 'text-left'
              }`}
            >
              {formatMessageTime(message.createdAt)}
            </div>
          </div>
        </div>
        
        {isCurrentUser && (
          <Avatar className="h-8 w-8 ml-2">
            <AvatarImage src={message.userProfileImage} />
            <AvatarFallback>{message.userName.charAt(0)}</AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
      <div className="p-3 border-b">
        <h3 className="font-medium">Group Chat</h3>
      </div>
      
      <ScrollArea className="flex-grow p-4">
        {groupMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            No messages yet. Be the first to say hello!
          </div>
        ) : (
          <div>
            {groupMessages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>
      
      <div className="p-3 border-t">
        <div className="flex items-end gap-2">
          <Textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-[60px] resize-none"
          />
          
          <div className="flex flex-col gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="h-10 w-10"
                    onClick={handleImageUpload}
                  >
                    <Image className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upload image</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button 
              size="icon" 
              className="h-10 w-10" 
              onClick={handleSendMessage}
              disabled={isSubmitting || !messageText.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  );
};

export default GroupChatSection;
