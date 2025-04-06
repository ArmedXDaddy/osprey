import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { ImageIcon } from 'lucide-react';

interface CreatePostProps {
  onPostCreated?: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const { createPost, addComment } = useData();
  const { currentUser } = useAuth();
  const [postContent, setPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to post.",
        variant: "destructive"
      });
      return;
    }
    
    if (!postContent.trim()) return;
    
    try {
      setIsSubmitting(true);
      
      const newPost = await createPost({
        content: postContent,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        userProfileImage: currentUser.profileImage,
        image: selectedImage || null
      });
      
      if (newPost && newPost.id && currentUser) {
        await addComment(newPost.id, {
          postId: newPost.id,
          content: postContent,
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          userProfileImage: currentUser.profileImage
        });
      }
      
      setPostContent('');
      setSelectedImage(null);
      toast({
        title: "Post created",
        description: "Your post has been created successfully."
      });
      
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsImageUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setIsImageUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      });
      setIsImageUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 space-y-4">
      <div className="flex items-center space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage 
            src={currentUser?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || '')}&background=random`} 
            alt={currentUser?.name || ''}
          />
          <AvatarFallback>{currentUser?.name?.[0] || '?'}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{currentUser?.name}</span>
      </div>
      
      <form onSubmit={handlePostSubmit} className="space-y-4">
        <Textarea
          placeholder="What's on your mind?"
          className="w-full resize-none border-gray-300 dark:border-gray-700 focus:ring-0 focus-visible:ring-0"
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          disabled={isSubmitting}
        />
        
        {selectedImage && (
          <div className="relative">
            <img src={selectedImage} alt="Uploaded" className="w-full h-auto rounded-md" />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setSelectedImage(null)}
            >
              X
            </Button>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div>
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <label htmlFor="image-upload">
              <Button 
                variant="ghost" 
                size="sm" 
                disabled={isImageUploading}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                {isImageUploading ? 'Uploading...' : 'Add Image'}
              </Button>
            </label>
          </div>
          
          <Button type="submit" disabled={isSubmitting || isImageUploading}>
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
