
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Edit, Settings, CalendarIcon, UsersIcon, MessageSquare } from 'lucide-react';
import { Post, Service, Event, Group } from '@/types';
import PostCard from '@/components/post/PostCard';
import ServiceCard from '@/components/service/ServiceCard';
import EventCard from '@/components/event/EventCard';
import GroupCard from '@/components/group/GroupCard';
import { supabase } from '@/integrations/supabase/client';

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { currentUser, updateProfile } = useAuth();
  const { fetchUserServices } = useData();
  const { toast } = useToast();
  
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userServices, setUserServices] = useState<Service[]>([]);
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  
  const isCurrentUser = currentUser && (!userId || userId === currentUser.id);
  const displayUserId = userId || currentUser?.id;
  
  useEffect(() => {
    if (!displayUserId) {
      navigate('/login');
      return;
    }
    
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', displayUserId)
          .single();
          
        if (profileError) throw profileError;
        setUserProfile(profileData);
        
        // Fetch user posts
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', displayUserId)
          .order('created_at', { ascending: false });
          
        if (postsError) throw postsError;
        setUserPosts(postsData.map((post: any) => ({
          ...post,
          id: post.id,
          userId: post.user_id,
          userName: post.user_name,
          userProfileImage: post.user_profile_image,
          createdAt: new Date(post.created_at),
          likes: post.likes_count || 0,
          comments: post.comments_count || 0,
          userLikes: []
        })));
        
        // Fetch services created by user
        const services = await fetchUserServices(displayUserId);
        setUserServices(services);
        
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load user data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [displayUserId, navigate, toast, fetchUserServices]);
  
  if (!displayUserId) return null;
  
  return (
    <div className="container mx-auto py-6 max-w-5xl">
      {loading ? (
        <div className="text-center py-10">Loading profile...</div>
      ) : (
        <>
          {userProfile && (
            <Card className="mb-6">
              <CardContent className="p-0">
                <div className="relative">
                  <div className="h-48 bg-gray-200">
                    {userProfile.cover_image && (
                      <img 
                        src={userProfile.cover_image} 
                        alt="Cover" 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  <div className="absolute bottom-0 left-6 transform translate-y-1/2">
                    <Avatar className="h-24 w-24 border-4 border-white">
                      <AvatarImage src={userProfile.profile_image} />
                      <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                  
                  {isCurrentUser && (
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="bg-white"
                        onClick={() => navigate('/settings')}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="bg-white"
                        onClick={() => {/* Open edit modal */}}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="pt-16 pb-6 px-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <h1 className="text-2xl font-bold">{userProfile.name}</h1>
                      <p className="text-gray-500">{userProfile.role}</p>
                    </div>
                    
                    {!isCurrentUser && (
                      <div className="mt-4 md:mt-0 flex space-x-2">
                        <Button variant="outline">Follow</Button>
                        <Button>Message</Button>
                      </div>
                    )}
                  </div>
                  
                  <p className="mb-4">{userProfile.bio}</p>
                  
                  <div className="flex flex-wrap gap-4">
                    {userProfile.location && (
                      <div className="flex items-center text-gray-500">
                        <span>{userProfile.location}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-gray-500">
                      <span>{userProfile.followers || 0} followers</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="groups">Groups</TabsTrigger>
            </TabsList>
            
            <TabsContent value="posts" className="space-y-4">
              {userPosts.length > 0 ? (
                userPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <p className="text-center py-10 text-gray-500">No posts yet</p>
              )}
            </TabsContent>
            
            <TabsContent value="services" className="space-y-4">
              {userServices.length > 0 ? (
                userServices.map(service => (
                  <ServiceCard key={service.id} service={service} />
                ))
              ) : (
                <p className="text-center py-10 text-gray-500">No services yet</p>
              )}
            </TabsContent>
            
            <TabsContent value="events" className="space-y-4">
              {userEvents.length > 0 ? (
                userEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))
              ) : (
                <p className="text-center py-10 text-gray-500">No events yet</p>
              )}
            </TabsContent>
            
            <TabsContent value="groups" className="space-y-4">
              {userGroups.length > 0 ? (
                userGroups.map(group => (
                  <GroupCard key={group.id} group={group} />
                ))
              ) : (
                <p className="text-center py-10 text-gray-500">No groups yet</p>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default Profile;
