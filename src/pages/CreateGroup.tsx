
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, Users, Upload, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CreateGroup = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { createGroup, loading } = useData();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
  });
  const [imagePreview, setImagePreview] = useState('');
  
  // Check if user can create groups (influencer or company)
  const canCreateGroup = ['influencer', 'company'].includes(currentUser?.role || '');
  
  if (!canCreateGroup) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 mx-auto text-gray-300" />
        <h2 className="text-2xl font-bold mt-4">Permission Required</h2>
        <p className="text-gray-500 mb-4">
          Only influencers and companies can create groups.
        </p>
        <Button onClick={() => navigate('/groups')}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Groups
        </Button>
      </div>
    );
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, this would be an API upload call
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (!currentUser) throw new Error('You must be logged in');
      
      await createGroup({
        name: formData.name,
        description: formData.description,
        image: formData.image || undefined,
        creatorId: currentUser.id,
        creatorName: currentUser.name,
        creatorRole: currentUser.role
      });
      
      toast({
        title: "Group created!",
        description: "Your group has been created successfully."
      });
      
      navigate('/groups');
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Failed to create group",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate('/groups')}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Groups
        </Button>
      </div>
      
      <div>
        <h1 className="text-2xl font-bold">Create a New Group</h1>
        <p className="text-muted-foreground">Connect with others and build your community</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Group Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name*</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter a name for your group"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description*</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="What is your group about? Include details that will help people decide if they want to join."
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">Group Cover Image</Label>
              <div className="mt-1 flex items-center">
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Group cover preview" 
                      className="h-48 w-full object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-2 right-2"
                      onClick={() => {
                        setImagePreview('');
                        setFormData(prev => ({ ...prev, image: '' }));
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-500">PNG, JPG or GIF up to 5MB</p>
                      </div>
                      <input
                        id="image-upload"
                        name="image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-md flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">Group Creation Tips</h4>
                <ul className="text-sm text-blue-700 list-disc list-inside mt-1">
                  <li>Choose a clear, descriptive name</li>
                  <li>Write a detailed description to attract the right members</li>
                  <li>Add a high-quality cover image</li>
                  <li>Be prepared to engage with members regularly</li>
                </ul>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate('/groups')}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Group'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateGroup;
