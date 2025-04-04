
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChevronLeft, Globe, Lock, DollarSign, Plus, X, Upload } from 'lucide-react';
import { GroupPrivacy } from '@/types';
import { Badge } from '@/components/ui/badge';
import GroupImageGallery from '@/components/group/GroupImageGallery';

const CreateGroup = () => {
  const { currentUser } = useAuth();
  const { createGroup } = useData();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    privacy: 'public' as GroupPrivacy,
    price: 9.99,
    memberLimit: 100,
    rules: ['Be respectful to all members', 'No spam or self-promotion']
  });
  const [newRule, setNewRule] = useState('');
  const [loading, setLoading] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setFormData(prev => ({ ...prev, [name]: numValue }));
    }
  };

  const handlePrivacyChange = (value: GroupPrivacy) => {
    setFormData(prev => ({ ...prev, privacy: value }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const price = parseFloat(e.target.value);
    if (!isNaN(price) && price >= 0) {
      setFormData(prev => ({ ...prev, price }));
    }
  };

  const handleAddRule = () => {
    if (newRule.trim() && !formData.rules.includes(newRule.trim())) {
      setFormData(prev => ({
        ...prev,
        rules: [...prev.rules, newRule.trim()]
      }));
      setNewRule('');
    }
  };

  const handleRemoveRule = (ruleToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter(rule => rule !== ruleToRemove)
    }));
  };

  const handleImageSelect = (image: string) => {
    setFormData(prev => ({ ...prev, image }));
    setShowImageGallery(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a group",
        variant: "destructive"
      });
      return;
    }

    // Validate form
    if (!formData.name.trim() || !formData.description.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Create the group
      const groupData = {
        ...formData,
        creatorId: currentUser.id,
        creatorName: currentUser.name,
        creatorRole: currentUser.role,
      };

      const newGroup = await createGroup(groupData);
      
      toast({
        title: "Group created!",
        description: `Your group "${newGroup.name}" has been created successfully.`
      });
      
      // Redirect to the new group page
      navigate(`/groups/${newGroup.id}`);
    } catch (error) {
      console.error("Failed to create group:", error);
      toast({
        title: "Creation failed",
        description: "There was an error creating your group. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create a New Group</CardTitle>
          <CardDescription>
            Create a community around your interests or expertise
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Fitness Enthusiasts"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="What is your group about?"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">Cover Image</Label>
              <div className="flex items-center space-x-2">
                <Button 
                  type="button" 
                  onClick={() => setShowImageGallery(!showImageGallery)}
                  className="flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Choose from gallery</span>
                </Button>
                {formData.image && (
                  <div className="relative w-16 h-16 overflow-hidden rounded border">
                    <img 
                      src={formData.image} 
                      alt="Preview" 
                      className="object-cover w-full h-full"
                    />
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                      className="absolute top-0 right-0 bg-black/50 p-1 rounded-bl"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                )}
              </div>
              
              {showImageGallery && (
                <div className="mt-2">
                  <GroupImageGallery 
                    selectedImage={formData.image}
                    onSelect={handleImageSelect}
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="memberLimit">Member Limit</Label>
              <Input
                id="memberLimit"
                name="memberLimit"
                type="number"
                min="1"
                value={formData.memberLimit}
                onChange={handleNumberChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Group Rules</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.rules.map((rule, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    <span>{rule}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveRule(rule)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newRule}
                  onChange={(e) => setNewRule(e.target.value)}
                  placeholder="Add a new rule"
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  onClick={handleAddRule}
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Privacy Settings</Label>
              <RadioGroup 
                defaultValue="public" 
                value={formData.privacy}
                onValueChange={handlePrivacyChange as (value: string) => void}
                className="grid grid-cols-1 gap-4 pt-2"
              >
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="public" id="privacy-public" />
                  <Label htmlFor="privacy-public" className="flex items-center cursor-pointer">
                    <Globe className="h-4 w-4 mr-2 text-blue-500" />
                    <div>
                      <span className="font-medium">Public</span>
                      <p className="text-sm text-gray-500">Anyone can join and view content</p>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="private" id="privacy-private" />
                  <Label htmlFor="privacy-private" className="flex items-center cursor-pointer">
                    <Lock className="h-4 w-4 mr-2 text-amber-500" />
                    <div>
                      <span className="font-medium">Private</span>
                      <p className="text-sm text-gray-500">Members need approval to join</p>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="paid" id="privacy-paid" />
                  <Label htmlFor="privacy-paid" className="flex items-center cursor-pointer">
                    <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                    <div>
                      <span className="font-medium">Paid Membership</span>
                      <p className="text-sm text-gray-500">Members pay a monthly subscription</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            {formData.privacy === 'paid' && (
              <div className="space-y-2">
                <Label htmlFor="price">Monthly Price ($)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handlePriceChange}
                  required
                />
              </div>
            )}
          </CardContent>
          
          <CardFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating...' : 'Create Group'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreateGroup;
