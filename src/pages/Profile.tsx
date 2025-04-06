
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link, useParams } from 'react-router-dom';
import { 
  Instagram, 
  Twitter, 
  Globe, 
  MapPin, 
  Edit, 
  UserCheck, 
  Users, 
  X,
  Camera,
  ImageIcon,
  UserPlus
} from 'lucide-react';
import PostCard from '@/components/shared/PostCard';
import EventCard from '@/components/shared/EventCard';
import GroupCard from '@/components/shared/GroupCard';
import ServiceCard from '@/components/shared/ServiceCard';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import ImageGallery from '@/components/profile/ImageGallery';
import ImageCropper from '@/components/shared/ImageCropper';
import { cn } from '@/lib/utils';
import { User, UserRole } from '@/types';
import FollowButton from '@/components/profile/FollowButton';
import FollowersList from '@/components/profile/FollowersList';
import { useFollowers } from '@/hooks/useFollowers';

const Profile = () => {
  const { id } = useParams();
  const { currentUser, updateProfile } = useAuth();
  const { posts, events, groups, services, loading } = useData();
  const { toast } = useToast();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFollowersDialogOpen, setIsFollowersDialogOpen] = useState(false);
  const [isFollowingDialogOpen, setIsFollowingDialogOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    bio: '',
    location: '',
    profileImage: '',
    coverImage: '',
    instagram: '',
    twitter: '',
    website: ''
  });
  
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  
  const [profileImages, setProfileImages] = useState<{ name: string; url: string }[]>([]);
  const [coverImages, setCoverImages] = useState<{ name: string; url: string }[]>([]);

  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropImageType, setCropImageType] = useState<'profile' | 'cover'>('profile');
  const [cropAspectRatio, setCropAspectRatio] = useState(1);
  const [isGalleryDialogOpen, setIsGalleryDialogOpen] = useState(false);
  const [galleryType, setGalleryType] = useState<'profile' | 'cover'>('profile');
  
  const isOwnProfile = !id || (currentUser && id === currentUser.id);
  
  const { 
    followers, 
    following, 
    followerCount, 
    followingCount, 
    loading: loadingFollowers,
    refresh: refreshFollowers
  } = useFollowers(
    isOwnProfile ? currentUser?.id : id,
    currentUser?.id
  );
  
  useEffect(() => {
    if (currentUser && isOwnProfile) {
      setProfileForm({
        name: currentUser.name || '',
        bio: currentUser.bio || '',
        location: currentUser.location || '',
        profileImage: currentUser.profileImage || '',
        coverImage: currentUser.coverImage || '',
        instagram: currentUser.socialLinks?.instagram || '',
        twitter: currentUser.socialLinks?.twitter || '',
        website: currentUser.socialLinks?.website || ''
      });
    }
  }, [currentUser, isOwnProfile]);
  
  useEffect(() => {
    if (currentUser && isOwnProfile) {
      fetchProfileImages();
      fetchCoverImages();
    }
  }, [currentUser, isOwnProfile]);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!id || (currentUser && id === currentUser.id)) {
        return;
      }
      
      setIsLoadingProfile(true);
      try {
        const baseUrl = 'https://zovddtldwqxlgjpprddb.supabase.co/rest/v1/profiles';
        const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdmRkdGxkd3F4bGdqcHByZGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NzI3NDQsImV4cCI6MjA1OTE0ODc0NH0.-MSTJqiuR3XdHIVbLKTMsym1_yvZuZEvQSIl_ltwTnQ';
        
        const url = `${baseUrl}?id=eq.${id}&select=*`;
        
        console.log('Fetching profile from:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'apikey': apiKey,
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching profile: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Profile data:', data);
        
        if (!data || data.length === 0) {
          throw new Error('User profile not found');
        }
        
        const userData = data[0];
        
        const formattedUser: User = {
          id: userData.id,
          name: userData.name || 'Unknown User',
          email: userData.email || '',
          role: userData.role as UserRole,
          profileImage: userData.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=random`,
          bio: userData.bio || '',
          location: userData.location || '',
          interests: userData.interests || [],
          followers: userData.followers || 0,
          verified: userData.verified || false,
          socialLinks: userData.social_links || {},
          createdAt: new Date(userData.created_at)
        };
        
        setProfileUser(formattedUser);
      } catch (error: any) {
        console.error('Error fetching user profile:', error);
        toast({
          title: "Error fetching profile",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [id, currentUser, toast]);

  const userToShow = isOwnProfile ? currentUser : profileUser;

  
  
  const handleCrop = (imageUrl: string, type: 'profile' | 'cover') => {
    setCropImageSrc(imageUrl);
    setCropImageType(type);
    setCropAspectRatio(type === 'profile' ? 1 : 2.5);
    setIsCropDialogOpen(true);
  };
  
  const handleCropComplete = async (croppedImageUrl: string) => {
    try {
      setUploading(true);
      
      if (!currentUser) return;
      
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      
      const fileExt = 'jpg';
      const fileName = `cropped_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('You must be logged in to upload images');
      }
      
      const bucket = cropImageType === 'profile' ? 'profiles' : 'covers';
      const filePath = `${currentUser.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);
      
      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }
      
      const { data: urlData } = await supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      
      setProfileForm(prev => ({
        ...prev,
        [cropImageType === 'profile' ? 'profileImage' : 'coverImage']: urlData.publicUrl
      }));
      
      if (cropImageType === 'profile') {
        await fetchProfileImages();
      } else {
        await fetchCoverImages();
      }
      
      toast({
        title: "Crop and upload successful",
        description: `Your ${cropImageType} image has been cropped and uploaded`,
      });
    } catch (error: any) {
      console.error('Error cropping and uploading image:', error);
      toast({
        title: "Upload failed",
        description: error.message || `There was an error uploading your ${cropImageType} image`,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setIsCropDialogOpen(false);
      setCropImageSrc(null);
    }
  };
  
  const uploadProfileImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !currentUser) {
      return;
    }
    
    try {
      const file = event.target.files[0];
      
      const previewUrl = URL.createObjectURL(file);
      
      handleCrop(previewUrl, 'profile');
    } catch (error: any) {
      console.error('Error processing image:', error);
      toast({
        title: "Image processing failed",
        description: error.message || "There was an error processing your profile image",
        variant: "destructive"
      });
    }
  };
  
  const uploadCoverImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !currentUser) {
      return;
    }
    
    try {
      const file = event.target.files[0];
      
      const previewUrl = URL.createObjectURL(file);
      
      handleCrop(previewUrl, 'cover');
    } catch (error: any) {
      console.error('Error processing image:', error);
      toast({
        title: "Image processing failed",
        description: error.message || "There was an error processing your cover image",
        variant: "destructive"
      });
    }
  };

  
  
  const fetchProfileImages = async () => {
    if (!currentUser) return;
    
    try {
      const { data, error } = await supabase.storage
        .from('profiles')
        .list(currentUser.id, {
          sortBy: { column: 'created_at', order: 'desc' },
        });
      
      if (error) {
        console.error('Error listing profile images:', error);
        return;
      }
      
      if (data) {
        const imageUrls = await Promise.all(
          data.map(async (file) => {
            const { data: urlData } = await supabase.storage
              .from('profiles')
              .getPublicUrl(`${currentUser.id}/${file.name}`);
            
            return {
              name: file.name,
              url: urlData.publicUrl
            };
          })
        );
        setProfileImages(imageUrls);
      }
    } catch (error) {
      console.error('Error fetching profile images:', error);
    }
  };
  
  const fetchCoverImages = async () => {
    if (!currentUser) return;
    
    try {
      const { data, error } = await supabase.storage
        .from('covers')
        .list(currentUser.id, {
          sortBy: { column: 'created_at', order: 'desc' },
        });
      
      if (error) {
        console.error('Error listing cover images:', error);
        return;
      }
      
      if (data) {
        const imageUrls = await Promise.all(
          data.map(async (file) => {
            const { data: urlData } = await supabase.storage
              .from('covers')
              .getPublicUrl(`${currentUser.id}/${file.name}`);
            
            return {
              name: file.name,
              url: urlData.publicUrl
            };
          })
        );
        setCoverImages(imageUrls);
      }
    } catch (error) {
      console.error('Error fetching cover images:', error);
    }
  };
  
  const selectProfileImage = (url: string) => {
    handleCrop(url, 'profile');
  };
  
  const selectCoverImage = (url: string) => {
    handleCrop(url, 'cover');
  };
  
  const handleProfileFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProfileUpdate = async () => {
    if (!currentUser) return;
    
    try {
      const updatedProfile = {
        ...currentUser,
        name: profileForm.name,
        bio: profileForm.bio,
        location: profileForm.location,
        profileImage: profileForm.profileImage,
        coverImage: profileForm.coverImage,
        socialLinks: {
          instagram: profileForm.instagram,
          twitter: profileForm.twitter,
          website: profileForm.website
        }
      };
      
      await updateProfile(updatedProfile);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
      
      setIsEditDialogOpen(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: error.message || "There was an error updating your profile",
        variant: "destructive"
      });
    }
  };

  
  
  const renderRoleContent = () => {
    if (!userToShow) return null;
    
    switch (userToShow.role) {
      case 'influencer':
        return (
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="bg-red-50">Fitness Influencer</Badge>
            <Badge variant="outline" className="bg-red-50">Content Creator</Badge>
          </div>
        );
      
      case 'coach':
        return (
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="bg-teal-50">Certified Coach</Badge>
            <Badge variant="outline" className="bg-teal-50">Fitness Expert</Badge>
          </div>
        );
      
      case 'company':
        return (
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="bg-blue-50">Verified Business</Badge>
            <Badge variant="outline" className="bg-blue-50">Brand Partner</Badge>
          </div>
        );
        
      default:
        return null;
    }
  };

  const renderFollowerItems = (items: any[], onClose: () => void) => {
    return (
      <FollowersList 
        users={items} 
        isOwnProfile={isOwnProfile}
        onClose={onClose}
        emptyMessage={items === followers ? "No followers yet" : "Not following anyone yet"}
      />
    );
  };
  
  if ((isOwnProfile && !currentUser) || (!isOwnProfile && !profileUser)) {
    if (loading || isLoadingProfile) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      );
    }
    
    if (!isLoadingProfile) {
      return (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-4">Profile not found</h2>
          <p className="text-gray-500 mb-6">The user profile you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link to="/networking">
            <Button>Discover Users</Button>
          </Link>
        </div>
      );
    }
  }

  const userPosts = userToShow ? posts.filter(post => post.userId === userToShow.id) : [];
  
  const userEvents = userToShow ? events.filter(event => 
    event.creatorId === userToShow.id || event.attendees.includes(userToShow.id)
  ) : [];
  
  const userCreatedEvents = userToShow ? events.filter(event => 
    event.creatorId === userToShow.id
  ) : [];
  
  const joinedEvents = userToShow ? events.filter(event => 
    event.creatorId !== userToShow.id && event.attendees.includes(userToShow.id)
  ) : [];

  const userGroups = userToShow ? groups.filter(group => 
    group.creatorId === userToShow.id || (group.memberIds && group.memberIds.includes(userToShow.id))
  ) : [];
  
  const userCreatedGroups = userToShow ? groups.filter(group => 
    group.creatorId === userToShow.id
  ) : [];
  
  const joinedGroups = userToShow ? groups.filter(group => 
    group.creatorId !== userToShow.id && group.memberIds && group.memberIds.includes(userToShow.id)
  ) : [];

  const userServices = userToShow && userToShow.role === 'coach' ? 
    services.filter(service => service.providerId === userToShow.id) : [];

  // Helper function to get user initials
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get default avatar URL
  const getDefaultAvatarUrl = (name: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
  };

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden">
        <div className="relative">
          <div 
            className="h-48 bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={userToShow?.coverImage ? { backgroundImage: `url(${userToShow.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
          ></div>
          {isOwnProfile && (
            <input
              ref={coverImageInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={uploadCoverImage}
              disabled={uploading}
            />
          )}
        </div>
        
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="-mt-12 shrink-0 relative">
              <div className="h-32 w-32 rounded-full border-4 border-white overflow-hidden shadow-md bg-white">
                <Avatar className="h-full w-full">
                  <AvatarImage 
                    src={userToShow?.profileImage || (userToShow?.name ? getDefaultAvatarUrl(userToShow.name) : undefined)} 
                    alt={userToShow?.name || 'User'} 
                    onError={() => {
                      console.log("Profile image failed to load");
                      if (userToShow?.name) {
                        const fallbackSrc = getDefaultAvatarUrl(userToShow.name);
                        const imgElements = document.querySelectorAll(`img[alt="${userToShow.name || 'User'}"]`);
                        imgElements.forEach(img => {
                          (img as HTMLImageElement).src = fallbackSrc;
                        });
                      }
                    }}
                  />
                  <AvatarFallback>
                    {userToShow?.name ? getUserInitials(userToShow.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
              {isOwnProfile && (
                <input
                  ref={profileImageInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={uploadProfileImage}
                  disabled={uploading}
                />
              )}
            </div>
            
            <div className="flex-1 pt-2 md:pt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{userToShow?.name}</h1>
                    {userToShow?.verified && (
                      <UserCheck className="h-5 w-5 text-success" />
                    )}
                  </div>
                  
                  <p className="text-gray-500 capitalize">{userToShow?.role}</p>
                  
                  {userToShow?.location && (
                    <div className="flex items-center gap-1 text-gray-500 mt-1">
                      <MapPin className="h-4 w-4" />
                      <span>{userToShow.location}</span>
                    </div>
                  )}
                  
                  {userToShow && renderRoleContent()}
                </div>
                
                <div className="flex gap-2">
                  {isOwnProfile ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => setIsEditDialogOpen(true)}
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </Button>
                  ) : (
                    <FollowButton targetUserId={id || ''} />
                  )}
                </div>
              </div>
              
              {userToShow?.bio && (
                <p className="mt-4 text-gray-700">{userToShow.bio}</p>
              )}
              
              {userToShow?.socialLinks && (
                <div className="flex gap-3 mt-4">
                  {userToShow.socialLinks.instagram && (
                    <a 
                      href={`https://instagram.com/${userToShow.socialLinks.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-pink-600"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                  
                  {userToShow.socialLinks.twitter && (
                    <a 
                      href={`https://twitter.com/${userToShow.socialLinks.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-400"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                  
                  {userToShow.socialLinks.website && (
                    <a 
                      href={userToShow.socialLinks.website.startsWith('http') 
                        ? userToShow.socialLinks.website 
                        : `https://${userToShow.socialLinks.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-primary"
                    >
                      <Globe className="h-5 w-5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <Dialog open={isFollowersDialogOpen} onOpenChange={setIsFollowersDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Followers</DialogTitle>
                <DialogDescription>
                  People who follow {isOwnProfile ? "you" : userToShow?.name}
                </DialogDescription>
              </DialogHeader>
              {renderFollowerItems(followers, () => setIsFollowersDialogOpen(false))}
            </DialogContent>
          </Dialog>
          
          <Dialog open={isFollowingDialogOpen} onOpenChange={setIsFollowingDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Following</DialogTitle>
                <DialogDescription>
                  People {isOwnProfile ? "you" : userToShow?.name} follows
                </DialogDescription>
              </DialogHeader>
              {renderFollowerItems(following, () => setIsFollowingDialogOpen(false))}
            </DialogContent>
          </Dialog>
          
          <div className="grid grid-cols-3 gap-4 mt-6 text-center">
            <div 
              className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
              onClick={() => setIsFollowersDialogOpen(true)}
            >
              <div className="text-2xl font-bold">{loadingFollowers ? '...' : followerCount}</div>
              <div className="text-gray-500 text-sm">Followers</div>
            </div>
            
            <div 
              className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
              onClick={() => setIsFollowingDialogOpen(true)}
            >
              <div className="text-2xl font-bold">{loadingFollowers ? '...' : followingCount}</div>
              <div className="text-gray-500 text-sm">Following</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold">{userPosts.length}</div>
              <div className="text-gray-500 text-sm">Posts</div>
            </div>
          </div>
        </div>
      </Card>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="name" className="text-sm font-medium">Name</label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Your name"
                  value={profileForm.name}
                  onChange={handleProfileFormChange}
                />
              </div>
              
              <div>
                <label htmlFor="bio" className="text-sm font-medium">Bio</label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell us about yourself"
                  value={profileForm.bio}
                  onChange={handleProfileFormChange}
                  rows={3}
                />
              </div>
              
              <div>
                <label htmlFor="location" className="text-sm font-medium">Location</label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Your location"
                  value={profileForm.location}
                  onChange={handleProfileFormChange}
                />
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-2">Profile Image</h3>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100">
                  {profileForm.profileImage ? (
                    <img src={profileForm.profileImage} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-200">
                      <ImageIcon className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    className="gap-1"
                    onClick={() => profileImageInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4" />
                    <span>Upload</span>
                  </Button>
                  
                  {profileImages.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setGalleryType('profile');
                        setIsGalleryDialogOpen(true);
                      }}
                    >
                      Gallery
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Cover Image</h3>
              <div className="flex items-center gap-4">
                <div className="h-12 w-24 rounded overflow-hidden bg-gray-100">
                  {profileForm.coverImage ? (
                    <img src={profileForm.coverImage} alt="Cover" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-200">
                      <ImageIcon className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    className="gap-1"
                    onClick={() => coverImageInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4" />
                    <span>Upload</span>
                  </Button>
                  
                  {coverImages.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setGalleryType('cover');
                        setIsGalleryDialogOpen(true);
                      }}
                    >
                      Gallery
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-2">Social Links</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-gray-500" />
                  <Input
                    name="instagram"
                    placeholder="Instagram username"
                    value={profileForm.instagram}
                    onChange={handleProfileFormChange}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Twitter className="h-4 w-4 text-gray-500" />
                  <Input
                    name="twitter"
                    placeholder="Twitter username"
                    value={profileForm.twitter}
                    onChange={handleProfileFormChange}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <Input
                    name="website"
                    placeholder="Website"
                    value={profileForm.website}
                    onChange={handleProfileFormChange}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleProfileUpdate}
              disabled={uploading}
            >
              {uploading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
            <DialogDescription>
              Adjust your {cropImageType} image
            </DialogDescription>
          </DialogHeader>
          
          {cropImageSrc && (
            <ImageCropper
              imageSrc={cropImageSrc}
              aspectRatio={cropAspectRatio}
              onCropComplete={handleCropComplete}
              onCancel={() => {
                setIsCropDialogOpen(false);
                setCropImageSrc(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={isGalleryDialogOpen} onOpenChange={setIsGalleryDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Select Image</DialogTitle>
            <DialogDescription>
              Choose from your saved images
            </DialogDescription>
          </DialogHeader>
          
          <ImageGallery
            images={galleryType === 'profile' ? profileImages : coverImages}
            onSelectImage={galleryType === 'profile' ? selectProfileImage : selectCoverImage}
            onClose={() => setIsGalleryDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
