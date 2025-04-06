
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Event } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { toast } from '@/hooks/use-toast';
import MockPaymentModal from '@/components/payment/MockPaymentModal';
import { DollarSign, Users } from 'lucide-react';

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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const isPaidEvent = event.privacy === 'paid' && event.price && event.price > 0;

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
      // If already attending, handle leaving
      onJoin();
    } else if (isPaidEvent) {
      // For paid events, show payment modal
      setShowPaymentModal(true);
    } else {
      // For free events, join directly
      onJoin();
    }
  };
  
  const handlePaymentSuccess = async () => {
    try {
      setIsProcessing(true);
      // After successful payment, join the event
      await onJoin();
    } catch (error) {
      console.error("Error joining event after payment:", error);
    } finally {
      setIsProcessing(false);
    }
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
      
      {/* Payment Modal */}
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
    </>
  );
};

export default EventPaymentButton;
