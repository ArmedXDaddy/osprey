
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { createSponsorship } from '@/integrations/supabase/sponsorshipHelpers';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const CreateSponsorship: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [compensation, setCompensation] = useState('');
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [requirement, setRequirement] = useState('');
  const [requirements, setRequirements] = useState<string[]>([]);
  const [benefit, setBenefit] = useState('');
  const [benefits, setBenefits] = useState<string[]>([]);
  
  const createSponsorshipMutation = useMutation({
    mutationFn: () => createSponsorship({
      companyId: currentUser?.id || '',
      companyName: currentUser?.name || '',
      companyLogo: currentUser?.profileImage,
      title,
      description,
      compensation,
      deadline,
      requirements,
      benefits,
      tags,
      status: 'active',
    }),
    onSuccess: (data) => {
      toast({
        title: 'Sponsorship created',
        description: 'Your sponsorship has been published successfully',
        variant: 'default',
      });
      navigate(`/sponsorships/${data?.id}`);
    },
    onError: (error) => {
      toast({
        title: 'Failed to create sponsorship',
        description: 'There was an error creating your sponsorship',
        variant: 'destructive',
      });
    }
  });
  
  const handleAddTag = () => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      setTags([...tags, tag.trim()]);
      setTag('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };
  
  const handleAddRequirement = () => {
    if (requirement.trim() && !requirements.includes(requirement.trim())) {
      setRequirements([...requirements, requirement.trim()]);
      setRequirement('');
    }
  };
  
  const handleRemoveRequirement = (reqToRemove: string) => {
    setRequirements(requirements.filter(r => r !== reqToRemove));
  };
  
  const handleAddBenefit = () => {
    if (benefit.trim() && !benefits.includes(benefit.trim())) {
      setBenefits([...benefits, benefit.trim()]);
      setBenefit('');
    }
  };
  
  const handleRemoveBenefit = (benToRemove: string) => {
    setBenefits(benefits.filter(b => b !== benToRemove));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || requirements.length === 0 || benefits.length === 0) {
      toast({
        title: 'Incomplete form',
        description: 'Please fill all required fields and add at least one requirement and benefit',
        variant: 'destructive',
      });
      return;
    }
    
    createSponsorshipMutation.mutate();
  };
  
  if (!currentUser || currentUser.role !== 'company') {
    return (
      <div className="container py-8 max-w-4xl text-center">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-6">You need to be logged in as a company to create sponsorships.</p>
        <Button onClick={() => navigate('/sponsorships')}>Back to Sponsorships</Button>
      </div>
    );
  }
  
  return (
    <div className="container py-8 max-w-4xl">
      <Button variant="outline" className="mb-6" onClick={() => navigate('/sponsorships')}>
        Back to Sponsorships
      </Button>
      
      <h1 className="text-3xl font-bold mb-6">Create New Sponsorship</h1>
      
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Provide the basic details of your sponsorship opportunity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Brand Ambassador Program"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the sponsorship opportunity in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[150px]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="compensation">Compensation</Label>
              <Input
                id="compensation"
                placeholder="e.g., $500 per post, Product samples worth $1000"
                value={compensation}
                onChange={(e) => setCompensation(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Application Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !deadline && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadline ? format(deadline, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={setDeadline}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex space-x-2">
                <Input
                  id="tags"
                  placeholder="e.g., Fashion, Beauty, Tech"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTag} size="sm">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((t, index) => (
                  <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                    {t}
                    <X 
                      className="h-4 w-4 ml-1 cursor-pointer" 
                      onClick={() => handleRemoveTag(t)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
            <CardDescription>What do you require from applicants?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="requirements">Add Requirement *</Label>
              <div className="flex space-x-2">
                <Input
                  id="requirements"
                  placeholder="e.g., Minimum 10K followers on Instagram"
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddRequirement();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddRequirement} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="mt-4 space-y-2">
                {requirements.map((req, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <span>{req}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveRequirement(req)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {requirements.length === 0 && (
                  <p className="text-muted-foreground text-sm italic">
                    No requirements added yet. Please add at least one requirement.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Benefits</CardTitle>
            <CardDescription>What benefits do you offer to the sponsored individual?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="benefits">Add Benefit *</Label>
              <div className="flex space-x-2">
                <Input
                  id="benefits"
                  placeholder="e.g., Free products every month"
                  value={benefit}
                  onChange={(e) => setBenefit(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddBenefit();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddBenefit} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="mt-4 space-y-2">
                {benefits.map((ben, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <span>{ben}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveBenefit(ben)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {benefits.length === 0 && (
                  <p className="text-muted-foreground text-sm italic">
                    No benefits added yet. Please add at least one benefit.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end space-x-4">
          <Button variant="outline" type="button" onClick={() => navigate('/sponsorships')}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createSponsorshipMutation.isPending}
          >
            {createSponsorshipMutation.isPending ? 'Creating...' : 'Create Sponsorship'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateSponsorship;
