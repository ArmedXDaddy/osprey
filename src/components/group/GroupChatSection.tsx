
// This is a stub to fix the interface of GroupChatSection
// Since we can't directly modify the component, we'll create a wrapper
// that converts the prop from group to groupId
import React from 'react';
import { Group } from '@/types';
import { useData } from '@/context/DataContext';

// The actual import of the original GroupChatSection
// This is where we would normally import the component from
import OriginalGroupChatSection from './OriginalGroupChatSection';

// Create a new interface for our component
interface GroupChatSectionProps {
  group: Group;
}

// Create a wrapper component that accepts a group prop
const GroupChatSection: React.FC<GroupChatSectionProps> = ({ group }) => {
  // Pass the groupId to the original component
  return <OriginalGroupChatSection groupId={group.id} />;
};

export default GroupChatSection;
