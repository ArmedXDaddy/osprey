import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Users, 
  Info,
  Book,
  Award,
  CheckCircle,
  Tag,
  ImageIcon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import WorkshopRegistration from '@/components/workshop/WorkshopRegistration';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import ImageGallery from '@/components/profile/ImageGallery';
import { uploadImage } from '@/integrations/supabase/helpers';

const WorkshopDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [workshop, setWorkshop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [images, setImages] = useState<{name: string; url: string}[]>([]);
  const [uploading, setUploading] = useState(false);
  
  useEffect(() => {
    const loadWorkshop = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('workshops')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        setWorkshop(data);
        
        // If user is the creator, load workshop registrations
        if (currentUser?.id === data.company_id) {
          loadRegistrations();
          loadImages();
        }
      } catch (error) {
        console.error('Error loading workshop:', error);
        toast({
          title: 'Failed to load workshop',
          description: 'Please try again later',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    const loadRegistrations = async () => {
      try {
        // Use direct query instead of RPC
        const { data, error } = await supabase
          .from('workshop_registrations')
          .select('*')
          .eq('workshop_id', id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setRegistrations(data || []);
      } catch (error) {
        console.error('Error loading registrations:', error);
      }
    };
    
    const loadImages = async () => {
      try {
        const { data: storageData, error: storageError } = await supabase
          .storage
          .from('covers')
          .list(currentUser?.id || 'default', {
            limit: 100,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' },
          });
        
        if (storageError) throw storageError;
        
        const imageList = storageData
          .filter(item => !item.id.includes('.emptyFolderPlaceholder'))
          .map(item => {
            const { data } = supabase.storage
              .from('covers')
              .getPublicUrl(`${currentUser?.id}/${item.name}`);
              
            return {
              name: item.name,
              url: data.publicUrl
            };
          });
          
        setImages(imageList);
      } catch (error) {
        console.error('Error loading images:', error);
      }
    };
    
    if (id) {
      loadWorkshop();
    }
  }, [id, currentUser, toast]);
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    
    try {
      setUploading(true);
      const path = `${currentUser.id}`;
      const url = await uploadImage(file, path);
      
      // Add image to list
      setImages([...images, { name: file.name, url }]);
      
      toast({
        title: 'Image uploaded',
        description: 'You can now select it as your workshop cover',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your image',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };
  
  const handleSelectImage = async (url: string) => {
    if (!workshop || !id) return;
    
    try {
      // Update workshop image in database
      const { error } = await supabase
        .from('workshops')
        .update({ image: url })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setWorkshop({
        ...workshop,
        image: url
      });
      
      toast({
        title: 'Cover image updated',
        description: 'Your workshop cover image has been updated',
      });
      
      setIsImageDialogOpen(false);
    } catch (error) {
      console.error('Error updating cover image:', error);
      toast({
        title: 'Update failed',
        description: 'There was an error updating your cover image',
        variant: 'destructive',
      });
    }
  };
  
  const isCreator = currentUser?.id === workshop?.company_id;
  
  if (loading) {
    return (
      <div className="py-8">
        <div className="h-6 w-24 bg-gray-200 rounded-md animate-pulse mb-4"></div>
        <div className="h-10 bg-gray-200 rounded-md animate-pulse mb-6"></div>
        <div className="h-64 bg-gray-200 rounded-md animate-pulse"></div>
      </div>
    );
  }
  
  if (!workshop) {
    return (
      <div className="py-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Workshop Not Found</h2>
        <p className="text-gray-500 mb-6">The workshop you're looking for doesn't exist or has been removed.</p>
        <Button onClick={handleBack}>Go Back</Button>
      </div>
    );
  }
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date not specified';
    const date = new Date(dateString);
    return format(date, 'MMMM d, yyyy');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
      
      <div>
        {workshop.image && (
          <div className="w-full aspect-video rounded-lg overflow-hidden bg-gray-100 mb-6 relative">
            <img src={workshop.image} alt={workshop.title} className="w-full h-full object-cover" />
            {isCreator && (
              <Button 
                size="sm"
                variant="secondary"
                className="absolute bottom-4 right-4"
                onClick={() => setIsImageDialogOpen(true)}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Change Cover
              </Button>
            )}
          </div>
        )}
        
        {!workshop.image && isCreator && (
          <div className="w-full aspect-video rounded-lg overflow-hidden bg-gray-100 mb-6 flex items-center justify-center">
            <Button 
              variant="secondary"
              onClick={() => setIsImageDialogOpen(true)}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Add Cover Image
            </Button>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{workshop.title}</h1>
            <div className="flex items-center gap-2 text-gray-500 mt-1">
              <img 
                src={workshop.company_logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(workshop.company_name)}&background=random`} 
                alt={workshop.company_name} 
                className="h-5 w-5 rounded-full"
              />
              <span>{workshop.company_name}</span>
              {workshop.category && (
                <>
                  <span className="mx-1">•</span>
                  <Badge variant="outline">{workshop.category}</Badge>
                </>
              )}
            </div>
          </div>
          
          {!isCreator && (
            <div className="flex gap-2">
              <WorkshopRegistration workshop={workshop} />
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>{formatDate(workshop.date)}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>{workshop.duration}</span>
            </div>
            {workshop.start_time && workshop.end_time && (
              <div className="text-sm text-gray-500 mt-1">
                {workshop.start_time} to {workshop.end_time}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {workshop.is_online ? (
                <>
                  <Video className="h-4 w-4 text-gray-400" />
                  <span>Online</span>
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{workshop.location || 'Location not specified'}</span>
                </>
              )}
            </div>
            {workshop.is_online && workshop.meeting_url && isCreator && (
              <div className="text-sm text-blue-500 hover:underline mt-1">
                <a href={workshop.meeting_url} target="_blank" rel="noopener noreferrer">
                  Meeting link
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Workshop Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <Info className="h-4 w-4 mr-2" />
                Description
              </h3>
              {workshop.long_description ? (
                <p className="whitespace-pre-line">{workshop.long_description}</p>
              ) : (
                <p className="whitespace-pre-line">{workshop.description}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {workshop.topics && workshop.topics.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Book className="h-4 w-4 mr-2" />
                    Topics Covered
                  </h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {workshop.topics.map((topic: string, i: number) => (
                      <li key={i}>{topic}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {workshop.prerequisites && workshop.prerequisites.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Prerequisites
                  </h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {workshop.prerequisites.map((prerequisite: string, i: number) => (
                      <li key={i}>{prerequisite}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {workshop.includes && workshop.includes.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <Award className="h-4 w-4 mr-2" />
                  What's Included
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {workshop.includes.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {workshop.instructors && Array.isArray(workshop.instructors) && workshop.instructors.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Instructors</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {workshop.instructors.map((instructor: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                        <img 
                          src={instructor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.name)}&background=random`} 
                          alt={instructor.name} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">{instructor.name}</h4>
                        <p className="text-sm text-gray-600">{instructor.role || 'Instructor'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {workshop.tags && workshop.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-1">
                  {workshop.tags.map((tag: string, i: number) => (
                    <Badge key={i} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-0 flex flex-row items-center justify-between">
            <CardTitle>Registration</CardTitle>
            <div className="font-bold text-xl text-primary">
              {workshop.price === 0 ? 'Free' : `$${typeof workshop.price === 'number' ? workshop.price.toFixed(2) : workshop.price}`}
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span>
                  {workshop.capacity 
                    ? `Capacity: ${workshop.capacity} participants` 
                    : 'Unlimited capacity'}
                </span>
              </div>
              
              {!isCreator && (
                <WorkshopRegistration workshop={workshop} />
              )}
            </div>
          </CardContent>
        </Card>
        
        {isCreator && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                Registrations 
                <Badge variant="outline" className="ml-2">{registrations.length}</Badge>
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowRegistrations(!showRegistrations)}
              >
                {showRegistrations ? 'Hide' : 'Show'}
              </Button>
            </CardHeader>
            
            {showRegistrations && (
              <CardContent>
                {registrations.length === 0 ? (
                  <p className="text-center py-4 text-gray-500">No registrations yet</p>
                ) : (
                  <div className="space-y-4">
                    {registrations.map((registration: any) => (
                      <div key={registration.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                          <img 
                            src={registration.user_profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(registration.user_name)}&background=random`} 
                            alt={registration.user_name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{registration.user_name}</h4>
                          <p className="text-sm text-gray-600">{registration.user_email}</p>
                        </div>
                        <Badge variant="outline">
                          {registration.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        )}
      </div>
      
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Workshop Cover Image</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            <ImageGallery 
              images={images}
              onSelectImage={handleSelectImage}
              onUploadImage={handleImageUpload}
              uploading={uploading}
              selectedImage={workshop.image}
              emptyMessage="You don't have any images yet. Upload one to use as a cover."
              aspectRatio="landscape"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkshopDetail;
