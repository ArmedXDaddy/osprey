
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building, MapPin, Clock, DollarSign, Calendar, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const JobPostingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadJob = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('job_postings')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        setJob(data);
      } catch (error) {
        console.error('Error loading job:', error);
        toast({
          title: 'Failed to load job posting',
          description: 'Please try again later',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      loadJob();
    }
  }, [id, toast]);
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const isOwner = currentUser?.id === job?.company_id;
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <div className="py-8">
        <div className="h-6 w-24 bg-gray-200 rounded-md animate-pulse mb-4"></div>
        <div className="h-10 bg-gray-200 rounded-md animate-pulse mb-6"></div>
        <div className="h-64 bg-gray-200 rounded-md animate-pulse"></div>
      </div>
    );
  }
  
  if (!job) {
    return (
      <div className="py-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Job Not Found</h2>
        <p className="text-gray-500 mb-6">The job posting you're looking for doesn't exist or has been removed.</p>
        <Button onClick={handleBack}>Go Back</Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
      
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{job.title}</h1>
          <div className="flex items-center gap-2 text-gray-500 mt-1">
            <Building className="h-4 w-4" />
            <span>{job.company_name}</span>
            {job.location && (
              <>
                <span className="mx-1">•</span>
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          {job.application_url && (
            <Button 
              onClick={() => window.open(job.application_url, '_blank')}
              className="flex items-center gap-2"
            >
              Apply Now
              <ExternalLink size={16} />
            </Button>
          )}
          
          {job.application_url && job.company_id === currentUser?.id && (
            <Button 
              variant="outline"
              onClick={() => navigate(`/company/jobs/edit/${job.id}`)}
            >
              Edit Job
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Employment Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>{job.job_type}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Salary Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span>{job.salary_range || 'Not specified'}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Application Deadline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>{formatDate(job.application_deadline)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Job Description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="whitespace-pre-line">{job.description}</p>
          </div>
          
          {job.skills && job.skills.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Skills</h3>
              <div className="flex flex-wrap gap-1">
                {job.skills.map((skill: string, i: number) => (
                  <Badge key={i} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
          )}
          
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Responsibilities</h3>
              <ul className="list-disc pl-5 space-y-1">
                {job.responsibilities.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          
          {job.requirements && job.requirements.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Requirements</h3>
              <ul className="list-disc pl-5 space-y-1">
                {job.requirements.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          
          {job.benefits && job.benefits.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Benefits</h3>
              <ul className="list-disc pl-5 space-y-1">
                {job.benefits.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          
          {job.company_description && (
            <div>
              <h3 className="font-semibold mb-2">About the Company</h3>
              <p>{job.company_description}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {(job.application_email || job.application_url) && (
        <Card>
          <CardHeader>
            <CardTitle>How to Apply</CardTitle>
          </CardHeader>
          <CardContent>
            {job.application_email && (
              <p>
                Please send your resume and cover letter to <a href={`mailto:${job.application_email}`} className="text-blue-600 hover:underline">{job.application_email}</a>
                {job.application_deadline && ` before ${formatDate(job.application_deadline)}`}.
              </p>
            )}
            
            {job.application_url && (
              <div className="mt-4">
                <Button 
                  onClick={() => window.open(job.application_url, '_blank')}
                  className="w-full md:w-auto flex items-center gap-2"
                >
                  Apply on Company Website
                  <ExternalLink size={16} />
                </Button>
              </div>
            )}
            
            {/* Add LinkedIn or professional networks sharing links */}
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-2">Share this job</h4>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                >
                  LinkedIn
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`https://twitter.com/intent/tweet?text=Check out this job: ${job.title} at ${job.company_name}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
                >
                  Twitter
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast({
                      title: "Link copied",
                      description: "Job posting link has been copied to clipboard",
                    });
                  }}
                >
                  Copy Link
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JobPostingDetail;
