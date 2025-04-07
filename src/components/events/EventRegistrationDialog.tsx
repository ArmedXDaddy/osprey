
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
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EventRegistrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  eventId: string;
  onSubmit: (data: EventRegistration) => Promise<void>;
}

const EventRegistrationDialog = ({ 
  isOpen, 
  onClose, 
  eventTitle,
  eventId,
  onSubmit 
}: EventRegistrationDialogProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (data: EventRegistration) => {
    try {
      setIsProcessing(true);
      
      // Store registration details in the database
      const { error } = await supabase
        .from('event_attendee_details')
        .insert({
          event_id: eventId,
          user_id: data.userId,
          name: data.name,
          email: data.email,
          age: data.age,
          gender: data.gender,
          phone: data.phone,
          emergency_contact: data.emergencyContact,
          instagram: data.instagram,
          twitter: data.twitter,
          additional_info: data.additionalInfo,
          profile_image: data.profileImage
        });
        
      if (error) {
        throw error;
      }
      
      await onSubmit(data);
      onClose();
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive"
      });
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
