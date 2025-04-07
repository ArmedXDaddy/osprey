
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EventRegistration } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
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
  const { currentUser } = useAuth();
  
  const handleProceedToPayment = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to join this event.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      // Create minimal registration data
      const registrationData: EventRegistration = {
        userId: currentUser.id,
        name: currentUser.name || 'Anonymous',
        email: currentUser.email || '',
        registeredAt: new Date(),
        profileImage: currentUser.profileImage,
        paymentStatus: isPaidEvent ? 'unpaid' as const : 'not_required' as const
      };
      
      // Check if already registered
      const { data: existingReg } = await supabase
        .from('event_attendee_details')
        .select('id, payment_status')
        .eq('event_id', eventId)
        .eq('user_id', currentUser.id)
        .maybeSingle();
        
      // If already registered
      if (existingReg) {
        // For paid events with unpaid status, proceed to payment
        if (isPaidEvent && existingReg.payment_status === 'unpaid') {
          await onSubmit(registrationData);
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
      
      // Register the user with minimal details
      const { error: insertError } = await supabase
        .from('event_attendee_details')
        .insert({
          event_id: eventId,
          user_id: currentUser.id,
          name: currentUser.name || 'Anonymous',
          email: currentUser.email || '',
          profile_image: currentUser.profileImage,
          payment_status: registrationData.paymentStatus,
          registered_at: new Date().toISOString()
        });
        
      if (insertError) {
        throw new Error("Registration failed");
      }
      
      // Proceed to payment or complete registration
      await onSubmit(registrationData);
      
      toast({
        title: "Registration successful",
        description: isPaidEvent ? "Proceeding to payment." : "You are now registered for this event.",
        variant: "success"
      });
      
      onClose();
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl">Register for {eventTitle}</DialogTitle>
          <DialogDescription>
            {isPaidEvent ? (
              <>
                Click the button below to register and proceed to payment.
                <span className="font-semibold"> A payment of ${price} will be required.</span>
              </>
            ) : (
              "Click the button below to register for this event."
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center my-6">
          <Button 
            onClick={handleProceedToPayment} 
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? "Processing..." : (isPaidEvent ? `Proceed to Payment ($${price})` : "Register Now")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventRegistrationDialog;
