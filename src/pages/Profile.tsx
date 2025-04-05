
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/types';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { ImageIcon } from 'lucide-react';
import FollowersList from '@/components/profile/FollowersList';
import SessionsTab from '@/components/profile/SessionsTab';
import ImageGallery from '@/components/profile/ImageGallery';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  profile_image?: string;
  bio?: string;
  location?: string;
  followers?: number;
}

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileImage, setProfileImage] = useState<string | undefined>(currentUser?.profileImage);
  const [coverImage, setCoverImage] = useState<string | undefined>('');
  const [bio, setBio] = useState<string | undefined>(currentUser?.bio);
  const [location, setLocation] = useState<string | undefined>(currentUser?.location);
  const [isFollowersOpen, setIsFollowersOpen] = useState(false);
  const [isFollowingOpen, setIsFollowingOpen] = useState(false);
  const [isImageGalleryOpen, setIsImageGalleryOpen] = useState(false);
  const [uploadedProfileImage, setUploadedProfileImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<{ name: string; url: string }[]>([]);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | undefined>(undefined);
  const [uploading, setUploading] = useState(false);

  // Fetch profile data
  const fetchProfileData = async () => {
    const profileId = id || currentUser?.id;
    if (!profileId) return null;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();
      
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return data;
  };

  const { data: currentProfile, isLoading: isProfileLoading, error: profileError } = useQuery({
    queryKey: ['profile', id],
    queryFn: fetchProfileData,
    enabled: !!id || !!currentUser,
  });
  
  // These queries would typically fetch real data, but for now we'll return empty arrays
  const { data: posts = [], isLoading: isPostsLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => [],
  });
  
  const { data: events = [], isLoading: isEventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => [],
  });
  
  const { data: groups = [], isLoading: isGroupsLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => [],
  });

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase.storage
        .from('profile_images')
        .list(`${currentUser?.id}/`, {
          sortBy: { column: 'created_at', order: 'asc' },
        });

      if (error) {
        console.error("Error fetching images:", error);
        return;
      }

      const publicUrls = await Promise.all(
        data.map(async (image) => {
          const { data: urlData } = supabase.storage
            .from('profile_images')
            .getPublicUrl(`${currentUser?.id}/${image.name}`);
          return { name: image.name, url: urlData.publicUrl };
        })
      );

      setGalleryImages(publicUrls);
    };

    if (currentUser?.id) {
      fetchImages();
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (currentProfile) {
      setProfileImage(currentProfile.profile_image);
      setBio(currentProfile.bio);
      setLocation(currentProfile.location);
    }
  }, [currentProfile]);
  
  const handleEditClick = () => {
    setIsEditMode(true);
  };
  
  const handleCancelClick = () => {
    setIsEditMode(false);
    setProfileImage(currentUser?.profileImage);
    setBio(currentUser?.bio);
    setLocation(currentUser?.location);
  };
  
  const handleSaveClick = async () => {
    if (!currentUser) return;
    
    const updates = {
      profileImage: profileImage,
      bio: bio,
      location: location,
    };
    
    const { error } = await supabase
      .from('profiles')
      .update({
        profile_image: updates.profileImage,
        bio: updates.bio,
        location: updates.location,
      })
      .eq('id', currentUser.id);
      
    if (error) {
      toast({
        title: "Update Failed",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
      
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          profileImage: updates.profileImage,
          bio: updates.bio,
          location: updates.location,
        };
        // Update local state
        // Note: updateUser would typically be provided by your auth context
      }
      
      setIsEditMode(false);
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedProfileImage(file);
      handleImageUpload(file);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    if (!currentUser) return;

    const fileExt = file.name.split('.').pop();
    const filePath = `${currentUser.id}/${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('profile_images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      toast({
        title: "Upload Failed",
        description: `Error: ${uploadError.message}`,
        variant: "destructive",
      });
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('profile_images').getPublicUrl(filePath);
    if (data && data.publicUrl) {
      setProfileImage(data.publicUrl);
      setUploading(false);
    }
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `${currentUser.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('profile_images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Gallery Upload error:", uploadError);
      toast({
        title: "Upload Failed",
        description: `Error: ${uploadError.message}`,
        variant: "destructive",
      });
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('profile_images').getPublicUrl(filePath);
    if (data && data.publicUrl) {
      setGalleryImages(prevImages => [...prevImages, { name: file.name, url: data.publicUrl }]);
      setUploading(false);
    }
  };

  const handleSelectGalleryImage = (url: string) => {
    setSelectedGalleryImage(url);
    setProfileImage(url);
  };
  
  // These would be populated with real data in a full implementation
  const userPosts = [];
  const attendingEvents = [];
  const createdEvents = [];
  const memberGroups = [];
  const managedGroups = [];
  
  if (isProfileLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-32 w-32 rounded-full" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
    );
  }
  
  if (profileError || !currentProfile) {
    return (
      <div className="text-center py-10">
        <ImageIcon className="mx-auto h-10 w-10 text-red-500" />
        <h2 className="mt-4 text-xl font-semibold">Profile Not Found</h2>
        <p className="mt-2 text-gray-500">The profile you're looking for doesn't exist or is private.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto mt-8">
      <div className="bg-white shadow rounded-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-32 h-32">
              <AvatarImage src={profileImage} alt={currentProfile.name} />
              <AvatarFallback>{currentProfile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-semibold">{currentProfile.name}</h1>
              <p className="text-gray-500">{currentProfile.role}</p>
            </div>
          </div>
          
          {currentUser?.id === currentProfile.id && (
            <div>
              {isEditMode ? (
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={handleCancelClick}>Cancel</Button>
                  <Button onClick={handleSaveClick} disabled={uploading}>
                    {uploading ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              ) : (
                <Button onClick={handleEditClick}>Edit Profile</Button>
              )}
            </div>
          )}
        </div>
        
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-4">
            {isEditMode ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700">
                    Profile Image
                  </label>
                  <div className="mt-1 flex items-center gap-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={profileImage} alt={currentProfile.name} />
                      <AvatarFallback>{currentProfile.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm" onClick={() => setIsImageGalleryOpen(true)}>
                      Choose from Gallery
                    </Button>
                    <Input
                      type="file"
                      id="profileImage"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfileImageChange}
                      disabled={uploading}
                    />
                    <label htmlFor="profileImage">
                      <Button variant="outline" size="sm" disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Upload New'}
                      </Button>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <div className="mt-1">
                    <Input
                      type="text"
                      id="bio"
                      value={bio || ''}
                      onChange={(e) => setBio(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <div className="mt-1">
                    <Input
                      type="text"
                      id="location"
                      value={location || ''}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {currentProfile.bio && (
                  <div>
                    <h2 className="text-lg font-semibold">Bio</h2>
                    <p>{currentProfile.bio}</p>
                  </div>
                )}
                
                {currentProfile.location && (
                  <div>
                    <h2 className="text-lg font-semibold">Location</h2>
                    <p>{currentProfile.location}</p>
                  </div>
                )}
                
                <div className="flex gap-4">
                  <Button variant="link" onClick={() => setIsFollowersOpen(true)}>
                    {currentProfile.followers || 0} Followers
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="sessions">
            <SessionsTab userId={currentProfile.id} isOwnProfile={currentUser?.id === currentProfile.id} />
          </TabsContent>
        </Tabs>
      </div>

      {isFollowersOpen && (
        <FollowersList 
          users={[]} 
          emptyMessage="No followers yet"
          isOwnProfile={currentUser?.id === currentProfile.id}
          onClose={() => setIsFollowersOpen(false)}
        />
      )}
      
      {isFollowingOpen && (
        <FollowersList 
          users={[]}
          emptyMessage="Not following anyone yet"
          isOwnProfile={currentUser?.id === currentProfile.id}
          onClose={() => setIsFollowingOpen(false)}
        />
      )}

      {isImageGalleryOpen && (
        <ImageGallery
          images={galleryImages}
          onSelectImage={handleSelectGalleryImage}
          onUploadImage={handleGalleryImageUpload}
          uploading={uploading}
          selectedImage={selectedGalleryImage}
          onClose={() => setIsImageGalleryOpen(false)}
          emptyMessage="You haven't uploaded any images yet"
        />
      )}
    </div>
  );
};

export default Profile;
