
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Service } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreditCard, DollarSign, Clock } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PaymentModalProps {
  isOpen: boolean;
  service: Service;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, service, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const { bookService } = useData();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  const isFreeService = service.price === 0;

  const handlePayment = async () => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to book this service."
      });
      onClose();
      return;
    }

    if (!isFreeService && (!cardNumber || !expiryDate || !cvv || !cardName)) {
      toast({
        variant: "destructive",
        title: "Missing payment information",
        description: "Please fill in all payment details."
      });
      return;
    }

    try {
      setIsProcessing(true);

      // Call the bookService function with appropriate parameters
      await bookService(service.id, !isFreeService);

      toast({
        title: "Booking successful!",
        description: isFreeService 
          ? "Your booking request has been submitted and is pending approval." 
          : "Your payment was successful and your booking has been confirmed."
      });

      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Booking failed",
        description: error.message || "There was an error processing your booking. Please try again."
      });
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  const handleRequestFree = async () => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to request this service."
      });
      onClose();
      return;
    }

    try {
      setIsProcessing(true);

      // For free services, we pass false for isPaid
      await bookService(service.id, false);

      toast({
        title: "Request submitted!",
        description: "Your request has been submitted and is pending approval."
      });

      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Request failed",
        description: error.message || "There was an error submitting your request. Please try again."
      });
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isFreeService ? 'Request Free Service' : 'Complete Your Booking'}
          </DialogTitle>
          <DialogDescription>
            {isFreeService 
              ? 'Submit your request for this free service.'
              : 'Enter your payment details to book this service.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{service.title}</CardTitle>
              <CardDescription>Provider: {service.providerName}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-sm">
                    {service.price > 0 ? `$${service.price}` : 'Free'}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-sm">{service.duration}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {!isFreeService && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardName">Name on Card</Label>
                <Input 
                  id="cardName" 
                  placeholder="John Doe" 
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input 
                  id="cardNumber" 
                  placeholder="1234 5678 9012 3456" 
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input 
                    id="expiryDate" 
                    placeholder="MM/YY" 
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input 
                    id="cvv" 
                    placeholder="123" 
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          
          {isFreeService ? (
            <Button onClick={handleRequestFree} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Request Service"}
            </Button>
          ) : (
            <Button onClick={handlePayment} disabled={isProcessing} className="gap-2">
              {isProcessing ? "Processing..." : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Pay ${service.price}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
