import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Group } from '@/types';
import { useData } from '@/context/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Upload } from 'lucide-react';
import GroupImageGallery from './GroupImageGallery';

interface EditGroupFormProps {
  group: Group;
  isOpen: boolean;
  onClose: () => void;
}

const EditGroupForm: React.FC<EditGroupFormProps> = ({ group, isOpen, onClose }) => {
  const { updateGroupDetails } = useData();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: group.name,
    description: group.description,
    image: group.image || '',
    memberLimit: group.memberLimit || 100,
    rules: group.rules || ['Be respectful to all members', 'No spam or self-promotion']
  });
  const [newRule, setNewRule] = useState('');
  const [loading, setLoading] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

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
    setUploadedImage(null);
    setShowImageGallery(false);
  };

  const handleFileUpload = async (file: File): Promise<void> => {
    const reader = new FileReader();
    return new Promise<void>((resolve, reject) => {
      reader.onload = (e) => {
        try {
          const imageDataUrl = e.target?.result as string;
          setUploadedImage(imageDataUrl);
          setFormData(prev => ({ ...prev, image: imageDataUrl }));
          setShowImageGallery(false);
          
          toast({
            title: "Image uploaded",
            description: "Your image has been uploaded successfully"
          });
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      await updateGroupDetails(group.id, formData);
      toast({
        title: "Group updated",
        description: "Group details have been updated successfully"
      });
      onClose();
    } catch (error) {
      console.error("Failed to update group:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating the group. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Group</DialogTitle>
          <DialogDescription>
            Update your group's details
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
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
                <span>{showImageGallery ? 'Hide upload' : 'Upload image'}</span>
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
                    onClick={() => {
                      setFormData(prev => ({ ...prev, image: '' }));
                      setUploadedImage(null);
                    }}
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
                  selectedImage={!uploadedImage ? formData.image : ''}
                  onSelect={handleImageSelect}
                  onFileUpload={handleFileUpload}
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
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditGroupForm;
