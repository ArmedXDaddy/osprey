
import React from 'react';
import { Group } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

interface GroupCardProps {
  group: Group;
}

const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{group.name}</h3>
            <p className="mt-2 text-sm text-gray-500">{group.description}</p>
            <div className="mt-3">
              <span>{group.members} members</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-4 py-2 border-t">
        <p className="text-sm">Created by {group.creatorName}</p>
      </CardFooter>
    </Card>
  );
};

export default GroupCard;
