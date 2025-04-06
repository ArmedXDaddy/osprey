
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { SponsorshipStatus } from '@/types';

const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters' }),
  description: z.string().min(20, { message: 'Description must be at least 20 characters' }),
  requirements: z.string().min(10, { message: 'Requirements must be at least 10 characters' }),
  benefits: z.string().min(10, { message: 'Benefits must be at least 10 characters' }),
  compensation: z.string().optional(),
  deadline: z.date().optional(),
  tags: z.string().optional(),
});

const CreateSponsorship = () => {
  const { currentUser } = useAuth();
  const { createSponsorship } = useData();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect non-company users to the home page
  useEffect(() => {
    if (currentUser && currentUser.role !== 'company') {
      navigate('/');
      toast({
        variant: 'destructive',
        title: 'Permission denied',
        description: 'Only companies can create sponsorship opportunities',
      });
    }
  }, [currentUser, navigate]);

  // If user is not logged in or is not a company, show access denied
  if (!currentUser || currentUser.role !== 'company') {
    return null; // Return null while redirecting
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      requirements: '',
      benefits: '',
      compensation: '',
      tags: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!currentUser || currentUser.role !== 'company') {
      toast({
        variant: 'destructive',
        title: 'Permission denied',
        description: 'Only companies can create sponsorship opportunities',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Parse requirements, benefits and tags into arrays
      const requirementsArray = values.requirements
        .split('\n')
        .filter(item => item.trim() !== '')
        .map(item => item.trim());

      const benefitsArray = values.benefits
        .split('\n')
        .filter(item => item.trim() !== '')
        .map(item => item.trim());

      const tagsArray = values.tags
        ? values.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
        : [];

      const sponsorshipData = {
        title: values.title,
        description: values.description,
        requirements: requirementsArray,
        benefits: benefitsArray,
        compensation: values.compensation,
        deadline: values.deadline,
        tags: tagsArray,
        companyId: currentUser.id,
        companyName: currentUser.name,
        companyLogo: currentUser.profileImage,
        status: 'active' as SponsorshipStatus,
      };

      const newSponsorship = await createSponsorship(sponsorshipData);
      
      toast({
        title: 'Sponsorship created',
        description: 'Your sponsorship opportunity has been published',
      });
      
      navigate(`/sponsorships/${newSponsorship.id}`);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create sponsorship',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Create Sponsorship Opportunity</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Brand Ambassador Program" {...field} />
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
                    placeholder="Describe the sponsorship opportunity in detail" 
                    className="min-h-[120px]"
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
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requirements</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List each requirement on a new line"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="benefits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Benefits</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List each benefit on a new line"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="compensation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Compensation (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. $500 per month, Free products, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Application Deadline (Optional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          !field.value && "text-muted-foreground"
                        }`}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
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
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. fashion, beauty, fitness (comma separated)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/sponsorships')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Sponsorship'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateSponsorship;
