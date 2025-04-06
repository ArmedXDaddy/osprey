
import React, { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  ExternalLink, 
  Eye, 
  MessageSquare, 
  ThumbsUp, 
  XCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SponsorshipApplication } from '@/types';

interface SponsorshipApplicationsTableProps {
  sponsorshipId: string;
}

const SponsorshipApplicationsTable = ({ sponsorshipId }: SponsorshipApplicationsTableProps) => {
  const { getSponsorshipApplications, updateApplicationStatus } = useData();
  const [applications, setApplications] = useState<SponsorshipApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<SponsorshipApplication | null>(null);
  const [isUpdateStatusLoading, setIsUpdateStatusLoading] = useState(false);

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setIsLoading(true);
        const data = await getSponsorshipApplications(sponsorshipId);
        setApplications(data);
      } catch (error) {
        console.error('Error loading applications:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load applications',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadApplications();
  }, [sponsorshipId, getSponsorshipApplications]);

  const handleViewApplication = (application: SponsorshipApplication) => {
    setSelectedApplication(application);
  };

  const handleUpdateStatus = async (applicationId: string, status: 'approved' | 'rejected') => {
    try {
      setIsUpdateStatusLoading(true);
      await updateApplicationStatus(applicationId, status);
      
      // Update local state
      setApplications(apps => 
        apps.map(app => 
          app.id === applicationId ? { ...app, status } : app
        )
      );
      
      toast({
        title: `Application ${status}`,
        description: `The application has been ${status} successfully`,
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update application status',
      });
    } finally {
      setIsUpdateStatusLoading(false);
    }
  };

  const filteredApplications = applications.filter(application => {
    if (activeTab === 'all') return true;
    return application.status === activeTab;
  });

  const renderSocialLinks = (application: SponsorshipApplication) => {
    const links = [];
    
    if (application.socialLinks?.instagram) {
      links.push(
        <a 
          key="instagram" 
          href={`https://instagram.com/${application.socialLinks.instagram.replace('@', '')}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
        >
          Instagram <ExternalLink className="h-3 w-3" />
        </a>
      );
    }
    
    if (application.socialLinks?.twitter) {
      links.push(
        <a 
          key="twitter" 
          href={`https://twitter.com/${application.socialLinks.twitter.replace('@', '')}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
        >
          Twitter <ExternalLink className="h-3 w-3" />
        </a>
      );
    }
    
    if (application.socialLinks?.website) {
      links.push(
        <a 
          key="website" 
          href={application.socialLinks.website}
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
        >
          Website <ExternalLink className="h-3 w-3" />
        </a>
      );
    }
    
    return (
      <div className="flex flex-col gap-1">
        {links.length > 0 ? links : <span className="text-muted-foreground text-sm">No links provided</span>}
      </div>
    );
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading applications...</div>;
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-6 bg-muted rounded-lg">
        <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
        <h3 className="text-lg font-medium">No applications yet</h3>
        <p className="text-muted-foreground">
          When users apply for this sponsorship, their applications will appear here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Tabs 
        defaultValue="all" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="mb-4"
      >
        <TabsList>
          <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({applications.filter(a => a.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({applications.filter(a => a.status === 'approved').length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({applications.filter(a => a.status === 'rejected').length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>Social Media</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center p-4">
                  No applications found for this filter
                </TableCell>
              </TableRow>
            ) : (
              filteredApplications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={application.userProfileImage} />
                        <AvatarFallback>{application.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{application.userName}</div>
                        <div className="text-xs text-muted-foreground">{application.userEmail}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{renderSocialLinks(application)}</TableCell>
                  <TableCell>
                    {application.status === 'approved' && (
                      <Badge className="gap-1"><CheckCircle className="h-3 w-3" /> Approved</Badge>
                    )}
                    {application.status === 'rejected' && (
                      <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>
                    )}
                    {application.status === 'pending' && (
                      <Badge variant="outline" className="gap-1">Pending Review</Badge>
                    )}
                  </TableCell>
                  <TableCell>{format(new Date(application.createdAt), 'PPP')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewApplication(application)}
                          >
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Application from {application.userName}</DialogTitle>
                            <DialogDescription>
                              Submitted on {format(new Date(application.createdAt), 'PPP')}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="mt-4 space-y-4">
                            <div>
                              <h4 className="font-medium mb-1">Motivation</h4>
                              <p className="text-sm whitespace-pre-line">{application.motivation}</p>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-1">Experience</h4>
                              <p className="text-sm whitespace-pre-line">{application.experience}</p>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-1">Social Media</h4>
                              {renderSocialLinks(application)}
                            </div>
                            
                            {application.status === 'pending' && (
                              <div className="flex justify-end gap-2 pt-4">
                                <Button 
                                  variant="destructive" 
                                  disabled={isUpdateStatusLoading}
                                  onClick={() => handleUpdateStatus(application.id, 'rejected')}
                                >
                                  <XCircle className="h-4 w-4 mr-1" /> Reject
                                </Button>
                                <Button 
                                  disabled={isUpdateStatusLoading}
                                  onClick={() => handleUpdateStatus(application.id, 'approved')}
                                >
                                  <ThumbsUp className="h-4 w-4 mr-1" /> Approve
                                </Button>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {application.status === 'pending' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-destructive hover:bg-destructive/10"
                            disabled={isUpdateStatusLoading}
                            onClick={() => handleUpdateStatus(application.id, 'rejected')}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-primary hover:bg-primary/10"
                            disabled={isUpdateStatusLoading}
                            onClick={() => handleUpdateStatus(application.id, 'approved')}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SponsorshipApplicationsTable;
