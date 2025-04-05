
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Service, ServiceType } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { createService } from '@/api/services';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  serviceType: z.enum(['one_on_one', 'group']),
  capacity: z.number().min(2).optional(),
  price: z.number().min(0),
  isFree: z.boolean(),
  duration: z.string().min(1, { message: "Duration is required" }),
  image: z.string().optional(),
  location: z.string().optional(),
  isOnline: z.boolean(),
  meetingUrl: z.string().url({ message: "Please enter a valid URL" }).optional(),
  isActive: z.boolean()
});

type FormValues = z.infer<typeof formSchema>;

const CreateServiceForm: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      serviceType: 'one_on_one',
      capacity: 5,
      price: 0,
      isFree: true,
      duration: '60 min',
      image: '',
      location: '',
      isOnline: false,
      meetingUrl: '',
      isActive: true
    }
  });
  
  const serviceType = form.watch('serviceType');
  const isOnline = form.watch('isOnline');
  const isFree = form.watch('isFree');
  
  const onSubmit = async (values: FormValues) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a service",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'> = {
        title: values.title,
        description: values.description,
        coachId: currentUser.id,
        coachName: currentUser.name,
        serviceType: values.serviceType,
        capacity: values.capacity,
        price: values.price,
        isFree: values.isFree,
        duration: values.duration,
        image: values.image,
        location: values.location,
        isOnline: values.isOnline,
        meetingUrl: values.meetingUrl,
        isActive: values.isActive
      };
      
      const newService = await createService(serviceData);
      
      toast({
        title: "Service created",
        description: "Your service has been successfully created",
        variant: "success"
      });
      
      navigate('/services');
    } catch (error) {
      console.error('Error creating service:', error);
      toast({
        title: "Failed to create service",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6 md:col-span-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Personal Training Session" {...field} />
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
                      placeholder="Describe your service, what clients will get, etc." 
                      className="min-h-32" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-6">
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
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {field.value === 'one_on_one' 
                      ? 'Personalized session for individual clients' 
                      : 'Session for multiple participants at once'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {serviceType === 'group' && (
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={2}
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))} 
                      />
                    </FormControl>
                    <FormDescription>Maximum number of participants</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="isFree"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Free Service</FormLabel>
                    <FormDescription>
                      Is this service offered for free?
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
            
            {!isFree && (
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0} 
                        step={0.01}
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 60 min, 2 hours" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="isOnline"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Online Service</FormLabel>
                    <FormDescription>
                      Will this service be delivered online?
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
            
            {isOnline ? (
              <FormField
                control={form.control}
                name="meetingUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting URL</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., https://zoom.us/j/123456789" {...field} />
                    </FormControl>
                    <FormDescription>
                      The URL clients will use to join your online session
                    </FormDescription>
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
                      <Input placeholder="e.g., Fitness Studio, Downtown" {...field} />
                    </FormControl>
                    <FormDescription>
                      Where will this service take place?
                    </FormDescription>
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
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormDescription>
                    An image representing your service
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <FormDescription>
                      Is this service currently active and available?
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
        </div>
        
        <div className="flex gap-4 justify-end">
          <Button variant="outline" type="button" onClick={() => navigate('/services')}>
            Cancel
          </Button>
          <Button type="submit">Create Service</Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateServiceForm;
