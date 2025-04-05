
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, Building, Tag, CheckCircle, ExternalLink } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const WorkshopDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  // In a real implementation, we would fetch the workshop details by ID
  // For now, using placeholder data
  const workshop = {
    id: id,
    title: 'Advanced React Patterns for Enterprise Applications',
    company: 'React Masters',
    companyLogo: 'https://ui-avatars.com/api/?name=React+Masters&background=random',
    date: '2025-06-15',
    startTime: '09:00',
    endTime: '17:00',
    location: 'Online (Zoom)',
    capacity: 50,
    enrolledCount: 32,
    price: '$199',
    description: 'A comprehensive workshop covering advanced React patterns and techniques for building scalable enterprise applications.',
    longDescription: 'Join us for an intensive one-day workshop where you\'ll learn how to implement advanced React patterns that solve complex UI challenges in enterprise applications. Our expert instructors will guide you through practical exercises and real-world examples that you can apply immediately to your projects.',
    topics: [
      'Component composition strategies',
      'State management beyond Redux',
      'Performance optimization techniques',
      'Custom hooks for reusable logic',
      'Render props and higher-order components',
      'Suspense and concurrent mode',
      'Testing strategies for complex components',
      'TypeScript best practices with React'
    ],
    prerequisites: [
      'Solid understanding of React fundamentals',
      'Experience with hooks and functional components',
      'Basic knowledge of TypeScript',
      'Familiarity with modern JavaScript (ES6+)'
    ],
    instructors: [
      {
        name: 'Sarah Johnson',
        role: 'Senior React Engineer',
        bio: 'Sarah has 8+ years of experience building React applications at scale and is a frequent conference speaker.',
        avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson'
      },
      {
        name: 'Michael Chen',
        role: 'Frontend Architect',
        bio: 'Michael specializes in performance optimization and has contributed to several popular React libraries.',
        avatar: 'https://ui-avatars.com/api/?name=Michael+Chen'
      }
    ],
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80&ixlib=rb-4.0.3',
    tags: ['React', 'Advanced', 'Enterprise', 'Patterns', 'Frontend'],
    includes: [
      'Full day of live instruction',
      'Workshop materials and slides',
      'Code repository access',
      '30 days of recording access',
      'Certificate of completion',
      'Community access for questions'
    ],
    registrationUrl: 'https://example.com/register'
  };
  
  const formattedDate = new Date(workshop.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const enrollmentPercentage = (workshop.enrolledCount / workshop.capacity) * 100;
  const spotsRemaining = workshop.capacity - workshop.enrolledCount;
  
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="overflow-hidden">
        <div className="w-full h-64 overflow-hidden bg-gray-100">
          <img src={workshop.image} alt={workshop.title} className="w-full h-full object-cover object-center" />
        </div>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border">
              <img src={workshop.companyLogo} alt={workshop.company} className="h-full w-full object-cover" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{workshop.title}</CardTitle>
                <Badge variant="secondary">{workshop.price}</Badge>
              </div>
              <div className="flex items-center text-gray-500">
                <Building className="h-4 w-4 mr-1" />
                <span>{workshop.company}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>{workshop.startTime} - {workshop.endTime}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{workshop.location}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{workshop.enrolledCount} enrolled (Capacity: {workshop.capacity})</span>
                </div>
                <span className="text-xs">{spotsRemaining} spots left</span>
              </div>
              <Progress value={enrollmentPercentage} className="h-2" />
              <div className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4 text-gray-500" />
                <span>Registration: {workshop.price}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">About This Workshop</h3>
            <p className="text-gray-700 mb-3">{workshop.description}</p>
            <p className="text-gray-700">{workshop.longDescription}</p>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">What You'll Learn</h3>
              <ul className="space-y-1">
                {workshop.topics.map((topic, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Prerequisites</h3>
              <ul className="list-disc pl-5 space-y-1">
                {workshop.prerequisites.map((prerequisite, i) => (
                  <li key={i} className="text-gray-700">{prerequisite}</li>
                ))}
              </ul>
              
              <h3 className="text-lg font-medium mt-6 mb-2">What's Included</h3>
              <ul className="space-y-1">
                {workshop.includes.map((item, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-4">Meet Your Instructors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workshop.instructors.map((instructor, i) => (
                <Card key={i} className="border">
                  <CardHeader className="pb-2 flex flex-row items-center space-y-0 gap-3">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                      <img src={instructor.avatar} alt={instructor.name} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{instructor.name}</CardTitle>
                      <CardDescription>{instructor.role}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{instructor.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {workshop.tags.map((tag, i) => (
                <Badge key={i} variant="outline">{tag}</Badge>
              ))}
            </div>
          </div>
          
          <div className="pt-4">
            <Button size="lg" className="w-full" onClick={() => window.open(workshop.registrationUrl, "_blank")}>
              Register Now ({spotsRemaining} spots remaining)
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkshopDetail;
