
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  CalendarClock, 
  ClipboardList, 
  DollarSign, 
  Gift, 
  Tag, 
  User, 
  CheckCircle,
  XCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import SponsorshipApplicationForm from '@/components/sponsorship/SponsorshipApplicationForm';
import SponsorshipApplicationsTable from '@/components/sponsorship/SponsorshipApplicationsTable';

const SponsorshipDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getSponsorshipById, getUserApplicationForSponsorship } = useData();
  const [sponsorship, setSponsorship] = useState(null);
  const [userApplication, setUserApplication] = useState(null);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!id) return;
        
        const sponsorshipData = await getSponsorshipById(id);
        setSponsorship(sponsorshipData);
        
        if (currentUser && currentUser.role !== 'company') {
          const application = await getUserApplicationForSponsorship(id, currentUser.id);
          setUserApplication(application);
        }
      } catch (error) {
        console.error('Error loading sponsorship:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load sponsorship details',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, currentUser, getSponsorshipById, getUserApplicationForSponsorship]);

  const handleBackToList = () => {
    navigate('/sponsorships');
  };

  const formatDate = (date) => {
    if (!date) return 'No deadline';
    return format(new Date(date), 'PPP');
  };

  const getApplicationStatusBadge = () => {
    switch (userApplication?.status) {
      case 'approved':
        return <Badge className="gap-1"><CheckCircle className="h-3 w-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><ClipboardList className="h-3 w-3" /> Pending Review</Badge>;
      default:
        return null;
    }
  };

  const isCompanyOwner = currentUser?.id === sponsorship?.companyId;
  const canApply = 
    currentUser && 
    currentUser.role !== 'company' && 
    !userApplication &&
    sponsorship?.status === 'active';

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center space-x-4 animate-pulse">
          <div className="h-12 w-12 rounded-full bg-muted"></div>
          <div className="space-y-2">
            <div className="h-4 w-[250px] bg-muted rounded"></div>
            <div className="h-4 w-[200px] bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!sponsorship) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Sponsorship not found</h1>
        <p>The sponsorship opportunity you're looking for doesn't exist or has been removed.</p>
        <Button className="mt-4" onClick={handleBackToList}>
          Back to Sponsorships
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Button 
        variant="ghost" 
        onClick={handleBackToList} 
        className="mb-4"
      >
        ← Back to Sponsorships
      </Button>
      
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={sponsorship.companyLogo} alt={sponsorship.companyName} />
            <AvatarFallback>{sponsorship.companyName.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{sponsorship.title}</h1>
              <Badge variant={sponsorship.status === 'active' ? 'default' : 'outline'}>
                {sponsorship.status === 'active' ? 'Active' : 'Closed'}
              </Badge>
            </div>
            <p className="text-muted-foreground">By {sponsorship.companyName}</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          {userApplication && getApplicationStatusBadge()}
          
          {canApply && (
            <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">Apply Now</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Apply for {sponsorship.title}</DialogTitle>
                </DialogHeader>
                <SponsorshipApplicationForm 
                  sponsorshipId={sponsorship.id} 
                  onSuccess={() => {
                    setIsApplyDialogOpen(false);
                    window.location.reload(); // Refresh to show the application status
                  }}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">About this opportunity</h2>
            <p className="whitespace-pre-line mb-6">{sponsorship.description}</p>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" /> Requirements
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {sponsorship.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                  <Gift className="h-5 w-5" /> Benefits
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {sponsorship.benefits.map((benefit, i) => (
                    <li key={i}>{benefit}</li>
                  ))}
                </ul>
              </div>
              
              {isCompanyOwner && (
                <div className="mt-8">
                  <Separator className="my-6" />
                  <h3 className="text-lg font-medium mb-4">Applications</h3>
                  <SponsorshipApplicationsTable sponsorshipId={sponsorship.id} />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-card rounded-lg border p-6 sticky top-20">
            <h3 className="text-lg font-medium mb-4">Details</h3>
            
            {sponsorship.compensation && (
              <div className="flex items-start gap-3 mb-4">
                <DollarSign className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Compensation</p>
                  <p className="text-muted-foreground">{sponsorship.compensation}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-3 mb-4">
              <CalendarClock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Deadline</p>
                <p className="text-muted-foreground">
                  {sponsorship.deadline ? formatDate(sponsorship.deadline) : 'No deadline'}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 mb-4">
              <User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Posted by</p>
                <p className="text-muted-foreground">{sponsorship.companyName}</p>
              </div>
            </div>
            
            {sponsorship.tags && sponsorship.tags.length > 0 && (
              <div className="flex items-start gap-3">
                <Tag className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Tags</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {sponsorship.tags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <Separator className="my-4" />
            
            <p className="text-sm text-muted-foreground">
              Posted {format(new Date(sponsorship.createdAt), 'PPP')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SponsorshipDetail;
