import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const jobSchema = z.object({
  title: z.string().min(5, 'Job title must be at least 5 characters'),
  description: z.string().min(50, 'Job description must be at least 50 characters'),
  location: z.string().min(3, 'Location is required'),
  type: z.string(),
  salaryRange: z.string(),
  skills: z.string(),
  applicationUrl: z.string().url('Please enter a valid URL'),
  applicationEmail: z.string().email('Please enter a valid email address'),
  applicationDeadline: z.string()
});

type JobFormValues = z.infer<typeof jobSchema>;

const CreateJobPosting = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Redirect if not a company
  React.useEffect(() => {
    if (currentUser && currentUser.role !== 'company') {
      navigate('/');
      toast({
        title: 'Access Denied',
        description: 'Only companies can post jobs.',
        variant: 'destructive'
      });
    }
  }, [currentUser, navigate, toast]);
  
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      type: 'full-time',
      salaryRange: '',
      skills: '',
      applicationUrl: '',
      applicationEmail: '',
      applicationDeadline: ''
    }
  });
  
  const onSubmit = async (data: JobFormValues) => {
    try {
      if (!currentUser?.id) {
        throw new Error('You must be logged in to post jobs');
      }
      
      // Convert skills to array
      const skillsArray = data.skills.split(',').map(skill => skill.trim());
      
      // Use direct insert method instead of raw SQL
      const { data: result, error } = await supabase
        .from('job_postings')
        .insert({
          title: data.title,
          description: data.description,
          location: data.location,
          job_type: data.type,
          salary_range: data.salaryRange,
          skills: skillsArray,
          application_url: data.applicationUrl,
          application_email: data.applicationEmail,
          application_deadline: data.applicationDeadline,
          company_id: currentUser.id,
          company_name: currentUser.name || 'Unknown Company',
          company_logo: currentUser.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'Company')}&background=random`
        })
        .select();
      
      if (error) throw error;
      
      toast({
        title: 'Job Posted Successfully',
        description: 'Your job posting has been published.',
        variant: 'success'
      });
      
      navigate('/company/jobs');
    } catch (error: any) {
      console.error('Error creating job posting:', error);
      toast({
        title: 'Failed to Create Job',
        description: error.message || 'There was an error posting your job. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Post a Job</h1>
        <p className="text-gray-500">Create a new job posting for your company</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>Provide information about the position you're hiring for.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Senior Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employment Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employment type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="freelance">Freelance</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
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
                        <Input placeholder="e.g. San Francisco, CA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="salaryRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary Range</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. $80,000 - $100,000" {...field} />
                    </FormControl>
                    <FormDescription>
                      Providing a salary range increases application rates.
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
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the job responsibilities, requirements, and benefits..." 
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
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Skills</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. React, Node.js, TypeScript" {...field} />
                    </FormControl>
                    <FormDescription>
                      Separate skills with commas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="applicationUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Application URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://yourcompany.com/careers" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="applicationEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Application Email</FormLabel>
                      <FormControl>
                        <Input placeholder="careers@yourcompany.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="applicationDeadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Deadline</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/company/jobs')}
                >
                  Cancel
                </Button>
                <Button type="submit">Post Job</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateJobPosting;
