
import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MobileActionButton: React.FC = () => {
  return (
    <div className="md:hidden fixed bottom-5 right-5 rounded-full shadow-lg z-10">
      <Button variant="default" size="icon" className="h-12 w-12 rounded-full bg-primary shadow-md">
        <PlusCircle size={20} />
      </Button>
    </div>
  );
};

export default MobileActionButton;
