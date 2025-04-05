
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServiceBooking } from '@/types';

const ManageServiceBookings: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [pendingBookings, setPendingBookings] = useState<ServiceBooking[]>([]);
  const [approvedBookings, setApprovedBookings] = useState<ServiceBooking[]>([]);

  useEffect(() => {
    if (currentUser?.role === 'coach') {
      fetchServiceBookings();
    }
  }, [currentUser]);

  const fetchServiceBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('service_enrollments')
        .select(`
          id, 
          services (title), 
          user_name, 
          user_email, 
          status, 
          payment_status,
          amount
        `)
        .eq('services.coach_id', currentUser?.id);

      if (error) throw error;

      if (data) {
        const bookings: ServiceBooking[] = data.map(booking => ({
          id: booking.id,
          serviceName: booking.services?.title || 'Unknown Service',
          userName: booking.user_name,
          userEmail: booking.user_email,
          status: booking.status as 'pending' | 'approved' | 'rejected',
          paymentStatus: booking.payment_status as 'paid' | 'unpaid' | 'refunded',
          amount: booking.amount || 0
        }));

        setPendingBookings(bookings.filter(b => b.status === 'pending'));
        setApprovedBookings(bookings.filter(b => b.status === 'approved'));
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: 'Error',
        description: 'Could not fetch bookings',
        variant: 'destructive'
      });
    }
  };

  const handleBookingAction = async (bookingId: string, action: 'approve' | 'reject') => {
    try {
      const { error } = await supabase
        .from('service_enrollments')
        .update({ status: action === 'approve' ? 'approved' : 'rejected' })
        .eq('id', bookingId);

      if (error) throw error;

      fetchServiceBookings();
      toast({
        title: 'Success',
        description: `Booking ${action}d successfully`
      });
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: 'Error',
        description: `Could not ${action} booking`,
        variant: 'destructive'
      });
    }
  };

  if (!currentUser || currentUser.role !== 'coach') {
    return <div>You must be a coach to access this page</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Service Bookings</h1>
      <Tabs defaultValue="pending">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="pending">Pending Bookings</TabsTrigger>
          <TabsTrigger value="approved">Approved Bookings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          {pendingBookings.length === 0 ? (
            <p className="text-center text-gray-500">No pending bookings</p>
          ) : (
            pendingBookings.map(booking => (
              <Card key={booking.id} className="mb-4">
                <CardHeader>
                  <CardTitle>{booking.serviceName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p>Name: {booking.userName}</p>
                    <p>Email: {booking.userEmail}</p>
                    <div className="flex space-x-4">
                      <Button 
                        variant="default" 
                        onClick={() => handleBookingAction(booking.id, 'approve')}
                      >
                        Approve
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={() => handleBookingAction(booking.id, 'reject')}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="approved">
          {approvedBookings.length === 0 ? (
            <p className="text-center text-gray-500">No approved bookings</p>
          ) : (
            approvedBookings.map(booking => (
              <Card key={booking.id} className="mb-4">
                <CardHeader>
                  <CardTitle>{booking.serviceName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p>Name: {booking.userName}</p>
                    <p>Email: {booking.userEmail}</p>
                    <p>Payment Status: {booking.paymentStatus}</p>
                    <p>Price: ${booking.amount}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageServiceBookings;
