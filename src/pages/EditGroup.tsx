
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { Group } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import EditGroupForm from '@/components/group/EditGroupForm';

const EditGroup = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { groups } = useData();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (id && groups.length > 0) {
      const foundGroup = groups.find(g => g.id === id);
      if (foundGroup) {
        setGroup(foundGroup);
      }
      setLoading(false);
    }
  }, [id, groups]);

  const handleClose = () => {
    setIsOpen(false);
    navigate(`/groups/${id}`);
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="container py-8">
        <div className="flex items-center mb-6">
          <Link to="/groups" className="flex items-center text-gray-600 hover:text-gray-800">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Groups
          </Link>
        </div>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold">Group not found</h1>
          <p className="mt-2 text-gray-600">The group you're looking for doesn't exist or you don't have access to it.</p>
          <Link to="/groups" className="mt-4 inline-block text-primary hover:underline">
            Return to Groups
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Link to={`/groups/${id}`} className="flex items-center text-gray-600 hover:text-gray-800">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Group
        </Link>
      </div>
      
      <EditGroupForm 
        group={group} 
        isOpen={isOpen} 
        onClose={handleClose} 
      />
    </div>
  );
};

export default EditGroup;
