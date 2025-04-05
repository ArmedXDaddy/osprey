
import React, { useState, useRef, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Crop, ZoomIn, ZoomOut, RotateCcw, Check } from 'lucide-react';

interface ImageCropperProps {
  imageSrc: string;
  aspectRatio?: number;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  imageSrc,
  aspectRatio = 1,
  onCropComplete,
  onCancel
}) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      // Center the image initially
      if (containerRef.current && imageRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        const imgWidth = image.width;
        const imgHeight = image.height;
        
        // Calculate initial scale to fit the container
        const containerRatio = containerWidth / containerHeight;
        const imageRatio = imgWidth / imgHeight;
        
        let initialScale = 1;
        if (containerRatio > imageRatio) {
          // Container is wider than image
          initialScale = containerHeight / imgHeight;
        } else {
          // Container is taller than image
          initialScale = containerWidth / imgWidth;
        }
        
        // Apply a minimum scale to ensure the image covers enough area
        initialScale = Math.max(initialScale, 0.9);
        setScale(initialScale);
      }
    };
  }, [imageSrc]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragOffset({ ...position });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    setPosition({
      x: dragOffset.x + dx,
      y: dragOffset.y + dy
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    setDragOffset({ ...position });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    
    const dx = e.touches[0].clientX - dragStart.x;
    const dy = e.touches[0].clientY - dragStart.y;
    
    setPosition({
      x: dragOffset.x + dx,
      y: dragOffset.y + dy
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleComplete = () => {
    if (!imageRef.current || !containerRef.current || !canvasRef.current) return;
    
    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    
    const canvas = canvasRef.current;
    canvas.width = containerWidth;
    canvas.height = containerHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save context state
    ctx.save();
    
    // Set the clipping region to the container size
    ctx.beginPath();
    ctx.rect(0, 0, containerWidth, containerHeight);
    ctx.clip();
    
    // Move to the center of the canvas
    ctx.translate(containerWidth / 2, containerHeight / 2);
    
    // Rotate around the center
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Scale the image
    ctx.scale(scale, scale);
    
    // Apply the position offset
    ctx.translate(position.x / scale, position.y / scale);
    
    // Draw the image centered
    const img = imageRef.current;
    ctx.drawImage(
      img,
      -img.naturalWidth / 2,
      -img.naturalHeight / 2,
      img.naturalWidth,
      img.naturalHeight
    );
    
    // Restore context state
    ctx.restore();
    
    // Convert canvas to data URL and pass to callback
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onCropComplete(dataUrl);
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="text-center text-sm text-muted-foreground mb-2">
        Drag to position, use slider to zoom, and buttons to rotate
      </div>
      
      <div className="relative bg-black/20 rounded-lg overflow-hidden" style={{ touchAction: 'none' }}>
        <AspectRatio ratio={aspectRatio} className="w-full">
          <div
            ref={containerRef}
            className="relative w-full h-full overflow-hidden cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              className="absolute left-1/2 top-1/2 origin-center"
              style={{
                transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${scale})`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
              }}
            >
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Crop preview"
                className="max-w-none"
                draggable={false}
                style={{ transform: 'translate(-50%, -50%)' }}
              />
            </div>
            {/* Grid overlay for better visualization */}
            <div className="absolute inset-0 pointer-events-none border border-white/30 border-dashed">
              <div className="absolute left-1/3 top-0 bottom-0 border-l border-white/30 border-dashed"></div>
              <div className="absolute right-1/3 top-0 bottom-0 border-l border-white/30 border-dashed"></div>
              <div className="absolute top-1/3 left-0 right-0 border-t border-white/30 border-dashed"></div>
              <div className="absolute bottom-1/3 left-0 right-0 border-t border-white/30 border-dashed"></div>
            </div>
          </div>
        </AspectRatio>
      </div>
      
      <div className="flex items-center gap-2">
        <ZoomOut className="h-4 w-4 text-muted-foreground" />
        <Slider 
          value={[scale]} 
          min={0.5} 
          max={3} 
          step={0.01} 
          onValueChange={(values) => setScale(values[0])}
          className="flex-1"
        />
        <ZoomIn className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <div className="flex justify-center gap-2">
        <Button variant="outline" size="sm" onClick={handleRotate}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Rotate
        </Button>
      </div>
      
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleComplete}>
          <Check className="h-4 w-4 mr-2" />
          Apply
        </Button>
      </div>
      
      {/* Hidden canvas used for cropping */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ImageCropper;
