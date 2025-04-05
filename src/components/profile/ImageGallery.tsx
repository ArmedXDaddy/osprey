
import React from 'react';
import { Upload, ImageIcon, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  images: { name: string; url: string }[];
  onSelectImage: (url: string) => void;
  onUploadImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  emptyMessage: string;
  aspectRatio?: 'square' | 'landscape';
  selectedImage?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onSelectImage,
  onUploadImage,
  uploading,
  emptyMessage,
  aspectRatio = 'square',
  selectedImage
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Your Gallery</h4>
        <label className="cursor-pointer">
          <Input 
            type="file" 
            className="hidden" 
            accept="image/*" 
            onChange={onUploadImage}
            disabled={uploading}
          />
          <Button variant="outline" size="sm" className="gap-1" disabled={uploading}>
            <Upload className="h-4 w-4" />
            <span>{uploading ? 'Uploading...' : 'Upload New'}</span>
          </Button>
        </label>
      </div>
      
      <ScrollArea className="h-[300px]">
        {images.length > 0 ? (
          <div className={cn(
            "grid gap-4 p-1",
            aspectRatio === 'landscape' ? 'grid-cols-2' : 'grid-cols-3'
          )}>
            {images.map((image, index) => (
              <div 
                key={index} 
                className={cn(
                  "relative cursor-pointer group overflow-hidden rounded-md border-2",
                  selectedImage === image.url ? "border-primary ring-2 ring-primary ring-opacity-50" : "border-transparent hover:border-gray-300"
                )}
                onClick={() => onSelectImage(image.url)}
              >
                <div className={cn(
                  "overflow-hidden",
                  aspectRatio === 'landscape' ? 'aspect-video' : 'aspect-square'
                )}>
                  <img 
                    src={image.url} 
                    alt={`Image ${index + 1}`} 
                    className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  {selectedImage === image.url ? (
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                  ) : (
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 text-white">
                      Select
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-md">
            <div className="flex flex-col items-center p-6">
              <div className="bg-gray-100 rounded-full p-4 mb-4">
                <ImageIcon className="h-8 w-8 text-gray-400" />
              </div>
              <p className="mb-4">{emptyMessage}</p>
              <label className="cursor-pointer">
                <Input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={onUploadImage}
                  disabled={uploading}
                />
                <Button variant="outline" size="sm" className="gap-1" disabled={uploading}>
                  <Upload className="h-4 w-4" />
                  <span>Upload Your First Image</span>
                </Button>
              </label>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ImageGallery;
