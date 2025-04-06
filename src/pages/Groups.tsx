import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Group, GroupPrivacy } from '@/types';
import GroupCard from '@/components/group/GroupCard';
import CreateGroup from '@/components/group/CreateGroup';
import { Search, Plus, Users } from 'lucide-react';
import { asGroupPrivacy } from '@/utils/typeHelpers';

const Groups = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { groups, createGroup, updateGroup, deleteGroup } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    // Filter joined groups when groups or currentUser changes
    if (groups && currentUser) {
      const joined = groups.filter(group => {
        if (group.creatorId === currentUser.id) return true;
        if (group.memberIds && group.memberIds.includes(currentUser.id)) return true;
        return false;
      });
      setJoinedGroups(joined);
    }
  }, [groups, currentUser]);

  const filteredGroups = groups?.filter(group => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      group.name.toLowerCase().includes(searchTerm) ||
      group.description.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <div className="container py-8">
      <div className="flex flex-col-reverse md:flex-row md:justify-between md:items-center mb-6">
        <h1 className="text-2xl font-bold mt-4 md:mt-0">Groups</h1>
        {currentUser && (
          <Button 
            onClick={() => setCreateDialogOpen(true)} 
            className="w-full md:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Group
          </Button>
        )}
      </div>

      <div className="mb-6">
        <div className="flex mb-4">
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mr-2"
          />
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Groups</TabsTrigger>
            <TabsTrigger value="joined">
              <Users className="h-4 w-4 mr-2" />
              My Groups
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {filteredGroups?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.map((group) => (
                  <GroupCard 
                    key={group.id} 
                    group={group} 
                    onClick={() => navigate(`/groups/${group.id}`)}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No groups found that match your search criteria.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="joined" className="space-y-4">
            {joinedGroups?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {joinedGroups.map((group) => (
                  <GroupCard 
                    key={group.id} 
                    group={group} 
                    onClick={() => navigate(`/groups/${group.id}`)}
                    onDelete={group.creatorId === currentUser?.id ? 
                      () => deleteGroup(group.id) : undefined}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">You haven't joined any groups yet.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setActiveTab("all")}
                  >
                    Browse all groups
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create a Group</DialogTitle>
            <DialogDescription>
              Create a new group to connect with others who share your interests.
            </DialogDescription>
          </DialogHeader>
          <CreateGroup 
            onSuccess={() => setCreateDialogOpen(false)}
            onCancel={() => setCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Groups;
