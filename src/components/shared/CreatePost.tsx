
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Image, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';

const CreatePost: React.FC = () => {
  const { currentUser } = useAuth();
  const { createPost } = useData();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "Image too large",
        description: "Please select an image under 5MB",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !selectedImage) {
      toast({
        title: "Empty post",
        description: "Please add some text or an image to your post",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    setIsUploading(!!selectedImage);
    
    try {
      // Send the post with image if selected
      await createPost(content, selectedImage);
      
      // Reset form
      setContent('');
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast({
        title: "Post created",
        description: "Your post has been published successfully"
      });
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarImage 
              src={currentUser.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random`} 
              alt={currentUser.name} 
            />
            <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <Textarea
              placeholder={`What's on your mind, ${currentUser.name.split(' ')[0]}?`}
              className="resize-none border-none focus-visible:ring-0 min-h-[100px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            
            {imagePreview && (
              <div className="relative mt-2 rounded-md overflow-hidden">
                <img 
                  src={imagePreview} 
                  alt="Post preview" 
                  className="max-h-[300px] w-auto object-contain bg-gray-100" 
                />
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-80 hover:opacity-100"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-3 flex justify-between">
        <div>
          <input
            type="file"
            accept="image/*"
            id="post-image"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageSelect}
          />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isSubmitting}
          >
            <Image className="h-5 w-5 mr-1" />
            <span>Add Image</span>
          </Button>
        </div>
        
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || (!content.trim() && !selectedImage)}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isUploading ? 'Uploading...' : 'Posting...'}
            </>
          ) : 'Post'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CreatePost;
