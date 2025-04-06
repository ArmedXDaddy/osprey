
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Info } from 'lucide-react';
import GroupCard from '@/components/shared/GroupCard';
import { Group } from '@/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const Groups = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { groups, getGroups, deleteGroup } = useData();
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);
  
  // Filter groups based on search and active tab
  const filteredGroups = groups.filter(group => {
    const matchesSearch = 
      group.name.toLowerCase().includes(searchText.toLowerCase()) ||
      group.description.toLowerCase().includes(searchText.toLowerCase());

    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'my-groups') {
      return matchesSearch && group.creatorId === currentUser?.id;
    }
    if (activeTab === 'joined') {
      // We'll handle joined groups separately
      return false;
    }
    
    return matchesSearch;
  });

  // For joined groups, we need to filter groups where the user is a member but not the creator
  const myGroups = groups.filter(group => 
    group.creatorId === currentUser?.id
  );
  
  // Create an array to store joined groups
  const userJoinedGroups = groups.filter(group => 
    group.memberIds?.includes(currentUser?.id || '') && 
    group.creatorId !== currentUser?.id
  );
  
  const handleCreateGroup = () => {
    navigate('/create-group');
  };
  
  const handleGroupClick = (groupId: string) => {
    navigate(`/groups/${groupId}`);
  };

  const handleDeleteGroup = (groupId: string) => {
    setGroupToDelete(groupId);
  };

  const confirmDeleteGroup = async () => {
    if (groupToDelete) {
      try {
        await deleteGroup(groupToDelete);
        setGroupToDelete(null);
      } catch (error) {
        console.error("Error deleting group:", error);
      }
    }
  };

  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Groups</h1>
          <p className="text-muted-foreground">
            Join communities, share insights, and collaborate
          </p>
        </div>
        
        {currentUser && (
          <Button onClick={handleCreateGroup}>
            <Plus className="mr-2 h-4 w-4" />
            Create Group
          </Button>
        )}
      </div>
      
      <div className="relative mb-6">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search groups..."
          className="pl-8"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      
      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="all">All Groups</TabsTrigger>
          {currentUser && (
            <>
              <TabsTrigger value="my-groups">My Groups</TabsTrigger>
              <TabsTrigger value="joined">Joined Groups</TabsTrigger>
            </>
          )}
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          {filteredGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => (
                <GroupCard 
                  key={group.id} 
                  group={group} 
                  onClick={() => handleGroupClick(group.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No groups found</h3>
              <p className="text-muted-foreground mt-2">
                {searchText
                  ? "Try adjusting your search criteria."
                  : "There are no groups available."}
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="my-groups" className="mt-6">
          {myGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myGroups.map((group) => (
                <GroupCard 
                  key={group.id} 
                  group={group}
                  onClick={() => handleGroupClick(group.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No groups created</h3>
              <p className="text-muted-foreground mt-2">
                You haven't created any groups yet.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={handleCreateGroup}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create a Group
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="joined" className="mt-6">
          {userJoinedGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userJoinedGroups.map((group) => (
                <GroupCard 
                  key={group.id} 
                  group={group}
                  onClick={() => handleGroupClick(group.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No joined groups</h3>
              <p className="text-muted-foreground mt-2">
                You haven't joined any groups yet.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setActiveTab('all')}
              >
                Browse Groups
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={!!groupToDelete} onOpenChange={(open) => !open && setGroupToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the group and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteGroup} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Groups;
