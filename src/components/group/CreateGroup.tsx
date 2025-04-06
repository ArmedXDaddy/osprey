
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { GroupPrivacy } from '@/types';
import { toast } from '@/hooks/use-toast';
import { uploadImage } from '@/integrations/supabase/helpers';

const formSchema = z.object({
  name: z.string().min(3, { message: "Group name must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  privacy: z.enum(['public', 'private', 'paid'] as const),
  price: z.number().min(0).optional(),
  memberLimit: z.number().min(2).max(10000).optional(),
  rules: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateGroupProps {
  onSuccess?: (groupId: string) => void;
  onCancel?: () => void;
}

const CreateGroup: React.FC<CreateGroupProps> = ({ onSuccess, onCancel }) => {
  const { currentUser } = useAuth();
  const { createGroup } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      privacy: 'public',
      price: 0,
      memberLimit: 100,
      rules: '',
    },
  });

  const watchPrivacy = form.watch('privacy');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Not authenticated",
        description: "You must be logged in to create a group."
      });
      return;
    }

    setIsLoading(true);

    try {
      let imageUrl;
      if (image) {
        const filePath = `groups/${Date.now()}_${image.name}`;
        imageUrl = await uploadImage(image, filePath);
      }

      // Parse rules from string to array
      const rulesArray = data.rules 
        ? data.rules.split('\n').filter(rule => rule.trim() !== '')
        : [];

      const groupData = {
        name: data.name,
        description: data.description,
        creatorId: currentUser.id,
        creatorName: currentUser.name,
        creatorRole: currentUser.role,
        image: imageUrl,
        privacy: data.privacy,
        price: data.privacy === 'paid' ? data.price : 0,
        memberLimit: data.memberLimit,
        rules: rulesArray,
      };

      const newGroup = await createGroup(groupData);
      
      toast({
        title: "Group created",
        description: "Your group has been created successfully."
      });

      if (onSuccess && newGroup) {
        onSuccess(newGroup.id);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create group",
        description: error.message || "There was an error creating your group."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter a name for your group" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What is this group about?" 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <Label>Group Image</Label>
          <div className="flex flex-col items-center gap-4">
            {imagePreview && (
              <div className="w-full aspect-video bg-gray-100 overflow-hidden rounded">
                <img 
                  src={imagePreview}
                  alt="Group preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="max-w-xs"
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="privacy"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Privacy</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="public" />
                    <Label htmlFor="public">Public - Anyone can join</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="private" />
                    <Label htmlFor="private">Private - Requires approval to join</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="paid" id="paid" />
                    <Label htmlFor="paid">Paid - Requires payment to join</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchPrivacy === 'paid' && (
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Membership Price ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    placeholder="5.99"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="memberLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Member Limit</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="2" 
                  placeholder="100"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rules"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Rules (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter each rule on a new line"
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Group"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateGroup;
