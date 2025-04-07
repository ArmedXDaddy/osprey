import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Service, ServiceType } from '@/types';
import { useNavigate } from 'react-router-dom';
import { ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Define the interface for component props
interface EditServiceFormProps {
  service?: Service;
  onSave?: (service: Service) => void;
}

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  price: z.string().refine(value => {
    const num = Number(value);
    return !isNaN(num) && num >= 0;
  }, {
    message: "Price must be a valid number and greater than or equal to 0.",
  }),
  duration: z.string().min(1, {
    message: "Duration is required.",
  }),
  serviceType: z.enum(['one_on_one', 'group', 'webinar', 'course', 'consultation'], {
    required_error: "Please select a service type.",
  }),
  isOnline: z.boolean().default(false),
  location: z.string().optional(),
  meetingUrl: z.string().optional(),
  capacity: z.string().optional(),
  available: z.boolean().default(true),
  coverImage: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const EditServiceForm: React.FC<EditServiceFormProps> = ({ service, onSave }) => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { createService, updateService } = useData();
  const navigate = useNavigate();

  const isEditMode = !!service;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: service?.title || "",
      description: service?.description || "",
      price: service?.price?.toString() || "0",
      duration: service?.duration || "",
      serviceType: service?.serviceType || "one_on_one",
      isOnline: service?.isOnline || false,
      location: service?.location || "",
      meetingUrl: service?.meetingUrl || "",
      capacity: service?.capacity?.toString() || "1",
      available: service?.available !== undefined ? service.available : true,
    },
    mode: "onChange",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(service?.coverImage || null);
  const [previousImagePath, setPreviousImagePath] = useState<string | null>(null);

  useEffect(() => {
    if (service?.coverImage) {
      setCoverImageUrl(service.coverImage);
      
      // Extract the file path from the URL for later deletion if needed
      try {
        const url = new URL(service.coverImage);
        const pathMatch = url.pathname.match(/\/covers\/(.+)$/);
        if (pathMatch && pathMatch[1]) {
          setPreviousImagePath(pathMatch[1]);
        }
      } catch (error) {
        console.error("Could not parse previous cover image URL:", error);
      }
    }
  }, [service?.coverImage]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setCoverImageUrl(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to upload images.",
        variant: "destructive"
      });
      return null;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB.",
        variant: "destructive"
      });
      return null;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only JPEG, PNG, WebP, and GIF images are allowed.",
        variant: "destructive"
      });
      return null;
    }

    try {
      // Delete the previous image if it exists and we're in edit mode
      if (isEditMode && previousImagePath) {
        try {
          const { error: deleteError } = await supabase.storage
            .from('covers')
            .remove([previousImagePath]);
            
          if (deleteError) {
            console.error('Error deleting previous image:', deleteError);
          } else {
            console.log('Previous image deleted successfully');
          }
        } catch (deleteErr) {
          console.error('Error during delete operation:', deleteErr);
        }
      }

      // Upload the new image
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`;
      const filePath = `services/${fileName}`;

      const { data, error } = await supabase.storage
        .from('covers')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(filePath);
      
      // Update the previous image path for potential future updates
      setPreviousImagePath(filePath);
      
      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading the image.",
        variant: "destructive"
      });
      return null;
    }
  };

  const handleSubmit = async (data: FormData) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create or edit services.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let uploadedCoverImageUrl: string | null = null;
      if (coverImage) {
        uploadedCoverImageUrl = await handleImageUpload(coverImage);
      }

      let serviceData: Service;
      
      if (isEditMode && service) {
        await updateService(service.id, {
          title: data.title,
          description: data.description,
          price: Number(data.price),
          duration: data.duration,
          serviceType: data.serviceType as ServiceType,
          isOnline: data.isOnline,
          location: !data.isOnline ? data.location : undefined,
          meetingUrl: data.isOnline ? data.meetingUrl : undefined,
          capacity: data.serviceType !== 'one_on_one' ? Number(data.capacity) : 1,
          available: data.available,
          coverImage: uploadedCoverImageUrl || coverImageUrl,
        });
        
        serviceData = {
          ...service,
          title: data.title,
          description: data.description,
          price: Number(data.price),
          duration: data.duration,
          serviceType: data.serviceType as ServiceType,
          isOnline: data.isOnline,
          location: !data.isOnline ? data.location : undefined,
          meetingUrl: data.isOnline ? data.meetingUrl : undefined,
          capacity: data.serviceType !== 'one_on_one' ? Number(data.capacity) : 1,
          available: data.available,
          coverImage: uploadedCoverImageUrl || coverImageUrl,
        };
        
        if (onSave) onSave(serviceData);
      } else {
        serviceData = await createService({
          title: data.title,
          description: data.description,
          price: Number(data.price),
          duration: data.duration,
          serviceType: data.serviceType as ServiceType,
          isOnline: data.isOnline,
          location: !data.isOnline ? data.location : undefined,
          meetingUrl: data.isOnline ? data.meetingUrl : undefined,
          capacity: data.serviceType !== 'one_on_one' ? Number(data.capacity) : 1,
          available: data.available,
          coverImage: uploadedCoverImageUrl || coverImageUrl,
        });
        
        if (onSave) onSave(serviceData);
        navigate('/services');
      }

      toast({
        title: isEditMode ? "Service updated!" : "Service created!",
        description: isEditMode 
          ? "Your service has been updated successfully." 
          : "Your new service has been created successfully."
      });
    } catch (error: any) {
      console.error("Error saving service:", error);
      toast({
        title: "Error",
        description: error.message || "There was an error saving your service. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Service Title" {...field} />
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
                      placeholder="Write a detailed description about your service"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 60 minutes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="one_on_one">One-on-One</SelectItem>
                      <SelectItem value="group">Group</SelectItem>
                      <SelectItem value="webinar">Webinar</SelectItem>
                      <SelectItem value="course">Course</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="available"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Available</FormLabel>
                    <FormDescription>
                      Set service availability.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="isOnline"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Online Service</FormLabel>
                    <FormDescription>
                      Is this service provided online?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.getValues("isOnline") ? (
              <FormField
                control={form.control}
                name="meetingUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://meet.google.com/abc-defg-hij" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Service Location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {form.getValues("serviceType") === "group" && (
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Number of participants"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div>
              <Label htmlFor="coverImage">Cover Image</Label>
              <Input
                type="file"
                id="coverImage"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <Button variant="outline" size="sm" asChild>
                <label htmlFor="coverImage" className="cursor-pointer">
                  {coverImage ? "Change Cover Image" : "Upload a Cover Image"}
                  <ImageIcon className="ml-2 h-4 w-4" />
                </label>
              </Button>
              {coverImageUrl && (
                <img
                  src={coverImageUrl}
                  alt="Cover"
                  className="mt-2 rounded-md object-cover aspect-video"
                />
              )}
            </div>
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isEditMode ? (isSubmitting ? "Updating..." : "Update Service") : (isSubmitting ? "Creating..." : "Create Service")}
        </Button>
      </form>
    </Form>
  );
};

export default EditServiceForm;
