
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
  isPaidEvent?: boolean;
  price?: number;
}

const EventRegistrationDialog = ({ 
  isOpen, 
  onClose, 
  eventTitle,
  eventId,
  onSubmit,
  isPaidEvent = false,
  price = 0
}: EventRegistrationDialogProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (data: EventRegistration) => {
    try {
      setIsProcessing(true);
      
      // Store registration details in the database - use snake_case for column names
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
          profile_image: data.profileImage,
          payment_status: isPaidEvent ? 'pending' : 'not_required'
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
            {isPaidEvent 
              ? `Please fill out the form below to complete your registration. Payment of $${price} will be required after registration.`
              : 'Please fill out the form below to complete your registration.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <EventRegistrationForm 
          onSubmit={handleSubmit}
          isProcessing={isProcessing}
          isPaidEvent={isPaidEvent}
          price={price}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EventRegistrationDialog;
