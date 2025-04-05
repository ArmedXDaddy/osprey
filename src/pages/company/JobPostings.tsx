
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Briefcase, Building, MapPin, Clock, DollarSign } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const JobPostings = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isCompany = currentUser?.role === 'company';
  const isCompanyRoute = location.pathname.startsWith('/company');
  
  // This would come from an API in a real implementation
  const jobs = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      company: 'Tech Solutions Inc.',
      companyLogo: 'https://ui-avatars.com/api/?name=Tech+Solutions&background=random',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$120,000 - $150,000',
      description: 'We are looking for a skilled senior frontend developer to join our team...',
      skills: ['React', 'TypeScript', 'GraphQL'],
      postedDate: '2025-03-15'
    },
    {
      id: '2',
      title: 'Product Manager',
      company: 'Innovative Apps',
      companyLogo: 'https://ui-avatars.com/api/?name=Innovative+Apps&background=random',
      location: 'New York, NY (Remote)',
      type: 'Full-time',
      salary: '$130,000 - $160,000',
      description: 'Seeking an experienced product manager to lead our SaaS platform development...',
      skills: ['Product Strategy', 'Agile', 'User Research'],
      postedDate: '2025-03-20'
    },
    {
      id: '3',
      title: 'DevOps Engineer',
      company: 'Cloud Systems',
      companyLogo: 'https://ui-avatars.com/api/?name=Cloud+Systems&background=random',
      location: 'Remote',
      type: 'Contract',
      salary: '$90/hour',
      description: 'Looking for a DevOps engineer to help build and maintain our cloud infrastructure...',
      skills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD'],
      postedDate: '2025-03-18'
    }
  ];
  
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
      
      {jobs.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {jobs.map((job, i) => (
            <JobCard key={i} job={job} onClick={() => handleViewJob(job.id)} />
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

const JobCard = ({ job, onClick }: { job: any, onClick: () => void }) => {
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
          {job.skills.map((skill: string, i: number) => (
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
