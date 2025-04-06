import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { uploadImage, createWorkshop } from '@/integrations/supabase/helpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import ImageGallery from '@/components/profile/ImageGallery';
import { DialogContent, Dialog, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Calendar as CalendarIcon, Clock, Users, MapPin, Video, Image as ImageIcon, Tag, DollarSign, Book, CheckCircle } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { TimePicker } from '@/components/ui/time-picker';

const CreateWorkshop = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [duration, setDuration] = useState('60');
  const [location, setLocation] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [meetingUrl, setMeetingUrl] = useState('');
  const [topics, setTopics] = useState('');
  const [prerequisites, setPrerequisites] = useState('');
  const [includes, setIncludes] = useState('');
  const [tags, setTags] = useState('');
  const [instructors, setInstructors] = useState([
    { name: '', role: '', bio: '' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [coverImage, setCoverImage] = useState('');
  const [openGallery, setOpenGallery] = useState(false);
  const [images, setImages] = useState<{name: string; url: string}[]>([]);
  const [uploading, setUploading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadImages();
    }
  }, [currentUser]);

  const loadImages = async () => {
    if (!currentUser) return;
    
    try {
      setUploading(true);
      const { data, error } = await supabase
        .storage
        .from('covers')
        .list(`${currentUser.id}`, {
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) {
        console.error('Error loading images:', error);
        toast({
          title: "Failed to load images",
          description: error.message || "There was an error loading your images.",
          variant: "destructive",
        });
        return;
      }

      const imageUrls = data
        .filter(file => file.name.match(/\.(jpeg|jpg|gif|png)$/i))
        .map(file => {
          const { data: { publicUrl } } = supabase
            .storage
            .from('covers')
            .getPublicUrl(`${currentUser.id}/${file.name}`);
          
          return {
            name: file.name,
            url: publicUrl
          };
        });

      setImages(imageUrls);
      setInitialLoadComplete(true);
    } catch (error: any) {
      console.error('Error in loadImages:', error);
      toast({
        title: "Error loading images",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !currentUser) return;
    
    const file = e.target.files[0];
    setUploading(true);
    
    try {
      const imagePath = `${currentUser.id}`;
      const imageUrl = await uploadImage(file, imagePath);
      
      await loadImages();
      
      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully.",
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your image.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSelectImage = (url: string) => {
    setCoverImage(url);
    setOpenGallery(false);
  };

  const updateInstructor = (index: number, field: 'name' | 'role' | 'bio', value: string) => {
    const newInstructors = [...instructors];
    newInstructors[index] = { ...newInstructors[index], [field]: value };
    setInstructors(newInstructors);
  };

  const addInstructor = () => {
    setInstructors([...instructors, { name: '', role: '', bio: '' }]);
  };

  const removeInstructor = (index: number) => {
    if (instructors.length > 1) {
      setInstructors(instructors.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !date) return;
    
    setIsLoading(true);
    
    try {
      const topicsArray = topics.split('\n').map(topic => topic.trim()).filter(topic => topic);
      const prerequisitesArray = prerequisites.split('\n').map(prereq => prereq.trim()).filter(prereq => prereq);
      const includesArray = includes.split('\n').map(item => item.trim()).filter(item => item);
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const formattedInstructors = instructors.filter(i => i.name).map(instructor => ({
        name: instructor.name,
        role: instructor.role,
        bio: instructor.bio,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.name)}`
      }));
      
      const workshopDate = new Date(date);
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      workshopDate.setHours(startHours, startMinutes);
      
      const workshopData = {
        title,
        description,
        long_description: longDescription,
        company_id: currentUser.id,
        company_name: currentUser.name,
        company_logo: currentUser.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random`,
        price: price ? parseFloat(price) : 0,
        date: workshopDate.toISOString(),
        start_time: startTime,
        end_time: endTime,
        duration: `${duration} minutes`,
        capacity: capacity ? parseInt(capacity) : null,
        location: isOnline ? null : location,
        is_online: isOnline,
        meeting_url: isOnline ? meetingUrl : null,
        category,
        image: coverImage,
        topics: topicsArray,
        prerequisites: prerequisitesArray,
        includes: includesArray,
        tags: tagsArray,
        instructors: formattedInstructors
      };
      
      const data = await createWorkshop(workshopData);
      
      toast({
        title: "Workshop created",
        description: "Your workshop has been created successfully.",
      });
      
      navigate(`/company/workshops/${data.id}`);
    } catch (error: any) {
      console.error('Error creating workshop:', error);
      toast({
        title: "Failed to create workshop",
        description: error.message || "There was an error creating your workshop.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser || currentUser.role !== 'company') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-gray-600">Only company accounts can create workshops.</p>
        <Button 
          className="mt-4" 
          variant="outline" 
          onClick={() => navigate('/profile')}
        >
          Go to Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create a New Workshop</h1>
        <p className="text-gray-500">Host a workshop to share knowledge and connect with the community</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Book className="mr-2 h-5 w-5" />
              Basic Workshop Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Workshop Title*</Label>
                <Input
                  id="title"
                  placeholder="Enter workshop title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Short Description*</Label>
                <Textarea
                  id="description"
                  placeholder="Write a concise description (1-2 sentences)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="longDescription">Detailed Description*</Label>
                <Textarea
                  id="longDescription"
                  placeholder="Provide a comprehensive description of your workshop, what participants will learn, and who should attend"
                  value={longDescription}
                  onChange={(e) => setLongDescription(e.target.value)}
                  rows={5}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category*</Label>
                <Select 
                  value={category} 
                  onValueChange={setCategory}
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="React">React</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Personal Development">Personal Development</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tags" className="flex items-center">
                  <Tag className="h-4 w-4 mr-1" />
                  Tags (comma separated)
                </Label>
                <Input
                  id="tags"
                  placeholder="e.g. React, Advanced, Enterprise, Patterns, Frontend"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5" />
              Workshop Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date*</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      id="date"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)*</Label>
                <Select 
                  value={duration} 
                  onValueChange={setDuration}
                >
                  <SelectTrigger id="duration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="180">3 hours</SelectItem>
                    <SelectItem value="240">4 hours</SelectItem>
                    <SelectItem value="480">8 hours (Full day)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time*</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time*</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Price ($)*
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0 for free"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="capacity" className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Capacity
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="Leave empty for unlimited"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  min="1"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="isOnline" 
                checked={isOnline}
                onCheckedChange={setIsOnline}
              />
              <Label htmlFor="isOnline">{isOnline ? 'Online Workshop' : 'In-Person Workshop'}</Label>
            </div>
            
            {isOnline ? (
              <div className="space-y-2">
                <Label htmlFor="meetingUrl" className="flex items-center">
                  <Video className="h-4 w-4 mr-1" />
                  Meeting URL*
                </Label>
                <Input
                  id="meetingUrl"
                  type="url"
                  placeholder="https://zoom.us/j/example"
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  required={isOnline}
                />
                <p className="text-xs text-gray-500">
                  Provide a Zoom, Google Meet, or other video conferencing link
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Location*
                </Label>
                <Input
                  id="location"
                  placeholder="Enter physical address"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required={!isOnline}
                />
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Workshop Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topics">What You'll Learn (one per line)*</Label>
              <Textarea
                id="topics"
                placeholder="Enter each topic on a new line
e.g. Component composition strategies
State management beyond Redux"
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
                rows={5}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prerequisites">Prerequisites (one per line)</Label>
              <Textarea
                id="prerequisites"
                placeholder="Enter each prerequisite on a new line
e.g. Solid understanding of React fundamentals
Experience with hooks and functional components"
                value={prerequisites}
                onChange={(e) => setPrerequisites(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="includes">What's Included (one per line)</Label>
              <Textarea
                id="includes"
                placeholder="Enter each included item on a new line
e.g. Full day of live instruction
Workshop materials and slides"
                value={includes}
                onChange={(e) => setIncludes(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Instructors</CardTitle>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={addInstructor}
            >
              Add Instructor
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {instructors.map((instructor, index) => (
              <Card key={index} className="border">
                <CardContent className="pt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Instructor {index + 1}</h4>
                    {instructors.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeInstructor(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`instructor-${index}-name`}>Name*</Label>
                      <Input
                        id={`instructor-${index}-name`}
                        value={instructor.name}
                        onChange={(e) => updateInstructor(index, 'name', e.target.value)}
                        placeholder="e.g. Sarah Johnson"
                        required={index === 0}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`instructor-${index}-role`}>Role/Title</Label>
                      <Input
                        id={`instructor-${index}-role`}
                        value={instructor.role}
                        onChange={(e) => updateInstructor(index, 'role', e.target.value)}
                        placeholder="e.g. Senior React Engineer"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`instructor-${index}-bio`}>Bio</Label>
                    <Textarea
                      id={`instructor-${index}-bio`}
                      value={instructor.bio}
                      onChange={(e) => updateInstructor(index, 'bio', e.target.value)}
                      placeholder="Brief bio of the instructor"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Workshop Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="coverImage" className="block mb-2">Cover Image</Label>
              {coverImage ? (
                <div className="relative aspect-video rounded-md overflow-hidden bg-gray-100 mb-2">
                  <img 
                    src={coverImage} 
                    alt="Cover" 
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-2 right-2"
                    onClick={() => setOpenGallery(true)}
                  >
                    Change Image
                  </Button>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenGallery(true)}
                >
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <Button type="button" variant="secondary">
                      Select Cover Image
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Choose an image from your gallery
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate('/company/workshops')}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isLoading || !date}
          >
            {isLoading ? 'Creating...' : 'Create Workshop'}
          </Button>
        </div>
      </form>
      
      <Dialog open={openGallery} onOpenChange={setOpenGallery}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>Your Image Gallery</DialogTitle>
          <DialogDescription>
            Select an image for your workshop or upload a new one.
          </DialogDescription>
          <ImageGallery
            images={images}
            onSelectImage={handleSelectImage}
            onUploadImage={handleUploadImage}
            uploading={uploading}
            emptyMessage="Upload images to use as cover images for your workshops."
            aspectRatio="landscape"
            selectedImage={coverImage}
            onClose={() => setOpenGallery(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateWorkshop;
