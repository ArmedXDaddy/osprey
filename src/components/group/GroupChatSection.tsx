import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Send, AlertCircle, ImageIcon, Paperclip, X, Loader2 } from 'lucide-react';
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
import GroupImageGallery from './GroupImageGallery';
import { ScrollArea } from '@/components/ui/scroll-area';

interface GroupChatSectionProps {
  groupId: string;
}

interface MessageRow {
  id: string;
  group_id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  user_profile_image: string | null;
  content: string;
  media_url?: string | null;
  media_type?: string | null;
  created_at: string;
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
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

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
        const formattedMessages: Message[] = data.map((msg: MessageRow) => ({
          id: msg.id,
          groupId: msg.group_id,
          userId: msg.user_id,
          userName: msg.user_name,
          userRole: msg.user_role as UserRole,
          userProfileImage: msg.user_profile_image || undefined,
          content: msg.content,
          mediaUrl: msg.media_url || undefined,
          mediaType: msg.media_type as 'image' | 'video' | 'file' | undefined,
          createdAt: new Date(msg.created_at)
        }));
        
        setMessages(formattedMessages);
        
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  }, [groupId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchMessages();

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
            const newMsg = payload.new as MessageRow;
            
            const formattedMessage: Message = {
              id: newMsg.id,
              groupId: newMsg.group_id,
              userId: newMsg.user_id,
              userName: newMsg.user_name,
              userRole: newMsg.user_role as UserRole,
              userProfileImage: newMsg.user_profile_image || undefined,
              content: newMsg.content,
              mediaUrl: newMsg.media_url || undefined,
              mediaType: newMsg.media_type as 'image' | 'video' | 'file' | undefined,
              createdAt: new Date(newMsg.created_at)
            };
            
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

    return () => {
      if (chatChannel) {
        console.log('Removing channel subscription');
        supabase.removeChannel(chatChannel);
      }
    };
  }, [groupId, fetchMessages]);

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

  const handleFileUpload = async (file: File) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to upload files",
        variant: "destructive"
      });
      return;
    }
    
    setUploadingFile(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${groupId}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('group-chat-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error('Error uploading file:', error);
        toast({
          title: "Upload failed",
          description: error.message,
          variant: "destructive"
        });
        return null;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('group-chat-media')
        .getPublicUrl(filePath);
      
      setSelectedFile(file);
      
      const mediaType = determineFileType(file);
      
      await sendMessage({
        groupId,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        userProfileImage: currentUser.profileImage,
        content: newMessage.trim() || '',
        mediaUrl: publicUrl,
        mediaType
      });
      
      setNewMessage('');
      setSelectedFile(null);
      setMediaPreviewUrl(null);
      setShowImageGallery(false);
      
      toast({
        title: "File uploaded",
        description: "Your file has been uploaded and shared"
      });
      
      return publicUrl;
    } catch (error: any) {
      console.error('Error in file upload process:', error);
      toast({
        title: "Upload failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploadingFile(false);
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
      let mediaUrl = undefined;
      let mediaType = undefined;
      
      if (selectedFile) {
        setUploadingFile(true);
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${groupId}/${fileName}`;
        
        mediaType = determineFileType(selectedFile);
        
        console.log('Uploading file to path:', filePath);
        const { error: uploadError, data } = await supabase.storage
          .from('group-chat-media')
          .upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          toast({
            title: "Upload failed",
            description: uploadError.message,
            variant: "destructive"
          });
          setLoading(false);
          setUploadingFile(false);
          return;
        }
        
        console.log('Upload successful, data:', data);
        
        const { data: { publicUrl } } = supabase.storage
          .from('group-chat-media')
          .getPublicUrl(filePath);
        
        console.log('File public URL:', publicUrl);
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
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error sending message",
        description: error.message || "Failed to send your message. Please try again.",
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
                className="max-h-60 max-w-full object-contain cursor-pointer rounded-md hover:opacity-90 transition-opacity" 
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
    <div className="flex flex-col h-[500px] border rounded-md overflow-hidden">
      <div className="border-b p-3 bg-muted/30">
        <h3 className="font-medium text-sm">Group Chat</h3>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {loadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading messages...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
              <AlertCircle className="h-12 w-12 mb-2" />
              <p className="text-center">No messages yet. Be the first to say something!</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div 
                key={message.id} 
                className={cn(
                  "flex",
                  message.userId === currentUser?.id ? "justify-end" : "justify-start",
                  index > 0 && messages[index - 1].userId !== message.userId ? "mt-6" : "",
                  index > 0 && messages[index - 1].userId === message.userId ? "-mt-2" : ""
                )}
              >
                <div 
                  className={cn(
                    "flex max-w-[85%]",
                    message.userId === currentUser?.id ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {(index === 0 || messages[index - 1].userId !== message.userId) && (
                    <Avatar className={cn(
                      "h-8 w-8",
                      message.userId === currentUser?.id ? "ml-2" : "mr-2"
                    )}>
                      <AvatarImage src={message.userProfileImage} />
                      <AvatarFallback>{message.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  
                  {index > 0 && messages[index - 1].userId === message.userId && (
                    <div className={cn(
                      "w-8",
                      message.userId === currentUser?.id ? "ml-2" : "mr-2"
                    )} />
                  )}
                  
                  <div className="max-w-full">
                    <div 
                      className={cn(
                        "px-3 py-2 rounded-lg",
                        message.userId === currentUser?.id 
                          ? "bg-primary text-primary-foreground rounded-br-none" 
                          : "bg-muted rounded-bl-none",
                        index > 0 && messages[index - 1].userId === message.userId
                          ? message.userId === currentUser?.id ? "rounded-tr-none" : "rounded-tl-none"
                          : ""
                      )}
                    >
                      {message.userId !== currentUser?.id && (index === 0 || messages[index - 1].userId !== message.userId) && (
                        <p className="text-xs font-medium mb-1">
                          {message.userName}
                          <span 
                            className={cn(
                              "ml-1 px-1 py-0.5 rounded-sm text-[10px]",
                              message.userRole === 'influencer' ? 'bg-red-500' :
                              message.userRole === 'coach' ? 'bg-teal-500' :
                              message.userRole === 'company' ? 'bg-blue-500' :
                              'bg-purple-500',
                              "text-white"
                            )}
                          >
                            {message.userRole}
                          </span>
                        </p>
                      )}
                      {message.content && (
                        <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                      )}
                      {renderMedia(message)}
                    </div>
                    
                    {(index === messages.length - 1 || messages[index + 1]?.userId !== message.userId) && (
                      <p className={cn(
                        "text-xs text-gray-500 mt-1",
                        message.userId === currentUser?.id ? "text-right" : ""
                      )}>
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {selectedFile && mediaPreviewUrl && (
        <div className="border-t p-2 bg-muted/30">
          <div className="relative inline-block">
            {selectedFile.type.startsWith('image/') ? (
              <div className="relative bg-background border rounded-md p-1">
                <img 
                  src={mediaPreviewUrl} 
                  alt="Selected media" 
                  className="h-20 object-contain rounded-md"
                />
                <button 
                  onClick={() => {
                    setSelectedFile(null);
                    setMediaPreviewUrl(null);
                  }}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 w-5 h-5 flex items-center justify-center shadow-sm"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : selectedFile.type.startsWith('video/') ? (
              <div className="relative bg-background border rounded-md p-1">
                <video 
                  src={mediaPreviewUrl} 
                  className="h-20 object-contain rounded-md"
                />
                <button 
                  onClick={() => {
                    setSelectedFile(null);
                    setMediaPreviewUrl(null);
                  }}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 w-5 h-5 flex items-center justify-center shadow-sm"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="relative bg-background border rounded-md p-2">
                <div className="h-16 flex items-center justify-center">
                  <Paperclip className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
                </div>
                <button 
                  onClick={() => {
                    setSelectedFile(null);
                    setMediaPreviewUrl(null);
                  }}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 w-5 h-5 flex items-center justify-center shadow-sm"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Image</DialogTitle>
          </DialogHeader>
          <GroupImageGallery
            selectedImage=""
            onSelect={() => {}}
            onFileUpload={(file) => {
              setSelectedFile(file);
              const url = URL.createObjectURL(file);
              setMediaPreviewUrl(url);
              setImageDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
      
      <div className="border-t p-3">
        <div className="flex items-end space-x-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="min-h-[60px] max-h-[120px] resize-none flex-1 px-3 py-2"
          />
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setImageDialogOpen(true)}
              title="Attach image"
              disabled={loading || uploadingFile}
              className="bg-background"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button 
              onClick={handleSendMessage} 
              disabled={((!newMessage.trim() && !selectedFile) || loading || uploadingFile)}
              size="icon"
              className={cn(loading || uploadingFile ? "opacity-70" : "")}
            >
              {loading || uploadingFile ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupChatSection;
