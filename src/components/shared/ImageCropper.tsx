
import React, { useState, useRef, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Crop, ZoomIn, ZoomOut, RotateCcw, Check, Square } from 'lucide-react';

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
  
  // Crop selection area
  const [cropSelection, setCropSelection] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    isDragging: false,
    startX: 0,
    startY: 0
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectionRef = useRef<HTMLDivElement>(null);

  // Initialize crop selection on image load
  useEffect(() => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        
        // Calculate initial scale to fit the container
        const containerRatio = containerWidth / containerHeight;
        const imageRatio = image.width / image.height;
        
        let initialScale = 1;
        if (containerRatio > imageRatio) {
          // Container is wider than image
          initialScale = containerHeight / image.height;
        } else {
          // Container is taller than image
          initialScale = containerWidth / image.width;
        }
        
        // Apply a minimum scale to ensure the image covers enough area
        initialScale = Math.max(initialScale, 0.9);
        setScale(initialScale);
        
        // Initialize crop selection to 80% of container size, centered
        const selectionSize = Math.min(containerWidth, containerHeight) * 0.8;
        setCropSelection({
          x: (containerWidth - selectionSize) / 2,
          y: (containerHeight - selectionSize) / 2,
          width: selectionSize,
          height: selectionSize / aspectRatio,
          isDragging: false,
          startX: 0,
          startY: 0
        });
      }
    };
  }, [imageSrc, aspectRatio]);

  // Start dragging the crop selection
  const handleSelectionMouseDown = (e: React.MouseEvent) => {
    setCropSelection(prev => ({
      ...prev,
      isDragging: true,
      startX: e.clientX - prev.x,
      startY: e.clientY - prev.y
    }));
  };

  // Move the crop selection
  const handleSelectionMouseMove = (e: React.MouseEvent) => {
    if (cropSelection.isDragging && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const newX = e.clientX - cropSelection.startX;
      const newY = e.clientY - cropSelection.startY;
      
      // Constrain selection within container bounds
      const maxX = containerRect.width - cropSelection.width;
      const maxY = containerRect.height - cropSelection.height;
      
      setCropSelection(prev => ({
        ...prev,
        x: Math.max(0, Math.min(maxX, newX)),
        y: Math.max(0, Math.min(maxY, newY))
      }));
    }
  };

  // Stop dragging
  const handleSelectionMouseUp = () => {
    setCropSelection(prev => ({
      ...prev,
      isDragging: false
    }));
  };

  // Handle touch events for mobile
  const handleSelectionTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setCropSelection(prev => ({
      ...prev,
      isDragging: true,
      startX: e.touches[0].clientX - prev.x,
      startY: e.touches[0].clientY - prev.y
    }));
  };

  const handleSelectionTouchMove = (e: React.TouchEvent) => {
    if (!cropSelection.isDragging || e.touches.length !== 1 || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newX = e.touches[0].clientX - cropSelection.startX;
    const newY = e.touches[0].clientY - cropSelection.startY;
    
    // Constrain selection within container bounds
    const maxX = containerRect.width - cropSelection.width;
    const maxY = containerRect.height - cropSelection.height;
    
    setCropSelection(prev => ({
      ...prev,
      x: Math.max(0, Math.min(maxX, newX)),
      y: Math.max(0, Math.min(maxY, newY))
    }));
  };

  const handleSelectionTouchEnd = () => {
    setCropSelection(prev => ({
      ...prev,
      isDragging: false
    }));
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

  // Resize crop selection when aspectRatio changes
  useEffect(() => {
    setCropSelection(prev => ({
      ...prev,
      height: prev.width / aspectRatio
    }));
  }, [aspectRatio]);

  const handleComplete = () => {
    if (!imageRef.current || !containerRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    canvas.width = cropSelection.width;
    canvas.height = cropSelection.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get the container and image dimensions
    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    
    const img = imageRef.current;
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;
    
    // Calculate the scaling and position of the image in the container
    const containerRatio = containerWidth / containerHeight;
    const imageRatio = imgWidth / imgHeight;
    
    let scaledImgWidth, scaledImgHeight;
    let imgX, imgY;
    
    if (containerRatio > imageRatio) {
      // Container is wider than image
      scaledImgHeight = containerHeight;
      scaledImgWidth = imgWidth * (containerHeight / imgHeight);
      imgX = (containerWidth - scaledImgWidth) / 2;
      imgY = 0;
    } else {
      // Container is taller than image
      scaledImgWidth = containerWidth;
      scaledImgHeight = imgHeight * (containerWidth / imgWidth);
      imgX = 0;
      imgY = (containerHeight - scaledImgHeight) / 2;
    }
    
    // Apply scaling
    scaledImgWidth *= scale;
    scaledImgHeight *= scale;
    
    // Apply center adjustment for scaling
    imgX -= (scaledImgWidth - containerWidth) / 2;
    imgY -= (scaledImgHeight - containerHeight) / 2;
    
    // Draw the cropped image onto the canvas
    ctx.save();
    
    // Apply rotation (if needed)
    if (rotation !== 0) {
      // Adjust canvas size for rotation
      if (rotation % 180 !== 0) {
        canvas.width = cropSelection.height;
        canvas.height = cropSelection.width;
      }
      
      // Move to center of canvas
      ctx.translate(canvas.width / 2, canvas.height / 2);
      
      // Rotate
      ctx.rotate((rotation * Math.PI) / 180);
      
      // Move back
      ctx.translate(-canvas.height / 2, -canvas.width / 2);
    }
    
    // Calculate the source rectangle from the original image
    const sourceX = ((cropSelection.x - imgX) / scaledImgWidth) * imgWidth;
    const sourceY = ((cropSelection.y - imgY) / scaledImgHeight) * imgHeight;
    const sourceWidth = (cropSelection.width / scaledImgWidth) * imgWidth;
    const sourceHeight = (cropSelection.height / scaledImgHeight) * imgHeight;
    
    // Draw the image with the crop selection
    if (rotation % 180 !== 0) {
      ctx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, canvas.height, canvas.width
      );
    } else {
      ctx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, canvas.width, canvas.height
      );
    }
    
    ctx.restore();
    
    // Convert canvas to data URL and pass to callback
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onCropComplete(dataUrl);
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="text-center text-sm text-muted-foreground mb-2">
        Drag the selection area to crop your image, use slider to zoom, and buttons to rotate
      </div>
      
      <div className="relative bg-black/20 rounded-lg overflow-hidden" style={{ touchAction: 'none' }}>
        <AspectRatio ratio={aspectRatio} className="w-full">
          <div
            ref={containerRef}
            className="relative w-full h-full overflow-hidden"
            onMouseMove={handleSelectionMouseMove}
            onMouseUp={handleSelectionMouseUp}
            onMouseLeave={handleSelectionMouseUp}
            onTouchMove={handleSelectionTouchMove}
            onTouchEnd={handleSelectionTouchEnd}
          >
            {/* Image with zoom and rotation */}
            <div 
              className="absolute w-full h-full"
              style={{
                transform: `rotate(${rotation}deg) scale(${scale})`,
                transformOrigin: 'center center',
                transition: 'transform 0.1s ease-out'
              }}
            >
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Crop preview"
                className="w-full h-full object-contain"
                draggable={false}
              />
            </div>
            
            {/* Crop selection area */}
            <div
              ref={selectionRef}
              className={`absolute border-2 border-white cursor-move ${
                cropSelection.isDragging ? 'border-primary' : ''
              }`}
              style={{
                left: `${cropSelection.x}px`,
                top: `${cropSelection.y}px`,
                width: `${cropSelection.width}px`,
                height: `${cropSelection.height}px`,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
              }}
              onMouseDown={handleSelectionMouseDown}
              onTouchStart={handleSelectionTouchStart}
            >
              {/* Corner handles */}
              <div className="absolute w-2 h-2 bg-white rounded-full -top-1 -left-1"></div>
              <div className="absolute w-2 h-2 bg-white rounded-full -top-1 -right-1"></div>
              <div className="absolute w-2 h-2 bg-white rounded-full -bottom-1 -left-1"></div>
              <div className="absolute w-2 h-2 bg-white rounded-full -bottom-1 -right-1"></div>
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
