
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EventRegistration } from '@/types';
import EventRegistrationForm from './EventRegistrationForm';

interface EventRegistrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  onSubmit: (data: EventRegistration) => Promise<void>;
}

const EventRegistrationDialog = ({ 
  isOpen, 
  onClose, 
  eventTitle, 
  onSubmit 
}: EventRegistrationDialogProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSubmit = async (data: EventRegistration) => {
    try {
      setIsProcessing(true);
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl">Register for {eventTitle}</DialogTitle>
          <DialogDescription>
            Please fill out the form below to complete your registration.
          </DialogDescription>
        </DialogHeader>
        
        <EventRegistrationForm 
          onSubmit={handleSubmit}
          isProcessing={isProcessing}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EventRegistrationDialog;
