import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Booking, Service, BookingStatus } from '@/types';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Check, Clock, DollarSign, Edit, MapPin, Trash, Users, Video, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EditServiceForm from '@/components/service/EditServiceForm';

const ManageService = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getServiceById, getServiceBookings, cancelBooking, approveBooking } = useData();
  const [service, setService] = useState<Service | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const serviceData = await getServiceById(id);
        
        if (!serviceData) {
          toast({
            variant: "destructive",
            title: "Service not found",
            description: "The requested service could not be found."
          });
          navigate('/services');
          return;
        }
        
        if (currentUser?.id !== serviceData.providerId) {
          toast({
            variant: "destructive",
            title: "Access denied",
            description: "You do not have permission to manage this service."
          });
          navigate(`/services/${id}`);
          return;
        }
        
        setService(serviceData);
        
        const serviceBookings = getServiceBookings(id);
        setBookings(serviceBookings);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error loading service",
          description: error.message || "There was an error loading this service."
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchServiceDetails();
  }, [id, currentUser, getServiceById, getServiceBookings, navigate]);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await cancelBooking(bookingId);
      
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled' as BookingStatus } 
            : booking
        )
      );
      
      toast({
        title: "Booking cancelled",
        description: "The booking has been cancelled successfully."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error cancelling booking",
        description: error.message || "There was an error cancelling the booking."
      });
    }
  };

  const handleApproveBooking = async (bookingId: string) => {
    try {
      await approveBooking(bookingId);
      
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'approved' as BookingStatus } 
            : booking
        )
      );
      
      toast({
        title: "Booking approved",
        description: "The booking has been approved successfully."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error approving booking",
        description: error.message || "There was an error approving the booking."
      });
    }
  };

  const handleEditService = (updatedService: Service) => {
    setService(updatedService);
    setShowEditDialog(false);
    toast({
      title: "Service updated",
      description: "Your service has been updated successfully."
    });
  };

  const pendingBookings = bookings.filter(booking => booking.status === 'pending');
  const approvedBookings = bookings.filter(booking => booking.status === 'approved');
  const completedBookings = bookings.filter(booking => booking.status === 'completed');
  const cancelledBookings = bookings.filter(booking => booking.status === 'cancelled');

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center min-h-[300px]">
          <p>Loading service details...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center min-h-[300px]">
          <p>Service not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(`/services/${id}`)}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Manage Service</h1>
          </div>

          <div className="flex space-x-2 mt-4 md:mt-0">
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Service
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Service</DialogTitle>
                  <DialogDescription>
                    Make changes to your service here. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <EditServiceForm 
                  service={service} 
                  onSave={handleEditService} 
                  onCancel={() => setShowEditDialog(false)} 
                />
              </DialogContent>
            </Dialog>
            
            <Button variant="destructive" className="gap-2">
              <Trash className="h-4 w-4" />
              Delete Service
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3">
              {service.coverImage ? (
                <img 
                  src={service.coverImage} 
                  alt={service.title} 
                  className="w-full h-auto rounded-lg object-cover aspect-video" 
                />
              ) : (
                <div className="w-full rounded-lg bg-muted flex items-center justify-center aspect-video">
                  <p className="text-muted-foreground">No cover image</p>
                </div>
              )}
            </div>
            
            <div className="w-full md:w-2/3">
              <h2 className="text-2xl font-bold">{service.title}</h2>
              
              <div className="flex items-center mt-2">
                <Badge variant={service.price > 0 ? "default" : "outline"}>
                  {service.price > 0 ? `$${service.price}` : 'Free'}
                </Badge>
                <Badge variant="outline" className="ml-2">
                  {service.serviceType === 'one_on_one' ? '1-on-1' : 'Group'}
                </Badge>
                <Badge variant="outline" className="ml-2">
                  {service.isOnline ? 'Online' : 'In-person'}
                </Badge>
              </div>
              
              <p className="mt-4">{service.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-500 mr-2" />
                  <span>{service.duration}</span>
                </div>
                
                {service.location && (
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                    <span>{service.location}</span>
                  </div>
                )}
                
                {service.isOnline && (
                  <div className="flex items-center">
                    <Video className="h-5 w-5 text-gray-500 mr-2" />
                    <span>Online Service</span>
                  </div>
                )}
                
                {service.capacity && (
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-500 mr-2" />
                    <span>
                      {service.capacity === 1 ? '1-on-1 Session' : `Group (up to ${service.capacity})`}
                    </span>
                  </div>
                )}
                
                {service.price > 0 && (
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-gray-500 mr-2" />
                    <span>${service.price}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        <div>
          <h2 className="text-xl font-bold mb-4">Bookings</h2>
          
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="pending" className="relative">
                Pending
                {pendingBookings.length > 0 && (
                  <Badge className="ml-2">{pendingBookings.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending">
              <Card className="p-4">
                {pendingBookings.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Booking Date</TableHead>
                        <TableHead>Payment Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{booking.userName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{booking.userName}</p>
                                <p className="text-sm text-muted-foreground">{booking.userEmail}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{new Date(booking.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={booking.paymentStatus === 'paid' ? "default" : "outline"}>
                              {booking.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 gap-1"
                                onClick={() => handleApproveBooking(booking.id)}
                              >
                                <Check className="h-4 w-4" />
                                Approve
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 gap-1 text-destructive"
                                onClick={() => handleCancelBooking(booking.id)}
                              >
                                <X className="h-4 w-4" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No pending bookings</p>
                  </div>
                )}
              </Card>
            </TabsContent>
            
            <TabsContent value="approved">
              <Card className="p-4">
                {approvedBookings.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Booking Date</TableHead>
                        <TableHead>Payment Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvedBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{booking.userName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{booking.userName}</p>
                                <p className="text-sm text-muted-foreground">{booking.userEmail}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{new Date(booking.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={booking.paymentStatus === 'paid' ? "default" : "outline"}>
                              {booking.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" className="h-8 gap-1">
                                <Check className="h-4 w-4" />
                                Complete
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 gap-1 text-destructive"
                                onClick={() => handleCancelBooking(booking.id)}
                              >
                                <X className="h-4 w-4" />
                                Cancel
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No approved bookings</p>
                  </div>
                )}
              </Card>
            </TabsContent>
            
            <TabsContent value="completed">
              <Card className="p-4">
                {completedBookings.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Booking Date</TableHead>
                        <TableHead>Payment Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{booking.userName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{booking.userName}</p>
                                <p className="text-sm text-muted-foreground">{booking.userEmail}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{new Date(booking.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={booking.paymentStatus === 'paid' ? "default" : "outline"}>
                              {booking.paymentStatus}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No completed bookings</p>
                  </div>
                )}
              </Card>
            </TabsContent>
            
            <TabsContent value="cancelled">
              <Card className="p-4">
                {cancelledBookings.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Booking Date</TableHead>
                        <TableHead>Payment Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cancelledBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{booking.userName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{booking.userName}</p>
                                <p className="text-sm text-muted-foreground">{booking.userEmail}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{new Date(booking.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={booking.paymentStatus === 'paid' ? "default" : "outline"}>
                              {booking.paymentStatus}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No cancelled bookings</p>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ManageService;
