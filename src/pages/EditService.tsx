
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Link } from 'lucide-react';
import { fetchServiceById, updateService } from '@/api/services';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const EditService = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch service data
  const { data: service, isLoading, error } = useQuery({
    queryKey: ['service', id],
    queryFn: () => fetchServiceById(id as string),
    enabled: !!id,
  });
  
  // Redirect if not a coach or not the owner of the service
  React.useEffect(() => {
    if (isLoading) return;
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load service information",
        variant: "destructive"
      });
      navigate('/services');
      return;
    }
    
    if (currentUser && service) {
      if (currentUser.role !== 'coach' || currentUser.id !== service.providerId) {
        toast({
          title: "Access Denied",
          description: "You can only edit your own services",
          variant: "destructive"
        });
        navigate('/services');
      }
    }
  }, [currentUser, service, error, isLoading, navigate, toast]);
  
  // Service update form schema
  const formSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    sessionType: z.enum(['one_on_one', 'group']),
    price: z.coerce.number().min(0, "Price must be 0 or greater"),
    duration: z.string().min(2, "Please specify the duration (e.g., '1 hour')"),
    capacity: z.coerce.number().optional(),
    isOnline: z.boolean(),
    location: z.string().optional(),
    meetingUrl: z.string().url("Please enter a valid URL").optional(),
    available: z.boolean(),
  });
  
  type FormValues = z.infer<typeof formSchema>;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      sessionType: 'one_on_one',
      price: 0,
      duration: '',
      isOnline: true,
      location: '',
      meetingUrl: '',
      available: true,
    },
  });
  
  // Update form when service data is loaded
  React.useEffect(() => {
    if (service) {
      form.reset({
        title: service.title,
        description: service.description,
        sessionType: service.sessionType,
        price: service.price,
        duration: service.duration,
        capacity: service.capacity,
        isOnline: service.isOnline,
        location: service.location || '',
        meetingUrl: service.meetingUrl || '',
        available: service.available,
      });
    }
  }, [service, form]);
  
  const updateServiceMutation = useMutation({
    mutationFn: (data: FormValues) => updateService(id as string, {
      ...data,
      isFree: data.price === 0,
    }),
    onSuccess: () => {
      toast({
        title: "Service Updated",
        description: "Your service has been updated successfully",
      });
      navigate(`/services/${id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update service: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: FormValues) => {
    updateServiceMutation.mutate(data);
  };
  
  const sessionType = form.watch('sessionType');
  const isOnline = form.watch('isOnline');
  
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !service) {
    return (
      <div className="max-w-2xl mx-auto text-center py-10">
        <h2 className="text-2xl font-bold mb-2">Service Not Found</h2>
        <p className="text-gray-500 mb-4">The service you're trying to edit doesn't exist or has been removed</p>
        <Button onClick={() => navigate('/services')}>Back to Services</Button>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Service</h1>
        <p className="text-gray-500">Update your service information</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Title</FormLabel>
                <FormControl>
                  <Input placeholder="E.g., Career Coaching Session" {...field} />
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
                    placeholder="Describe what clients will get from this service..."
                    className="min-h-32"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="sessionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Session Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="one_on_one" id="one_on_one" />
                      <label htmlFor="one_on_one" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        One-on-One Coaching
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="group" id="group" />
                      <label htmlFor="group" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Group Session
                      </label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {sessionType === 'group' && (
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity (Seats)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={2}
                      placeholder="E.g., 10" 
                      {...field} 
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum number of participants (leave empty for unlimited)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (USD)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={0}
                    placeholder="0 for free" 
                    {...field} 
                    onChange={(e) => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Set to 0 for free services
                </FormDescription>
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
                  <Input placeholder="E.g., 1 hour" {...field} />
                </FormControl>
                <FormDescription>
                  How long the session will last
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="isOnline"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Online Session</FormLabel>
                  <FormDescription>
                    Is this an online session or in-person?
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
          
          {isOnline && (
            <FormField
              control={form.control}
              name="meetingUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Link</FormLabel>
                  <FormControl>
                    <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 bg-background">
                      <span className="pl-3 text-muted-foreground">
                        <Link className="h-4 w-4" />
                      </span>
                      <Input 
                        placeholder="https://zoom.us/j/12345" 
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        {...field} 
                        value={field.value || ''}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Zoom, Google Meet, or other video conferencing link
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          {!isOnline && (
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., 123 Main St, City" {...field} />
                  </FormControl>
                  <FormDescription>
                    Where the in-person session will take place
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <FormField
            control={form.control}
            name="available"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active Service</FormLabel>
                  <FormDescription>
                    Is this service currently available for booking?
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
          
          <div className="pt-4 flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(`/services/${id}`)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateServiceMutation.isPending}
            >
              {updateServiceMutation.isPending ? 'Updating...' : 'Update Service'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditService;
