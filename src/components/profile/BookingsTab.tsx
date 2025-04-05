
import React from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Booking, Service } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface BookingsTabProps {
  userId: string;
  isOwnProfile: boolean;
}

const BookingsTab: React.FC<BookingsTabProps> = ({ userId, isOwnProfile }) => {
  const { currentUser } = useAuth();
  const { getUserBookings, getServiceById, cancelBooking } = useData();
  const { toast } = useToast();
  
  // Get user's bookings
  const userBookings = getUserBookings(userId);
  
  // Group bookings by status
  const pendingBookings = userBookings.filter(b => b.status === 'pending');
  const approvedBookings = userBookings.filter(b => b.status === 'approved');
  const completedBookings = userBookings.filter(b => b.status === 'completed');
  const cancelledBookings = userBookings.filter(b => b.status === 'cancelled');
  
  const handleCancelBooking = async (bookingId: string) => {
    try {
      await cancelBooking(bookingId);
      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error cancelling booking",
        description: error.message || "There was an error cancelling your booking. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (userBookings.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 mx-auto text-gray-300" />
        <h3 className="mt-4 text-lg font-medium">No Bookings</h3>
        <p className="text-gray-500 mb-6">
          {isOwnProfile 
            ? "You haven't booked any sessions yet." 
            : "This user hasn't booked any sessions yet."}
        </p>
        {isOwnProfile && (
          <Link to="/sessions">
            <Button>Browse Sessions</Button>
          </Link>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {pendingBookings.length > 0 && (
        <>
          <h4 className="text-md font-medium">Pending Requests</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingBookings.map(booking => (
              <BookingCard 
                key={booking.id} 
                booking={booking} 
                getServiceById={getServiceById}
                onCancel={handleCancelBooking}
                isOwnProfile={isOwnProfile}
              />
            ))}
          </div>
        </>
      )}
      
      {approvedBookings.length > 0 && (
        <>
          <h4 className="text-md font-medium">Upcoming Sessions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvedBookings.map(booking => (
              <BookingCard 
                key={booking.id} 
                booking={booking} 
                getServiceById={getServiceById}
                onCancel={handleCancelBooking}
                isOwnProfile={isOwnProfile}
              />
            ))}
          </div>
        </>
      )}
      
      {completedBookings.length > 0 && (
        <>
          <h4 className="text-md font-medium">Past Sessions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedBookings.map(booking => (
              <BookingCard 
                key={booking.id} 
                booking={booking} 
                getServiceById={getServiceById}
                onCancel={handleCancelBooking}
                isOwnProfile={isOwnProfile}
                disableCancel
              />
            ))}
          </div>
        </>
      )}
      
      {isOwnProfile && cancelledBookings.length > 0 && (
        <>
          <h4 className="text-md font-medium">Cancelled Bookings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cancelledBookings.map(booking => (
              <BookingCard 
                key={booking.id} 
                booking={booking} 
                getServiceById={getServiceById}
                onCancel={handleCancelBooking}
                isOwnProfile={isOwnProfile}
                disableCancel
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

interface BookingCardProps {
  booking: Booking;
  getServiceById: (serviceId: string) => Promise<Service>;
  onCancel: (bookingId: string) => void;
  isOwnProfile: boolean;
  disableCancel?: boolean;
}

const BookingCard: React.FC<BookingCardProps> = ({ 
  booking, 
  getServiceById, 
  onCancel,
  isOwnProfile,
  disableCancel = false 
}) => {
  const [service, setService] = React.useState<Service | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    const fetchService = async () => {
      try {
        const serviceData = await getServiceById(booking.serviceId);
        setService(serviceData);
      } catch (error) {
        console.error("Error fetching service:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchService();
  }, [booking.serviceId, getServiceById]);
  
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-100 rounded"></div>
            <div className="h-4 bg-gray-100 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!service) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Unknown Service</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            This service may have been removed by the provider.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">{service.title}</CardTitle>
            <div className="text-sm text-gray-500">by {service.providerName}</div>
          </div>
          <Badge 
            variant={
              booking.status === 'approved' 
                ? 'default' 
                : booking.status === 'rejected' || booking.status === 'cancelled'
                ? 'destructive' 
                : 'outline'
            }
          >
            {booking.status === 'approved' ? 'Confirmed' : 
             booking.status === 'pending' ? 'Pending' :
             booking.status === 'completed' ? 'Completed' : 'Cancelled'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">{service.duration}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">
                {service.price > 0 ? `$${service.price}` : 'Free'}
              </span>
            </div>
          </div>
          
          {booking.scheduledTime && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {format(new Date(booking.scheduledTime), 'MMM d, yyyy')}
              </span>
            </div>
          )}
          
          {booking.paymentStatus && (
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs">
                {booking.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
              </Badge>
            </div>
          )}
        </div>
        
        {isOwnProfile && booking.status !== 'cancelled' && booking.status !== 'completed' && !disableCancel && (
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => onCancel(booking.id)}
            >
              Cancel Booking
            </Button>
          </div>
        )}
        
        {(!isOwnProfile || booking.status === 'cancelled' || booking.status === 'completed' || disableCancel) && (
          <div className="mt-4">
            <Link to={`/services/${service.id}`}>
              <Button variant="outline" size="sm" className="w-full">
                View Service
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingsTab;
