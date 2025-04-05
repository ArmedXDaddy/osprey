
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Briefcase, Building, MapPin, Clock, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const JobPostings = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const isCompany = currentUser?.role === 'company';
  
  // This would come from an API in a real implementation
  const jobs = [];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Job Postings</h1>
          <p className="text-gray-500">Browse job opportunities</p>
        </div>
        
        {isCompany && (
          <Button onClick={() => navigate('/company/jobs/create')}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Post Job
          </Button>
        )}
      </div>
      
      <Separator />
      
      {jobs.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {jobs.map((job, i) => (
            <JobCard key={i} job={job} />
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
            <Button className="mt-4" onClick={() => navigate('/company/jobs/create')}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Post Job
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

const JobCard = ({ job }: { job: any }) => {
  const navigate = useNavigate();
  
  // Example job data
  const {
    id = '1',
    title = 'Software Engineer',
    company = 'Tech Company',
    companyLogo = 'https://ui-avatars.com/api/?name=Tech+Company&background=random',
    location = 'San Francisco, CA',
    type = 'Full-time',
    salary = '$120,000 - $150,000',
    description = 'We are looking for a skilled software engineer to join our team...',
    skills = ['React', 'TypeScript', 'Node.js'],
    postedDate = '2023-04-01'
  } = job || {};
  
  const formattedDate = new Date(postedDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
            <img src={companyLogo} alt={company} className="h-full w-full object-cover" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <Building className="h-3 w-3" />
              <span>{company}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div className="flex items-center gap-1 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{type}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <DollarSign className="h-4 w-4" />
            <span>{salary}</span>
          </div>
          <div className="text-gray-600 text-sm">
            Posted: {formattedDate}
          </div>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{description}</p>
        
        <div className="flex flex-wrap gap-1 mb-2">
          {skills.map((skill, i) => (
            <Badge key={i} variant="outline">{skill}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button 
          variant="default" 
          className="w-full"
          onClick={() => navigate(`/company/jobs/${id}`)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default JobPostings;
