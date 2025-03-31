
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Globe, MapPin, Edit, UserCheck } from 'lucide-react';
import PostCard from '@/components/shared/PostCard';
import EventCard from '@/components/shared/EventCard';
import GroupCard from '@/components/shared/GroupCard';
import ServiceCard from '@/components/shared/ServiceCard';

const Profile = () => {
  const { currentUser } = useAuth();
  const { posts, events, groups, services, loading } = useData();
  
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Skeleton className="h-40 w-full max-w-md" />
      </div>
    );
  }

  // Filter data by current user
  const userPosts = posts.filter(post => post.userId === currentUser.id);
  const userEvents = events.filter(event => event.creatorId === currentUser.id);
  const userGroups = groups.filter(group => group.creatorId === currentUser.id);
  const userServices = services.filter(service => service.providerId === currentUser.id);
  
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
                  <Button variant="outline" size="sm" className="gap-1">
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
            <div>
              <div className="text-2xl font-bold">{currentUser.followers || 0}</div>
              <div className="text-gray-500 text-sm">Followers</div>
            </div>
            
            <div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You haven't created any events yet.</p>
              {['influencer', 'coach', 'company'].includes(currentUser.role) && (
                <Link to="/create/event">
                  <Button>Create Your First Event</Button>
                </Link>
              )}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userGroups.map(group => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You haven't created any groups yet.</p>
              {['influencer', 'company'].includes(currentUser.role) && (
                <Link to="/create/group">
                  <Button>Create Your First Group</Button>
                </Link>
              )}
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
    </div>
  );
};

export default Profile;
