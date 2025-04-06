
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
import ImageGallery from "@/components/profile/ImageGallery"
import { Image, Upload } from 'lucide-react';

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
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaGallery, setMediaGallery] = useState([
    { name: 'Event 1', url: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81' },
    { name: 'Event 2', url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158' },
    { name: 'Event 3', url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c' },
    { name: 'Event 4', url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d' },
    { name: 'Event 5', url: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7' },
  ]);

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

  const handleSelectImage = (url: string) => {
    form.setValue("image", url);
    setShowImageGallery(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // In a real app, we would upload the file to storage here
      // For this demo, we'll create a local URL
      const imageUrl = URL.createObjectURL(file);
      
      // Add the new image to the gallery
      setMediaGallery(prev => [
        { name: file.name, url: imageUrl },
        ...prev
      ]);
      
      // Auto-select the uploaded image
      form.setValue("image", imageUrl);
      
      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully."
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Failed to upload image. Please try again."
      });
    } finally {
      setUploading(false);
    }
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
                  {field.value ? (
                    <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-md border border-gray-200">
                      <img 
                        src={field.value} 
                        alt="Event preview" 
                        className="h-full w-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute bottom-2 right-2 bg-white/80"
                        onClick={() => setShowImageGallery(true)}
                      >
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="flex aspect-video w-full max-w-md cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
                      onClick={() => setShowImageGallery(true)}
                    >
                      <div className="flex flex-col items-center justify-center space-y-2 p-4 text-center">
                        <Image className="h-10 w-10 text-gray-400" />
                        <p className="text-sm font-medium">
                          Click to select an image
                        </p>
                        <p className="text-xs text-gray-500">
                          Select an image from your gallery or upload a new one
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowImageGallery(true)}
                    className="w-full max-w-md"
                  >
                    <Image className="mr-2 h-4 w-4" /> 
                    Select from Gallery
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

      <Dialog open={showImageGallery} onOpenChange={setShowImageGallery}>
        <DialogContent className="sm:max-w-2xl">
          <DialogTitle>Select Event Image</DialogTitle>
          <ImageGallery
            images={mediaGallery}
            onSelectImage={handleSelectImage}
            onUploadImage={handleImageUpload}
            uploading={uploading}
            emptyMessage="No images found in your gallery."
            aspectRatio="landscape"
            selectedImage={watchImage}
            onClose={() => setShowImageGallery(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateEvent;
