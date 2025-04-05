
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, GraduationCap, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const Workshops = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isCompany = currentUser?.role === 'company';
  const isCompanyRoute = location.pathname.startsWith('/company');
  
  // This would come from an API in a real implementation
  const workshops = [
    {
      id: '1',
      title: 'Advanced React Patterns',
      company: 'React Masters',
      companyLogo: 'https://ui-avatars.com/api/?name=React+Masters&background=random',
      date: '2025-06-15',
      startTime: '09:00',
      endTime: '17:00',
      location: 'Online',
      capacity: 50,
      enrolledCount: 32,
      price: '$199',
      description: 'Learn advanced React patterns and techniques to build scalable applications with our expert instructors.',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      tags: ['Frontend', 'React', 'JavaScript', 'Advanced']
    },
    {
      id: '2',
      title: 'Data Science Fundamentals',
      company: 'Data Academy',
      companyLogo: 'https://ui-avatars.com/api/?name=Data+Academy&background=random',
      date: '2025-05-20',
      startTime: '10:00',
      endTime: '16:00',
      location: 'San Francisco, CA',
      capacity: 30,
      enrolledCount: 18,
      price: '$249',
      description: 'A hands-on workshop covering the essentials of data science, from data preprocessing to model evaluation.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      tags: ['Data Science', 'Python', 'Machine Learning', 'Beginner']
    },
    {
      id: '3',
      title: 'Leadership Skills for Tech Managers',
      company: 'Management Excellence',
      companyLogo: 'https://ui-avatars.com/api/?name=Management+Excellence&background=random',
      date: '2025-07-10',
      startTime: '09:30',
      endTime: '15:30',
      location: 'Online',
      capacity: 25,
      enrolledCount: 12,
      price: '$299',
      description: 'Develop essential leadership skills for managing technical teams effectively in this interactive workshop.',
      image: 'https://images.unsplash.com/photo-1565728744382-61accd4aa148?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      tags: ['Leadership', 'Management', 'Communication', 'Soft Skills']
    }
  ];
  
  const handleCreateWorkshop = () => {
    navigate('/company/workshops/create');
  };
  
  const handleViewWorkshop = (id: string) => {
    navigate(isCompanyRoute ? `/company/workshops/${id}` : `/workshops/${id}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workshops & Training</h1>
          <p className="text-gray-500">Discover professional development opportunities</p>
        </div>
        
        {isCompany && (
          <Button onClick={handleCreateWorkshop}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Workshop
          </Button>
        )}
      </div>
      
      <Separator />
      
      {workshops.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {workshops.map((workshop, i) => (
            <WorkshopCard key={i} workshop={workshop} onClick={() => handleViewWorkshop(workshop.id)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <GraduationCap className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No workshops available</h3>
          <p className="text-gray-500 mt-2">
            {isCompany 
              ? "You haven't created any workshops or training sessions yet."
              : "There are no workshops or training sessions available at this time."}
          </p>
          {isCompany && (
            <Button className="mt-4" onClick={handleCreateWorkshop}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Workshop
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

const WorkshopCard = ({ workshop, onClick }: { workshop: any, onClick: () => void }) => {
  const formattedDate = new Date(workshop.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="aspect-video w-full overflow-hidden bg-gray-100">
        <img src={workshop.image} alt={workshop.title} className="w-full h-full object-cover" />
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <img src={workshop.companyLogo} alt={workshop.company} className="h-5 w-5 rounded-full" />
              <span className="text-gray-500 text-sm">{workshop.company}</span>
            </div>
            <CardTitle className="text-lg">{workshop.title}</CardTitle>
          </div>
          <Badge variant="secondary">{workshop.price}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2 flex-1">
        <div className="grid grid-cols-1 gap-2 text-sm mb-3">
          <div className="flex items-center gap-1 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{workshop.startTime} - {workshop.endTime}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{workshop.location}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Users className="h-4 w-4" />
            <span>{workshop.enrolledCount} enrolled (Capacity: {workshop.capacity})</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{workshop.description}</p>
        
        <div className="flex flex-wrap gap-1 mt-auto">
          {workshop.tags.map((tag: string, i: number) => (
            <Badge key={i} variant="outline">{tag}</Badge>
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

export default Workshops;
