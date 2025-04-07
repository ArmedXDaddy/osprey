
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
      
      // Check if already registered
      const { data: existingReg } = await supabase
        .from('event_attendee_details')
        .select('id, payment_status')
        .eq('event_id', eventId)
        .eq('user_id', data.userId)
        .maybeSingle();
        
      // If already registered, handle according to payment status
      if (existingReg) {
        if (isPaidEvent && existingReg.payment_status === 'unpaid') {
          // Execute onSubmit to proceed with payment flow
          await onSubmit({
            ...data,
            paymentStatus: 'unpaid'
          });
          
          onClose();
          return;
        } else {
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
      
      // Insert the registration
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
          payment_status: paymentStatus,
          registered_at: new Date().toISOString()
        });
        
      if (insertError) {
        throw new Error("Registration failed");
      }
      
      // Successfully registered
      await onSubmit(registrationData);
      
      toast({
        title: "Registration successful",
        description: isPaidEvent ? "Please proceed with payment." : "You are now registered for this event.",
        variant: "success"
      });
      
      onClose();
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: "Please try again",
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
