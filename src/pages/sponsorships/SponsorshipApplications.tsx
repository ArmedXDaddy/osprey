
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSponsorshipById, getSponsorshipApplications, updateApplicationStatus } from '@/integrations/supabase/sponsorshipHelpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Check, X, Clock, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

const SponsorshipApplications: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedApplication, setSelectedApplication] = React.useState<any>(null);
  
  // Fetch sponsorship details
  const { data: sponsorship, isLoading: isLoadingSponsorship } = useQuery({
    queryKey: ['sponsorship', id],
    queryFn: () => fetchSponsorshipById(id || ''),
    enabled: !!id
  });
  
  // Fetch applications
  const { data: applications, isLoading: isLoadingApplications } = useQuery({
    queryKey: ['sponsorshipApplications', id],
    queryFn: () => getSponsorshipApplications(id || ''),
    enabled: !!id
  });
  
  // Update application status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: string, status: 'approved' | 'rejected' }) => 
      updateApplicationStatus(applicationId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsorshipApplications', id] });
      toast({
        title: 'Application updated',
        description: 'The application status has been updated',
        variant: 'default',
      });
    },
    onError: () => {
      toast({
        title: 'Failed to update',
        description: 'There was an error updating the application status',
        variant: 'destructive',
      });
    }
  });
  
  // Check if user has access (is the company that created the sponsorship)
  const isCompanyOwner = currentUser?.role === 'company' && sponsorship?.companyId === currentUser.id;
  
  if (!isCompanyOwner && !isLoadingSponsorship) {
    return (
      <div className="container py-8 max-w-4xl text-center">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-6">You do not have permission to view these applications.</p>
        <Button onClick={() => navigate('/sponsorships')}>Back to Sponsorships</Button>
      </div>
    );
  }
  
  if (isLoadingSponsorship) {
    return (
      <div className="container py-8 max-w-4xl animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }
  
  const handleViewApplication = (application: any) => {
    setSelectedApplication(application);
  };
  
  const handleUpdateStatus = (applicationId: string, status: 'approved' | 'rejected') => {
    updateStatusMutation.mutate({ applicationId, status });
    setSelectedApplication(null);
  };
  
  return (
    <div className="container py-8 max-w-4xl">
      <Button variant="outline" className="mb-6" onClick={() => navigate(`/sponsorships/${id}`)}>
        Back to Sponsorship
      </Button>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Applications</h1>
        <p className="text-gray-600">
          Viewing applications for "{sponsorship?.title}"
        </p>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
          <CardDescription>
            {applications?.length || 0} application{applications?.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingApplications ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded-md"></div>
              ))}
            </div>
          ) : applications?.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No applications received yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications?.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={application.userProfileImage} />
                          <AvatarFallback>{application.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{application.userName}</p>
                          <p className="text-sm text-gray-500">{application.userEmail}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        application.status === 'approved' ? 'bg-green-100 text-green-800' :
                        application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {formatDistanceToNow(application.createdAt, { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewApplication(application)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Application Detail Dialog */}
      {selectedApplication && (
        <Dialog open={!!selectedApplication} onOpenChange={(open) => !open && setSelectedApplication(null)}>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
              <DialogDescription>
                Application from {selectedApplication.userName}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedApplication.userProfileImage} />
                  <AvatarFallback>{selectedApplication.userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedApplication.userName}</h3>
                  <p className="text-gray-500">{selectedApplication.userEmail}</p>
                  <div className="flex items-center mt-2">
                    <Badge className={
                      selectedApplication.status === 'approved' ? 'bg-green-100 text-green-800' :
                      selectedApplication.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                    </Badge>
                    <span className="text-xs text-gray-500 ml-2">
                      Applied {formatDistanceToNow(selectedApplication.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
              
              {selectedApplication.socialLinks && Object.keys(selectedApplication.socialLinks).some(key => !!selectedApplication.socialLinks[key]) && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Social Media Links</h4>
                  <div className="space-y-1">
                    {selectedApplication.socialLinks.instagram && (
                      <a 
                        href={`https://instagram.com/${selectedApplication.socialLinks.instagram.replace('@', '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-blue-600 hover:underline"
                      >
                        Instagram: {selectedApplication.socialLinks.instagram}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    )}
                    {selectedApplication.socialLinks.twitter && (
                      <a 
                        href={`https://twitter.com/${selectedApplication.socialLinks.twitter.replace('@', '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-blue-600 hover:underline"
                      >
                        Twitter: {selectedApplication.socialLinks.twitter}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    )}
                    {selectedApplication.socialLinks.website && (
                      <a 
                        href={selectedApplication.socialLinks.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-blue-600 hover:underline"
                      >
                        Website: {selectedApplication.socialLinks.website}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    )}
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium mb-2">Experience</h4>
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  {selectedApplication.experience}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Motivation</h4>
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  {selectedApplication.motivation}
                </div>
              </div>
              
              {selectedApplication.status === 'pending' && (
                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    variant="destructive" 
                    onClick={() => handleUpdateStatus(selectedApplication.id, 'rejected')}
                    disabled={updateStatusMutation.isPending}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button 
                    onClick={() => handleUpdateStatus(selectedApplication.id, 'approved')}
                    disabled={updateStatusMutation.isPending}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SponsorshipApplications;
