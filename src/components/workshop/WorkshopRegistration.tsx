
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Workshop } from '@/types';
import { Users } from 'lucide-react';

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

  useEffect(() => {
    if (currentUser && workshop.id) {
      const checkRegistration = async () => {
        // Check if user is already registered
        const { data: registration, error: registrationError } = await supabase
          .from('workshop_registrations')
          .select('*')
          .eq('workshop_id', workshop.id)
          .eq('user_id', currentUser.id)
          .single();

        if (registrationError && registrationError.code !== 'PGRST116') {
          console.error('Error checking registration:', registrationError);
        }

        setIsRegistered(!!registration);

        // Get count of registrations
        const { count, error: countError } = await supabase
          .from('workshop_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('workshop_id', workshop.id);

        if (countError) {
          console.error('Error counting registrations:', countError);
        } else {
          setRegistrationCount(count || 0);
          
          // Check if at capacity
          if (workshop.capacity && count !== null) {
            setAtCapacity(count >= workshop.capacity);
          }
        }
      };

      checkRegistration();
    }
  }, [currentUser, workshop.id, workshop.capacity]);

  const handleRegister = async () => {
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

    setIsRegistering(true);

    try {
      if (isRegistered) {
        // Unregister
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
      } else {
        // Register
        const { error } = await supabase
          .from('workshop_registrations')
          .insert({
            workshop_id: workshop.id,
            user_id: currentUser.id,
            user_name: currentUser.name,
            user_email: currentUser.email,
            user_profile_image: currentUser.profileImage,
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

        if (onRegistered) {
          onRegistered();
        }
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
        onClick={handleRegister}
        variant={isRegistered ? "outline" : "default"}
        disabled={isRegistering || (!isRegistered && atCapacity)}
        className="w-full sm:w-auto"
      >
        {isRegistering ? 'Processing...' : isRegistered ? 'Cancel Registration' : 'Register for Workshop'}
      </Button>

      {(!isRegistered && atCapacity) && (
        <p className="text-sm text-red-500">This workshop is at full capacity</p>
      )}
    </div>
  );
};

export default WorkshopRegistration;
