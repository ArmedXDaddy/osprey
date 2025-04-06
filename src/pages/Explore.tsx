import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Search, Filter, Users, Calendar, User, RefreshCw, Package2, GraduationCap } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { UserCard } from '@/components/shared/UserCard';
import EventCard from '@/components/shared/EventCard';
import GroupCard from '@/components/shared/GroupCard';
import { ProductCard } from '@/components/shared/ProductCard';
import { WorkshopCard } from '@/components/shared/WorkshopCard';
import { useNavigate } from 'react-router-dom';
import { Product, Workshop, Event, Group } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts, fetchWorkshops } from '@/integrations/supabase/helpers';

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  
  const activeTab = searchParams.get('tab') || 'people';
  
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const { 
    data: products = [], 
    isLoading: isLoadingProducts,
  } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const { 
    data: workshops = [], 
    isLoading: isLoadingWorkshops,
  } = useQuery({
    queryKey: ['workshops'],
    queryFn: fetchWorkshops,
  });

  const users = [
    { id: '1', name: 'Alex Johnson', role: 'influencer', followers: 21500, location: 'New York, NY', image: 'https://randomuser.me/api/portraits/men/32.jpg', bio: 'Tech influencer focusing on mobile development and emerging technologies.' },
    { id: '2', name: 'Sarah Williams', role: 'coach', followers: 8900, location: 'San Francisco, CA', image: 'https://randomuser.me/api/portraits/women/44.jpg', bio: 'Career coach helping tech professionals advance their careers and find work-life balance.' },
    { id: '3', name: 'Tech Solutions Inc.', role: 'company', followers: 45600, location: 'Boston, MA', image: 'https://ui-avatars.com/api/?name=Tech+Solutions&background=0D8ABC&color=fff', bio: 'Leading technology consulting firm specializing in digital transformation.' },
    { id: '4', name: 'Michael Brown', role: 'influencer', followers: 15200, location: 'Austin, TX', image: 'https://randomuser.me/api/portraits/men/22.jpg', bio: 'Sharing insights on startup growth, venture capital, and entrepreneurship.' },
    { id: '5', name: 'Innovation Labs', role: 'company', followers: 32100, location: 'Seattle, WA', image: 'https://ui-avatars.com/api/?name=Innovation+Labs&background=FF5733&color=fff', bio: 'Cutting-edge research lab focused on AI and robotics.' },
    { id: '6', name: 'Emma Clark', role: 'coach', followers: 11800, location: 'Chicago, IL', image: 'https://randomuser.me/api/portraits/women/28.jpg', bio: 'Executive coach with expertise in leadership development for tech executives.' }
  ];

  const events: Event[] = [
    { 
      id: '1', 
      title: 'Tech Conference 2023', 
      description: 'Annual tech conference featuring top industry speakers.', 
      date: new Date('2023-05-15'), 
      location: 'San Francisco, CA', 
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 
      attendees: ['1', '2', '3'], 
      privacy: 'public',
      creatorId: '1',
      creatorName: 'Tech Solutions Inc.',
      creatorRole: 'company',
      createdAt: new Date('2023-04-15')
    },
    { 
      id: '2', 
      title: 'Networking Mixer', 
      description: 'Connect with professionals in your industry.', 
      date: new Date('2023-04-20'), 
      location: 'New York, NY', 
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 
      attendees: ['1', '2', '3', '4'], 
      privacy: 'public',
      creatorId: '2',
      creatorName: 'Sarah Williams',
      creatorRole: 'coach',
      createdAt: new Date('2023-03-20')
    },
    { 
      id: '3', 
      title: 'Startup Workshop', 
      description: 'Learn the essentials of launching a successful startup.', 
      date: new Date('2023-06-10'), 
      location: 'Austin, TX', 
      image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 
      attendees: ['1', '2'], 
      privacy: 'public',
      creatorId: '4',
      creatorName: 'Michael Brown',
      creatorRole: 'influencer',
      createdAt: new Date('2023-05-10')
    },
    { 
      id: '4', 
      title: 'AI in Business Seminar', 
      description: 'Explore practical applications of AI in business operations.', 
      date: new Date('2023-05-25'), 
      location: 'Boston, MA', 
      image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 
      attendees: ['1', '2', '3', '4', '5'], 
      privacy: 'public',
      creatorId: '5',
      creatorName: 'Innovation Labs',
      creatorRole: 'company',
      createdAt: new Date('2023-04-25')
    }
  ];

  const groups: Group[] = [
    { 
      id: '1', 
      name: 'Tech Founders', 
      description: 'A community for startup founders to share experiences and advice.', 
      members: 520, 
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 
      privacy: 'public', 
      creatorId: '4',
      creatorName: 'Michael Brown',
      creatorRole: 'influencer',
      createdAt: new Date('2022-10-15')
    },
    { 
      id: '2', 
      name: 'Women in Tech', 
      description: 'Supporting women in technology fields through networking and mentorship.', 
      members: 780, 
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 
      privacy: 'public', 
      creatorId: '2',
      creatorName: 'Sarah Williams',
      creatorRole: 'coach',
      createdAt: new Date('2022-11-20')
    },
    { 
      id: '3', 
      name: 'AI Research Group', 
      description: 'Discussions on the latest developments in artificial intelligence.', 
      members: 350, 
      image: 'https://images.unsplash.com/photo-1669130650646-67905bfaddd5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 
      privacy: 'private', 
      creatorId: '5',
      creatorName: 'Innovation Labs',
      creatorRole: 'company',
      createdAt: new Date('2023-01-15')
    },
    { 
      id: '4', 
      name: 'Mobile Dev Meetup', 
      description: 'Regular meetups for mobile developers to share knowledge and network.', 
      members: 420, 
      image: 'https://images.unsplash.com/photo-1574689211272-bc14e289e223?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 
      privacy: 'public', 
      creatorId: '1',
      creatorName: 'Alex Johnson',
      creatorRole: 'influencer',
      createdAt: new Date('2023-02-10')
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Explore</h1>
          <p className="text-muted-foreground">Discover people, events, groups, products, and more</p>
        </div>
        
        <div className="flex w-full flex-col space-y-2 md:w-auto md:flex-row md:space-x-2 md:space-y-0">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-9 md:w-[250px] lg:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
            <span className="sr-only">Filter</span>
          </Button>
          
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-5 md:w-[600px]">
          <TabsTrigger value="people">
            <User className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">People</span>
          </TabsTrigger>
          
          <TabsTrigger value="events">
            <Calendar className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Events</span>
          </TabsTrigger>
          
          <TabsTrigger value="groups">
            <Users className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Groups</span>
          </TabsTrigger>
          
          <TabsTrigger value="products">
            <Package2 className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Products</span>
          </TabsTrigger>
          
          <TabsTrigger value="workshops">
            <GraduationCap className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Workshops</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="people" className="mt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {users
              .filter(user => 
                searchTerm === '' || 
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.role.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map(user => (
                <UserCard key={user.id} user={user} />
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="events" className="mt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {events
              .filter(event => 
                searchTerm === '' || 
                event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.location.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map(event => (
                <EventCard key={event.id} event={event} />
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="groups" className="mt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groups
              .filter(group => 
                searchTerm === '' || 
                group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                group.description.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map(group => (
                <GroupCard key={group.id} group={group} />
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="products" className="mt-6">
          {isLoadingProducts ? (
            <div className="flex justify-center p-12">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products
                .filter(product => 
                  searchTerm === '' || 
                  product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  product.category.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onClick={() => navigate(`/products/${product.id}`)} 
                  />
                ))}
            </div>
          ) : (
            <Card>
              <CardHeader className="text-center">
                <CardTitle>No Products Found</CardTitle>
                <CardDescription>
                  There are no products available at this time.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Package2 className="h-16 w-16 text-muted-foreground/50" />
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="workshops" className="mt-6">
          {isLoadingWorkshops ? (
            <div className="flex justify-center p-12">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : workshops.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {workshops
                .filter(workshop => 
                  searchTerm === '' || 
                  workshop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  workshop.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  workshop.category.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(workshop => (
                  <WorkshopCard 
                    key={workshop.id} 
                    workshop={workshop} 
                    onClick={() => navigate(`/workshops/${workshop.id}`)} 
                  />
                ))}
            </div>
          ) : (
            <Card>
              <CardHeader className="text-center">
                <CardTitle>No Workshops Found</CardTitle>
                <CardDescription>
                  There are no workshops available at this time.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <GraduationCap className="h-16 w-16 text-muted-foreground/50" />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Explore;
