
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Group } from '@/types';
import EditGroupForm from '@/components/group/EditGroupForm';

const EditGroup = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { groups } = useData();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(true);

  useEffect(() => {
    if (id && groups.length > 0) {
      const foundGroup = groups.find(g => g.id === id);
      if (foundGroup) {
        setGroup(foundGroup);
        
        // Check if the current user is the creator of the group
        if (currentUser && foundGroup.creatorId !== currentUser.id) {
          toast({
            title: "Access denied",
            description: "You don't have permission to edit this group",
            variant: "destructive"
          });
          navigate(`/groups/${id}`);
        }
      } else {
        toast({
          title: "Group not found",
          description: "The group you're trying to edit doesn't exist",
          variant: "destructive"
        });
        navigate('/groups');
      }
      setLoading(false);
    }
  }, [id, groups, currentUser, navigate, toast]);

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    navigate(`/groups/${id}`);
  };

  if (loading || !group) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p>Loading group details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate(`/groups/${id}`)}>
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Group
        </Button>
      </div>

      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Group</h1>
        <EditGroupForm 
          group={group} 
          isOpen={isEditModalOpen} 
          onClose={handleCloseModal} 
        />
      </Card>
    </div>
  );
};

export default EditGroup;
