
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
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
  Upload,
  Image as ImageIcon
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
import { cn } from '@/lib/utils';

const Profile = () => {
  const { currentUser, updateProfile } = useAuth();
  const { posts, events, groups, services, loading } = useData();
  const { toast } = useToast();

  const userPosts = currentUser ? posts.filter(post => post.userId === currentUser.id) : [];
  
  const userEvents = currentUser ? events.filter(event => 
    event.creatorId === currentUser.id || event.attendees.includes(currentUser.id)
  ) : [];
  
  const userCreatedEvents = currentUser ? events.filter(event => 
    event.creatorId === currentUser.id
  ) : [];
  
  const joinedEvents = currentUser ? events.filter(event => 
    event.creatorId !== currentUser.id && event.attendees.includes(currentUser.id)
  ) : [];

  const userGroups = currentUser ? groups.filter(group => 
    group.creatorId === currentUser.id || (group.memberIds && group.memberIds.includes(currentUser.id))
  ) : [];
  
  const userCreatedGroups = currentUser ? groups.filter(group => 
    group.creatorId === currentUser.id
  ) : [];
  
  const joinedGroups = currentUser ? groups.filter(group => 
    group.creatorId !== currentUser.id && group.memberIds && group.memberIds.includes(currentUser.id)
  ) : [];

  const userServices = currentUser && currentUser.role === 'coach' ? 
    services.filter(service => service.providerId === currentUser.id) : [];

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    bio: currentUser?.bio || '',
    location: currentUser?.location || '',
    profileImage: currentUser?.profileImage || '',
    coverImage: currentUser?.coverImage || '',
    instagram: currentUser?.socialLinks?.instagram || '',
    twitter: currentUser?.socialLinks?.twitter || '',
    website: currentUser?.socialLinks?.website || ''
  });

  const [isFollowersDialogOpen, setIsFollowersDialogOpen] = useState(false);
  const [isFollowingDialogOpen, setIsFollowingDialogOpen] = useState(false);
  
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  
  const [profileImages, setProfileImages] = useState<{ name: string; url: string }[]>([]);
  const [coverImages, setCoverImages] = useState<{ name: string; url: string }[]>([]);

  useEffect(() => {
    if (currentUser) {
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
  }, [currentUser]);
  
  useEffect(() => {
    if (currentUser) {
      fetchProfileImages();
      fetchCoverImages();
    }
  }, [currentUser]);
  
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
      toast({
        title: "Failed to load images",
        description: "There was an error loading your profile images.",
        variant: "destructive"
      });
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
      toast({
        title: "Failed to load images",
        description: "There was an error loading your cover images.",
        variant: "destructive"
      });
    }
  };
  
  const uploadProfileImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !currentUser) {
      return;
    }
    
    try {
      setUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${currentUser.id}/${fileName}`;
      
      // First check if we have a valid session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('You must be logged in to upload images');
      }
      
      // Then upload the file
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);
      
      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }
      
      // Get the public URL
      const { data: urlData } = await supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
      
      // Update the profile form
      setProfileForm(prev => ({
        ...prev,
        profileImage: urlData.publicUrl
      }));
      
      // Refresh the image gallery
      await fetchProfileImages();
      
      toast({
        title: "Upload successful",
        description: "Your profile image has been uploaded and selected",
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your profile image",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };
  
  const uploadCoverImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !currentUser) {
      return;
    }
    
    try {
      setUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${currentUser.id}/${fileName}`;
      
      // First check if we have a valid session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('You must be logged in to upload images');
      }
      
      // Then upload the file
      const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(filePath, file);
      
      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }
      
      // Get the public URL
      const { data: urlData } = await supabase.storage
        .from('covers')
        .getPublicUrl(filePath);
      
      // Update the profile form
      setProfileForm(prev => ({
        ...prev,
        coverImage: urlData.publicUrl
      }));
      
      // Refresh the image gallery
      await fetchCoverImages();
      
      toast({
        title: "Upload successful",
        description: "Your cover image has been uploaded and selected",
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your cover image",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };
  
  const selectProfileImage = (url: string) => {
    setProfileForm(prev => ({
      ...prev,
      profileImage: url
    }));
    toast({
      title: "Profile image selected",
      description: "Click Save Changes to update your profile"
    });
  };
  
  const selectCoverImage = (url: string) => {
    setProfileForm(prev => ({
      ...prev,
      coverImage: url
    }));
    toast({
      title: "Cover image selected",
      description: "Click Save Changes to update your profile"
    });
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
    if (!currentUser) return null;
    
    switch (currentUser.role) {
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
    if (items.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No followers yet
        </div>
      );
    }
    
    return items.map((item, index) => (
      <div key={index} className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={item.profileImage} />
            <AvatarFallback>
              {item.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-gray-500 capitalize">{item.role}</p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          {item.isFollowing ? "Unfollow" : "Follow"}
        </Button>
      </div>
    ));
  };

  const mockFollowers = [
    { id: '1', name: 'John Doe', profileImage: '', role: 'user', isFollowing: true },
    { id: '2', name: 'Jane Smith', profileImage: '', role: 'influencer', isFollowing: false },
    { id: '3', name: 'Fitness Pro', profileImage: '', role: 'coach', isFollowing: true }
  ];
  
  const mockFollowing = [
    { id: '4', name: 'Gym Bros', profileImage: '', role: 'company', isFollowing: true },
    { id: '5', name: 'Workout Daily', profileImage: '', role: 'influencer', isFollowing: true },
    { id: '6', name: 'Health Plus', profileImage: '', role: 'company', isFollowing: true }
  ];

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden">
        <div className="relative">
          <div 
            className="h-48 bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={currentUser?.coverImage ? { backgroundImage: `url(${currentUser.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
          ></div>
          <Button 
            size="sm" 
            variant="secondary"
            className="absolute right-4 bottom-4 gap-1 shadow-md"
            onClick={() => coverImageInputRef.current?.click()}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Change Cover</span>
          </Button>
          <input
            ref={coverImageInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={uploadCoverImage}
            disabled={uploading}
          />
        </div>
        
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="-mt-12 shrink-0 relative">
              <div className="h-32 w-32 rounded-full border-4 border-white overflow-hidden shadow-md bg-white">
                <img 
                  src={currentUser?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'User')}&background=random&size=150`} 
                  alt={currentUser?.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <Button 
                size="sm" 
                variant="secondary" 
                className="absolute bottom-0 right-0 h-8 w-8 p-0 rounded-full shadow-md"
                onClick={() => profileImageInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
              </Button>
              <input
                ref={profileImageInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={uploadProfileImage}
                disabled={uploading}
              />
            </div>
            
            <div className="flex-1 pt-2 md:pt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{currentUser?.name}</h1>
                    {currentUser?.verified && (
                      <UserCheck className="h-5 w-5 text-success" />
                    )}
                  </div>
                  
                  <p className="text-gray-500 capitalize">{currentUser?.role}</p>
                  
                  {currentUser?.location && (
                    <div className="flex items-center gap-1 text-gray-500 mt-1">
                      <MapPin className="h-4 w-4" />
                      <span>{currentUser.location}</span>
                    </div>
                  )}
                  
                  {currentUser && renderRoleContent()}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => setIsEditDialogOpen(true)}
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </Button>
                </div>
              </div>
              
              {currentUser?.bio && (
                <p className="mt-4 text-gray-700">{currentUser.bio}</p>
              )}
              
              {currentUser?.socialLinks && (
                <div className="flex gap-3 mt-4">
                  {currentUser.socialLinks.instagram && (
                    <a 
                      href={`https://instagram.com/${currentUser.socialLinks.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-pink-600"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                  
                  {currentUser.socialLinks.twitter && (
                    <a 
                      href={`https://twitter.com/${currentUser.socialLinks.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-400"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                  
                  {currentUser.socialLinks.website && (
                    <a 
                      href={`https://${currentUser.socialLinks.website}`}
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
          
          <div className="grid grid-cols-3 gap-4 mt-6 text-center">
            <div 
              className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
              onClick={() => setIsFollowersDialogOpen(true)}
            >
              <div className="text-2xl font-bold">{currentUser?.followers || 0}</div>
              <div className="text-gray-500 text-sm">Followers</div>
            </div>
            
            <div 
              className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
              onClick={() => setIsFollowingDialogOpen(true)}
            >
              <div className="text-2xl font-bold">{(currentUser?.following?.length || 0)}</div>
              <div className="text-gray-500 text-sm">Following</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold">{userPosts.length}</div>
              <div className="text-gray-500 text-sm">Posts</div>
            </div>
          </div>
        </div>
      </Card>
      
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          {currentUser?.role === 'coach' && (
            <TabsTrigger value="services">Services</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="posts" className="mt-6">
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : userPosts.length > 0 ? (
            <div className="space-y-4">
              {userPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You haven't created any posts yet.</p>
              {currentUser?.role !== 'user' && (
                <Link to="/create/post">
                  <Button>Create Your First Post</Button>
                </Link>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="events" className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-lg" />
              ))}
            </div>
          ) : userEvents.length > 0 ? (
            <div>
              {userCreatedEvents.length > 0 && (
                <>
                  <h3 className="text-lg font-medium mb-4">Events You're Hosting</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {userCreatedEvents.map(event => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </>
              )}
              
              {joinedEvents.length > 0 && (
                <>
                  <h3 className="text-lg font-medium mb-4">Events You're Attending</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {joinedEvents.map(event => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </>
              )}
              
              {userCreatedEvents.length === 0 && joinedEvents.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">You haven't joined any events yet.</p>
                  <Link to="/events">
                    <Button>Explore Events</Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You haven't joined any events yet.</p>
              <div className="flex justify-center gap-4">
                <Link to="/events">
                  <Button variant="outline">Explore Events</Button>
                </Link>
                {currentUser && ['influencer', 'coach', 'company'].includes(currentUser.role) && (
                  <Link to="/create-event">
                    <Button>Create Your First Event</Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="groups" className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-lg" />
              ))}
            </div>
          ) : userGroups.length > 0 ? (
            <div>
              {userCreatedGroups.length > 0 && (
                <>
                  <h3 className="text-lg font-medium mb-4">Groups You Manage</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {userCreatedGroups.map(group => (
                      <GroupCard key={group.id} group={group} />
                    ))}
                  </div>
                </>
              )}
              
              {joinedGroups.length > 0 && (
                <>
                  <h3 className="text-lg font-medium mb-4">Groups You've Joined</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {joinedGroups.map(group => (
                      <GroupCard key={group.id} group={group} />
                    ))}
                  </div>
                </>
              )}
              
              {userCreatedGroups.length === 0 && joinedGroups.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">You haven't joined any groups yet.</p>
                  <Link to="/groups">
                    <Button>Explore Groups</Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You haven't joined any groups yet.</p>
              <div className="flex justify-center gap-4">
                <Link to="/groups">
                  <Button variant="outline">Explore Groups</Button>
                </Link>
                {currentUser && ['influencer', 'company'].includes(currentUser.role) && (
                  <Link to="/create-group">
                    <Button>Create Your First Group</Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </TabsContent>
        
        {currentUser?.role === 'coach' && (
          <TabsContent value="services" className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-lg" />
                ))}
              </div>
            ) : userServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userServices.map(service => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">You haven't created any services yet.</p>
                <Link to="/create/service">
                  <Button>Create Your First Service</Button>
                </Link>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <Input
                id="name"
                name="name"
                value={profileForm.name}
                onChange={handleProfileFormChange}
                placeholder="Your name"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium">Bio</label>
              <Textarea
                id="bio"
                name="bio"
                value={profileForm.bio}
                onChange={handleProfileFormChange}
                placeholder="Tell us about yourself"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">Location</label>
              <Input
                id="location"
                name="location"
                value={profileForm.location}
                onChange={handleProfileFormChange}
                placeholder="Your location"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="profileImage" className="text-sm font-medium flex justify-between">
                <span>Profile Image</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 gap-1"
                  onClick={() => profileImageInputRef.current?.click()}
                >
                  <ImageIcon className="h-4 w-4" />
                  <span>Choose Image</span>
                </Button>
              </label>
              {profileForm.profileImage && (
                <div className="mt-2 flex items-center">
                  <img 
                    src={profileForm.profileImage} 
                    alt="Profile preview" 
                    className="h-16 w-16 rounded-full object-cover border"
                  />
                  <div className="ml-4 text-sm text-gray-500">
                    <p>Current selection</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="coverImage" className="text-sm font-medium flex justify-between">
                <span>Cover Image</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 gap-1"
                  onClick={() => coverImageInputRef.current?.click()}
                >
                  <ImageIcon className="h-4 w-4" />
                  <span>Choose Image</span>
                </Button>
              </label>
              {profileForm.coverImage && (
                <div className="mt-2">
                  <img 
                    src={profileForm.coverImage} 
                    alt="Cover preview" 
                    className="h-24 w-full object-cover rounded-md border"
                  />
                </div>
              )}
            </div>
            
            <Separator className="my-4" />
            
            <h4 className="text-sm font-medium mb-2">Social Links</h4>
            
            <div className="space-y-2">
              <label htmlFor="instagram" className="text-sm font-medium flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                <span>Instagram</span>
              </label>
              <Input
                id="instagram"
                name="instagram"
                value={profileForm.instagram}
                onChange={handleProfileFormChange}
                placeholder="@username"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="twitter" className="text-sm font-medium flex items-center gap-2">
                <Twitter className="h-4 w-4" />
                <span>Twitter</span>
              </label>
              <Input
                id="twitter"
                name="twitter"
                value={profileForm.twitter}
                onChange={handleProfileFormChange}
                placeholder="@username"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="website" className="text-sm font-medium flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Website</span>
              </label>
              <Input
                id="website"
                name="website"
                value={profileForm.website}
                onChange={handleProfileFormChange}
                placeholder="yourwebsite.com"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleProfileUpdate}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isFollowersDialogOpen} onOpenChange={setIsFollowersDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Followers</DialogTitle>
            <DialogDescription>
              People who follow you
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-1 py-2">
              {renderFollowerItems(mockFollowers, () => setIsFollowersDialogOpen(false))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isFollowingDialogOpen} onOpenChange={setIsFollowingDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Following</DialogTitle>
            <DialogDescription>
              People you follow
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-1 py-2">
              {renderFollowerItems(mockFollowing, () => setIsFollowingDialogOpen(false))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
