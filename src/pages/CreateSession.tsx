
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/hooks/use-toast';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Session } from '@/types';

const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  sessionType: z.enum(['one_on_one', 'group']),
  capacity: z.number().optional(),
  price: z.number().min(0, { message: 'Price must be a positive number' }),
  duration: z.string().min(3, { message: 'Please specify the duration' }),
  startTime: z.date().optional(),
  location: z.string().optional(),
  isOnline: z.boolean().default(false),
  meetingUrl: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

const CreateSession = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { createSession, loading } = useData();
  const { toast } = useToast();
  
  const coachForSession = {
    id: currentUser?.id || '',
    name: currentUser?.name || '',
    role: currentUser?.role || 'user',
    profileImage: currentUser?.profileImage || '',
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      sessionType: 'group',
      capacity: 10,
      price: 20,
      duration: '60 min',
      isOnline: false,
      isActive: true,
    },
  });
  
  const isOnline = form.watch('isOnline');
  const sessionType = form.watch('sessionType');
  
  const onSubmit = async (data: FormValues) => {
    if (!currentUser || currentUser.role !== 'coach') {
      toast({
        title: "Unauthorized",
        description: "Only coaches can create sessions",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Clean up data before submission
      const sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'> = {
        title: data.title,
        description: data.description,
        coachId: currentUser.id,
        coachName: currentUser.name,
        coach: coachForSession,
        type: data.sessionType,
        sessionType: data.sessionType,
        capacity: data.sessionType === 'group' ? data.capacity : undefined,
        price: data.price,
        duration: data.duration,
        startTime: data.startTime || new Date(),
        endTime: data.startTime ? new Date(data.startTime.getTime() + 60*60*1000) : new Date(),
        location: !data.isOnline ? data.location : undefined,
        isOnline: data.isOnline,
        meetingUrl: data.isOnline ? data.meetingUrl : undefined,
        isActive: data.isActive,
        isFree: data.price === 0,
        status: 'upcoming',
        currentAttendees: 0,
        available: true
      };
      
      const session = await createSession(sessionData);
      
      toast({
        title: "Session created",
        description: "Your session has been created successfully",
      });
      
      navigate(`/sessions/${session.id}`);
    } catch (error: any) {
      console.error('Error creating session:', error);
      toast({
        title: "Error creating session",
        description: error.message || "There was an error creating your session",
        variant: "destructive"
      });
    }
  };
  
  if (!currentUser || currentUser.role !== 'coach') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Unauthorized</h2>
        <p className="text-gray-500 mb-6">Only coaches can create sessions.</p>
        <Button onClick={() => navigate('/sessions')}>Go to Sessions</Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => navigate('/sessions')}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Sessions
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New Session</CardTitle>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Strength Training Fundamentals" {...field} />
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
                          placeholder="Describe what participants can expect from this session..." 
                          rows={4} 
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
                    name="sessionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Session Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a session type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="one_on_one">One-on-One</SelectItem>
                            <SelectItem value="group">Group</SelectItem>
                          </SelectContent>
                        </Select>
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
                          <FormLabel>Capacity</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={1} 
                              placeholder="e.g., 10" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || '')}
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum number of participants
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            placeholder="e.g., 25.00" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || '')}
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
                          <Input placeholder="e.g., 60 min" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Time (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPp")
                              ) : (
                                <span>Pick a date and time</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                          <div className="p-3 border-t border-border">
                            <Input
                              type="time"
                              onChange={(e) => {
                                if (field.value && e.target.value) {
                                  const [hours, minutes] = e.target.value.split(':');
                                  const newDate = new Date(field.value);
                                  newDate.setHours(parseInt(hours, 10));
                                  newDate.setMinutes(parseInt(minutes, 10));
                                  field.onChange(newDate);
                                }
                              }}
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        When the session will take place
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
                          Will this session be held online?
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
                          <Input placeholder="e.g., https://zoom.us/j/..." {...field} />
                        </FormControl>
                        <FormDescription>
                          The link participants will use to join the session
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
                          Where the session will take place
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <FormDescription>
                          Make this session available for enrollment
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
              
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => navigate('/sessions')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Session'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateSession;
