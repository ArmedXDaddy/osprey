
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Workshop } from '@/types';
import { Users, Ticket } from 'lucide-react';
import MockPaymentModal from '@/components/payment/MockPaymentModal';
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

interface WorkshopRegistrationProps {
  workshop: Workshop;
  onRegistered?: () => void;
}

const WorkshopRegistration = ({ workshop, onRegistered }: WorkshopRegistrationProps) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [atCapacity, setAtCapacity] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showVerificationCode, setShowVerificationCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    if (currentUser && workshop.id) {
      const checkRegistration = async () => {
        // Check if user is already registered - using direct query
        const { data: registration, error: registrationError } = await supabase
          .from('workshop_registrations')
          .select('*')
          .eq('workshop_id', workshop.id)
          .eq('user_id', currentUser.id)
          .maybeSingle();

        if (registrationError) {
          console.error('Error checking registration:', registrationError);
        }

        setIsRegistered(!!registration);

        // Get count of registrations - using direct query
        const { data: registrations, error: countError } = await supabase
          .from('workshop_registrations')
          .select('*', { count: 'exact' })
          .eq('workshop_id', workshop.id);

        if (countError) {
          console.error('Error counting registrations:', countError);
        } else {
          const count = registrations?.length || 0;
          setRegistrationCount(count);
          
          // Check if at capacity
          if (workshop.capacity && count !== null) {
            setAtCapacity(count >= workshop.capacity);
          }
        }
      };

      checkRegistration();
    }
  }, [currentUser, workshop.id, workshop.capacity]);

  // Function to generate a random 6-digit verification code
  const generateVerificationCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    return code;
  };

  const handleRegisterClick = () => {
    if (!currentUser) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to register for this workshop',
        variant: 'destructive',
      });
      return;
    }

    if (atCapacity && !isRegistered) {
      toast({
        title: 'Workshop is full',
        description: 'This workshop has reached its capacity',
        variant: 'destructive',
      });
      return;
    }

    if (isRegistered) {
      handleUnregister();
    } else {
      // For paid workshops, show payment modal
      if (workshop.price > 0) {
        setShowPaymentModal(true);
      } else {
        handleRegister();
      }
    }
  };

  const handleRegister = async () => {
    setIsRegistering(true);

    try {
      // Register - using direct insert
      const { error } = await supabase
        .from('workshop_registrations')
        .insert({
          workshop_id: workshop.id,
          user_id: currentUser.id,
          user_name: currentUser.name,
          user_email: currentUser.email,
          user_profile_image: currentUser.profileImage || null,
          status: 'confirmed'
        });

      if (error) throw error;

      setIsRegistered(true);
      setRegistrationCount(prev => prev + 1);
      
      // Check if now at capacity
      if (workshop.capacity && registrationCount + 1 >= workshop.capacity) {
        setAtCapacity(true);
      }

      toast({
        title: 'Registration successful',
        description: 'You have been registered for this workshop',
      });

      // Generate verification code
      const code = generateVerificationCode();
      setVerificationCode(code);
      setShowVerificationCode(true);

      if (onRegistered) {
        onRegistered();
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration failed',
        description: 'There was an error processing your registration',
        variant: 'destructive',
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleUnregister = async () => {
    setIsRegistering(true);

    try {
      // Unregister - using direct query
      const { error } = await supabase
        .from('workshop_registrations')
        .delete()
        .eq('workshop_id', workshop.id)
        .eq('user_id', currentUser.id);

      if (error) throw error;

      setIsRegistered(false);
      setRegistrationCount(prev => Math.max(0, prev - 1));
      setAtCapacity(false);

      toast({
        title: 'Unregistered',
        description: 'You have been removed from this workshop',
      });
    } catch (error) {
      console.error('Unregistration error:', error);
      toast({
        title: 'Unregistration failed',
        description: 'There was an error processing your request',
        variant: 'destructive',
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handlePaymentSuccess = () => {
    handleRegister();
    setShowPaymentModal(false);
  };

  const handleCloseVerificationDialog = () => {
    setShowVerificationCode(false);
  };

  const spotRemaining = workshop.capacity 
    ? Math.max(0, workshop.capacity - registrationCount) 
    : 'unlimited';

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center text-sm text-gray-500">
        <Users className="h-4 w-4 mr-1" />
        <span>
          {workshop.capacity 
            ? `${registrationCount} registered, ${spotRemaining} ${spotRemaining === 1 ? 'spot' : 'spots'} remaining` 
            : `${registrationCount} registered`}
        </span>
      </div>

      <Button
        onClick={handleRegisterClick}
        variant={isRegistered ? "outline" : "default"}
        disabled={isRegistering || (!isRegistered && atCapacity)}
        className="w-full sm:w-auto"
      >
        {isRegistering ? 'Processing...' : isRegistered ? 'Cancel Registration' : 'Register for Workshop'}
      </Button>

      {(!isRegistered && atCapacity) && (
        <p className="text-sm text-red-500">This workshop is at full capacity</p>
      )}

      {/* Payment Modal for paid workshops */}
      {showPaymentModal && (
        <MockPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          itemTitle={workshop.title}
          itemDescription={workshop.description}
          itemImage={workshop.image}
          organizerName={workshop.companyName}
          price={workshop.price}
          duration={workshop.duration}
          isFree={workshop.price === 0}
        />
      )}
      
      {/* Verification Code Dialog */}
      <Dialog open={showVerificationCode} onOpenChange={handleCloseVerificationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Workshop Registration Code</DialogTitle>
            <DialogDescription>
              Keep this code safe. You'll need to present it at the workshop for verification.
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
              <span>Workshop: {workshop.title}</span>
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              You can find this code in your profile or booking history at any time.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkshopRegistration;
