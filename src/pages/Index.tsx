
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import PostCard from '@/components/shared/PostCard';
import EventCard from '@/components/shared/EventCard';
import GroupCard from '@/components/shared/GroupCard';
import ServiceCard from '@/components/shared/ServiceCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import RoleBasedActionButton from '@/components/shared/RoleBasedActionButton';
import { UserRole } from '@/types';
import { Calendar, Users, DollarSign, Award, Star, TrendingUp } from 'lucide-react';

const HomePage = () => {
  const { currentUser } = useAuth();
  const { posts, events, groups, services, loading } = useData();
  
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Skeleton className="h-40 w-full max-w-md" />
      </div>
    );
  }

  // Role-based welcome message and stats
  const getRoleBasedIntro = () => {
    switch (currentUser.role) {
      case 'user':
        return {
          title: 'Welcome back!',
          subtitle: 'Discover events, groups, and inspiring content',
          stats: [
            { icon: <Calendar className="h-5 w-5 text-primary" />, label: 'Events', value: events.length },
            { icon: <Users className="h-5 w-5 text-primary" />, label: 'Groups', value: groups.length },
          ]
        };
      
      case 'influencer':
        return {
          title: 'Your Creator Dashboard',
          subtitle: 'Engage with your audience and grow your community',
          stats: [
            { icon: <Users className="h-5 w-5 text-red-500" />, label: 'Followers', value: currentUser.followers || 0 },
            { icon: <Calendar className="h-5 w-5 text-red-500" />, label: 'Events', value: events.filter(e => e.creatorId === currentUser.id).length },
            { icon: <Star className="h-5 w-5 text-red-500" />, label: 'Engagement', value: '24%' },
          ]
        };
      
      case 'coach':
        return {
          title: 'Coach Dashboard',
          subtitle: 'Manage your services and connect with clients',
          stats: [
            { icon: <DollarSign className="h-5 w-5 text-teal-500" />, label: 'Services', value: services.filter(s => s.providerId === currentUser.id).length },
            { icon: <Users className="h-5 w-5 text-teal-500" />, label: 'Clients', value: Math.floor(Math.random() * 20) },
            { icon: <Calendar className="h-5 w-5 text-teal-500" />, label: 'Events', value: events.filter(e => e.creatorId === currentUser.id).length },
          ]
        };
      
      case 'company':
        return {
          title: 'Company Dashboard',
          subtitle: 'Manage your brand presence and partnerships',
          stats: [
            { icon: <TrendingUp className="h-5 w-5 text-blue-500" />, label: 'Reach', value: `${(currentUser.followers || 0) * 23}` },
            { icon: <Calendar className="h-5 w-5 text-blue-500" />, label: 'Events', value: events.filter(e => e.creatorId === currentUser.id).length },
            { icon: <Award className="h-5 w-5 text-blue-500" />, label: 'Partnerships', value: Math.floor(Math.random() * 10) },
          ]
        };
        
      case 'admin':
        return {
          title: 'Admin Dashboard',
          subtitle: 'Monitor platform activity and manage verifications',
          stats: [
            { icon: <Users className="h-5 w-5 text-gray-500" />, label: 'Users', value: 243 },
            { icon: <Award className="h-5 w-5 text-gray-500" />, label: 'Pending Verifications', value: 7 },
          ]
        };
        
      default:
        return {
          title: 'Welcome to Osprey',
          subtitle: 'Your fitness collaboration platform',
          stats: []
        };
    }
  };

  const roleIntro = getRoleBasedIntro();
  
  // Role-specific colors
  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'influencer': return 'from-red-500 to-orange-400';
      case 'coach': return 'from-teal-500 to-emerald-400';
      case 'company': return 'from-blue-600 to-blue-400';
      case 'admin': return 'from-gray-700 to-gray-500';
      default: return 'from-primary to-accent';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className={`bg-gradient-to-r ${getRoleColor(currentUser.role)} rounded-lg p-6 text-white`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{roleIntro.title}</h1>
            <p className="text-white/80">{roleIntro.subtitle}</p>
          </div>
          
          <div className="flex gap-3 md:gap-6">
            {roleIntro.stats.map((stat, i) => (
              <div key={i} className="bg-white/20 rounded-lg px-3 py-2 flex flex-col items-center">
                <div className="mb-1">{stat.icon}</div>
                <div className="text-lg font-bold">{stat.value}</div>
                <div className="text-xs text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <RoleBasedActionButton />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Feed */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="for-you" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="for-you">For You</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
            </TabsList>
            
            <TabsContent value="for-you" className="space-y-4 mt-4">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-0">
                      <div className="p-4 flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                      <div className="px-4 pb-4">
                        <Skeleton className="h-16 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                posts.map(post => <PostCard key={post.id} post={post} />)
              )}
            </TabsContent>
            
            <TabsContent value="following" className="mt-4">
              <div className="text-center py-8">
                <p className="text-gray-500 mb-2">
                  Start following influencers, coaches, and companies to see their content here.
                </p>
                <Link to="/explore" className="text-primary hover:underline">
                  Explore users to follow
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right Column - Events, Groups, Services */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : (
                <div className="space-y-3">
                  {events.slice(0, 2).map(event => (
                    <Link key={event.id} to={`/events/${event.id}`}>
                      <EventCard event={event} compact />
                    </Link>
                  ))}
                  <Link to="/events" className="text-primary hover:underline text-sm block text-center mt-2">
                    View all events
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Popular Groups */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Popular Groups
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : (
                <div className="space-y-3">
                  {groups.slice(0, 2).map(group => (
                    <Link key={group.id} to={`/groups/${group.id}`}>
                      <GroupCard group={group} compact />
                    </Link>
                  ))}
                  <Link to="/groups" className="text-primary hover:underline text-sm block text-center mt-2">
                    View all groups
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Coach Services - Only show for non-coaches */}
          {currentUser.role !== 'coach' && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-primary" />
                  Featured Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-48 w-full" />
                ) : (
                  <div>
                    {services.slice(0, 1).map(service => (
                      <ServiceCard 
                        key={service.id} 
                        service={{
                          ...service,
                          providerId: (service as any).providerId || service.coachId,
                          providerName: (service as any).providerName || service.coachName,
                        } as Service} 
                      />
                    ))}
                    <Link to="/explore?tab=services" className="text-primary hover:underline text-sm block text-center mt-4">
                      Explore all services
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
