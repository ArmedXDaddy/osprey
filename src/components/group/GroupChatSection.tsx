
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Send, AlertCircle, ImageIcon, Paperclip } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Message, UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';

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
  const [channel, setChannel] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch messages from Supabase on component mount
  const fetchMessages = useCallback(async () => {
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
          userRole: msg.user_role as UserRole,
          userProfileImage: msg.user_profile_image,
          content: msg.content,
          mediaUrl: msg.media_url || null,
          mediaType: msg.media_type || null,
          createdAt: new Date(msg.created_at)
        }));
        
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  }, [groupId]);

  // Set up real-time subscription
  useEffect(() => {
    // First, fetch initial messages
    fetchMessages();

    // Then set up the real-time channel
    const setupSubscription = () => {
      const newChannel = supabase
        .channel(`group:${groupId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `group_id=eq.${groupId}`
          },
          (payload) => {
            console.log('New message received:', payload);
            const newMsg = payload.new as any;
            
            // Transform the data to match the Message type
            const formattedMessage: Message = {
              id: newMsg.id,
              groupId: newMsg.group_id,
              userId: newMsg.user_id,
              userName: newMsg.user_name,
              userRole: newMsg.user_role as UserRole,
              userProfileImage: newMsg.user_profile_image,
              content: newMsg.content,
              mediaUrl: newMsg.media_url || null,
              mediaType: newMsg.media_type || null,
              createdAt: new Date(newMsg.created_at)
            };
            
            // Add the message only if it's not already in the list
            setMessages(prev => {
              const exists = prev.some(msg => msg.id === formattedMessage.id);
              return exists ? prev : [...prev, formattedMessage];
            });
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
        });

      setChannel(newChannel);
      return newChannel;
    };

    const chatChannel = setupSubscription();

    // Clean up subscription when component unmounts
    return () => {
      if (chatChannel) {
        console.log('Removing channel subscription');
        supabase.removeChannel(chatChannel);
      }
    };
  }, [groupId, fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    
    if (file) {
      const url = URL.createObjectURL(file);
      setMediaPreviewUrl(url);
    } else {
      setMediaPreviewUrl(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setMediaPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const determineFileType = (file: File): 'image' | 'video' | 'file' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'file';
  };

  const handleSendMessage = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to send messages",
        variant: "destructive"
      });
      return;
    }
    
    if (!newMessage.trim() && !selectedFile) return;
    
    setLoading(true);
    
    try {
      let mediaUrl = null;
      let mediaType = null;
      
      // Upload file if selected
      if (selectedFile) {
        setUploadingFile(true);
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${groupId}/${fileName}`;
        
        mediaType = determineFileType(selectedFile);
        
        const { error: uploadError, data } = await supabase.storage
          .from('group-chat-media')
          .upload(filePath, selectedFile);
        
        if (uploadError) {
          throw uploadError;
        }
        
        // Get the public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('group-chat-media')
          .getPublicUrl(filePath);
        
        mediaUrl = publicUrl;
        setUploadingFile(false);
      }
      
      await sendMessage({
        groupId,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        userProfileImage: currentUser.profileImage,
        content: newMessage.trim(),
        mediaUrl,
        mediaType
      });
      
      setNewMessage('');
      setSelectedFile(null);
      setMediaPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error sending message",
        description: "Failed to send your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setUploadingFile(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMedia = (message: Message) => {
    if (!message.mediaUrl) return null;
    
    if (message.mediaType === 'image') {
      return (
        <div className="mt-2 rounded-md overflow-hidden">
          <Dialog>
            <DialogTrigger asChild>
              <img 
                src={message.mediaUrl} 
                alt="Shared image" 
                className="max-h-60 max-w-full object-contain cursor-pointer rounded-md" 
              />
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle>Shared by {message.userName}</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center items-center">
                <img 
                  src={message.mediaUrl} 
                  alt="Shared image" 
                  className="max-h-[80vh] max-w-full object-contain" 
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      );
    }
    
    if (message.mediaType === 'video') {
      return (
        <div className="mt-2 rounded-md overflow-hidden">
          <video 
            controls 
            className="max-h-60 max-w-full rounded-md"
          >
            <source src={message.mediaUrl} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }
    
    // Default file link for other types
    return (
      <div className="mt-2">
        <a 
          href={message.mediaUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center text-blue-600 hover:underline"
        >
          <Paperclip className="h-4 w-4 mr-1" />
          Attachment
        </a>
      </div>
    );
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
                    {message.content && (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                    {renderMedia(message)}
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
      
      {selectedFile && mediaPreviewUrl && (
        <div className="border-t p-2 bg-gray-50">
          <div className="relative inline-block">
            {selectedFile.type.startsWith('image/') ? (
              <img 
                src={mediaPreviewUrl} 
                alt="Selected media" 
                className="h-20 object-contain rounded-md"
              />
            ) : selectedFile.type.startsWith('video/') ? (
              <video 
                src={mediaPreviewUrl} 
                className="h-20 object-contain rounded-md"
              />
            ) : (
              <div className="h-20 p-2 flex items-center justify-center bg-gray-100 rounded-md">
                <Paperclip className="h-6 w-6 mr-2" />
                <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
              </div>
            )}
            <button 
              onClick={handleRemoveFile}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-xs"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <div className="border-t p-4">
        <div className="flex items-end space-x-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="min-h-[60px] resize-none flex-1"
          />
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              title="Attach file"
              disabled={loading || uploadingFile}
            >
              <ImageIcon className="h-4 w-4" />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                hidden
                accept="image/*,video/*"
              />
            </Button>
            <Button 
              onClick={handleSendMessage} 
              disabled={((!newMessage.trim() && !selectedFile) || loading || uploadingFile)}
              size="icon"
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
