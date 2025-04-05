
import React from 'react';
import { Upload, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ImageGalleryProps {
  images: { name: string; url: string }[];
  onSelectImage: (url: string) => void;
  onUploadImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  emptyMessage: string;
  aspectRatio?: 'square' | 'landscape';
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onSelectImage,
  onUploadImage,
  uploading,
  emptyMessage,
  aspectRatio = 'square'
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Your Images</h4>
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
          <div className={`grid grid-cols-${aspectRatio === 'landscape' ? '2' : '3'} gap-4 p-1`}>
            {images.map((image, index) => (
              <div 
                key={index} 
                className="relative cursor-pointer group overflow-hidden rounded-md"
                onClick={() => onSelectImage(image.url)}
              >
                <img 
                  src={image.url} 
                  alt={`Image ${index + 1}`} 
                  className={`${aspectRatio === 'landscape' ? 'h-32' : 'h-24'} w-full object-cover`}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 text-white">
                    Select
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <ImageIcon className="mx-auto h-12 w-12 opacity-20 mb-2" />
            <p>{emptyMessage}</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ImageGallery;
