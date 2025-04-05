
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, UserCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { User, UserRole } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

type UserCardProps = {
  user: User;
};

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const roleColors: Record<UserRole, string> = {
    user: 'bg-gray-100',
    influencer: 'bg-purple-100',
    coach: 'bg-blue-100',
    company: 'bg-green-100',
    admin: 'bg-red-100'
  };

  const roleBadgeColors: Record<UserRole, string> = {
    user: 'bg-gray-500 text-white',
    influencer: 'bg-purple-500 text-white',
    coach: 'bg-blue-500 text-white',
    company: 'bg-green-500 text-white',
    admin: 'bg-red-500 text-white'
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div 
        className="h-32 w-full bg-gradient-to-r from-indigo-500 to-purple-600"
      />
      <CardHeader className="pt-0 -mt-12 flex justify-center">
        <Avatar className="h-24 w-24 border-4 border-white">
          <AvatarImage src={user.profileImage} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xl">
            {user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </CardHeader>
      <CardContent className="text-center">
        <h3 className="text-xl font-bold mb-1">{user.name}</h3>
        <div className="mb-2">
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${roleBadgeColors[user.role]}`}>
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </span>
        </div>
        <p className="text-gray-500 text-sm mb-2">{user.location}</p>
        <p className="text-sm line-clamp-2 mb-2">{user.bio}</p>
        <div className="text-sm text-gray-500 mb-2">
          <span className="font-semibold">{user.followers?.toLocaleString() || 0}</span> followers
        </div>
      </CardContent>
      <CardFooter className="flex justify-center pb-4">
        <Link to={`/profile/${user.id}`}>
          <Button variant="outline" size="sm">View Profile</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

const Networking = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  const activeTab = searchParams.get('tab') || 'all';
  
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Fetch data directly using API calls instead of typed client
        // This avoids the TypeScript error while we wait for types to update
        const baseUrl = 'https://zovddtldwqxlgjpprddb.supabase.co/rest/v1/profiles';
        const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdmRkdGxkd3F4bGdqcHByZGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NzI3NDQsImV4cCI6MjA1OTE0ODc0NH0.-MSTJqiuR3XdHIVbLKTMsym1_yvZuZEvQSIl_ltwTnQ';
        
        let url = `${baseUrl}?select=*`;
        
        if (activeTab !== 'all') {
          url += `&role=eq.${activeTab}`;
        } else {
          url += `&role=in.(influencer,coach,company)`;
        }
        
        console.log('Fetching profiles from:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'apikey': apiKey,
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Response error:', errorText);
          throw new Error(`Error fetching profiles: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Profiles data:', data);
        
        if (!data || data.length === 0) {
          setUsers([]);
          return;
        }
        
        const formattedUsers: User[] = data.map((user: any) => ({
          id: user.id,
          name: user.name || 'Unknown User',
          email: user.email || '',
          role: user.role as UserRole,
          profileImage: user.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`,
          bio: user.bio || '',
          location: user.location || '',
          interests: user.interests || [],
          followers: user.followers || 0,
          verified: user.verified || false,
          socialLinks: user.social_links || {},
          createdAt: new Date(user.created_at)
        }));
        
        setUsers(formattedUsers);
      } catch (error: any) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error fetching users",
          description: error.message,
          variant: "destructive"
        });
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [activeTab, toast]);
  
  const filteredUsers = users.filter(user => {
    const matchesSearchTerm = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.bio && user.bio.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.location && user.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearchTerm;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Networking</h1>
        
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, bio, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="influencer">Influencers</TabsTrigger>
          <TabsTrigger value="coach">Coaches</TabsTrigger>
          <TabsTrigger value="company">Companies</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          {renderUserGrid(filteredUsers, loading)}
        </TabsContent>
        
        <TabsContent value="influencer" className="mt-6">
          {renderUserGrid(filteredUsers, loading)}
        </TabsContent>
        
        <TabsContent value="coach" className="mt-6">
          {renderUserGrid(filteredUsers, loading)}
        </TabsContent>
        
        <TabsContent value="company" className="mt-6">
          {renderUserGrid(filteredUsers, loading)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const renderUserGrid = (users: User[], loading: boolean) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-80 rounded-lg" />
        ))}
      </div>
    );
  }
  
  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <UserCircle className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <p className="text-lg text-gray-500">No users found matching your search.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
};

export default Networking;
