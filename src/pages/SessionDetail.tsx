
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Clock, 
  DollarSign, 
  MapPin, 
  Calendar, 
  Users, 
  Video,
  ChevronLeft, 
  User,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { Session, SessionEnrollment } from '@/types';
import { useToast } from '@/hooks/use-toast';
import MockPaymentGateway from '@/components/shared/MockPaymentGateway';

const SessionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { 
    sessions, 
    sessionEnrollments, 
    enrollInSession, 
    cancelEnrollment, 
    loading 
  } = useData();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [userEnrollment, setUserEnrollment] = useState<SessionEnrollment | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  useEffect(() => {
    if (id && sessions.length > 0) {
      const foundSession = sessions.find(s => s.id === id);
      if (foundSession) {
        setSession(foundSession);
      }
    }
  }, [id, sessions]);
  
  useEffect(() => {
    if (session && currentUser && sessionEnrollments.length > 0) {
      const enrollment = sessionEnrollments.find(e => 
        e.sessionId === session.id && e.userId === currentUser.id
      );
      if (enrollment) {
        setUserEnrollment(enrollment);
      }
    }
  }, [session, currentUser, sessionEnrollments]);
  
  const handleEnroll = async () => {
    if (!session) return;
    
    try {
      if (!currentUser) {
        toast({
          title: "Authentication required",
          description: "Please log in to enroll in this session",
          variant: "destructive"
        });
        return;
      }
      
      // If it's a paid session, show payment modal
      if (session.price > 0) {
        setShowPaymentModal(true);
      } else {
        // For free sessions, just send a request
        await enrollInSession(session.id);
        toast({
          title: "Request sent",
          description: "Your request has been sent to the coach for approval",
        });
      }
    } catch (error) {
      console.error('Error enrolling in session:', error);
      toast({
        title: "Error",
        description: "There was an error processing your request",
        variant: "destructive"
      });
    }
  };
  
  const handlePaymentSuccess = async () => {
    if (!session) return;
    
    try {
      // Enroll with payment status set to paid
      await enrollInSession(session.id, true);
      toast({
        title: "Enrollment successful",
        description: "You have successfully enrolled in this session",
      });
    } catch (error) {
      console.error('Error enrolling after payment:', error);
    }
  };
  
  const handlePaymentCancel = () => {
    toast({
      title: "Payment cancelled",
      description: "Your payment has been cancelled",
    });
  };
  
  const handleCancel = async () => {
    if (!userEnrollment) return;
    
    try {
      await cancelEnrollment(userEnrollment.id);
      setUserEnrollment(null);
      toast({
        title: "Enrollment cancelled",
        description: "Your enrollment has been cancelled",
      });
    } catch (error) {
      console.error('Error canceling enrollment:', error);
      toast({
        title: "Error",
        description: "There was an error cancelling your enrollment",
        variant: "destructive"
      });
    }
  };
  
  const isCoach = currentUser?.role === 'coach';
  const isOwnSession = isCoach && currentUser?.id === session?.coachId;
  
  if (loading || !session) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }
  
  const getStatusBadge = () => {
    if (!userEnrollment) return null;
    
    switch (userEnrollment.status) {
      case 'pending':
        return <Badge className="w-full justify-center py-1" variant="outline">Pending Approval</Badge>;
      case 'approved':
        return <Badge className="w-full justify-center py-1" variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge className="w-full justify-center py-1" variant="destructive">Rejected</Badge>;
      default:
        return null;
    }
  };
  
  const getPaymentBadge = () => {
    if (!userEnrollment) return null;
    
    switch (userEnrollment.paymentStatus) {
      case 'paid':
        return <Badge className="w-full justify-center py-1" variant="success">Paid</Badge>;
      case 'unpaid':
        return <Badge className="w-full justify-center py-1" variant="outline">Unpaid</Badge>;
      case 'refunded':
        return <Badge className="w-full justify-center py-1" variant="secondary">Refunded</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => navigate('/sessions')}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Sessions
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">{session.title}</CardTitle>
                  <div className="flex items-center mt-2">
                    <Badge variant={session.sessionType === 'one_on_one' ? 'outline' : 'secondary'} className="mr-2">
                      {session.sessionType === 'one_on_one' ? '1:1 Session' : 'Group Class'}
                    </Badge>
                    {session.isActive ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                    {session.price === 0 && (
                      <Badge variant="outline" className="ml-2">Free</Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">${session.price}</div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-gray-700">{session.description}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-700">{session.duration}</span>
                  </div>
                  
                  {session.startTime && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-700">
                        {format(session.startTime, 'PPp')}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  {session.location && !session.isOnline && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-700">{session.location}</span>
                    </div>
                  )}
                  
                  {session.isOnline && (
                    <div className="flex items-center gap-2">
                      <Video className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-700">Online Session</span>
                      {userEnrollment?.status === 'approved' && session.meetingUrl && (
                        <a 
                          href={session.meetingUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Join Meeting
                        </a>
                      )}
                    </div>
                  )}
                  
                  {session.sessionType === 'group' && session.capacity && (
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-700">Capacity: {session.capacity} people</span>
                    </div>
                  )}
                </div>
              </div>
              
              {session.price === 0 && (
                <div className="bg-blue-50 p-4 rounded-md mt-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-700">Free Session Information</h4>
                      <p className="text-sm text-blue-600">
                        This is a free session. Your request will need to be approved by the coach before you can join.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Coach</CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="" alt={session.coachName} />
                  <AvatarFallback>{session.coachName.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div>
                  <div className="font-medium">{session.coachName}</div>
                  <div className="text-gray-500 text-sm">Fitness Coach</div>
                </div>
              </div>
              
              <div className="mt-6">
                {isOwnSession ? (
                  <Button className="w-full" onClick={() => navigate(`/sessions/${session.id}/manage`)}>
                    Manage Session
                  </Button>
                ) : userEnrollment ? (
                  <div className="space-y-4">
                    <div className="rounded-md p-3 bg-gray-50">
                      <div className="text-sm font-medium mb-1">Enrollment Status</div>
                      {getStatusBadge()}
                    </div>
                    
                    {session.price > 0 && (
                      <div className="rounded-md p-3 bg-gray-50">
                        <div className="text-sm font-medium mb-1">Payment Status</div>
                        {getPaymentBadge()}
                      </div>
                    )}
                    
                    <Button variant="outline" className="w-full" onClick={handleCancel}>
                      Cancel Enrollment
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={handleEnroll} 
                    disabled={!session.isActive}
                  >
                    {session.isActive ? (
                      session.sessionType === 'one_on_one' ? 
                        (session.price > 0 ? `Book for $${session.price}` : 'Request Session') : 
                        (session.price > 0 ? `Enroll for $${session.price}` : 'Enroll Now')
                    ) : (
                      'Currently Unavailable'
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <MockPaymentGateway 
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        amount={session.price}
        serviceName={session.title}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentCancel={handlePaymentCancel}
      />
    </div>
  );
};

export default SessionDetail;
