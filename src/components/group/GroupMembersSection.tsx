
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { UserX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GroupMember {
  id: string;
  userId: string;
  userName: string;
  userProfileImage?: string;
  userRole: string;
  joinedAt: Date;
  isAdmin: boolean;
}

interface GroupMembersSectionProps {
  groupId: string;
  creatorId: string;
}

const GroupMembersSection: React.FC<GroupMembersSectionProps> = ({ groupId, creatorId }) => {
  const { currentUser } = useAuth();
  const { removeGroupMember } = useData();
  const { toast } = useToast();
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const isAdmin = currentUser?.id === creatorId;

  useEffect(() => {
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
          // For demonstration, create mock member data
          // In a real app, you would fetch user profiles based on user_id
          const memberData: GroupMember[] = data.map((member, index) => ({
            id: member.id,
            userId: member.user_id,
            userName: member.user_id === creatorId 
              ? 'Group Creator' 
              : `Member ${index + 1}`,
            userProfileImage: `https://ui-avatars.com/api/?name=Member${index + 1}&background=random`,
            userRole: member.user_id === creatorId ? 'admin' : 'member',
            joinedAt: new Date(member.joined_at),
            isAdmin: member.user_id === creatorId
          }));
          
          setMembers(memberData);
        }
      } catch (error) {
        console.error('Error fetching group members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [groupId, creatorId, toast]);

  const handleRemoveMember = async (userId: string) => {
    if (!isAdmin) return;
    
    try {
      await removeGroupMember(groupId, userId);
      setMembers(prev => prev.filter(member => member.userId !== userId));
      
      toast({
        title: "Member removed",
        description: "The member has been removed from the group",
      });
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const filteredMembers = members.filter(member => 
    member.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Members ({members.length})</h3>
        <div className="relative w-full md:w-64">
          <Input 
            type="search" 
            placeholder="Search members..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
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
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {filteredMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
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
                {member.isAdmin && (
                  <Badge variant="outline">Admin</Badge>
                )}
                
                {isAdmin && !member.isAdmin && (
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

export default GroupMembersSection;
