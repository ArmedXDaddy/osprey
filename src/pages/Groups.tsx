import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import GroupCard from '@/components/shared/GroupCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Users, List, Grid, Filter, Plus, Trash2, PenSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from '@/hooks/use-toast';

const Groups = () => {
  const { groups, loading, deleteGroup } = useData();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'alphabetical'>('popular');
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  // Filter groups based on search term
  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.creatorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort groups based on selected option
  const sortedGroups = [...filteredGroups].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'popular':
        return b.members - a.members;
      case 'alphabetical':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // Get user's groups (groups created by the current user)
  const userGroups = currentUser ? groups.filter(group => group.creatorId === currentUser?.id) : [];
  
  // Handle navigating to a group's detail page
  const handleGroupClick = (groupId: string) => {
    navigate(`/groups/${groupId}`);
  };

  // Check if user can create groups (influencers, companies, and coaches)
  const canCreateGroup = currentUser && ['influencer', 'company', 'coach'].includes(currentUser.role);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 bg-gray-200 animate-pulse rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-200 h-72 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Groups</h1>
          <p className="text-muted-foreground">Join communities and connect with like-minded people</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search groups..."
              className="w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Show create button for influencers, companies, and coaches */}
          {canCreateGroup && (
            <Link to="/create-group">
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Create Group
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Groups</TabsTrigger>
          {currentUser && <TabsTrigger value="my">My Groups</TabsTrigger>}
          {currentUser && <TabsTrigger value="joined">Joined Groups</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Filter className="h-4 w-4" />
                  Sort by: {sortBy === 'popular' ? 'Popular' : sortBy === 'newest' ? 'Newest' : 'A-Z'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy('popular')}>
                  Popular
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('newest')}>
                  Newest
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('alphabetical')}>
                  Alphabetical (A-Z)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="flex border rounded-md overflow-hidden">
              <Button 
                variant={viewMode === 'list' ? 'default' : 'ghost'} 
                size="sm" 
                className="rounded-none border-r"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                size="sm" 
                className="rounded-none"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedGroups.map((group) => (
                <GroupCard 
                  key={group.id} 
                  group={group} 
                  onClick={() => handleGroupClick(group.id)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedGroups.map((group) => (
                <div key={group.id} className="flex items-center border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <img 
                    src={group.image || 'https://via.placeholder.com/150?text=Group'} 
                    alt={group.name} 
                    className="w-16 h-16 object-cover rounded-md mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{group.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1">{group.description}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Users className="h-3 w-3 mr-1" />
                      {group.members} members
                    </div>
                  </div>
                  <Link to={`/groups/${group.id}`}>
                    <Button size="sm">View</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}

          {sortedGroups.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-gray-300" />
              <h3 className="mt-4 text-lg font-medium">No groups found</h3>
              <p className="text-gray-500">Try adjusting your search or create a new group</p>
            </div>
          )}
        </TabsContent>
        
        {currentUser && (
          <TabsContent value="my" className="space-y-4">
            {userGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userGroups.map((group) => (
                  <div key={group.id} className="relative">
                    <GroupCard 
                      group={group} 
                      onClick={() => handleGroupClick(group.id)}
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="h-8 w-8 bg-white/90 hover:bg-white"
                        asChild
                      >
                        <Link to={`/groups/${group.id}/edit`}>
                          <PenSquare className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        size="icon" 
                        variant="destructive" 
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setGroupToDelete(group.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-gray-300" />
                <h3 className="mt-4 text-lg font-medium">You haven't created any groups yet</h3>
                {['influencer', 'company', 'coach'].includes(currentUser.role) && (
                   <Link to="/create-group" className="mt-4 inline-block">
                     <Button>Create Your First Group</Button>
                   </Link>
                )}
              </div>
            )}
          </TabsContent>
        )}
        
        {currentUser && (
          <TabsContent value="joined" className="space-y-4">
            {joinedGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {joinedGroups.map((group) => (
                  <Link to={`/groups/${group.id}`} key={group.id}>
                    <GroupCard group={group} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-gray-300" />
                <h3 className="mt-4 text-lg font-medium">You haven't joined any groups yet</h3>
                <p className="text-gray-500">Explore and join groups to see them here</p>
                <Link to="/explore?tab=groups" className="mt-4 inline-block">
                  <Button variant="outline">Explore Groups</Button>
                </Link>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      <AlertDialog open={!!groupToDelete} onOpenChange={(open) => !open && setGroupToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this group?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your group
              and remove all data associated with it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { handleDeleteGroup(); }} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Groups;
