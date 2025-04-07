import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, MapPin, Users, ArrowLeft, Video, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { Session, SessionEnrollment } from '@/types';

const SessionDetail = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { 
    sessions, 
    sessionEnrollments, 
    enrollInSession, 
    cancelEnrollment, 
    approveEnrollment, 
    rejectEnrollment 
  } = useData();
  
  const [session, setSession] = useState<Session | null>(null);
  const [enrollments, setEnrollments] = useState<SessionEnrollment[]>([]);
  const [userEnrollment, setUserEnrollment] = useState<SessionEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!sessionId) return;
    
    const foundSession = sessions.find(s => s.id === sessionId);
    if (foundSession) {
      setSession(foundSession);
    }
    
    const sessionEnrollmentsList = sessionEnrollments.filter(
      enrollment => enrollment.sessionId === sessionId
    );
    setEnrollments(sessionEnrollmentsList);
    
    if (currentUser) {
      const userEnroll = sessionEnrollmentsList.find(
        enrollment => enrollment.userId === currentUser.id
      );
      setUserEnrollment(userEnroll || null);
    }
    
    setLoading(false);
  }, [sessionId, sessions, sessionEnrollments, currentUser]);
  
  if (loading) {
    return <div className="text-center py-12">Loading session details...</div>;
  }
  
  if (!session) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Session not found</h2>
        <p className="text-muted-foreground mb-4">The session you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/sessions')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sessions
        </Button>
      </div>
    );
  }
  
  const isCoach = currentUser?.id === session.coachId;
  const isPending = userEnrollment?.status === 'pending';
  const isApproved = userEnrollment?.status === 'approved';
  const isRejected = userEnrollment?.status === 'rejected';
  const isEnrolled = isPending || isApproved;
  
  const handleEnroll = async () => {
    try {
      await enrollInSession(sessionId);
      
      // Create a new enrollment object
      const newEnrollment: SessionEnrollment = {
        id: Date.now().toString(),
        sessionId: sessionId,
        userId: currentUser?.id || '',
        userName: currentUser?.name || '',
        userEmail: currentUser?.email || '',
        userProfileImage: currentUser?.profileImage,
        status: 'pending',
        paymentStatus: session.price > 0 ? 'unpaid' : 'paid',
        createdAt: new Date()
      };
      
      // Update local state
      setEnrollments(prev => [...prev, newEnrollment]);
      setUserEnrollment(newEnrollment);
      
      toast({
        title: "Enrollment request sent",
        description: "Your request to join this session has been submitted."
      });
    } catch (error: any) {
      toast({
        title: "Enrollment failed",
        description: error.message || "Failed to enroll in session",
        variant: "destructive"
      });
    }
  };
  
  const handleCancelEnrollment = async () => {
    if (!userEnrollment) return;
    
    try {
      await cancelEnrollment(userEnrollment.id);
      
      // Update local state
      setEnrollments(prev => prev.filter(e => e.id !== userEnrollment.id));
      setUserEnrollment(null);
      
      toast({
        title: "Enrollment cancelled",
        description: "You have cancelled your enrollment in this session."
      });
    } catch (error: any) {
      toast({
        title: "Cancellation failed",
        description: error.message || "Failed to cancel enrollment",
        variant: "destructive"
      });
    }
  };
  
  const handleApproveEnrollment = async (enrollmentId: string) => {
    try {
      await approveEnrollment(enrollmentId);
      
      // Update local state
      setEnrollments(prev => 
        prev.map(e => 
          e.id === enrollmentId 
            ? { ...e, status: 'approved' } 
            : e
        )
      );
      
      toast({
        title: "Enrollment approved",
        description: "The enrollment request has been approved."
      });
    } catch (error: any) {
      toast({
        title: "Approval failed",
        description: error.message || "Failed to approve enrollment",
        variant: "destructive"
      });
    }
  };
  
  const handleRejectEnrollment = async (enrollmentId: string) => {
    try {
      await rejectEnrollment(enrollmentId);
      
      // Update local state
      setEnrollments(prev => 
        prev.map(e => 
          e.id === enrollmentId 
            ? { ...e, status: 'rejected' } 
            : e
        )
      );
      
      toast({
        title: "Enrollment rejected",
        description: "The enrollment request has been rejected."
      });
    } catch (error: any) {
      toast({
        title: "Rejection failed",
        description: error.message || "Failed to reject enrollment",
        variant: "destructive"
      });
    }
  };
  
  const pendingEnrollments = enrollments.filter(e => e.status === 'pending');
  const approvedEnrollments = enrollments.filter(e => e.status === 'approved');
  
  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" onClick={() => navigate('/sessions')} className="pl-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sessions
        </Button>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{session.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="capitalize">
                {session.sessionType} Session
              </Badge>
              {session.isOnline && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Video className="h-3 w-3" />
                  Online
                </Badge>
              )}
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-3">About this Session</h2>
            <p className="text-gray-700">{session.description}</p>
          </div>
          
          <Separator />
          
          <div>
            <h2 className="text-xl font-semibold mb-3">Coach</h2>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(session.coachName)}&background=random`} />
                <AvatarFallback>{session.coachName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{session.coachName}</p>
                <p className="text-sm text-muted-foreground">Coach</p>
              </div>
            </div>
          </div>
          
          {isCoach && pendingEnrollments.length > 0 && (
            <>
              <Separator />
              
              <div>
                <h2 className="text-xl font-semibold mb-3">
                  Pending Enrollments <span className="text-muted-foreground font-normal text-base">({pendingEnrollments.length})</span>
                </h2>
                <div className="space-y-3">
                  {pendingEnrollments.map(enrollment => (
                    <div key={enrollment.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={enrollment.userProfileImage ?? ""} />
                          <AvatarFallback>{enrollment.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{enrollment.userName}</p>
                          <p className="text-xs text-gray-500">
                            Requested {format(new Date(enrollment.createdAt), 'PPP')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleRejectEnrollment(enrollment.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        
                        <Button 
                          size="sm"
                          onClick={() => handleApproveEnrollment(enrollment.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          
          {approvedEnrollments.length > 0 && (
            <>
              <Separator />
              
              <div>
                <h2 className="text-xl font-semibold mb-3">
                  Participants <span className="text-muted-foreground font-normal text-base">({approvedEnrollments.length})</span>
                </h2>
                <div className="flex flex-wrap gap-3">
                  {approvedEnrollments.map(enrollment => (
                    <div key={enrollment.id} className="flex items-center gap-2 p-2 border rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={enrollment.userProfileImage ?? ""} />
                        <AvatarFallback>{enrollment.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{enrollment.userName}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium">Date and Time</p>
                {session.startTime ? (
                  <p className="text-gray-600">
                    {format(new Date(session.startTime), 'EEEE, MMMM d, yyyy')}
                    <br />
                    {format(new Date(session.startTime), 'h:mm a')}
                  </p>
                ) : (
                  <p className="text-gray-600">Flexible scheduling</p>
                )}
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium">Duration</p>
                <p className="text-gray-600">{session.duration}</p>
              </div>
            </div>
            
            {!session.isOnline && session.location && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-gray-600">{session.location}</p>
                </div>
              </div>
            )}
            
            {session.isOnline && session.meetingUrl && isApproved && (
              <div className="flex items-start gap-3">
                <Video className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">Meeting Link</p>
                  <a 
                    href={session.meetingUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Join Meeting
                  </a>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium">Capacity</p>
                <p className="text-gray-600">
                  {session.sessionType === 'one_on_one' ? '1 person' : 
                    `${approvedEnrollments.length}/${session.capacity || 'unlimited'} participants`}
                </p>
              </div>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center mb-2">
                <p className="font-medium">Price</p>
                <p className="font-bold text-lg">${session.price.toFixed(2)}</p>
              </div>
              
              {!isCoach && (
                <div className="mt-4">
                  {!isEnrolled ? (
                    <Button 
                      className="w-full" 
                      onClick={handleEnroll}
                    >
                      Enroll in Session
                    </Button>
                  ) : isPending ? (
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full bg-amber-50"
                        disabled
                      >
                        Enrollment Pending
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleCancelEnrollment}
                      >
                        Cancel Request
                      </Button>
                    </div>
                  ) : isApproved ? (
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full bg-green-50 text-green-700"
                        disabled
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Enrolled
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleCancelEnrollment}
                      >
                        Cancel Enrollment
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full bg-red-50 text-red-700"
                      disabled
                    >
                      Enrollment Rejected
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetail;
