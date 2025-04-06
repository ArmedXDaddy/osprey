import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

const formSchema = z.object({
  motivation: z.string().min(30, { message: 'Please provide a detailed explanation (at least 30 characters)' }),
  experience: z.string().min(30, { message: 'Please provide details about your experience (at least 30 characters)' }),
  instagramLink: z.string().optional(),
  twitterLink: z.string().optional(),
  websiteLink: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
});

interface SponsorshipApplicationFormProps {
  sponsorshipId: string;
  onSuccess: () => void;
}

const SponsorshipApplicationForm = ({ sponsorshipId, onSuccess }: SponsorshipApplicationFormProps) => {
  const { currentUser } = useAuth();
  const { applyForSponsorship } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      motivation: '',
      experience: '',
      instagramLink: '',
      twitterLink: '',
      websiteLink: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!currentUser) {
      toast({
        variant: 'destructive',
        title: 'Not logged in',
        description: 'You must be logged in to apply for sponsorships',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const applicationData = {
        sponsorshipId,
        userId: currentUser.id,
        motivation: values.motivation,
        experience: values.experience,
        socialLinks: {
          instagram: values.instagramLink || undefined,
          twitter: values.twitterLink || undefined,
          website: values.websiteLink || undefined,
        },
      };

      await applyForSponsorship(sponsorshipId, applicationData);
      
      toast({
        title: 'Application submitted',
        description: 'Your application has been submitted successfully',
      });
      
      onSuccess();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to submit application',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="motivation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Why are you interested in this opportunity?</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Explain why you're a good fit and what attracts you to this opportunity"
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="experience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Relevant experience</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your experience with similar brands or products"
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Social Media Links (Optional)</h3>
          
          <FormField
            control={form.control}
            name="instagramLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instagram</FormLabel>
                <FormControl>
                  <Input placeholder="Your Instagram handle (e.g. @username)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="twitterLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Twitter</FormLabel>
                <FormControl>
                  <Input placeholder="Your Twitter handle (e.g. @username)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="websiteLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website/Portfolio</FormLabel>
                <FormControl>
                  <Input placeholder="https://your-website.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SponsorshipApplicationForm;
