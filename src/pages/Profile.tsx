import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit, MapPin, Calendar, Link as LinkIcon, Instagram, Twitter, Globe, Upload, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { User, UserRole } from '@/types';
import PostCard from '@/components/post/PostCard';
import ServiceCard from '@/components/service/ServiceCard';
import EventCard from '@/components/event/EventCard';
import GroupCard from '@/components/group/GroupCard';
import { uploadImage } from '@/integrations/supabase/helpers';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, updateProfile } = useAuth();
  const { posts, services, events, groups, fetchUserServices } = useData();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileData, setProfileData] = useState<Partial<User>>({});
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  
  const isOwnProfile = currentUser && (!id || id === currentUser.id);
  const displayUser = isOwnProfile ? currentUser : null; // In a real app, fetch the user by ID
  
  const userPosts = posts.filter(post => post.userId === (id || currentUser?.id));
  const userServices = services.filter(service => service.providerId === (id || currentUser?.id));
  const userEvents = events.filter(event => event.creatorId === (id || currentUser?.id));
  const userGroups = groups.filter(group => group.creatorId === (id || currentUser?.id));
  
  React.useEffect(() => {
    if (displayUser) {
      setProfileData({
        name: displayUser.name,
        bio: displayUser.bio || '',
        location: displayUser.location || '',
        interests: displayUser.interests || [],
        socialLinks: {
          instagram: displayUser.socialLinks?.instagram || '',
          twitter: displayUser.socialLinks?.twitter || '',
          website: displayUser.socialLinks?.website || '',
        }
      });
    }
  }, [displayUser]);
  
  React.useEffect(() => {
    if (id || currentUser?.id) {
      fetchUserServices(id || currentUser?.id || '');
    }
  }, [id, currentUser?.id, fetchUserServices]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleInterestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const interests = e.target.value.split(',').map(item => item.trim());
    setProfileData(prev => ({ ...prev, interests }));
  };
  
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };
  
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(e.target.files[0]);
    }
  };
  
  const handleRemoveProfileImage = () => {
    setProfileImage(null);
  };
  
  const handleRemoveCoverImage = () => {
    setCoverImage(null);
  };
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    try {
      setIsUpdating(true);
      
      let profileImageUrl = currentUser.profileImage;
      let coverImageUrl = currentUser.coverImage;
      
      if (profileImage) {
        profileImageUrl = await uploadImage(profileImage, 'profiles');
      }
      
      if (coverImage) {
        coverImageUrl = await uploadImage(coverImage, 'covers');
      }
      
      const updatedProfile = {
        ...profileData,
        profileImage: profileImageUrl,
        coverImage: coverImageUrl
      };
      
      await updateProfile(updatedProfile);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  if (!displayUser) {
    return <div className="p-8 text-center">User not found</div>;
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800">
        {displayUser.coverImage && (
          <img 
            src={displayUser.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        )}
        
        {isEditing && (
          <div className="absolute top-4 right-4 flex space-x-2">
            <label className="cursor-pointer bg-white dark:bg-gray-800 p-2 rounded-full shadow">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleCoverImageChange}
              />
              <Upload className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </label>
            
            {coverImage && (
              <button 
                onClick={handleRemoveCoverImage}
                className="bg-white dark:bg-gray-800 p-2 rounded-full shadow"
              >
                <X className="h-5 w-5 text-red-500" />
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Profile Header */}
      <div className="relative -mt-16 px-4">
        <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-white dark:border-gray-900 shadow-lg">
              <AvatarImage src={displayUser.profileImage} />
              <AvatarFallback>{displayUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            {isEditing && (
              <div className="absolute bottom-0 right-0 flex space-x-1">
                <label className="cursor-pointer bg-white dark:bg-gray-800 p-1.5 rounded-full shadow">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleProfileImageChange}
                  />
                  <Upload className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </label>
                
                {profileImage && (
                  <button 
                    onClick={handleRemoveProfileImage}
                    className="bg-white dark:bg-gray-800 p-1.5 rounded-full shadow"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </button>
                )}
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold">{displayUser.name}</h1>
                <div className="flex items-center justify-center md:justify-start space-x-2 mt-1">
                  <Badge variant="outline" className="capitalize">
                    {displayUser.role}
                  </Badge>
                  
                  {displayUser.verified && (
                    <Badge className="bg-blue-500">Verified</Badge>
                  )}
                </div>
              </div>
              
              {isOwnProfile && (
                <div className="mt-4 md:mt-0">
                  {isEditing ? (
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                        disabled={isUpdating}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleUpdateProfile}
                        disabled={isUpdating}
                      >
                        {isUpdating ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-500 dark:text-gray-400">
              {displayUser.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{displayUser.location}</span>
                </div>
              )}
              
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Joined {formatDistanceToNow(displayUser.createdAt, { addSuffix: true })}</span>
              </div>
              
              {displayUser.followers !== undefined && (
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{displayUser.followers}</span> followers
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Profile Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <Input 
                      name="name"
                      value={profileData.name || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Bio</label>
                    <Textarea 
                      name="bio"
                      value={profileData.bio || ''}
                      onChange={handleInputChange}
                      rows={4}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <Input 
                      name="location"
                      value={profileData.location || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Interests (comma separated)</label>
                    <Input 
                      name="interests"
                      value={profileData.interests?.join(', ') || ''}
                      onChange={handleInterestsChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Instagram</label>
                    <Input 
                      name="socialLinks.instagram"
                      value={profileData.socialLinks?.instagram || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Twitter</label>
                    <Input 
                      name="socialLinks.twitter"
                      value={profileData.socialLinks?.twitter || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Website</label>
                    <Input 
                      name="socialLinks.website"
                      value={profileData.socialLinks?.website || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {displayUser.bio ? (
                    <p className="text-sm">{displayUser.bio}</p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No bio provided</p>
                  )}
                  
                  {displayUser.interests && displayUser.interests.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Interests</h3>
                      <div className="flex flex-wrap gap-2">
                        {displayUser.interests.map((interest, index) => (
                          <Badge key={index} variant="secondary">{interest}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {displayUser.socialLinks && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Social Links</h3>
                      <div className="space-y-2">
                        {displayUser.socialLinks.instagram && (
                          <a 
                            href={`https://instagram.com/${displayUser.socialLinks.instagram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm hover:underline"
                          >
                            <Instagram className="h-4 w-4 mr-2" />
                            {displayUser.socialLinks.instagram}
                          </a>
                        )}
                        
                        {displayUser.socialLinks.twitter && (
                          <a 
                            href={`https://twitter.com/${displayUser.socialLinks.twitter}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm hover:underline"
                          >
                            <Twitter className="h-4 w-4 mr-2" />
                            {displayUser.socialLinks.twitter}
                          </a>
                        )}
                        
                        {displayUser.socialLinks.website && (
                          <a 
                            href={displayUser.socialLinks.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm hover:underline"
                          >
                            <Globe className="h-4 w-4 mr-2" />
                            {displayUser.socialLinks.website}
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="md:col-span-2">
          <Tabs defaultValue="posts">
            <TabsList className="w-full">
              <TabsTrigger value="posts" className="flex-1">Posts</TabsTrigger>
              {displayUser.role === 'coach' && (
                <TabsTrigger value="services" className="flex-1">Services</TabsTrigger>
              )}
              <TabsTrigger value="events" className="flex-1">Events</TabsTrigger>
              <TabsTrigger value="groups" className="flex-1">Groups</TabsTrigger>
            </TabsList>
            
            <TabsContent value="posts" className="mt-4 space-y-4">
              {userPosts.length > 0 ? (
                userPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No posts yet
                </div>
              )}
            </TabsContent>
            
            {displayUser.role === 'coach' && (
              <TabsContent value="services" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userServices.length > 0 ? (
                    userServices.map(service => (
                      <ServiceCard key={service.id} service={service} />
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8 text-gray-500">
                      No services yet
                    </div>
                  )}
                </div>
              </TabsContent>
            )}
            
            <TabsContent value="events" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userEvents.length > 0 ? (
                  userEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    No events yet
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="groups" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userGroups.length > 0 ? (
                  userGroups.map(group => (
                    <GroupCard key={group.id} group={group} />
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    No groups yet
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
