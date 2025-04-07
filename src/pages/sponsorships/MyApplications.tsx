
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUserSponsorshipApplications } from '@/integrations/supabase/sponsorshipHelpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, BriefcaseIcon, Clock, ExternalLink } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

const MyApplications: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Fetch user's applications
  const { data: applications, isLoading } = useQuery({
    queryKey: ['userApplications', currentUser?.id],
    queryFn: () => getUserSponsorshipApplications(currentUser?.id || ''),
    enabled: !!currentUser,
  });
  
  if (!currentUser) {
    return (
      <div className="container py-8 max-w-4xl text-center">
        <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
        <p className="text-gray-600 mb-6">You need to be logged in to view your applications.</p>
        <Button onClick={() => navigate('/auth/login')}>Log In</Button>
      </div>
    );
  }
  
  if (currentUser.role === 'company') {
    return (
      <div className="container py-8 max-w-4xl text-center">
        <h2 className="text-2xl font-bold mb-4">Not Available</h2>
        <p className="text-gray-600 mb-6">This page is for influencers and coaches.</p>
        <Button onClick={() => navigate('/sponsorships')}>View Sponsorships</Button>
      </div>
    );
  }
  
  return (
    <div className="container py-8 max-w-4xl">
      <Button variant="outline" className="mb-6" onClick={() => navigate('/sponsorships')}>
        Back to Sponsorships
      </Button>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">My Applications</h1>
        <p className="text-gray-600">Manage your sponsorship applications</p>
      </div>
      
      {isLoading ? (
        <div className="animate-pulse space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      ) : applications?.length === 0 ? (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium mb-2">No Applications Yet</h3>
          <p className="text-gray-500 mb-6">You haven't applied to any sponsorships yet.</p>
          <Button onClick={() => navigate('/sponsorships')}>Browse Sponsorships</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {applications?.map((application) => (
            <Card key={application.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <CardContent className="flex-1 p-6">
                  <div className="mb-4">
                    <Badge className={
                      application.status === 'approved' ? 'bg-green-100 text-green-800' :
                      application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </Badge>
                    <span className="text-sm text-gray-500 ml-2">
                      Applied {formatDistanceToNow(application.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">Application Details</h3>
                      <div className="mt-2 space-y-2">
                        <div>
                          <h4 className="text-sm font-medium">Experience</h4>
                          <p className="text-sm text-gray-600 mt-1">{application.experience}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Motivation</h4>
                          <p className="text-sm text-gray-600 mt-1">{application.motivation}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate(`/sponsorships/${application.sponsorshipId}`)}
                      >
                        View Sponsorship
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
