
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { uploadImage } from '@/integrations/supabase/helpers';
import { GroupPrivacy } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface CreateGroupProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreateGroup: React.FC<CreateGroupProps> = ({ onSuccess, onCancel }) => {
  const { currentUser } = useAuth();
  const { createGroup } = useData();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<GroupPrivacy>('public');
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [memberLimit, setMemberLimit] = useState<number>(100);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!currentUser) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">You must be logged in to create a group.</p>
      </div>
    );
  }
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !description) {
      toast({
        title: "Missing information",
        description: "Please provide a name and description for your group.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImage(image, 'groups');
      }
      
      const newGroup = await createGroup({
        name,
        description,
        image: imageUrl,
        privacy,
        price: privacy === 'paid' ? price : undefined,
        memberLimit,
        rules: []
      });
      
      toast({
        title: "Group created",
        description: "Your group has been created successfully."
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error creating group:", error);
      toast({
        title: "Error creating group",
        description: error.message || "There was a problem creating your group.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="group-name">Group Name</Label>
        <Input
          id="group-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter group name"
          required
        />
      </div>
      
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="group-description">Description</Label>
        <Textarea
          id="group-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this group about?"
          required
        />
      </div>
      
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="group-image">Group Image</Label>
        <Input
          id="group-image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        {imagePreview && (
          <div className="mt-2 w-full aspect-video relative">
            <img
              src={imagePreview}
              alt="Group preview"
              className="rounded object-cover w-full h-full"
            />
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label>Privacy</Label>
        <RadioGroup 
          value={privacy} 
          onValueChange={(value) => setPrivacy(value as GroupPrivacy)}
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="public" id="public" />
            <Label htmlFor="public" className="cursor-pointer">Public - Anyone can join</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="private" id="private" />
            <Label htmlFor="private" className="cursor-pointer">Private - Request to join required</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="paid" id="paid" />
            <Label htmlFor="paid" className="cursor-pointer">Paid - Membership requires payment</Label>
          </div>
        </RadioGroup>
      </div>
      
      {privacy === 'paid' && (
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="group-price">Membership Price ($)</Label>
          <Input
            id="group-price"
            type="number"
            min="0.01"
            step="0.01"
            value={price || ''}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
            placeholder="5.00"
            required
          />
        </div>
      )}
      
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="member-limit">Member Limit</Label>
        <Input
          id="member-limit"
          type="number"
          min="5"
          max="1000"
          value={memberLimit}
          onChange={(e) => setMemberLimit(parseInt(e.target.value, 10))}
        />
        <p className="text-xs text-gray-500">Maximum number of members allowed (5-1000)</p>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Group'}
        </Button>
      </div>
    </form>
  );
};

export default CreateGroup;
