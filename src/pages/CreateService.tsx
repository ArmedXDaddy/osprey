
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { createService } from '@/api/services';
import { useToast } from '@/hooks/use-toast';

const CreateService = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Redirect if not a coach
  React.useEffect(() => {
    if (currentUser && currentUser.role !== 'coach') {
      navigate('/services');
      toast({
        title: "Access Denied",
        description: "Only coaches can create services",
        variant: "destructive"
      });
    }
  }, [currentUser, navigate, toast]);
  
  // Service creation form schema
  const formSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    sessionType: z.enum(['one_on_one', 'group']),
    price: z.coerce.number().min(0, "Price must be 0 or greater"),
    duration: z.string().min(2, "Please specify the duration (e.g., '1 hour')"),
    capacity: z.coerce.number().optional(),
    isOnline: z.boolean().default(true),
    location: z.string().optional(),
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
    },
  });
  
  const createServiceMutation = useMutation({
    mutationFn: createService,
    onSuccess: () => {
      toast({
        title: "Service Created",
        description: "Your service has been created successfully",
      });
      navigate('/services');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create service: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: FormValues) => {
    if (!currentUser) return;
    
    const serviceData = {
      ...data,
      providerId: currentUser.id,
      providerName: currentUser.name,
      available: true,
    };
    
    createServiceMutation.mutate(serviceData);
  };
  
  const sessionType = form.watch('sessionType');
  const isOnline = form.watch('isOnline');
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create a New Service</h1>
        <p className="text-gray-500">Share your expertise with others by creating a coaching service</p>
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
                <FormDescription>
                  Make it clear and attractive to potential clients
                </FormDescription>
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
                <FormDescription>
                  Explain what you offer, your expertise, and what clients can expect
                </FormDescription>
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
                    defaultValue={field.value}
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
          
          <div className="pt-4 flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/services')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createServiceMutation.isPending}
            >
              {createServiceMutation.isPending ? 'Creating...' : 'Create Service'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateService;
