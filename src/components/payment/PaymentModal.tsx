
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogFooter, DialogHeader, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check, CreditCard, DollarSign } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  service: any;
  onSuccess?: () => void;
}

const PaymentMethods = [
  {
    id: 'card',
    name: 'Credit / Debit Card',
    icon: <CreditCard className="h-4 w-4" />
  },
  {
    id: 'cash',
    name: 'Pay with Cash',
    icon: <DollarSign className="h-4 w-4" />
  },
];

const PaymentModal: React.FC<PaymentModalProps> = ({ open, onClose, service, onSuccess }) => {
  const { currentUser } = useAuth();
  const { bookService } = useData();
  const { toast } = useToast();
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  const [processing, setProcessing] = useState(false);
  const [notes, setNotes] = useState('');
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({ ...prev, [name]: value }));
  }
  
  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
  }
  
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    setCardDetails(prev => ({ ...prev, cardNumber: formatCardNumber(value) }));
  }
  
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    setCardDetails(prev => ({ ...prev, expiryDate: value }));
  }
  
  const validateCard = () => {
    if (paymentMethod === 'cash') return true;
    
    if (cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
      toast({
        title: "Invalid card number",
        description: "Please enter a valid 16-digit card number",
        variant: "destructive"
      });
      return false;
    }
    
    if (!cardDetails.cardName) {
      toast({
        title: "Missing cardholder name",
        description: "Please enter the name on your card",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  }
  
  const handleSubmit = async () => {
    if (!validateCard()) return;
    
    setProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Book the service
      await bookService(service.id, {
        notes,
        paymentMethod
      });
      
      toast({
        title: "Payment successful",
        description: `You have successfully booked ${service.title}`,
        variant: "default"
      });
      
      if (onSuccess) onSuccess();
      onClose();
      
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Payment failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
          <DialogDescription>
            Complete your booking for {service?.title}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="font-medium text-sm">Booking Summary</div>
            <div className="bg-muted p-3 rounded-md space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Service</span>
                <span className="text-sm font-medium">{service?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Price</span>
                <span className="text-sm font-medium">${service?.price}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="font-medium text-sm">Additional Notes (Optional)</div>
            <Input
              placeholder="Any specific requirements or questions?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <div className="font-medium text-sm">Payment Method</div>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="space-y-2">
                {PaymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={cn(
                      "flex items-center justify-between rounded-md border p-3",
                      paymentMethod === method.id && "border-primary"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Label htmlFor={method.id} className="flex items-center gap-2 cursor-pointer">
                        {method.icon}
                        <span>{method.name}</span>
                      </Label>
                    </div>
                    {paymentMethod === method.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
          
          {paymentMethod === 'card' && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.cardNumber}
                  onChange={handleCardNumberChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input
                  id="cardName"
                  name="cardName"
                  placeholder="John Doe"
                  value={cardDetails.cardName}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    value={cardDetails.expiryDate}
                    onChange={handleExpiryDateChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    name="cvv"
                    placeholder="123"
                    maxLength={3}
                    value={cardDetails.cvv}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setCardDetails(prev => ({ ...prev, cvv: value }));
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={processing}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={processing}>
            {processing ? "Processing..." : `Pay $${service?.price}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
