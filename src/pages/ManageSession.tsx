import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { 
  ChevronLeft, 
  Edit, 
  User, 
  Check, 
  X, 
  ExternalLink,
  Mail
} from 'lucide-react';
import { Session, SessionEnrollment, SessionStatus } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';

const ManageSession = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { sessions, sessionEnrollments, updateSession, updateEnrollmentStatus, loading } = useData();
  const { toast } = useToast();
  
  const [session, setSession] = useState<Session | null>(null);
  const [enrollments, setEnrollments] = useState<SessionEnrollment[]>([]);
  const [pendingEnrollments, setPendingEnrollments] = useState<SessionEnrollment[]>([]);
  const [approvedEnrollments, setApprovedEnrollments] = useState<SessionEnrollment[]>([]);
  const [rejectedEnrollments, setRejectedEnrollments] = useState<SessionEnrollment[]>([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState<SessionEnrollment | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  
  useEffect(() => {
    if (id && sessions.length > 0) {
      const foundSession = sessions.find(s => s.id === id);
      if (foundSession) {
        setSession(foundSession);
        
        // Get enrollments for this session
        const sessionEnrollmentsList = sessionEnrollments.filter(e => e.sessionId === id);
        setEnrollments(sessionEnrollmentsList);
        
        // Filter by status
        setPendingEnrollments(sessionEnrollmentsList.filter(e => e.status === 'pending'));
        setApprovedEnrollments(sessionEnrollmentsList.filter(e => e.status === 'approved'));
        setRejectedEnrollments(sessionEnrollmentsList.filter(e => e.status === 'rejected'));
      }
    }
  }, [id, sessions, sessionEnrollments]);
  
  const handleToggleActive = async () => {
    if (!session) return;
    
    try {
      await updateSession(session.id, { isActive: !session.isActive });
      setSession(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
      
      toast({
        title: session.isActive ? "Session deactivated" : "Session activated",
        description: session.isActive 
          ? "The session is now hidden from users" 
          : "The session is now visible and open for enrollment",
      });
    } catch (error: any) {
      console.error('Error toggling session active state:', error);
      toast({
        title: "Error updating session",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const openConfirmDialog = (enrollment: SessionEnrollment, action: 'approve' | 'reject') => {
    setSelectedEnrollment(enrollment);
    setActionType(action);
    setIsConfirmDialogOpen(true);
  };
  
  const handleConfirmAction = async () => {
    if (!selectedEnrollment || !actionType) return;
    
    try {
      const newStatus = actionType === 'approve' ? 'approved' : 'rejected';
      await updateEnrollmentStatus(selectedEnrollment.id, newStatus);
      
      // Update local state to reflect changes
      setEnrollments(prevEnrollments => 
        prevEnrollments.map(e => 
          e.id === selectedEnrollment.id ? { ...e, status: newStatus } : e
        )
      );
      
      // Refresh filtered lists
      const updatedEnrollment = { ...selectedEnrollment, status: newStatus };
      
      if (newStatus === 'approved') {
        setPendingEnrollments(prev => prev.filter(e => e.id !== selectedEnrollment.id));
        setApprovedEnrollments(prev => [...prev, updatedEnrollment]);
      } else {
        setPendingEnrollments(prev => prev.filter(e => e.id !== selectedEnrollment.id));
        setRejectedEnrollments(prev => [...prev, updatedEnrollment]);
      }
      
      toast({
        title: `Enrollment ${newStatus}`,
        description: `You have ${newStatus} the enrollment request`,
      });
    } catch (error: any) {
      console.error(`Error ${actionType}ing enrollment:`, error);
      toast({
        title: "Error updating enrollment",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsConfirmDialogOpen(false);
      setSelectedEnrollment(null);
      setActionType(null);
    }
  };
  
  // Check if the current user is the coach for this session
  if (currentUser && session && currentUser.id !== session.coachId) {
    navigate('/sessions');
    return null;
  }
  
  if (loading || !session) {
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
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/sessions')}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Sessions
        </Button>
        
        <Button variant="outline" onClick={() => navigate(`/sessions/${id}`)}>
          <ExternalLink className="h-4 w-4 mr-2" />
          View Public Page
        </Button>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{session.title}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={session.sessionType === 'one_on_one' ? 'outline' : 'secondary'}>
                {session.sessionType === 'one_on_one' ? '1:1 Session' : 'Group Class'}
              </Badge>
              {session.isActive ? (
                <Badge variant="success">Active</Badge>
              ) : (
                <Badge variant="destructive">Inactive</Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Active</span>
              <Switch checked={session.isActive} onCheckedChange={handleToggleActive} />
            </div>
            
            <Button size="sm" variant="outline" onClick={() => navigate(`/sessions/${id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="font-medium mb-2">Session Details</h3>
              <p className="text-gray-700 mb-4">{session.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Price:</span>
                  <span className="font-medium">${session.price}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Duration:</span>
                  <span>{session.duration}</span>
                </div>
                
                {session.startTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Start Time:</span>
                    <span>{format(session.startTime, 'PPp')}</span>
                  </div>
                )}
                
                {session.location && !session.isOnline && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Location:</span>
                    <span>{session.location}</span>
                  </div>
                )}
                
                {session.isOnline && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Format:</span>
                    <span>Online</span>
                  </div>
                )}
                
                {session.isOnline && session.meetingUrl && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Meeting URL:</span>
                    <a 
                      href={session.meetingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {session.meetingUrl.substring(0, 30)}...
                    </a>
                  </div>
                )}
                
                {session.sessionType === 'group' && session.capacity && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Capacity:</span>
                    <span>{session.capacity} people</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Enrollment Summary</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Total Enrollments:</span>
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
                
                {session.sessionType === 'group' && session.capacity && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Spots Remaining:</span>
                    <span>{Math.max(0, session.capacity - approvedEnrollments.length)} of {session.capacity}</span>
                  </div>
                )}
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
                  <h3 className="mt-4 text-lg font-medium">No pending enrollments</h3>
                  <p className="text-gray-500">
                    There are currently no pending enrollment requests for this session.
                  </p>
                </div>
              ) : (
                <EnrollmentTable 
                  enrollments={pendingEnrollments} 
                  showActions={true}
                  onApprove={(enrollment) => openConfirmDialog(enrollment, 'approve')}
                  onReject={(enrollment) => openConfirmDialog(enrollment, 'reject')}
                />
              )}
            </TabsContent>
            
            <TabsContent value="approved" className="mt-6">
              {approvedEnrollments.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 mx-auto text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium">No approved enrollments</h3>
                  <p className="text-gray-500">
                    There are currently no approved enrollments for this session.
                  </p>
                </div>
              ) : (
                <EnrollmentTable 
                  enrollments={approvedEnrollments} 
                  showActions={false}
                />
              )}
            </TabsContent>
            
            <TabsContent value="rejected" className="mt-6">
              {rejectedEnrollments.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 mx-auto text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium">No rejected enrollments</h3>
                  <p className="text-gray-500">
                    There are currently no rejected enrollments for this session.
                  </p>
                </div>
              ) : (
                <EnrollmentTable 
                  enrollments={rejectedEnrollments} 
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
              {actionType === 'approve' ? 'Approve Enrollment' : 'Reject Enrollment'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'Are you sure you want to approve this enrollment request?' 
                : 'Are you sure you want to reject this enrollment request?'
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedEnrollment && (
            <div className="flex items-center gap-4 py-2">
              <Avatar>
                <AvatarImage src={selectedEnrollment.userProfileImage} />
                <AvatarFallback>{selectedEnrollment.userName.charAt(0)}</AvatarFallback>
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

interface EnrollmentTableProps {
  enrollments: SessionEnrollment[];
  showActions: boolean;
  onApprove?: (enrollment: SessionEnrollment) => void;
  onReject?: (enrollment: SessionEnrollment) => void;
}

const EnrollmentTable: React.FC<EnrollmentTableProps> = ({ 
  enrollments, 
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
            <TableHead>Enrollment Date</TableHead>
            <TableHead>Payment Status</TableHead>
            {showActions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.map((enrollment) => (
            <TableRow key={enrollment.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={enrollment.userProfileImage} alt={enrollment.userName} />
                    <AvatarFallback>{enrollment.userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{enrollment.userName}</div>
                    <div className="text-xs text-gray-500">{enrollment.userEmail}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {format(new Date(enrollment.createdAt), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                <Badge variant={enrollment.paymentStatus === 'paid' ? 'success' : 'outline'}>
                  {enrollment.paymentStatus}
                </Badge>
              </TableCell>
              {showActions && (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onApprove?.(enrollment)}
                    >
                      <Check className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => onReject?.(enrollment)}
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

export default ManageSession;
