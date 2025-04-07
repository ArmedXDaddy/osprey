
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { EventRegistration } from '@/types';
import { DollarSign } from 'lucide-react';

interface EventRegistrationFormProps {
  onSubmit: (data: EventRegistration) => Promise<void>;
  isProcessing: boolean;
  isPaidEvent?: boolean;
  price?: number;
}

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  age: z.coerce.number().optional(),
  gender: z.string().optional(),
  phone: z.string().optional(),
  emergencyContact: z.string().optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  additionalInfo: z.string().optional(),
});

const EventRegistrationForm = ({ 
  onSubmit, 
  isProcessing, 
  isPaidEvent = false,
  price = 0 
}: EventRegistrationFormProps) => {
  const { currentUser } = useAuth();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      age: undefined,
      gender: '',
      phone: '',
      emergencyContact: '',
      instagram: currentUser?.socialLinks?.instagram || '',
      twitter: currentUser?.socialLinks?.twitter || '',
      additionalInfo: '',
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!currentUser) return;
    
    const registrationData: EventRegistration = {
      userId: currentUser.id,
      name: values.name,
      email: values.email,
      age: values.age,  // z.coerce.number() handles the type conversion
      gender: values.gender,
      phone: values.phone,
      emergencyContact: values.emergencyContact,
      instagram: values.instagram,
      twitter: values.twitter,
      additionalInfo: values.additionalInfo,
      registeredAt: new Date(),
      profileImage: currentUser.profileImage,
      paymentStatus: isPaidEvent ? 'pending' : 'not_required',
    };
    
    await onSubmit(registrationData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {isPaidEvent && (
          <div className="bg-muted p-4 rounded-lg flex items-center mb-4">
            <DollarSign className="h-5 w-5 text-primary mr-2" />
            <div>
              <p className="font-medium">This is a paid event</p>
              <p className="text-sm text-muted-foreground">
                You will be asked to complete payment of ${price} after registration
              </p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Your age (optional)" 
                    {...field} 
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Your phone number (optional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="emergencyContact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emergency Contact</FormLabel>
                <FormControl>
                  <Input placeholder="Emergency contact (optional)" {...field} />
                </FormControl>
                <FormDescription>
                  Name and phone number of someone we can contact in case of emergency
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Social Media (Optional)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram</FormLabel>
                  <FormControl>
                    <Input placeholder="Instagram handle" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="twitter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twitter</FormLabel>
                  <FormControl>
                    <Input placeholder="Twitter handle" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="additionalInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Information</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Anything else you'd like the organizer to know" 
                    className="min-h-24"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit" disabled={isProcessing} className="w-full">
          {isProcessing ? "Processing..." : "Register for Event"}
        </Button>
      </form>
    </Form>
  );
};

export default EventRegistrationForm;
