
import React from 'react';
import { Check } from 'lucide-react';

interface GroupImageGalleryProps {
  selectedImage: string;
  onSelect: (image: string) => void;
}

const placeholderImages = [
  '/images/groups/photo-1605810230434-7631ac76ec81.jpg',
  '/images/groups/photo-1519389950473-47ba0277781c.jpg',
  '/images/groups/photo-1466442929976-97f336a657be.jpg',
  '/images/groups/photo-1517022812141-23620dba5c23.jpg',
  '/images/groups/photo-1493962853295-0fd70327578a.jpg',
  '/images/groups/photo-1452378174528-3090a4bba7b2.jpg',
];

const GroupImageGallery: React.FC<GroupImageGalleryProps> = ({ selectedImage, onSelect }) => {
  return (
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
  );
};

export default GroupImageGallery;
