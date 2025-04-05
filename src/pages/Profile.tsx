
import React, { useState } from 'react';
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
  X 
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

const Profile = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const { posts, events, groups, services, loading } = useData();
  const { toast } = useToast();

  // State for profile editing
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    bio: currentUser?.bio || '',
    location: currentUser?.location || '',
    profileImage: currentUser?.profileImage || '',
    instagram: currentUser?.socialLinks?.instagram || '',
    twitter: currentUser?.socialLinks?.twitter || '',
    website: currentUser?.socialLinks?.website || ''
  });

  // State for followers/following dialogs
  const [isFollowersDialogOpen, setIsFollowersDialogOpen] = useState(false);
  const [isFollowingDialogOpen, setIsFollowingDialogOpen] = useState(false);
  
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Skeleton className="h-40 w-full max-w-md" />
      </div>
    );
  }

  // Filter data by current user
  const userPosts = posts.filter(post => post.userId === currentUser.id);
  
  // Filter joined events (both created and attended)
  const userCreatedEvents = events.filter(event => event.creatorId === currentUser.id);
  const joinedEvents = events.filter(event => 
    event.creatorId !== currentUser.id && 
    event.attendees > 0 // This is a placeholder; in a real app we'd check if user is an attendee
  );
  const userEvents = [...userCreatedEvents, ...joinedEvents];
  
  // Filter joined groups (both created and member)
  const userCreatedGroups = groups.filter(group => group.creatorId === currentUser.id);
  const joinedGroups = groups.filter(group => 
    group.creatorId !== currentUser.id && 
    group.members > 0 // This is a placeholder; in a real app we'd check if user is a member
  );
  const userGroups = [...userCreatedGroups, ...joinedGroups];
  
  // Filter services provided by the user
  const userServices = services.filter(service => service.providerId === currentUser.id);
  
  // Handle profile form changes
  const handleProfileFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle profile update
  const handleProfileUpdate = async () => {
    try {
      const updatedProfile = {
        ...currentUser,
        name: profileForm.name,
        bio: profileForm.bio,
        location: profileForm.location,
        profileImage: profileForm.profileImage,
        socialLinks: {
          instagram: profileForm.instagram,
          twitter: profileForm.twitter,
          website: profileForm.website
        }
      };
      
      await updateUserProfile(updatedProfile);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating your profile",
        variant: "destructive"
      });
    }
  };
  
  // Role-specific info
  const renderRoleContent = () => {
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

  // Render follower items
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
            <AvatarFallback>{item.name.substring(0, 2).toUpperCase()}</AvatarFallback>
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

  // Mock data for followers and following
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
      {/* Profile Header */}
      <Card className="overflow-hidden">
        {/* Cover image */}
        <div className="h-48 bg-gradient-to-r from-primary to-accent"></div>
        
        <div className="px-6 pb-6">
          {/* Profile picture and basic info */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="-mt-12 shrink-0">
              <img 
                src={currentUser.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random&size=150`} 
                alt={currentUser.name}
                className="h-32 w-32 rounded-full border-4 border-white object-cover"
              />
            </div>
            
            <div className="flex-1 pt-2 md:pt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{currentUser.name}</h1>
                    {currentUser.verified && (
                      <UserCheck className="h-5 w-5 text-success" />
                    )}
                  </div>
                  
                  <p className="text-gray-500 capitalize">{currentUser.role}</p>
                  
                  {currentUser.location && (
                    <div className="flex items-center gap-1 text-gray-500 mt-1">
                      <MapPin className="h-4 w-4" />
                      <span>{currentUser.location}</span>
                    </div>
                  )}
                  
                  {renderRoleContent()}
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
              
              {/* Bio */}
              {currentUser.bio && (
                <p className="mt-4 text-gray-700">{currentUser.bio}</p>
              )}
              
              {/* Social links */}
              {currentUser.socialLinks && (
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
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 text-center">
            <div 
              className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
              onClick={() => setIsFollowersDialogOpen(true)}
            >
              <div className="text-2xl font-bold">{currentUser.followers || 0}</div>
              <div className="text-gray-500 text-sm">Followers</div>
            </div>
            
            <div 
              className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
              onClick={() => setIsFollowingDialogOpen(true)}
            >
              <div className="text-2xl font-bold">{(currentUser.following || []).length}</div>
              <div className="text-gray-500 text-sm">Following</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold">{userPosts.length}</div>
              <div className="text-gray-500 text-sm">Posts</div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Profile Content */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          {currentUser.role === 'coach' && (
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
              {currentUser.role !== 'user' && (
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
                {['influencer', 'coach', 'company'].includes(currentUser.role) && (
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
                {['influencer', 'company'].includes(currentUser.role) && (
                  <Link to="/create-group">
                    <Button>Create Your First Group</Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </TabsContent>
        
        {currentUser.role === 'coach' && (
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
      
      {/* Edit Profile Dialog */}
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
              <label htmlFor="profileImage" className="text-sm font-medium">Profile Image URL</label>
              <Input
                id="profileImage"
                name="profileImage"
                value={profileForm.profileImage}
                onChange={handleProfileFormChange}
                placeholder="https://example.com/image.jpg"
              />
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
                placeholder="example.com"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleProfileUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Followers Dialog */}
      <Dialog open={isFollowersDialogOpen} onOpenChange={setIsFollowersDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Followers</DialogTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsFollowersDialogOpen(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <ScrollArea className="h-[400px] pr-4">
            {renderFollowerItems(mockFollowers, () => setIsFollowersDialogOpen(false))}
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      {/* Following Dialog */}
      <Dialog open={isFollowingDialogOpen} onOpenChange={setIsFollowingDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Following</DialogTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsFollowingDialogOpen(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <ScrollArea className="h-[400px] pr-4">
            {renderFollowerItems(mockFollowing, () => setIsFollowingDialogOpen(false))}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
