import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Lock, 
  Unlock, 
  DollarSign, 
  Edit, 
  Plus, 
  X, 
  ArrowLeft,
  UserPlus,
  User,
  Eye,
  EyeOff
} from 'lucide-react';
import { Group, UserRole, GroupPrivacy, JoinRequest } from '@/types';
import { format } from 'date-fns';
import GroupRequestsSection from '@/components/group/GroupRequestsSection';
import OriginalGroupChatSection from '@/components/group/OriginalGroupChatSection';
import GroupChatSection from '@/components/group/GroupChatSection';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'react-toastify';

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { groups, joinGroup, leaveGroup, requestToJoinGroup, removeGroupMember, updateGroupDetails, getGroupRequests, deleteGroup } = useData();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [isGroupAdmin, setIsGroupAdmin] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [editingRules, setEditingRules] = useState(false);
  const [newRule, setNewRule] = useState('');
  const [tempRules, setTempRules] = useState<string[]>([]);
  const [showMemberLimit, setShowMemberLimit] = useState(false);
  const [editingMemberLimit, setEditingMemberLimit] = useState(false);
  const [tempMemberLimit, setTempMemberLimit] = useState<number | undefined>(undefined);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id && groups.length > 0) {
      const foundGroup = groups.find(g => g.id === id);
      if (foundGroup) {
        setGroup(foundGroup);
      }
    }
  }, [id, groups]);

  useEffect(() => {
    if (group) {
      setLoading(false);
      if (currentUser) {
        setIsMember(group.memberIds?.includes(currentUser.id) || false);
        setIsRequestSent(false);
        setIsGroupAdmin(group.creatorId === currentUser.id);
      }
      setTempRules(group.rules || []);
      setTempMemberLimit(group.memberLimit);
    }
  }, [group, currentUser]);

  if (loading || !group) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <Skeleton className="h-[300px] w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-[150px] w-full" />
          <Skeleton className="h-[150px] w-full" />
        </div>
      </div>
    );
  }

  const handleJoinGroup = async () => {
    if (!currentUser) {
      navigate('/auth/login');
      return;
    }

    if (group.privacy === 'private') {
      await requestToJoinGroup(id);
      setIsRequestSent(true);
    } else {
      await joinGroup(id);
      setIsMember(true);
    }
  };

  const handleLeaveGroup = async () => {
    if (!currentUser) return;
    await leaveGroup(id);
    setIsMember(false);
  };

  const handleRemoveMember = async (userId: string) => {
    if (!currentUser) return;
    await removeGroupMember(id, userId);
    setGroup(prevGroup => {
      if (prevGroup) {
        return {
          ...prevGroup,
          members: prevGroup.members - 1,
          memberIds: prevGroup.memberIds?.filter(memberId => memberId !== userId)
        };
      }
      return prevGroup;
    });
  };

  const handleToggleRules = () => {
    setShowRules(!showRules);
  };

  const handleEditRules = () => {
    setEditingRules(true);
  };

  const handleAddRule = () => {
    if (newRule.trim() !== '') {
      setTempRules([...tempRules, newRule]);
      setNewRule('');
    }
  };

  const handleRemoveRule = (index: number) => {
    const newRules = [...tempRules];
    newRules.splice(index, 1);
    setTempRules(newRules);
  };

  const handleSaveRules = async () => {
    await updateGroupDetails(id, { rules: tempRules });
    setGroup(prevGroup => {
      if (prevGroup) {
        return { ...prevGroup, rules: tempRules };
      }
      return prevGroup;
    });
    setEditingRules(false);
  };

  const handleCancelEditRules = () => {
    setTempRules(group.rules || []);
    setEditingRules(false);
  };

  const handleToggleMemberLimit = () => {
    setShowMemberLimit(!showMemberLimit);
  };

  const handleEditMemberLimit = () => {
    setEditingMemberLimit(true);
    setTempMemberLimit(group.memberLimit);
  };

  const handleSaveMemberLimit = async () => {
    await updateGroupDetails(id, { memberLimit: tempMemberLimit });
    setGroup(prevGroup => {
      if (prevGroup) {
        return { ...prevGroup, memberLimit: tempMemberLimit };
      }
      return prevGroup;
    });
    setEditingMemberLimit(false);
  };

  const handleCancelEditMemberLimit = () => {
    setTempMemberLimit(group.memberLimit);
    setEditingMemberLimit(false);
  };

  const handleDeleteGroup = async () => {
    if (!currentUser || !group) return;
    
    try {
      await deleteGroup(id);
      toast({
        title: "Group deleted",
        description: "Your group has been deleted successfully"
      });
      navigate('/groups');
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete group",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Link to="/groups" className="flex items-center text-gray-600 hover:text-gray-800">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Groups
        </Link>
      </div>

      <Card className="space-y-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={group.image} alt={group.name} />
                <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl font-bold">{group.name}</CardTitle>
            </div>
            {isGroupAdmin && (
              <Button variant="outline" size="sm" onClick={() => navigate(`/groups/${id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Group
              </Button>
            )}
          </div>
          <CardDescription>{group.description}</CardDescription>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Group Details</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-gray-500" />
                <span>{group.members} Members</span>
              </div>
              <div className="flex items-center">
                {group.privacy === 'public' && <Unlock className="h-5 w-5 mr-2 text-gray-500" />}
                {group.privacy === 'private' && <Lock className="h-5 w-5 mr-2 text-gray-500" />}
                <span>{group.privacy === 'public' ? 'Public Group' : 'Private Group'}</span>
              </div>
              {group.price && (
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-gray-500" />
                  <span>Price: ${group.price}</span>
                </div>
              )}
              {group.memberLimit && (
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-gray-500" />
                  <span>Member Limit: {group.memberLimit}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Actions</h3>
            {!currentUser ? (
              <Button onClick={() => navigate('/auth/login')}>Login to Join</Button>
            ) : isGroupAdmin ? (
              <div className="space-y-2">
                <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                  Delete Group
                </Button>
              </div>
            ) : isMember ? (
              <Button variant="secondary" onClick={handleLeaveGroup}>
                Leave Group
              </Button>
            ) : isRequestSent ? (
              <div className="text-gray-500">Request Sent</div>
            ) : (
              <Button onClick={handleJoinGroup}>Join Group</Button>
            )}
          </div>
        </CardContent>

        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Group Rules</h3>
                <Button variant="ghost" size="sm" onClick={handleToggleRules}>
                  {showRules ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Rules
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show Rules
                    </>
                  )}
                </Button>
              </div>
              {showRules && (
                <div className="mt-4">
                  {editingRules ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="New rule"
                            value={newRule}
                            onChange={(e) => setNewRule(e.target.value)}
                            className="border p-2 rounded w-full"
                          />
                          <Button size="sm" onClick={handleAddRule}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {tempRules.map((rule, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span>{rule}</span>
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveRule(index)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={handleCancelEditRules}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleSaveRules}>
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {group.rules && group.rules.length > 0 ? (
                        <ul className="list-disc pl-5">
                          {group.rules.map((rule, index) => (
                            <li key={index}>{rule}</li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-gray-500">No rules specified for this group.</div>
                      )}
                      {isGroupAdmin && (
                        <Button variant="outline" size="sm" onClick={handleEditRules}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Rules
                        </Button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Member Limit</h3>
                <Button variant="ghost" size="sm" onClick={handleToggleMemberLimit}>
                  {showMemberLimit ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Limit
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show Limit
                    </>
                  )}
                </Button>
              </div>
              {showMemberLimit && (
                <div className="mt-4">
                  {editingMemberLimit ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <input
                          type="number"
                          placeholder="Member limit"
                          value={tempMemberLimit !== undefined ? tempMemberLimit.toString() : ''}
                          onChange={(e) => setTempMemberLimit(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                          className="border p-2 rounded w-full"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={handleCancelEditMemberLimit}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleSaveMemberLimit}>
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {group.memberLimit ? (
                        <div className="text-gray-700">Member limit: {group.memberLimit}</div>
                      ) : (
                        <div className="text-gray-500">No member limit specified for this group.</div>
                      )}
                      {isGroupAdmin && (
                        <Button variant="outline" size="sm" onClick={handleEditMemberLimit}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Limit
                        </Button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>

        {group.pendingRequests && group.pendingRequests > 0 && isGroupAdmin && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Pending Requests ({pendingRequestsCount})</h3>
            <GroupRequestsSection groupId={id} />
          </div>
        )}

        {(isMember || isGroupAdmin) && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Group Chat</h2>
            <GroupChatSection group={group} />
          </div>
        )}
      </Card>

      {showDeleteConfirm && (
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Group</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this group? This action cannot be undone and all group data will be permanently lost.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteGroup}>Delete Group</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default GroupDetail;
