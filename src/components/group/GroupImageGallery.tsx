
import React, { useRef } from 'react';
import { Check, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GroupImageGalleryProps {
  selectedImage: string;
  onSelect: (image: string) => void;
  onFileUpload: (file: File) => void;
}

const placeholderImages = [
  '/images/groups/photo-1605810230434-7631ac76ec81.jpg',
  '/images/groups/photo-1519389950473-47ba0277781c.jpg',
  '/images/groups/photo-1466442929976-97f336a657be.jpg',
  '/images/groups/photo-1517022812141-23620dba5c23.jpg',
  '/images/groups/photo-1493962853295-0fd70327578a.jpg',
  '/images/groups/photo-1452378174528-3090a4bba7b2.jpg',
];

const GroupImageGallery: React.FC<GroupImageGalleryProps> = ({ 
  selectedImage, 
  onSelect,
  onFileUpload 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Button 
          type="button" 
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          <span>Upload from device</span>
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {placeholderImages.map((image, index) => (
          <div 
            key={index} 
            className={`relative aspect-video rounded border overflow-hidden cursor-pointer hover:opacity-90 transition-opacity
              ${selectedImage === image ? 'ring-2 ring-primary' : ''}`}
            onClick={() => onSelect(image)}
          >
            <img src={image} alt={`Gallery image ${index + 1}`} className="w-full h-full object-cover" />
            {selectedImage === image && (
              <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                <Check className="h-3 w-3" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupImageGallery;
