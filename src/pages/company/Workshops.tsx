
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Users, Calendar, Clock, MapPin, Video, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

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
      company: 'Tech Solutions',
      companyLogo: 'https://ui-avatars.com/api/?name=Tech+Solutions&background=random',
      description: 'Learn advanced React patterns and techniques to build scalable, maintainable applications.',
      date: new Date('2025-05-10T14:00:00'),
      duration: '2 hours',
      isOnline: true,
      location: null,
      meetingUrl: 'https://zoom.us/j/1234567890',
      price: 49.99,
      capacity: 50,
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      category: 'Technology'
    },
    {
      id: '2',
      title: 'Business Marketing Strategies',
      company: 'Marketing Pros',
      companyLogo: 'https://ui-avatars.com/api/?name=Marketing+Pros&background=random',
      description: 'Join us for a comprehensive workshop on effective marketing strategies for small businesses.',
      date: new Date('2025-05-15T10:00:00'),
      duration: '3 hours',
      isOnline: false,
      location: '123 Business Center, New York, NY',
      meetingUrl: null,
      price: 99.99,
      capacity: 30,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      category: 'Marketing'
    },
    {
      id: '3',
      title: 'UI/UX Design Fundamentals',
      company: 'Design Studio',
      companyLogo: 'https://ui-avatars.com/api/?name=Design+Studio&background=random',
      description: 'Master the basics of UI/UX design in this hands-on workshop for beginners and intermediate designers.',
      date: new Date('2025-05-20T13:00:00'),
      duration: '4 hours',
      isOnline: true,
      location: null,
      meetingUrl: 'https://zoom.us/j/0987654321',
      price: 79.99,
      capacity: 25,
      image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      category: 'Design'
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
          <p className="text-gray-500">Browse upcoming workshops and training sessions</p>
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
          <Users className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No workshops available</h3>
          <p className="text-gray-500 mt-2">
            {isCompany 
              ? "You haven't created any workshops yet."
              : "There are no workshops available at this time."}
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
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="aspect-video w-full overflow-hidden bg-gray-100">
        <img src={workshop.image} alt={workshop.title} className="w-full h-full object-cover" />
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-lg">{workshop.title}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <img src={workshop.companyLogo} alt={workshop.company} className="h-4 w-4 rounded-full" />
              <span>{workshop.company}</span>
            </CardDescription>
          </div>
          <Badge variant="outline">{workshop.category}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2 flex-1">
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div className="flex items-center gap-1 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{format(workshop.date, 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{format(workshop.date, 'h:mm a')} ({workshop.duration})</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            {workshop.isOnline ? (
              <>
                <Video className="h-4 w-4" />
                <span>Online</span>
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4" />
                <span>In-person</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Users className="h-4 w-4" />
            <span>{workshop.capacity ? `${workshop.capacity} spots` : 'Unlimited'}</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-3 mb-3">{workshop.description}</p>
        
        <div className="mt-auto">
          <div className="text-lg font-bold text-primary">
            ${workshop.price.toFixed(2)}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button 
          variant="default" 
          className="w-full"
          onClick={onClick}
        >
          Learn More
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Workshops;
