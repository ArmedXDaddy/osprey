
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
      
      // Check if user is already registered for this event
      const { data: existingRegistration, error: checkError } = await supabase
        .from('event_attendee_details')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', data.userId)
        .single();
        
      if (existingRegistration) {
        toast({
          title: "Already registered",
          description: "You are already registered for this event.",
          variant: "destructive"
        });
        onClose();
        return;
      }
      
      // Add payment status based on event type
      const paymentStatus = isPaidEvent ? 'unpaid' : 'paid';
      const registrationData = {
        ...data,
        paymentStatus
      };
      
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
          profile_image: data.profileImage,
          payment_status: paymentStatus // Using snake_case for database column
        });
        
      if (error) {
        console.error("Database insertion error:", error);
        throw new Error("Registration failed. Please try again.");
      }
      
      await onSubmit(registrationData);
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
            {isPaidEvent ? (
              <>
                Please fill out the form below to complete your registration. 
                <span className="font-semibold"> A payment of ${price} will be required after registration.</span>
              </>
            ) : (
              "Please fill out the form below to complete your registration."
            )}
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
