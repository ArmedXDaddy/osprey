
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Globe, Lock, DollarSign, Plus, X, Upload } from 'lucide-react';

interface CreateGroupProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreateGroup: React.FC<CreateGroupProps> = ({ onSuccess, onCancel }) => {
  const { currentUser } = useAuth();
  const { createGroup } = useData();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    privacy: 'public',
    price: 9.99,
    memberLimit: 100,
    rules: ['Be respectful to all members', 'No spam or self-promotion']
  });
  const [newRule, setNewRule] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handlePrivacyChange = (value: string) => {
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
      const groupData = {
        ...formData,
        creatorId: currentUser.id,
        creatorName: currentUser.name,
        creatorRole: currentUser.role,
      };

      await createGroup(groupData);
      
      toast({
        title: "Group created!",
        description: `Your group "${formData.name}" has been created successfully.`
      });
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Failed to create group:", error);
      toast({
        title: "Creation failed",
        description: error.message || "There was an error creating your group. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <Label htmlFor="image">Cover Image URL</Label>
        <Input
          id="image"
          name="image"
          value={formData.image}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
        />
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
          onValueChange={handlePrivacyChange}
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
                <p className="text-sm text-gray-500">Members pay a subscription fee</p>
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
      
      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Group'}
        </Button>
      </div>
    </form>
  );
};

export default CreateGroup;
