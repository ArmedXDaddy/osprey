
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServiceBooking } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Check, X, DollarSign, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ManageServiceBookings: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [pendingBookings, setPendingBookings] = useState<ServiceBooking[]>([]);
  const [approvedBookings, setApprovedBookings] = useState<ServiceBooking[]>([]);
  const [rejectedBookings, setRejectedBookings] = useState<ServiceBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.role === 'coach') {
      fetchServiceBookings();

      // Set up real-time subscription for new enrollments
      const channel = supabase
        .channel('service-enrollments-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'service_enrollments',
          filter: `services.coach_id=eq.${currentUser.id}`
        }, () => {
          fetchServiceBookings();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentUser]);

  const fetchServiceBookings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('service_enrollments')
        .select(`
          id, 
          service_id,
          services (id, title, coach_id), 
          user_name, 
          user_email,
          user_profile_image,
          status, 
          payment_status,
          amount,
          created_at
        `)
        .eq('services.coach_id', currentUser?.id);

      if (error) throw error;

      if (data) {
        const bookings: ServiceBooking[] = data.map(booking => ({
          id: booking.id,
          serviceId: booking.service_id,
          serviceName: booking.services?.title || 'Unknown Service',
          userName: booking.user_name,
          userEmail: booking.user_email,
          userProfileImage: booking.user_profile_image,
          status: booking.status as 'pending' | 'approved' | 'rejected',
          paymentStatus: booking.payment_status as 'paid' | 'unpaid' | 'refunded',
          amount: booking.amount || 0,
          createdAt: new Date(booking.created_at)
        }));

        setPendingBookings(bookings.filter(b => b.status === 'pending'));
        setApprovedBookings(bookings.filter(b => b.status === 'approved'));
        setRejectedBookings(bookings.filter(b => b.status === 'rejected'));
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: 'Error',
        description: 'Could not fetch bookings',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
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
    return <div className="container mx-auto p-6 text-center">You must be a coach to access this page</div>;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto"></div>
          <div className="h-64 bg-gray-200 rounded w-full mx-auto"></div>
        </div>
      </div>
    );
  }

  const totalPending = pendingBookings.length;
  const totalApproved = approvedBookings.length;
  const totalRejected = rejectedBookings.length;
  const totalBookings = totalPending + totalApproved + totalRejected;
  const totalRevenue = approvedBookings.reduce((sum, booking) => sum + booking.amount, 0);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Service Bookings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalPending}</div>
            <p className="text-sm text-muted-foreground">Booking{totalPending !== 1 ? 's' : ''} awaiting approval</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalApproved}</div>
            <p className="text-sm text-muted-foreground">Booking{totalApproved !== 1 ? 's' : ''} approved</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">From {totalApproved} approved booking{totalApproved !== 1 ? 's' : ''}</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="pending">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="pending">Pending Bookings {totalPending > 0 && `(${totalPending})`}</TabsTrigger>
          <TabsTrigger value="approved">Approved Bookings {totalApproved > 0 && `(${totalApproved})`}</TabsTrigger>
          <TabsTrigger value="rejected">Rejected Bookings {totalRejected > 0 && `(${totalRejected})`}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          {pendingBookings.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg shadow">
              <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Pending Bookings</h3>
              <p className="text-gray-500">You don't have any bookings waiting for approval</p>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Pending Bookings</CardTitle>
                <CardDescription>
                  Bookings waiting for your approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar>
                              <AvatarImage src={booking.userProfileImage || ''} />
                              <AvatarFallback>{booking.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{booking.userName}</div>
                              <div className="text-sm text-muted-foreground">{booking.userEmail}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{booking.serviceName}</TableCell>
                        <TableCell>{format(booking.createdAt, 'MMM dd, yyyy')}</TableCell>
                        <TableCell>${booking.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{booking.paymentStatus}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              className="h-8 px-2 text-xs"
                              onClick={() => handleBookingAction(booking.id, 'approve')}
                            >
                              <Check className="h-4 w-4 mr-1" /> Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              className="h-8 px-2 text-xs"
                              onClick={() => handleBookingAction(booking.id, 'reject')}
                            >
                              <X className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="approved">
          {approvedBookings.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg shadow">
              <Check className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Approved Bookings</h3>
              <p className="text-gray-500">You haven't approved any bookings yet</p>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Approved Bookings</CardTitle>
                <CardDescription>
                  Bookings you have approved
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar>
                              <AvatarImage src={booking.userProfileImage || ''} />
                              <AvatarFallback>{booking.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{booking.userName}</div>
                              <div className="text-sm text-muted-foreground">{booking.userEmail}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{booking.serviceName}</TableCell>
                        <TableCell>{format(booking.createdAt, 'MMM dd, yyyy')}</TableCell>
                        <TableCell>${booking.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={booking.paymentStatus === 'paid' ? 'success' : 'outline'}>
                            {booking.paymentStatus === 'paid' ? (
                              <span className="flex items-center">
                                <DollarSign className="h-3 w-3 mr-1" /> Paid
                              </span>
                            ) : booking.paymentStatus}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="rejected">
          {rejectedBookings.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg shadow">
              <X className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Rejected Bookings</h3>
              <p className="text-gray-500">You haven't rejected any bookings yet</p>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Rejected Bookings</CardTitle>
                <CardDescription>
                  Bookings you have rejected
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rejectedBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar>
                              <AvatarImage src={booking.userProfileImage || ''} />
                              <AvatarFallback>{booking.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{booking.userName}</div>
                              <div className="text-sm text-muted-foreground">{booking.userEmail}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{booking.serviceName}</TableCell>
                        <TableCell>{format(booking.createdAt, 'MMM dd, yyyy')}</TableCell>
                        <TableCell>${booking.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageServiceBookings;
