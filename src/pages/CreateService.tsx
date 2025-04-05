
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { ServiceType } from '@/types';

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters."
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters."
  }),
  price: z.number().min(0),
  duration: z.string().min(2, {
    message: "Duration must be specified."
  }),
  capacity: z.number().optional(),
  serviceType: z.enum(['one_on_one', 'group', 'webinar', 'course'] as const),
  isOnline: z.boolean(),
  location: z.string().optional(),
  meetingUrl: z.string().optional(),
  coverImage: z.string().optional(),
});

const CreateService = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { services, createService } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      duration: "60 min",
      capacity: 1,
      serviceType: "one_on_one" as ServiceType,
      isOnline: false,
      location: "",
      meetingUrl: "",
      coverImage: "",
    }
  });

  const watchServiceType = form.watch("serviceType");
  const watchIsOnline = form.watch("isOnline");

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!currentUser || currentUser.role !== 'coach') {
      toast({
        variant: "destructive",
        title: "Permission denied",
        description: "Only coaches can create services"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare service data
      const serviceData = {
        title: data.title,
        description: data.description,
        price: data.price,
        duration: data.duration,
        capacity: data.capacity,
        serviceType: data.serviceType,
        isOnline: data.isOnline,
        location: data.location,
        meetingUrl: data.meetingUrl,
        coverImage: data.coverImage,
        providerId: currentUser.id,
        providerName: currentUser.name,
        available: true,
      };

      // Create service
      const newService = await createService(serviceData);
      console.log("Service created successfully:", newService);
      
      toast({
        title: "Service created successfully!",
        description: "Your service has been created."
      });
      
      // Add a small delay to make sure state is updated before navigating
      setTimeout(() => {
        navigate(`/services/${newService.id}`);
      }, 500);
    } catch (err: any) {
      console.error("Error creating service:", err);
      toast({
        variant: "destructive",
        title: "Error creating service",
        description: err.message || "There was an error creating your service. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8">
      <h2 className="text-2xl font-bold mb-4">Create Service</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Service title" {...field} />
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
                    placeholder="Detail what this service offers..." 
                    className="resize-none min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
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
                    <Input placeholder="e.g. 60 min" {...field} />
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
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
          
          {watchServiceType === 'group' && (
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Maximum participants" 
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
            name="isOnline"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Online Service</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    This service will be delivered online
                  </p>
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
          
          {!watchIsOnline && (
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Physical location for this service" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          {watchIsOnline && (
            <FormField
              control={form.control}
              name="meetingUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Zoom, Google Meet, etc. link" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <FormField
            control={form.control}
            name="coverImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Image URL (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="URL for service cover image" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Service"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CreateService;
