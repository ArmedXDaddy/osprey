
import React from 'react';
import { Booking, BookingStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { CalendarIcon, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BookingsListProps {
  bookings: Booking[];
  isLoading: boolean;
  serviceId: string;
  onApprove?: (bookingId: string) => void;
  onReject?: (bookingId: string) => void;
}

const BookingsList = ({ bookings, isLoading, serviceId, onApprove, onReject }: BookingsListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-24 bg-gray-200 animate-pulse rounded-lg"></div>
        <div className="h-24 bg-gray-200 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <h3 className="font-medium text-lg mb-2">No bookings yet</h3>
            <p className="text-muted-foreground">
              Your service hasn't received any bookings yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Recent Bookings</h3>
        <Badge variant="outline">{bookings.length} Total</Badge>
      </div>
      
      <div className="space-y-4">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{booking.userName}</span>
                  </div>
                  
                  {booking.preferredTime && (
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {format(new Date(booking.preferredTime), 'PPP')}
                      </span>
                    </div>
                  )}
                  
                  {booking.scheduledTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {format(new Date(booking.scheduledTime), 'p')}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2">
                  <Badge variant={
                    booking.status === 'approved' ? 'default' :
                    booking.status === 'completed' ? 'success' :
                    booking.status === 'cancelled' ? 'destructive' : 
                    'outline'
                  }>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                  
                  {booking.status === 'pending' && onApprove && onReject && (
                    <div className="flex gap-2 mt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => onApprove(booking.id)}
                      >
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-destructive border-destructive hover:bg-destructive/10" 
                        onClick={() => onReject(booking.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BookingsList;
