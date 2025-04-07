
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
      
      // First, try to retrieve the attendee record if it exists
      const { data: existingReg, error: regError } = await supabase
        .from('event_attendee_details')
        .select('id, payment_status')
        .eq('event_id', eventId)
        .eq('user_id', data.userId)
        .maybeSingle();
        
      if (regError) {
        console.error("Error checking registration:", regError);
        throw new Error("Failed to check registration status. Please try again.");
      }
      
      // If already registered, handle according to payment status
      if (existingReg) {
        console.log("Found existing registration:", existingReg);
        
        // If it's a paid event and payment is still required, close the dialog and redirect to payment
        if (isPaidEvent && existingReg.payment_status === 'unpaid') {
          toast({
            title: "Registration exists",
            description: "You're already registered. Please complete the payment.",
            variant: "default"
          });
          
          // Execute onSubmit to proceed with the flow (like showing payment button)
          await onSubmit({
            ...data,
            paymentStatus: 'unpaid'
          });
          
          onClose();
          return;
        } else {
          // Already fully registered
          toast({
            title: "Already registered",
            description: "You are already registered for this event.",
            variant: "default"
          });
          onClose();
          return;
        }
      }
      
      // Add payment status based on event type
      const paymentStatus = isPaidEvent ? 'unpaid' as const : 'not_required' as const;
      const registrationData: EventRegistration = {
        ...data,
        paymentStatus
      };
      
      console.log("About to insert registration:", {
        event_id: eventId,
        user_id: data.userId,
        name: data.name
      });
      
      // Insert new registration with upsert: false to avoid duplicate key conflicts
      const { error: insertError } = await supabase
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
          payment_status: paymentStatus
        });
        
      if (insertError) {
        console.error("Database insertion error:", insertError);
        
        // If it's a duplicate key error, it means another registration happened concurrently
        if (insertError.code === '23505') {
          toast({
            title: "Registration conflicts",
            description: "Another registration attempt was made. Please try again.",
            variant: "destructive"
          });
          onClose();
          return;
        }
        
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
