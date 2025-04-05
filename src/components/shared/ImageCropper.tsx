
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { RotateCcw, Check, Square } from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

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
  const [rotation, setRotation] = useState(0);
  
  // Crop selection area
  const [cropSelection, setCropSelection] = useState({
    x: 0,
    y: 0,
    width: 200,
    height: 200,
    isDragging: false,
    startX: 0,
    startY: 0,
    isResizing: false,
    corner: '' as '' | 'tl' | 'tr' | 'bl' | 'br'
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
        
        // Calculate the selection size (50% of the smaller dimension)
        const selectionSize = Math.min(containerWidth, containerHeight) * 0.5;
        setCropSelection({
          x: (containerWidth - selectionSize) / 2,
          y: (containerHeight - selectionSize) / 2,
          width: selectionSize,
          height: selectionSize / aspectRatio,
          isDragging: false,
          startX: 0,
          startY: 0,
          isResizing: false,
          corner: ''
        });
      }
    };
  }, [imageSrc, aspectRatio]);

  // Start dragging the crop selection
  const handleSelectionMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
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
    } else if (cropSelection.isResizing && containerRef.current) {
      e.preventDefault();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      let newWidth, newHeight, newX = cropSelection.x, newY = cropSelection.y;
      
      // Calculate new dimensions based on corner being dragged
      if (cropSelection.corner === 'br') {
        newWidth = Math.max(80, Math.min(e.clientX - containerRect.left - cropSelection.x, containerRect.width - cropSelection.x));
        newHeight = newWidth / aspectRatio;
      } else if (cropSelection.corner === 'bl') {
        const rightEdge = cropSelection.x + cropSelection.width;
        newWidth = Math.max(80, Math.min(rightEdge - (e.clientX - containerRect.left), rightEdge));
        newHeight = newWidth / aspectRatio;
        newX = rightEdge - newWidth;
      } else if (cropSelection.corner === 'tr') {
        const bottomEdge = cropSelection.y + cropSelection.height;
        newWidth = Math.max(80, Math.min(e.clientX - containerRect.left - cropSelection.x, containerRect.width - cropSelection.x));
        newHeight = newWidth / aspectRatio;
        newY = bottomEdge - newHeight;
      } else if (cropSelection.corner === 'tl') {
        const rightEdge = cropSelection.x + cropSelection.width;
        const bottomEdge = cropSelection.y + cropSelection.height;
        newWidth = Math.max(80, Math.min(rightEdge - (e.clientX - containerRect.left), rightEdge));
        newHeight = newWidth / aspectRatio;
        newX = rightEdge - newWidth;
        newY = bottomEdge - newHeight;
      }
      
      // Ensure selection stays within container
      if (newX < 0) {
        newX = 0;
        newWidth = cropSelection.x + cropSelection.width;
      }
      if (newY < 0) {
        newY = 0;
        newHeight = cropSelection.y + cropSelection.height;
      }
      
      setCropSelection(prev => ({
        ...prev,
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight
      }));
    }
  };

  // Stop dragging
  const handleSelectionMouseUp = () => {
    setCropSelection(prev => ({
      ...prev,
      isDragging: false,
      isResizing: false,
      corner: ''
    }));
  };

  // Handle corner resize start
  const handleCornerMouseDown = (e: React.MouseEvent, corner: 'tl' | 'tr' | 'bl' | 'br') => {
    e.stopPropagation();
    setCropSelection(prev => ({
      ...prev,
      isResizing: true,
      corner: corner
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
    
    // Calculate the scaling of the image in the container
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
        Drag the selection area to position your crop, or resize using the corner handles
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
            {/* Image with rotation */}
            <div 
              className="absolute w-full h-full"
              style={{
                transform: `rotate(${rotation}deg)`,
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
              <div 
                className="absolute w-5 h-5 bg-white/80 border border-gray-400 rounded-full -top-2 -left-2 cursor-nwse-resize"
                onMouseDown={(e) => handleCornerMouseDown(e, 'tl')}
              ></div>
              <div 
                className="absolute w-5 h-5 bg-white/80 border border-gray-400 rounded-full -top-2 -right-2 cursor-nesw-resize"
                onMouseDown={(e) => handleCornerMouseDown(e, 'tr')}
              ></div>
              <div 
                className="absolute w-5 h-5 bg-white/80 border border-gray-400 rounded-full -bottom-2 -left-2 cursor-nesw-resize"
                onMouseDown={(e) => handleCornerMouseDown(e, 'bl')}
              ></div>
              <div 
                className="absolute w-5 h-5 bg-white/80 border border-gray-400 rounded-full -bottom-2 -right-2 cursor-nwse-resize"
                onMouseDown={(e) => handleCornerMouseDown(e, 'br')}
              ></div>
            </div>
          </div>
        </AspectRatio>
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
