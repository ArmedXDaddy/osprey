
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
import { useAuth } from '@/context/AuthContext';

interface EventRegistrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  eventId: string;
  onSubmit: (data: EventRegistration) => Promise<void>;
}

const EventRegistrationDialog = ({ 
  isOpen, 
  onClose, 
  eventTitle,
  eventId,
  onSubmit 
}: EventRegistrationDialogProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  // Helper function to save registration to localStorage
  const saveRegistrationToLocalStorage = (registration: any) => {
    try {
      // Get existing registrations or initialize empty array
      const existingRegistrationsString = localStorage.getItem('event_registrations');
      const existingRegistrations = existingRegistrationsString 
        ? JSON.parse(existingRegistrationsString) 
        : [];
      
      // Check if this event registration already exists
      const existingIndex = existingRegistrations.findIndex(
        (reg: any) => reg.event_id === registration.event_id && reg.user_id === registration.user_id
      );
      
      // Update or add registration
      if (existingIndex >= 0) {
        existingRegistrations[existingIndex] = registration;
      } else {
        existingRegistrations.push(registration);
      }
      
      // Save back to localStorage
      localStorage.setItem('event_registrations', JSON.stringify(existingRegistrations));
    } catch (error) {
      console.error("Error saving registration to localStorage:", error);
    }
  };
  
  const handleSubmit = async (data: EventRegistration) => {
    try {
      if (!currentUser) {
        toast({
          title: "Authentication required",
          description: "Please log in to register for this event",
          variant: "destructive"
        });
        return;
      }
      
      setIsProcessing(true);
      
      // Check localStorage for existing registration
      const existingRegistrationsString = localStorage.getItem('event_registrations');
      const existingRegistrations = existingRegistrationsString 
        ? JSON.parse(existingRegistrationsString) 
        : [];
      
      const existingRegistration = existingRegistrations.find(
        (reg: any) => reg.event_id === eventId && reg.user_id === currentUser.id
      );
      
      if (existingRegistration) {
        toast({
          title: "Already registered",
          description: "You have already registered for this event",
          variant: "default"
        });
        onClose();
        return;
      }
      
      // Prepare registration data
      const registrationData = {
        event_id: eventId,
        user_id: currentUser.id,
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
        registered_at: new Date().toISOString()
      };
      
      // Save to localStorage only
      saveRegistrationToLocalStorage(registrationData);
      
      await onSubmit(data);
      onClose();
      
      toast({
        title: "Registration successful",
        description: "You have successfully registered for the event",
      });
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
            Please fill out the form below to complete your registration.
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
