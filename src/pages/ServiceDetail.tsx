
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchServiceById, createEnrollment, fetchServiceEnrollments } from '@/api/services';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Users, Edit, Trash2 } from 'lucide-react';
import { ServiceEnrollment, SessionStatus } from '@/types';
import { useAuth } from '@/context/AuthContext';
import ServiceDetailCard from '@/components/shared/ServiceDetailCard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('details');
  
  const { data: service, isLoading, error } = useQuery({
    queryKey: ['service', id],
    queryFn: () => fetchServiceById(id!),
    enabled: !!id
  });
  
  const { data: enrollments, isLoading: isLoadingEnrollments } = useQuery({
    queryKey: ['serviceEnrollments', id],
    queryFn: () => fetchServiceEnrollments(id!),
    enabled: !!id && !!currentUser && (currentUser.role === 'coach' || currentUser.id === service?.coachId)
  });
  
  const enrollMutation = useMutation({
    mutationFn: (data: Omit<ServiceEnrollment, 'id' | 'createdAt'>) => createEnrollment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceEnrollments', id] });
      toast({
        title: 'Enrollment successful',
        description: 'You have successfully enrolled in this service',
        variant: 'success'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Enrollment failed',
        description: error.message || 'Failed to enroll in this service. Please try again.',
        variant: 'destructive'
      });
    }
  });
  
  const handleEnroll = async () => {
    if (!currentUser) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to enroll in services',
        variant: 'destructive'
      });
      navigate('/auth/login');
      return;
    }
    
    if (!service) return;
    
    const enrollmentData: Omit<ServiceEnrollment, 'id' | 'createdAt'> = {
      serviceId: service.id,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      userProfileImage: currentUser.profileImage,
      status: service.serviceType === 'one_on_one' ? 'pending' : 'approved',
      paymentStatus: service.isFree ? 'paid' : 'unpaid'
    };
    
    enrollMutation.mutate(enrollmentData);
  };
  
  const isEnrolled = React.useMemo(() => {
    if (!currentUser || !enrollments) return false;
    return enrollments.some(e => e.userId === currentUser.id);
  }, [currentUser, enrollments]);
  
  const isOwner = React.useMemo(() => {
    if (!currentUser || !service) return false;
    return currentUser.id === service.coachId;
  }, [currentUser, service]);
  
  const getStatusBadge = (status: SessionStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const getPaymentBadge = (status: string) => {
    return status === 'paid' 
      ? <Badge variant="success">Paid</Badge>
      : <Badge variant="outline">Unpaid</Badge>;
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/services')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-10 w-48" />
        </div>
        
        <Skeleton className="h-[400px] rounded-lg" />
      </div>
    );
  }
  
  if (error || !service) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/services')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-600">Service not found</h2>
          <p className="text-gray-600 mt-2">
            The service you're looking for might have been removed or doesn't exist.
          </p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/services')}
            className="mt-4"
          >
            Back to Services
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/services')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">{service.title}</h1>
      </div>
      
      {isOwner && (
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="enrollments">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>Enrollments</span>
              </div>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <ServiceDetailCard 
                  service={service} 
                  onEnroll={handleEnroll}
                  isEnrolled={isEnrolled}
                />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Service Management</h2>
                
                <div className="flex gap-2 flex-col">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate(`/services/${service.id}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Service
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        className="w-full justify-start"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Service
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete
                          your service and all associated enrollments.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            // TODO: Implement delete functionality
                            toast({
                              title: "Service deleted",
                              description: "The service has been successfully deleted",
                              variant: "success"
                            });
                            navigate('/services');
                          }}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="enrollments" className="mt-6">
            {isLoadingEnrollments ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : enrollments && enrollments.length > 0 ? (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Enrolled</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map(enrollment => (
                      <TableRow key={enrollment.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {enrollment.userProfileImage ? (
                              <img 
                                src={enrollment.userProfileImage} 
                                alt={enrollment.userName}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                {enrollment.userName.charAt(0)}
                              </div>
                            )}
                            <span>{enrollment.userName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{enrollment.userEmail}</TableCell>
                        <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                        <TableCell>{getPaymentBadge(enrollment.paymentStatus)}</TableCell>
                        <TableCell>
                          {formatDistanceToNow(enrollment.createdAt, { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              Manage
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <h2 className="text-xl font-bold text-gray-600">No enrollments yet</h2>
                <p className="text-gray-500 mt-2">
                  No one has enrolled in this service yet.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
      
      {!isOwner && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ServiceDetailCard 
              service={service} 
              onEnroll={handleEnroll}
              isEnrolled={isEnrolled}
            />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">About the Coach</h2>
            
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                {service.coachName.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold">{service.coachName}</h3>
                <p className="text-sm text-gray-500">Coach</p>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Services by this Coach</h3>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate(`/profile/${service.coachId}`)}
              >
                View Coach Profile
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetail;
