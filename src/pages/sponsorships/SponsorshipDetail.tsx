
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSponsorshipById, applyForSponsorship } from '@/integrations/supabase/sponsorshipHelpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, DollarSign, ListChecks, Award, User, MapPin, BriefcaseIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { Sponsorship } from '@/types/sponsorship';

const SponsorshipDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [experience, setExperience] = useState('');
  const [motivation, setMotivation] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [website, setWebsite] = useState('');
  
  // Fetch sponsorship details
  const { data: sponsorship, isLoading, error } = useQuery({
    queryKey: ['sponsorship', id],
    queryFn: () => fetchSponsorshipById(id || ''),
    enabled: !!id
  });
  
  // Apply for sponsorship
  const applyMutation = useMutation({
    mutationFn: () => applyForSponsorship(id || '', {
      userId: currentUser?.id || '',
      userName: currentUser?.name || '',
      userEmail: currentUser?.email || '',
      userProfileImage: currentUser?.profileImage,
      experience,
      motivation,
      socialLinks: {
        instagram: instagram || undefined,
        twitter: twitter || undefined,
        website: website || undefined
      }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsorship', id] });
      queryClient.invalidateQueries({ queryKey: ['userApplications'] });
      toast({
        title: 'Application submitted',
        description: 'Your application has been successfully submitted',
        variant: 'default',
      });
      setShowApplyDialog(false);
    },
    onError: (error) => {
      toast({
        title: 'Failed to apply',
        description: 'There was an error submitting your application',
        variant: 'destructive',
      });
    }
  });
  
  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!experience || !motivation) {
      toast({
        title: 'Incomplete form',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    applyMutation.mutate();
  };
  
  if (isLoading) {
    return (
      <div className="container py-8 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }
  
  if (error || !sponsorship) {
    return (
      <div className="container py-8 max-w-4xl text-center">
        <h2 className="text-2xl font-bold mb-4">Error Loading Sponsorship</h2>
        <p className="text-gray-600 mb-6">There was an error loading the sponsorship details.</p>
        <Button onClick={() => navigate('/sponsorships')}>Back to Sponsorships</Button>
      </div>
    );
  }
  
  return (
    <div className="container py-8 max-w-4xl">
      <Button variant="outline" className="mb-6" onClick={() => navigate('/sponsorships')}>
        Back to Sponsorships
      </Button>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{sponsorship.title}</h1>
          <div className="flex items-center text-gray-600">
            <div className="flex items-center mr-4">
              <BriefcaseIcon className="w-4 h-4 mr-1" />
              <span>{sponsorship.companyName}</span>
            </div>
            
            {sponsorship.deadline && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>Deadline: {format(sponsorship.deadline, 'MMM d, yyyy')}</span>
              </div>
            )}
          </div>
        </div>
        
        {currentUser && currentUser.role !== 'company' && sponsorship.status === 'active' && (
          <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0">Apply Now</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>Apply for Sponsorship</DialogTitle>
                <DialogDescription>
                  Submit your application for "{sponsorship.title}" at {sponsorship.companyName}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleApply}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience">Your Experience *</Label>
                    <Textarea
                      id="experience"
                      placeholder="Describe your relevant experience..."
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="motivation">Why You're Interested *</Label>
                    <Textarea
                      id="motivation"
                      placeholder="Why are you interested in this sponsorship opportunity?"
                      value={motivation}
                      onChange={(e) => setMotivation(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="socialLinks">Social Media Links</Label>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="instagram" className="text-xs">Instagram</Label>
                        <Input
                          id="instagram"
                          placeholder="@username"
                          value={instagram}
                          onChange={(e) => setInstagram(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor="twitter" className="text-xs">Twitter</Label>
                        <Input
                          id="twitter"
                          placeholder="@username"
                          value={twitter}
                          onChange={(e) => setTwitter(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor="website" className="text-xs">Website</Label>
                        <Input
                          id="website"
                          placeholder="https://example.com"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={applyMutation.isPending}
                  >
                    {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {sponsorship.tags?.map(tag => (
          <Badge key={tag} variant="outline" className="bg-gray-100">{tag}</Badge>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{sponsorship.description}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                {sponsorship.requirements.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                {sponsorship.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sponsorship Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start">
                <BriefcaseIcon className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                <div>
                  <p className="font-medium">Company</p>
                  <p className="text-gray-600">{sponsorship.companyName}</p>
                </div>
              </div>
              
              {sponsorship.compensation && (
                <div className="flex items-start">
                  <DollarSign className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <p className="font-medium">Compensation</p>
                    <p className="text-gray-600">{sponsorship.compensation}</p>
                  </div>
                </div>
              )}
              
              {sponsorship.deadline && (
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <p className="font-medium">Application Deadline</p>
                    <p className="text-gray-600">{format(sponsorship.deadline, 'MMMM d, yyyy')}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start">
                <Award className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                <div>
                  <p className="font-medium">Status</p>
                  <Badge className={sponsorship.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}>
                    {sponsorship.status.charAt(0).toUpperCase() + sponsorship.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {currentUser?.role === 'company' && currentUser.id === sponsorship.companyId && (
            <Card>
              <CardHeader>
                <CardTitle>Manage Sponsorship</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => navigate(`/sponsorships/${sponsorship.id}/applications`)}
                  className="w-full"
                >
                  View Applications
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate(`/sponsorships/${sponsorship.id}/edit`)}
                  className="w-full"
                >
                  Edit Sponsorship
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SponsorshipDetail;
