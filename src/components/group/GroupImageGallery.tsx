import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useToast } from '../../hooks/use-toast';
import { cn } from '../../lib/utils';
import ImageCropper from '../shared/ImageCropper';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';

interface GroupImageGalleryProps {
  selectedImage: string;
  onSelect: (image: string) => void;
  onFileUpload: (file: File) => Promise<void>;
}

const GroupImageGallery: React.FC<GroupImageGalleryProps> = ({ 
  selectedImage, 
  onSelect,
  onFileUpload 
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be less than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      // Preview the image for cropping
      const reader = new FileReader();
      reader.onload = () => {
        setCropImageSrc(reader.result as string);
        setIsCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      try {
        setUploading(true);
        await onFileUpload(selectedFile);
        // Update selected image to show change immediately
        if (previewImage) {
          onSelect(previewImage);
        }
        // Reset after upload
        setPreviewImage(null);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        toast({
          title: "Upload successful",
          description: "Your image has been uploaded and applied",
        });
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: "Upload failed",
          description: "There was an error uploading your image.",
          variant: "destructive"
        });
      } finally {
        setUploading(false);
      }
    }
  };

  const handleCancel = () => {
    setPreviewImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Check if it's an image
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive"
        });
        return;
      }
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be less than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      // Preview the image for cropping
      const reader = new FileReader();
      reader.onload = () => {
        setCropImageSrc(reader.result as string);
        setIsCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
      
      setSelectedFile(file);
    }
  };

  const handleCropComplete = async (croppedImageUrl: string) => {
    setPreviewImage(croppedImageUrl);
    setIsCropDialogOpen(false);
    
    // Convert the cropped image to a File object
    const response = await fetch(croppedImageUrl);
    const blob = await response.blob();
    const fileName = selectedFile ? selectedFile.name : `cropped_image_${Date.now()}.jpg`;
    const croppedFile = new File([blob], fileName, { type: 'image/jpeg' });
    
    setSelectedFile(croppedFile);
    
    // Auto-upload after cropping to make changes reflect immediately
    try {
      setUploading(true);
      await onFileUpload(croppedFile);
      // Update selected image to show change immediately
      onSelect(croppedImageUrl);
      
      // Reset
      setTimeout(() => {
        setPreviewImage(null);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setUploading(false);
      }, 500);
      
      toast({
        title: "Image updated",
        description: "Your image has been cropped and applied",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Update failed",
        description: "There was an error applying your image.",
        variant: "destructive"
      });
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!previewImage ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 transition-colors flex flex-col items-center justify-center gap-4",
            isDragging ? "border-primary bg-primary/5" : "border-gray-300"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="bg-muted rounded-full p-4">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Drag and drop an image here</p>
            <p className="text-xs text-muted-foreground mt-1">or select a file to upload</p>
          </div>
          <Button 
            type="button" 
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
            disabled={uploading}
          >
            <Upload className="h-4 w-4" />
            <span>Select image</span>
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative inline-block bg-muted p-2 rounded-md">
            <img 
              src={previewImage} 
              alt="Preview" 
              className="max-h-60 max-w-full object-contain rounded-md"
            />
            <button
              onClick={handleCancel}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 w-6 h-6 flex items-center justify-center shadow-md hover:bg-destructive/90 transition-colors"
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="button" 
              size="sm"
              onClick={handleUpload}
              className="flex-1"
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Uploading..." : "Upload Image"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={handleCancel}
              className="flex-1"
              disabled={uploading}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      
      {/* Crop Dialog */}
      <Dialog open={isCropDialogOpen} onOpenChange={(open) => {
        if (!open && cropImageSrc) {
          URL.revokeObjectURL(cropImageSrc);
        }
        setIsCropDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
          </DialogHeader>
          
          {cropImageSrc && (
            <ImageCropper
              imageSrc={cropImageSrc}
              aspectRatio={1}
              onCropComplete={handleCropComplete}
              onCancel={() => {
                if (cropImageSrc) {
                  URL.revokeObjectURL(cropImageSrc);
                }
                setIsCropDialogOpen(false);
                setCropImageSrc(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupImageGallery;
