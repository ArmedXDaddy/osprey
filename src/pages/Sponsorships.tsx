
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search } from 'lucide-react';
import SponsorshipCard from '@/components/shared/SponsorshipCard';

const Sponsorships = () => {
  const { currentUser } = useAuth();
  const { sponsorships } = useData();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const isCompany = currentUser?.role === 'company';

  const handleCreateSponsorship = () => {
    navigate('/sponsorships/create');
  };

  const filteredSponsorships = sponsorships?.filter(sponsorship => {
    const matchesSearch = 
      sponsorship.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      sponsorship.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'active') return matchesSearch && sponsorship.status === 'active';
    if (activeTab === 'withCompensation') return matchesSearch && !!sponsorship.compensation;
    return matchesSearch;
  }) || [];

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Sponsorship Opportunities</h1>
          <p className="text-muted-foreground mt-1">
            Find brands looking for ambassadors and collaboration opportunities
          </p>
        </div>
        {isCompany && (
          <Button onClick={handleCreateSponsorship} className="mt-4 md:mt-0 gap-2">
            <PlusCircle className="h-4 w-4" />
            Create Opportunity
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search opportunities..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Tabs 
          defaultValue="all" 
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="w-full md:w-auto grid grid-cols-3 md:grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="withCompensation">Paid</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredSponsorships.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSponsorships.map((sponsorship) => (
            <SponsorshipCard key={sponsorship.id} sponsorship={sponsorship} />
          ))}
        </div>
      ) : (
        <div className="bg-muted rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No sponsorships found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? "No sponsorships match your search criteria. Try adjusting your filters."
              : "There are no sponsorship opportunities available yet."}
          </p>
          {isCompany && (
            <Button onClick={handleCreateSponsorship}>
              Create Your First Opportunity
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Sponsorships;
