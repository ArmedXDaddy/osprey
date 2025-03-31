
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizontal } from 'lucide-react';
import { format } from 'date-fns';

interface GroupChatSectionProps {
  groupId: string;
}

const GroupChatSection: React.FC<GroupChatSectionProps> = ({ groupId }) => {
  const { currentUser } = useAuth();
  const { getGroupMessages, sendMessage } = useData();
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load messages
    setMessages(getGroupMessages(groupId));
  }, [groupId, getGroupMessages]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentUser || !messageInput.trim()) return;

    try {
      await sendMessage({
        groupId,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        userProfileImage: currentUser.profileImage,
        content: messageInput.trim()
      });
      
      // Refresh messages
      setMessages(getGroupMessages(groupId));
      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!currentUser) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Please sign in to participate in the chat</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px] border rounded-md">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex gap-3 ${message.userId === currentUser?.id ? 'justify-end' : ''}`}
            >
              {message.userId !== currentUser?.id && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.userProfileImage} />
                  <AvatarFallback>{message.userName.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              
              <div className={`max-w-[80%] ${message.userId === currentUser?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-3`}>
                {message.userId !== currentUser?.id && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{message.userName}</span>
                    <span className={`inline-block px-1.5 py-0.5 rounded-full text-xs capitalize
                      ${message.userRole === 'influencer' ? 'bg-red-500 text-white' : 
                        message.userRole === 'coach' ? 'bg-teal-500 text-white' : 
                        message.userRole === 'company' ? 'bg-blue-500 text-white' : 
                        'bg-purple-500 text-white'}`}
                    >
                      {message.userRole}
                    </span>
                  </div>
                )}
                
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                
                <div className={`text-xs mt-1 ${message.userId === currentUser?.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {format(new Date(message.createdAt), 'h:mm a')}
                </div>
              </div>
              
              {message.userId === currentUser?.id && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.userProfileImage} />
                  <AvatarFallback>{message.userName.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t p-3 flex gap-2">
        <Textarea
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="resize-none min-h-[60px]"
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={!messageInput.trim()}
          className="self-end"
        >
          <SendHorizontal className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default GroupChatSection;
