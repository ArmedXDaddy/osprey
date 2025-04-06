import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Briefcase, Building, MapPin, Clock, DollarSign } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { JobPosting } from '@/types';

interface JobPostingDisplay {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  skills: string[];
  postedDate: string;
  companyId: string;
}

const JobPostings = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isCompany = currentUser?.role === 'company';
  const isCompanyRoute = location.pathname.startsWith('/company');
  
  const [jobs, setJobs] = useState<JobPostingDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('job_postings')
          .select('*')
          .order('created_at', { ascending: false }) as { data: JobPosting[] | null, error: any };
          
        if (error) throw error;
        
        const formattedJobs = data?.map(job => ({
          id: job.id,
          title: job.title,
          company: job.company_name || 'Unknown Company',
          companyLogo: job.company_logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company_name || 'Company')}&background=random`,
          location: job.location || 'Remote',
          type: job.job_type || 'Full-time',
          salary: job.salary_range || 'Not specified',
          description: job.description || 'No description provided',
          skills: job.skills ? (Array.isArray(job.skills) ? job.skills : job.skills.toString().split(',').map(s => s.trim())) : [],
          postedDate: job.created_at,
          companyId: job.company_id
        })) || [];
        
        const filteredJobs = isCompanyRoute && isCompany && currentUser?.id
          ? formattedJobs.filter(job => job.companyId === currentUser.id)
          : formattedJobs;
          
        setJobs(filteredJobs);
      } catch (error) {
        console.error('Error loading jobs:', error);
        toast({
          title: 'Failed to load job postings',
          description: 'Please try again later',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadJobs();
  }, [currentUser, isCompany, isCompanyRoute, toast]);
  
  const handleCreateJob = () => {
    navigate('/company/jobs/create');
  };
  
  const handleViewJob = (id: string) => {
    navigate(isCompanyRoute ? `/company/jobs/${id}` : `/jobs/${id}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Job Postings</h1>
          <p className="text-gray-500">Browse job opportunities</p>
        </div>
        
        {isCompany && (
          <Button onClick={handleCreateJob}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Post Job
          </Button>
        )}
      </div>
      
      <Separator />
      
      {loading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 rounded-lg border bg-card animate-pulse" />
          ))}
        </div>
      ) : jobs.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} onClick={() => handleViewJob(job.id)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No job postings available</h3>
          <p className="text-gray-500 mt-2">
            {isCompany 
              ? "You haven't created any job postings yet."
              : "There are no job postings available at this time."}
          </p>
          {isCompany && (
            <Button className="mt-4" onClick={handleCreateJob}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Post Job
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

const JobCard = ({ job, onClick }: { job: JobPostingDisplay, onClick: () => void }) => {
  const formattedDate = new Date(job.postedDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
            <img src={job.companyLogo} alt={job.company} className="h-full w-full object-cover" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{job.title}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <Building className="h-3 w-3" />
              <span>{job.company}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div className="flex items-center gap-1 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{job.type}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <DollarSign className="h-4 w-4" />
            <span>{job.salary}</span>
          </div>
          <div className="text-gray-600 text-sm">
            Posted: {formattedDate}
          </div>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{job.description}</p>
        
        <div className="flex flex-wrap gap-1 mb-2">
          {job.skills.map((skill, i) => (
            <Badge key={i} variant="outline">{skill}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button 
          variant="default" 
          className="w-full"
          onClick={onClick}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default JobPostings;
