
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { fetchServiceById, fetchServiceEnrollments, updateEnrollmentStatus } from '@/api/services';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, Edit, User, Check, X, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ManageService = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  // Fetch service details
  const { 
    data: service, 
    isLoading: serviceLoading, 
    error: serviceError 
  } = useQuery({
    queryKey: ['service', id],
    queryFn: () => fetchServiceById(id as string),
    enabled: !!id,
  });

  // Fetch service enrollments
  const { 
    data: enrollments = [], 
    isLoading: enrollmentsLoading, 
    error: enrollmentsError,
    refetch: refetchEnrollments
  } = useQuery({
    queryKey: ['serviceEnrollments', id],
    queryFn: () => fetchServiceEnrollments(id as string),
    enabled: !!id,
  });

  // Check if user is the service provider
  useEffect(() => {
    if (!serviceLoading && service && currentUser) {
      if (service.providerId !== currentUser.id) {
        toast({
          title: "Access Denied",
          description: "You can only manage your own services",
          variant: "destructive"
        });
        navigate('/services');
      }
    }
  }, [service, currentUser, serviceLoading, navigate, toast]);

  // Filter enrollments by status
  const pendingEnrollments = enrollments?.filter(e => e.status === 'pending') || [];
  const approvedEnrollments = enrollments?.filter(e => e.status === 'approved') || [];
  const rejectedEnrollments = enrollments?.filter(e => e.status === 'rejected') || [];

  const handleToggleActive = async () => {
    if (!service) return;
    
    try {
      // This would be implemented in a real app to toggle service availability
      toast({
        title: service.available ? "Service deactivated" : "Service activated",
        description: service.available 
          ? "The service is now hidden from users" 
          : "The service is now visible and open for booking",
      });
    } catch (error: any) {
      console.error('Error toggling service active state:', error);
      toast({
        title: "Error updating service",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const openConfirmDialog = (enrollment: any, action: 'approve' | 'reject') => {
    setSelectedEnrollment(enrollment);
    setActionType(action);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedEnrollment || !actionType) return;
    
    try {
      const newStatus = actionType === 'approve' ? 'approved' : 'rejected';
      
      // Update enrollment status
      await updateEnrollmentStatus(selectedEnrollment.id, newStatus);
      
      // Refetch enrollments to get the updated list
      refetchEnrollments();
      
      toast({
        title: `Booking ${newStatus}`,
        description: `You have ${newStatus} the booking request`,
      });
    } catch (error: any) {
      console.error(`Error ${actionType}ing enrollment:`, error);
      toast({
        title: "Error updating booking",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsConfirmDialogOpen(false);
      setSelectedEnrollment(null);
      setActionType(null);
    }
  };

  if (serviceLoading || enrollmentsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (serviceError || !service) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-2">Service Not Found</h2>
        <p className="text-gray-500 mb-4">The service you're trying to manage doesn't exist or has been removed</p>
        <Button onClick={() => navigate('/services')}>Back to Services</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/services')}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Services
        </Button>
        
        <Button variant="outline" onClick={() => navigate(`/services/${id}`)}>
          <ExternalLink className="h-4 w-4 mr-2" />
          View Public Page
        </Button>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{service.title}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={service.sessionType === 'one_on_one' ? 'outline' : 'secondary'}>
                {service.sessionType === 'one_on_one' ? '1:1 Session' : 'Group Class'}
              </Badge>
              {service.available ? (
                <Badge variant="success">Active</Badge>
              ) : (
                <Badge variant="destructive">Inactive</Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Active</span>
              <Switch checked={service.available} onCheckedChange={handleToggleActive} />
            </div>
            
            <Button size="sm" variant="outline" onClick={() => navigate(`/services/${id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="font-medium mb-2">Service Details</h3>
              <p className="text-gray-700 mb-4">{service.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Price:</span>
                  <span className="font-medium">${service.price}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Duration:</span>
                  <span>{service.duration}</span>
                </div>
                
                {service.location && !service.isOnline && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Location:</span>
                    <span>{service.location}</span>
                  </div>
                )}
                
                {service.isOnline && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Format:</span>
                    <span>Online</span>
                  </div>
                )}
                
                {service.isOnline && service.meetingUrl && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Meeting URL:</span>
                    <a 
                      href={service.meetingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {service.meetingUrl.substring(0, 30)}...
                    </a>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Booking Summary</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Total Bookings:</span>
                  <span className="font-medium">{enrollments.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Pending:</span>
                  <Badge variant="outline">{pendingEnrollments.length}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Approved:</span>
                  <Badge variant="success">{approvedEnrollments.length}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Rejected:</span>
                  <Badge variant="destructive">{rejectedEnrollments.length}</Badge>
                </div>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">
                Pending ({pendingEnrollments.length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({approvedEnrollments.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({rejectedEnrollments.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="mt-6">
              {pendingEnrollments.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 mx-auto text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium">No pending bookings</h3>
                  <p className="text-gray-500">
                    There are currently no pending booking requests for this service.
                  </p>
                </div>
              ) : (
                <BookingTable 
                  bookings={pendingEnrollments} 
                  showActions={true}
                  onApprove={(booking) => openConfirmDialog(booking, 'approve')}
                  onReject={(booking) => openConfirmDialog(booking, 'reject')}
                />
              )}
            </TabsContent>
            
            <TabsContent value="approved" className="mt-6">
              {approvedEnrollments.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 mx-auto text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium">No approved bookings</h3>
                  <p className="text-gray-500">
                    There are currently no approved bookings for this service.
                  </p>
                </div>
              ) : (
                <BookingTable 
                  bookings={approvedEnrollments} 
                  showActions={false}
                />
              )}
            </TabsContent>
            
            <TabsContent value="rejected" className="mt-6">
              {rejectedEnrollments.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 mx-auto text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium">No rejected bookings</h3>
                  <p className="text-gray-500">
                    There are currently no rejected bookings for this service.
                  </p>
                </div>
              ) : (
                <BookingTable 
                  bookings={rejectedEnrollments} 
                  showActions={false}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Booking' : 'Reject Booking'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'Are you sure you want to approve this booking request?' 
                : 'Are you sure you want to reject this booking request?'
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedEnrollment && (
            <div className="flex items-center gap-4 py-2">
              <Avatar>
                <AvatarImage src={selectedEnrollment.userProfileImage} />
                <AvatarFallback>{selectedEnrollment.userName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              
              <div>
                <div className="font-medium">{selectedEnrollment.userName}</div>
                <div className="text-sm text-gray-500">{selectedEnrollment.userEmail}</div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant={actionType === 'approve' ? 'default' : 'destructive'} 
              onClick={handleConfirmAction}
            >
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface BookingTableProps {
  bookings: any[];
  showActions: boolean;
  onApprove?: (booking: any) => void;
  onReject?: (booking: any) => void;
}

const BookingTable: React.FC<BookingTableProps> = ({ 
  bookings, 
  showActions, 
  onApprove, 
  onReject 
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Booking Date</TableHead>
            <TableHead>Payment Status</TableHead>
            {showActions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={booking.userProfileImage} alt={booking.userName} />
                    <AvatarFallback>{booking.userName?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{booking.userName}</div>
                    <div className="text-xs text-gray-500">{booking.userEmail}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {format(new Date(booking.createdAt), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                <Badge variant={booking.paymentStatus === 'paid' ? 'success' : 'outline'}>
                  {booking.paymentStatus}
                </Badge>
              </TableCell>
              {showActions && (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onApprove?.(booking)}
                    >
                      <Check className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => onReject?.(booking)}
                    >
                      <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ManageService;
