
import React, { useState, useRef, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Message } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Send, Image, X, FileText, FileImage, Film } from 'lucide-react';

interface GroupChatSectionProps {
  groupId: string;
  isAdmin: boolean;
}

const GroupChatSection: React.FC<GroupChatSectionProps> = ({ groupId, isAdmin }) => {
  const { currentUser } = useAuth();
  const { sendMessage, messages: allMessages } = useData();
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Filter messages for this group
  const messages = allMessages.filter(msg => msg.groupId === groupId);
  
  // Group messages by date
  const messagesByDate = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);
  
  // Dates sorted chronologically
  const sortedDates = Object.keys(messagesByDate).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async () => {
    if ((!messageText.trim() && !mediaFile) || !currentUser) return;
    
    try {
      setIsLoading(true);
      
      let mediaUrl = '';
      let mediaType = '';
      
      // If there's a media file, upload it first
      if (mediaFile) {
        // Simulate file upload
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real app, you would upload the file to a storage service
        // and get back a URL. For now, we'll just use the preview URL.
        mediaUrl = mediaPreviewUrl || '';
        
        if (mediaFile.type.startsWith('image/')) {
          mediaType = 'image';
        } else if (mediaFile.type.startsWith('video/')) {
          mediaType = 'video';
        } else {
          mediaType = 'document';
        }
      }
      
      await sendMessage(groupId, messageText, mediaUrl, mediaType);
      
      // Reset the form
      setMessageText('');
      setMediaFile(null);
      setMediaPreviewUrl(null);
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setMediaFile(file);
    
    // Create preview URL for images and videos
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setMediaPreviewUrl(url);
    } else {
      setMediaPreviewUrl(null);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const formatMessageTime = (date: Date) => {
    return format(new Date(date), 'h:mm a');
  };
  
  const getMediaPreview = () => {
    if (!mediaPreviewUrl) return null;
    
    if (mediaFile?.type.startsWith('image/')) {
      return (
        <div className="relative w-32 h-32 rounded overflow-hidden">
          <img 
            src={mediaPreviewUrl} 
            alt="Preview" 
            className="w-full h-full object-cover"
          />
          <button 
            onClick={() => {
              setMediaFile(null);
              setMediaPreviewUrl(null);
            }}
            className="absolute top-1 right-1 bg-black/60 rounded-full p-1"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      );
    }
    
    if (mediaFile?.type.startsWith('video/')) {
      return (
        <div className="relative w-32 h-32 rounded overflow-hidden">
          <video 
            src={mediaPreviewUrl} 
            className="w-full h-full object-cover"
          />
          <button 
            onClick={() => {
              setMediaFile(null);
              setMediaPreviewUrl(null);
            }}
            className="absolute top-1 right-1 bg-black/60 rounded-full p-1"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      );
    }
    
    // Document file
    return (
      <div className="relative flex items-center p-2 border rounded">
        <FileText className="h-5 w-5 mr-2 text-blue-500" />
        <span className="text-sm truncate max-w-[150px]">
          {mediaFile?.name}
        </span>
        <button 
          onClick={() => {
            setMediaFile(null);
            setMediaPreviewUrl(null);
          }}
          className="ml-2"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  };
  
  const renderMessageContent = (message: Message) => {
    return (
      <div>
        {message.content && (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}
        
        {message.mediaUrl && message.mediaType === 'image' && (
          <div className="mt-2 rounded overflow-hidden">
            <img 
              src={message.mediaUrl} 
              alt="Shared image" 
              className="max-w-[250px] max-h-[200px] object-contain"
            />
          </div>
        )}
        
        {message.mediaUrl && message.mediaType === 'video' && (
          <div className="mt-2 rounded overflow-hidden">
            <video 
              src={message.mediaUrl} 
              controls
              className="max-w-[250px] max-h-[200px]"
            />
          </div>
        )}
        
        {message.mediaUrl && message.mediaType === 'document' && (
          <div className="mt-2 flex items-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
            <FileText className="h-5 w-5 mr-2 text-blue-500" />
            <a 
              href={message.mediaUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline"
            >
              Attachment
            </a>
          </div>
        )}
      </div>
    );
  };
  
  const handleAddEmoji = (emoji: string) => {
    setMessageText(prev => prev + emoji);
  };
  
  return (
    <div className="flex flex-col h-[500px] max-h-[500px] border rounded-md overflow-hidden">
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {sortedDates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>No messages yet</p>
            <p className="text-sm">Be the first to send a message!</p>
          </div>
        ) : (
          sortedDates.map(date => (
            <div key={date}>
              <div className="sticky top-0 z-10 flex justify-center my-2">
                <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
                  {new Date(date).toLocaleDateString(undefined, { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Badge>
              </div>
              
              <div className="space-y-4">
                {messagesByDate[date].map(message => (
                  <div 
                    key={message.id}
                    className={`flex ${
                      currentUser?.id === message.userId ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div className={`flex gap-2 max-w-[80%] ${
                      currentUser?.id === message.userId ? 'flex-row-reverse' : 'flex-row'
                    }`}>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.userProfileImage} />
                        <AvatarFallback>{message.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <div className={`flex items-center gap-2 text-xs text-gray-500 mb-1 ${
                          currentUser?.id === message.userId ? 'justify-end' : 'justify-start'
                        }`}>
                          <span>{message.userName}</span>
                          <span>{formatMessageTime(message.createdAt)}</span>
                          {message.userRole === 'coach' && (
                            <Badge variant="outline" className="text-xs px-1 py-0 h-4">Coach</Badge>
                          )}
                          {isAdmin && message.userId === groupId.split('-')[0] && (
                            <Badge variant="outline" className="text-xs px-1 py-0 h-4">Admin</Badge>
                          )}
                        </div>
                        
                        <div className={`rounded-lg p-3 ${
                          currentUser?.id === message.userId 
                            ? 'bg-blue-500 text-white rounded-tr-none' 
                            : 'bg-white border dark:bg-gray-800 rounded-tl-none'
                        }`}>
                          {renderMessageContent(message)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="border-t p-2 bg-white dark:bg-gray-950">
        {mediaFile && (
          <div className="mb-2">
            {getMediaPreview()}
          </div>
        )}
        
        <div className="flex items-end gap-2">
          <Textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="min-h-[60px] resize-none"
          />
          
          <div className="flex flex-col gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Image className="h-4 w-4" />
            </Button>
            
            <Button
              type="button"
              size="icon"
              onClick={handleSendMessage}
              disabled={isLoading || (!messageText.trim() && !mediaFile)}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupChatSection;
