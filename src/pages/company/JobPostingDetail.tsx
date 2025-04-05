
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Building, MapPin, Clock, DollarSign, Calendar, ExternalLink } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const JobPostingDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  // In a real implementation, we would fetch the job details by ID
  // For now, using placeholder data
  const job = {
    id: id,
    title: 'Senior Frontend Developer',
    company: 'Tech Solutions Inc.',
    companyLogo: 'https://ui-avatars.com/api/?name=Tech+Solutions&background=random',
    location: 'San Francisco, CA (Remote Available)',
    type: 'Full-time',
    salary: '$130,000 - $160,000',
    description: 'We are looking for a passionate Senior Frontend Developer to join our growing team. You will be responsible for building and maintaining our web applications, ensuring high-performance and responsiveness to user interactions.',
    responsibilities: [
      'Develop new user-facing features using React.js',
      'Build reusable components and front-end libraries for future use',
      'Translate designs and wireframes into high-quality code',
      'Optimize components for maximum performance across devices and browsers',
      'Coordinate with various stakeholders from design, product, and engineering teams'
    ],
    requirements: [
      '5+ years of experience in frontend development',
      'Strong proficiency in JavaScript, TypeScript, and React.js',
      'Experience with modern frontend build pipelines and tools',
      'Understanding of server-side rendering and its benefits',
      'Familiarity with RESTful APIs and GraphQL',
      'Knowledge of modern authorization mechanisms like OAuth 2.0'
    ],
    benefits: [
      'Competitive salary package',
      'Flexible working hours and remote work options',
      'Health, dental, and vision insurance',
      '401(k) matching',
      'Professional development budget',
      'Unlimited PTO policy'
    ],
    skills: ['React', 'TypeScript', 'JavaScript', 'CSS', 'HTML', 'GraphQL'],
    postedDate: '2025-03-15',
    applicationUrl: 'https://example.com/apply',
    companyDescription: 'Tech Solutions Inc. is a leading software development company specializing in creating innovative solutions for enterprise clients. With offices in major tech hubs and a team of over 200 professionals, we are dedicated to pushing the boundaries of what technology can achieve.'
  };
  
  const formattedDate = new Date(job.postedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
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
            <p className="text-gray-700">{job.description}</p>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-2">Key Responsibilities</h3>
            <ul className="list-disc pl-5 space-y-1">
              {job.responsibilities.map((item, i) => (
                <li key={i} className="text-gray-700">{item}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Requirements</h3>
            <ul className="list-disc pl-5 space-y-1">
              {job.requirements.map((item, i) => (
                <li key={i} className="text-gray-700">{item}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Benefits & Perks</h3>
            <ul className="list-disc pl-5 space-y-1">
              {job.benefits.map((item, i) => (
                <li key={i} className="text-gray-700">{item}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, i) => (
                <Badge key={i} variant="secondary">{skill}</Badge>
              ))}
            </div>
          </div>
          
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
