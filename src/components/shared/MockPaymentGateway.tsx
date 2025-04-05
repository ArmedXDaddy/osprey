
import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CreditCard, 
  Calendar, 
  Lock, 
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MockPaymentGatewayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  serviceName: string;
  onPaymentSuccess: () => void;
  onPaymentCancel: () => void;
}

const MockPaymentGateway: React.FC<MockPaymentGatewayProps> = ({
  open,
  onOpenChange,
  amount,
  serviceName,
  onPaymentSuccess,
  onPaymentCancel,
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState('');

  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!cardNumber || !expiryDate || !cvv || !nameOnCard) {
      setError('All fields are required');
      return;
    }
    
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      setError('Card number must be 16 digits');
      return;
    }
    
    if (cvv.length < 3) {
      setError('Invalid CVV');
      return;
    }
    
    // Simulate payment processing
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);

      // Simulate successful payment after a short delay
      setTimeout(() => {
        try {
          // Call the onPaymentSuccess callback
          onPaymentSuccess();
          
          toast({
            title: "Payment successful",
            description: `Your payment of $${amount.toFixed(2)} for ${serviceName} has been processed.`,
          });
          
          // Reset form and close dialog
          resetForm();
          onOpenChange(false);
        } catch (error) {
          console.error('Error during payment success handling:', error);
          toast({
            title: "Payment processed",
            description: "Your payment was processed, but there was an error updating your booking. Please contact support.",
            variant: "destructive"
          });
          // Still close the dialog
          resetForm();
          onOpenChange(false);
        }
      }, 1500);
    }, 2000);
  };
  
  const resetForm = () => {
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setNameOnCard('');
    setError('');
    setIsProcessing(false);
    setIsComplete(false);
  };
  
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    // Add spaces for readability
    if (value.length > 0) {
      value = value.match(/.{1,4}/g)?.join(' ') || '';
    }
    
    // Limit to 16 digits (19 chars with spaces)
    if (value.length <= 19) {
      setCardNumber(value);
    }
  };
  
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    
    if (value.length <= 5) {
      setExpiryDate(value);
    }
  };
  
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    
    if (value.length <= 4) {
      setCvv(value);
    }
  };
  
  const handleCancel = () => {
    resetForm();
    onPaymentCancel();
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Your Payment</DialogTitle>
          <DialogDescription>
            {serviceName} - ${amount.toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        
        {isComplete ? (
          <div className="flex flex-col items-center justify-center py-6">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-medium">Payment Successful!</h3>
            <p className="text-gray-500 text-center mt-2">
              Your payment has been processed successfully.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 p-3 rounded-md flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <div className="relative">
                <Input
                  id="cardNumber"
                  placeholder="4111 1111 1111 1111"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  disabled={isProcessing}
                  className="pl-10"
                />
                <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <div className="relative">
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={handleExpiryDateChange}
                    disabled={isProcessing}
                    className="pl-10"
                  />
                  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <div className="relative">
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={cvv}
                    onChange={handleCvvChange}
                    disabled={isProcessing}
                    className="pl-10"
                  />
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nameOnCard">Name on Card</Label>
              <Input
                id="nameOnCard"
                placeholder="John Doe"
                value={nameOnCard}
                onChange={(e) => setNameOnCard(e.target.value)}
                disabled={isProcessing}
              />
            </div>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isProcessing}>
                Cancel
              </Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay $${amount.toFixed(2)}`
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MockPaymentGateway;
