import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, UserCircle } from 'lucide-react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { User, UserRole } from '@/types';
import UserCard from '@/components/shared/UserCard';

const Networking = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const location = useLocation();
  
  const activeTab = searchParams.get('tab') || 'all';
  
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  useEffect(() => {
    console.log('Location changed or component mounted:', location.pathname);
    
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const baseUrl = 'https://zovddtldwqxlgjpprddb.supabase.co/rest/v1/profiles';
        const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdmRkdGxkd3F4bGdqcHByZGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NzI3NDQsImV4cCI6MjA1OTE0ODc0NH0.-MSTJqiuR3XdHIVbLKTMsym1_yvZuZEvQSIl_ltwTnQ';
        
        let url = `${baseUrl}?select=*`;
        
        if (activeTab !== 'all' && !searchTerm) {
          url += `&role=eq.${activeTab}`;
        } else if (activeTab === 'all' && !searchTerm) {
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
          profileImage: user.profile_image || null,
          bio: user.bio || '',
          location: user.location || '',
          interests: user.interests || [],
          followers: user.followers || 0,
          verified: user.verified || false,
          socialLinks: user.social_links || {},
          createdAt: new Date(user.created_at)
        }));
        
        console.log('Formatted users with profile data:', formattedUsers);
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
  }, [activeTab, toast, searchTerm, location.pathname]);
  
  const filteredUsers = users.filter(user => {
    if (currentUser && user.id === currentUser.id) {
      return false;
    }
    
    if (searchTerm) {
      const matchesSearchTerm = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.bio && user.bio.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.location && user.location.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesSearchTerm;
    }
    
    return true;
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
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
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
