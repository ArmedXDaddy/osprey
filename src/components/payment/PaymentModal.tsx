
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Service } from '@/types';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Check, CreditCard, DollarSign } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  service: Service;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, 
  service, 
  onClose,
  onSuccess
}) => {
  const { currentUser } = useAuth();
  const { bookService } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const isPaid = service.price > 0;

  const handlePaymentOrRequest = async () => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to book this service."
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // For paid services, pass 'paid' as notes to trigger automatic approval
      if (isPaid) {
        await bookService(service.id, 'paid', new Date());
      } else {
        await bookService(service.id);
      }
      
      setIsComplete(true);
      toast({
        title: "Success!",
        description: isPaid ? 
          "Payment successful. You now have access to this service." : 
          "Request submitted. Waiting for provider approval."
      });
      
      setTimeout(() => {
        onClose();
        onSuccess();
      }, 2000);
    } catch (error: any) {
      console.error("Error during booking:", error);
      
      // Check if the error is a duplicate booking
      if (error.message && error.message.includes("duplicate key")) {
        toast({
          title: "Already booked",
          description: "You have already booked this service."
        });
        onClose();
        onSuccess(); // Still trigger success to refresh the UI
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "There was a problem processing your request."
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isPaid ? "Complete Payment" : "Request Service"}
          </DialogTitle>
          <DialogDescription>
            {isPaid 
              ? `Complete your payment of $${service.price} to book this service.`
              : "Submit your request to access this free service."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="border rounded p-4">
            <h3 className="font-medium">{service.title}</h3>
            <p className="text-sm text-muted-foreground">{service.duration}</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm">Price:</span>
              <span className="font-medium">{isPaid ? `$${service.price}` : "Free"}</span>
            </div>
          </div>
          
          {isComplete ? (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium text-center">
                {isPaid ? "Payment Successful!" : "Request Submitted!"}
              </h3>
              <p className="text-sm text-center text-muted-foreground mt-1">
                {isPaid 
                  ? "You now have access to this service."
                  : "Waiting for provider approval."}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border p-4 flex items-center">
              {isPaid ? (
                <CreditCard className="mr-3 h-5 w-5 text-muted-foreground" />
              ) : (
                <DollarSign className="mr-3 h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <h4 className="text-sm font-medium">
                  {isPaid ? "Credit Card" : "Free Service"}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {isPaid 
                    ? "Your card will be charged immediately." 
                    : "Provider approval required."}
                </p>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          {!isComplete && (
            <>
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button 
                onClick={handlePaymentOrRequest} 
                disabled={isLoading || isComplete}
              >
                {isLoading 
                  ? (isPaid ? "Processing..." : "Submitting...") 
                  : (isPaid ? "Pay Now" : "Submit Request")}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
