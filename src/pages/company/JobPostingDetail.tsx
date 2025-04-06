
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Building, MapPin, Clock, DollarSign, Calendar, ExternalLink } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const JobPostingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('job_postings')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        setJob({
          id: data.id,
          title: data.title,
          company: data.company_name,
          companyLogo: data.company_logo,
          location: data.location,
          type: data.job_type,
          salary: data.salary_range,
          description: data.description,
          responsibilities: data.responsibilities || [],
          requirements: data.requirements || [],
          benefits: data.benefits || [],
          skills: Array.isArray(data.skills) ? data.skills : [],
          postedDate: data.created_at,
          applicationUrl: data.application_url,
          applicationDeadline: data.application_deadline,
          companyDescription: data.company_description || 'No company description available.'
        });
      } catch (error) {
        console.error('Error fetching job details:', error);
        toast({
          title: 'Failed to load job details',
          description: 'Please try again later',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobDetails();
  }, [id, toast]);
  
  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Card className="animate-pulse">
          <CardHeader className="pb-3">
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!job) {
    return (
      <div className="text-center py-12">
        <Briefcase className="h-12 w-12 mx-auto text-gray-400" />
        <h3 className="mt-4 text-lg font-medium">Job not found</h3>
        <p className="text-gray-500 mt-2">The job posting you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }
  
  const formattedDate = new Date(job.postedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const formattedDeadline = job.applicationDeadline 
    ? new Date(job.applicationDeadline).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null;
  
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border">
              <img src={job.companyLogo} alt={job.company} className="h-full w-full object-cover" />
            </div>
            <div className="space-y-1 flex-1">
              <CardTitle className="text-2xl">{job.title}</CardTitle>
              <div className="flex items-center text-gray-500">
                <Building className="h-4 w-4 mr-1" />
                <span>{job.company}</span>
              </div>
              <div className="flex flex-wrap gap-3 mt-2">
                <div className="flex items-center text-gray-600 text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{job.type}</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span>{job.salary}</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Posted: {formattedDate}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Job Description</h3>
            <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
          </div>
          
          <Separator />
          
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Key Responsibilities</h3>
              <ul className="list-disc pl-5 space-y-1">
                {job.responsibilities.map((item: string, i: number) => (
                  <li key={i} className="text-gray-700">{item}</li>
                ))}
              </ul>
            </div>
          )}
          
          {job.requirements && job.requirements.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Requirements</h3>
              <ul className="list-disc pl-5 space-y-1">
                {job.requirements.map((item: string, i: number) => (
                  <li key={i} className="text-gray-700">{item}</li>
                ))}
              </ul>
            </div>
          )}
          
          {job.benefits && job.benefits.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Benefits & Perks</h3>
              <ul className="list-disc pl-5 space-y-1">
                {job.benefits.map((item: string, i: number) => (
                  <li key={i} className="text-gray-700">{item}</li>
                ))}
              </ul>
            </div>
          )}
          
          {job.skills && job.skills.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill: string, i: number) => (
                  <Badge key={i} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
          )}
          
          {formattedDeadline && (
            <div>
              <h3 className="text-lg font-medium mb-2">Application Deadline</h3>
              <p className="text-gray-700">{formattedDeadline}</p>
            </div>
          )}
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-2">About {job.company}</h3>
            <p className="text-gray-700">{job.companyDescription}</p>
          </div>
          
          <div className="pt-4">
            <Button size="lg" className="w-full md:w-auto" onClick={() => window.open(job.applicationUrl, "_blank")}>
              Apply for this position
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobPostingDetail;
