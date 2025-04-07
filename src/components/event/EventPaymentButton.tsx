import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Event } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/hooks/use-toast';
import MockPaymentModal from '@/components/payment/MockPaymentModal';
import { DollarSign, Users, Ticket } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';

interface EventPaymentButtonProps {
  event: Event;
  isAttending: boolean;
  onJoin: () => Promise<void>;
}

const EventPaymentButton: React.FC<EventPaymentButtonProps> = ({ 
  event, 
  isAttending,
  onJoin 
}) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showVerificationCode, setShowVerificationCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  
  const isPaidEvent = event.privacy === 'paid' && event.price && event.price > 0;

  const generateVerificationCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    return code;
  };

  const handleJoinClick = async () => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to join this event."
      });
      return;
    }
    
    if (isAttending) {
      onJoin();
    } else {
      try {
        await onJoin();
        
        if (isPaidEvent) {
          setShowPaymentModal(true);
        }
      } catch (error) {
        console.error("Error joining event:", error);
      }
    }
  };
  
  const handlePaymentSuccess = async () => {
    try {
      setIsProcessing(true);
      
      if (currentUser) {
        const { error } = await supabase
          .from('event_attendee_details')
          .update({ payment_status: 'paid' })
          .eq('event_id', event.id)
          .eq('user_id', currentUser.id);
          
        if (error) {
          throw error;
        }
      }
      
      const code = generateVerificationCode();
      setVerificationCode(code);
      
      setShowPaymentModal(false);
      setShowVerificationCode(true);
      
      toast({
        title: "Payment successful!",
        description: "Your registration has been confirmed.",
      });
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process payment. Please try again."
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCloseVerificationDialog = () => {
    setShowVerificationCode(false);
  };
  
  return (
    <>
      <Button 
        onClick={handleJoinClick}
        disabled={isProcessing}
        variant={isAttending ? "outline" : "default"}
        className="w-full md:w-auto"
      >
        {isProcessing ? "Processing..." : (
          isAttending ? "Leave Event" : (
            isPaidEvent ? (
              <>
                <DollarSign className="h-4 w-4 mr-2" />
                Register (${event.price})
              </>
            ) : "Join Event"
          )
        )}
      </Button>
      
      {showPaymentModal && (
        <MockPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          itemTitle={event.title}
          itemDescription={event.description}
          itemImage={event.image}
          organizerName={event.creatorName}
          price={event.price || 0}
          isFree={!isPaidEvent}
        />
      )}
      
      <Dialog open={showVerificationCode} onOpenChange={handleCloseVerificationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Event Verification Code</DialogTitle>
            <DialogDescription>
              Keep this code safe. You'll need to present it at the event entrance for verification.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center p-4 space-y-4">
            <div className="bg-muted p-4 rounded-lg w-full text-center">
              <InputOTP maxLength={6} value={verificationCode} disabled>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <Ticket className="h-4 w-4 mr-2" />
              <span>Event: {event.title}</span>
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              You can find this code in your profile or booking history at any time.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventPaymentButton;
