
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { UserX, Search, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/context/DataContext';

interface GroupMember {
  id: string;
  userId: string;
  userName: string;
  userProfileImage?: string;
  joinedAt: Date;
  isAdmin: boolean;
}

interface GroupMembersModalProps {
  groupId: string;
  creatorId: string;
  open: boolean;
  onClose: () => void;
}

const GroupMembersModal: React.FC<GroupMembersModalProps> = ({ groupId, creatorId, open, onClose }) => {
  const { toast } = useToast();
  const { removeGroupMember } = useData();
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (open) {
      fetchMembers();
    }
  }, [open, groupId]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      
      // Fetch group members with their user information
      const { data, error } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId);
        
      if (error) {
        console.error('Error fetching group members:', error);
        toast({
          title: "Error fetching members",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      if (data && data.length > 0) {
        // For each member, fetch their profile information
        const memberPromises = data.map(async (member) => {
          // Check if this is the creator
          const isCreator = member.user_id === creatorId;
          
          // Create a default user name and image
          let userName = isCreator ? 'Group Creator' : `Member`;
          let userProfileImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`;
          
          // Try to fetch actual profile info
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('name, profile_image')
              .eq('id', member.user_id)
              .single();
              
            if (profileData) {
              userName = profileData.name || userName;
              userProfileImage = profileData.profile_image || userProfileImage;
            }
          } catch (profileError) {
            console.error('Error fetching member profile:', profileError);
          }
          
          return {
            id: member.id,
            userId: member.user_id,
            userName: userName,
            userProfileImage: userProfileImage,
            joinedAt: new Date(member.joined_at),
            isAdmin: isCreator
          };
        });
        
        const memberData = await Promise.all(memberPromises);
        setMembers(memberData);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error('Error fetching group members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeGroupMember(groupId, userId);
      
      // Update the local state
      setMembers(prev => prev.filter(member => member.userId !== userId));
      
      toast({
        title: "Member removed",
        description: "The member has been removed from the group",
      });
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive"
      });
    }
  };

  const filteredMembers = members.filter(member => 
    member.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Group Members</DialogTitle>
          <DialogDescription>
            Manage members of your group
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search members..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-24 mt-2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              {searchTerm ? 'No members found matching your search' : 'No members in this group yet'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.userProfileImage} />
                      <AvatarFallback>{member.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.userName}</p>
                      <p className="text-xs text-gray-500">
                        Joined {formatJoinDate(member.joinedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.isAdmin ? (
                      <Badge variant="outline">Admin</Badge>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveMember(member.userId)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Helper function to format join date
const formatJoinDate = (date: Date): string => {
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
  
  if (diffInDays < 1) return 'today';
  if (diffInDays < 2) return 'yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
};

export default GroupMembersModal;
