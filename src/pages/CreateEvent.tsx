
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useData } from '@/context/DataContext';
import { EventPrivacy } from '@/types';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Image, Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { uploadImage } from '@/integrations/supabase/helpers';

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  date: z.date(),
  privacy: z.enum(['public', 'private', 'paid']),
  price: z.number().optional(),
  image: z.string().optional(),
});

const CreateEvent = () => {
  const navigate = useNavigate();
  const { createEvent } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [eventImages, setEventImages] = useState<{ name: string; url: string }[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      date: new Date(),
      privacy: 'public',
      price: 0,
      image: "",
    },
  });

  // Watch the privacy field to conditionally display price input
  const watchPrivacy = form.watch("privacy");
  const watchImage = form.watch("image");

  // Fetch event images from Supabase storage on component mount
  React.useEffect(() => {
    const fetchEventImages = async () => {
      try {
        setIsLoadingImages(true);
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) return;

        const { data, error } = await supabase.storage
          .from('event_images')
          .list(`${userData.user.id}`, {
            sortBy: { column: 'created_at', order: 'desc' },
          });

        if (error) {
          console.error('Error fetching event images:', error);
          return;
        }

        if (data) {
          const imageUrls = await Promise.all(
            data.map(async (file) => {
              const { data: urlData } = supabase.storage
                .from('event_images')
                .getPublicUrl(`${userData.user.id}/${file.name}`);
              
              return {
                name: file.name,
                url: urlData.publicUrl
              };
            })
          );
          setEventImages(imageUrls);
        }
      } catch (error) {
        console.error('Error in fetchEventImages:', error);
      } finally {
        setIsLoadingImages(false);
      }
    };

    fetchEventImages();
  }, []);

  const handleSubmit = async (formData: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      // If event is paid but no price is set, set a default price
      if (formData.privacy === 'paid' && (!formData.price || formData.price <= 0)) {
        formData.price = 10; // Default price of $10
      }
      
      // Pass the data to createEvent
      const newEvent = await createEvent(formData);
      
      // Redirect to the event detail page
      toast({
        title: "Event created successfully!",
        description: "Your event has been created.",
      });
      
      navigate(`/events/${newEvent.id}`);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: err.message || "Failed to create event. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        throw new Error('User not authenticated');
      }

      // Upload the file to Supabase storage
      const userId = userData.user.id;
      const filePath = `${userId}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      
      // Use the uploadImage helper function
      const imageUrl = await uploadImage(file, filePath);
      
      // Add the new image to the list of event images
      const newImage = { name: file.name, url: imageUrl };
      setEventImages(prev => [newImage, ...prev]);
      
      // Set the image in the form
      form.setValue("image", imageUrl);
      setImagePreview(imageUrl);
      
      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully.",
        variant: "success",
      });
      
      // Close the upload dialog
      setShowImageUpload(false);
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Failed to upload image. Please try again."
      });
    } finally {
      setUploading(false);
      setUploadProgress(100);
    }
  };

  const handleSelectImage = (url: string) => {
    form.setValue("image", url);
    setImagePreview(url);
    setShowImageUpload(false);
  };

  return (
    <div className="container py-8">
      <h2 className="text-2xl font-bold mb-4">Create Event</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Event title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Event description"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Event location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <DatePicker
                  onSelect={field.onChange}
                  className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="privacy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Privacy</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select privacy" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Paid events require attendees to purchase tickets.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {watchPrivacy === 'paid' && (
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Event price"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Image</FormLabel>
                <div className="space-y-4">
                  {field.value || imagePreview ? (
                    <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-md border border-gray-200">
                      <img 
                        src={imagePreview || field.value} 
                        alt="Event preview" 
                        className="h-full w-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute bottom-2 right-2 bg-white/80"
                        onClick={() => setShowImageUpload(true)}
                      >
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="flex aspect-video w-full max-w-md cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
                      onClick={() => setShowImageUpload(true)}
                    >
                      <div className="flex flex-col items-center justify-center space-y-2 p-4 text-center">
                        <Image className="h-10 w-10 text-gray-400" />
                        <p className="text-sm font-medium">
                          Click to select an image
                        </p>
                        <p className="text-xs text-gray-500">
                          Select an image from your storage or upload a new one
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowImageUpload(true)}
                    className="w-full max-w-md"
                  >
                    <Image className="mr-2 h-4 w-4" /> 
                    Select from Storage
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Create Event"}
          </Button>
        </form>
      </Form>

      <Dialog open={showImageUpload} onOpenChange={setShowImageUpload}>
        <DialogContent className="sm:max-w-2xl">
          <DialogTitle>Select or Upload Event Image</DialogTitle>
          
          <div className="space-y-4">
            {/* Upload Section */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Upload New Image</label>
              <label className="cursor-pointer">
                <Input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 transition">
                  {uploading ? (
                    <div className="flex flex-col items-center space-y-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span>Uploading... {uploadProgress}%</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span>Click to upload a new image</span>
                    </div>
                  )}
                </div>
              </label>
            </div>
            
            {/* Gallery Section */}
            <div>
              <h4 className="text-sm font-medium mb-2">Your Images</h4>
              
              {isLoadingImages ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : eventImages.length > 0 ? (
                <div className="grid grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-1">
                  {eventImages.map((image, index) => (
                    <div 
                      key={index} 
                      className={`
                        relative cursor-pointer group overflow-hidden rounded-md border-2
                        ${watchImage === image.url ? "border-primary ring-2 ring-primary ring-opacity-50" : "border-transparent hover:border-gray-300"}
                      `}
                      onClick={() => handleSelectImage(image.url)}
                    >
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={image.url} 
                          alt={`Image ${index + 1}`} 
                          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-md">
                  <div className="flex flex-col items-center p-4">
                    <div className="bg-gray-100 rounded-full p-4 mb-4">
                      <Image className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="mb-4">No images found in your storage.</p>
                    <label className="cursor-pointer">
                      <Input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleImageUpload}
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
            </div>
            
            <div className="flex justify-end mt-4">
              <Button type="button" onClick={() => setShowImageUpload(false)}>
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateEvent;
