
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, GraduationCap, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const Workshops = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const isCompany = currentUser?.role === 'company';
  
  // This would come from an API in a real implementation
  const workshops = [];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workshops & Training</h1>
          <p className="text-gray-500">Discover professional development opportunities</p>
        </div>
        
        {isCompany && (
          <Button onClick={() => navigate('/company/workshops/create')}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Workshop
          </Button>
        )}
      </div>
      
      <Separator />
      
      {workshops.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {workshops.map((workshop, i) => (
            <WorkshopCard key={i} workshop={workshop} />
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
            <Button className="mt-4" onClick={() => navigate('/company/workshops/create')}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Workshop
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

const WorkshopCard = ({ workshop }: { workshop: any }) => {
  const navigate = useNavigate();
  
  // Example workshop data
  const {
    id = '1',
    title = 'Advanced React Patterns',
    company = 'Tech Company',
    companyLogo = 'https://ui-avatars.com/api/?name=Tech+Company&background=random',
    date = '2025-05-15',
    startTime = '09:00',
    endTime = '17:00',
    location = 'Online',
    capacity = 50,
    enrolledCount = 12,
    price = '$199',
    description = 'Learn advanced React patterns and techniques to build scalable applications...',
    image = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    tags = ['Frontend', 'React', 'JavaScript', 'Advanced']
  } = workshop || {};
  
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="aspect-video w-full overflow-hidden bg-gray-100">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <img src={companyLogo} alt={company} className="h-5 w-5 rounded-full" />
              <span className="text-gray-500 text-sm">{company}</span>
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <Badge variant="secondary">{price}</Badge>
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
            <span>{startTime} - {endTime}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Users className="h-4 w-4" />
            <span>{enrolledCount} enrolled (Capacity: {capacity})</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{description}</p>
        
        <div className="flex flex-wrap gap-1 mt-auto">
          {tags.map((tag, i) => (
            <Badge key={i} variant="outline">{tag}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button 
          variant="default" 
          className="w-full"
          onClick={() => navigate(`/company/workshops/${id}`)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Workshops;
