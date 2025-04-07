
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSponsorships } from '@/integrations/supabase/sponsorshipHelpers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Sponsorship } from '@/types/sponsorship';
import SponsorshipCard from '@/components/sponsorship/SponsorshipCard';
import { useAuth } from '@/context/AuthContext';
import { Plus, Search } from 'lucide-react';

const Sponsorships: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  
  // Fetch sponsorships
  const { data: sponsorships, isLoading, error } = useQuery({
    queryKey: ['sponsorships'],
    queryFn: fetchSponsorships
  });
  
  // Filter sponsorships based on search query and selected tab
  const filteredSponsorships = sponsorships?.filter(sponsorship => {
    // Filter by search query
    const matchesQuery = searchQuery === '' || 
      sponsorship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sponsorship.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sponsorship.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sponsorship.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by tab
    if (selectedTab === 'all') return matchesQuery;
    if (selectedTab === 'active') return matchesQuery && sponsorship.status === 'active';
    
    return matchesQuery;
  });
  
  const handleCreateSponsorship = () => {
    navigate('/sponsorships/create');
  };
  
  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Sponsorships</h1>
          <p className="text-gray-600">Find partnership opportunities with companies</p>
        </div>
        {currentUser?.role === 'company' && (
          <Button onClick={handleCreateSponsorship}>
            <Plus className="w-4 h-4 mr-2" />
            Create Sponsorship
          </Button>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search sponsorships..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <Tabs defaultValue="all" className="mb-6" onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">All Sponsorships</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500">Failed to load sponsorships</p>
            </div>
          ) : filteredSponsorships?.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No sponsorships found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredSponsorships?.map((sponsorship) => (
                <SponsorshipCard key={sponsorship.id} sponsorship={sponsorship} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="active" className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500">Failed to load sponsorships</p>
            </div>
          ) : filteredSponsorships?.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No active sponsorships found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredSponsorships?.map((sponsorship) => (
                <SponsorshipCard key={sponsorship.id} sponsorship={sponsorship} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Sponsorships;
