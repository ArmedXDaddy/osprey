
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ImageIcon, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ImageGallery from '@/components/profile/ImageGallery';
import { supabase } from '@/integrations/supabase/client';
import { uploadImage } from '@/integrations/supabase/helpers';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface WorkshopImageSelectorProps {
  value: string;
  onChange: (url: string) => void;
}

const WorkshopImageSelector: React.FC<WorkshopImageSelectorProps> = ({ value, onChange }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [images, setImages] = useState<{name: string; url: string}[]>([]);
  const [uploading, setUploading] = useState(false);
  
  useEffect(() => {
    loadImages();
  }, [currentUser]);
  
  const loadImages = async () => {
    if (!currentUser) return;
    
    try {
      const { data, error } = await supabase
        .storage
        .from('covers')
        .list(currentUser.id, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        });
      
      if (error) throw error;
      
      const imageList = data
        .filter(item => !item.id.includes('.emptyFolderPlaceholder'))
        .map(item => {
          const { data } = supabase.storage
            .from('covers')
            .getPublicUrl(`${currentUser.id}/${item.name}`);
            
          return {
            name: item.name,
            url: data.publicUrl
          };
        });
        
      setImages(imageList);
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    
    try {
      setUploading(true);
      const path = `${currentUser.id}`;
      const url = await uploadImage(file, path);
      
      // Add image to list
      setImages([...images, { name: file.name, url }]);
      
      toast({
        title: 'Image uploaded',
        description: 'You can now select it as your workshop cover',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your image',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };
  
  const handleSelectImage = (url: string) => {
    onChange(url);
    setIsDialogOpen(false);
  };
  
  const handleClearImage = () => {
    onChange('');
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Cover Image</h4>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={() => setIsDialogOpen(true)}
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          {value ? 'Change Image' : 'Select Image'}
        </Button>
      </div>
      
      {value && (
        <div className="relative">
          <div className="aspect-video w-full rounded-md overflow-hidden border bg-muted">
            <img 
              src={value} 
              alt="Workshop cover" 
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleClearImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {!value && (
        <div 
          className="aspect-video w-full rounded-md border border-dashed flex items-center justify-center bg-muted cursor-pointer"
          onClick={() => setIsDialogOpen(true)}
        >
          <div className="text-center">
            <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">Click to select a cover image</p>
          </div>
        </div>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Workshop Cover Image</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            <ImageGallery 
              images={images}
              onSelectImage={handleSelectImage}
              onUploadImage={handleImageUpload}
              uploading={uploading}
              selectedImage={value}
              emptyMessage="You don't have any images yet. Upload one to use as a cover."
              aspectRatio="landscape"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkshopImageSelector;
