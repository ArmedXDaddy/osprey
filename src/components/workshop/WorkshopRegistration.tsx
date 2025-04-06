import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Workshop } from '@/types';

interface WorkshopRegistrationProps {
  workshop: Workshop;
  isRegistered: boolean;
  onRegister: () => Promise<void>;
}

const WorkshopRegistration: React.FC<WorkshopRegistrationProps> = ({ workshop, isRegistered, onRegister }) => {
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const handleRegistration = async () => {
    if (!currentUser) {
      toast({
        title: 'Not authenticated.',
        description: 'You must be logged in to register for this workshop.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await onRegister();
      toast({
        title: 'Registration successful.',
        description: `You have successfully registered for ${workshop.title}.`,
      });
    } catch (error: any) {
      toast({
        title: 'Registration failed.',
        description: error.message || 'Failed to register for the workshop. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workshop Registration</CardTitle>
        <CardDescription>
          {isRegistered
            ? 'You are already registered for this workshop.'
            : 'Register to secure your spot in this workshop.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!currentUser ? (
          <p>You must be logged in to register for this workshop.</p>
        ) : isRegistered ? (
          <p>You are all set! We'll see you there.</p>
        ) : (
          <Button onClick={handleRegistration}>Register Now</Button>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          {workshop.price > 0
            ? `Price: $${workshop.price}`
            : 'This workshop is free!'}
        </p>
      </CardFooter>
    </Card>
  );
};

export default WorkshopRegistration;
