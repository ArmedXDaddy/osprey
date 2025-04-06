
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Session, SessionEnrollment } from '@/types';
import { Calendar, Clock, Users, Check, X, MapPin, VideoIcon, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const SessionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { enrollInSession, cancelEnrollment, loading } = useData();
  const { currentUser } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [enrollment, setEnrollment] = useState<SessionEnrollment | null>(null);
  const [enrollments, setEnrollments] = useState<SessionEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, we would fetch the session data here
    // For now, using a mock session
    if (id) {
      const mockSession: Session = {
        id,
        title: 'Advanced Fitness Training',
        description: 'A comprehensive fitness program designed for all levels.',
        coachId: 'coach-1',
        coachName: 'Fitness Coach',
        sessionType: 'group',
        capacity: 10,
        price: 49.99,
        duration: '60 minutes',
        startTime: new Date('2023-12-20T10:00:00'),
        location: 'Downtown Fitness Center',
        isOnline: false,
        isActive: true,
        createdAt: new Date('2023-11-01'),
        updatedAt: new Date('2023-11-01')
      };
      
      setSession(mockSession);
      
      // Mock enrollment data
      const mockEnrollment: SessionEnrollment = {
        id: 'enrollment-1',
        sessionId: id,
        userId: currentUser?.id || 'user-1',
        userName: currentUser?.name || 'User',
        userEmail: currentUser?.email || 'user@example.com',
        status: 'approved',
        paymentStatus: 'paid',
        createdAt: new Date('2023-11-15')
      };
      
      // Only set enrollment if current user is enrolled
      if (Math.random() > 0.5) {
        setEnrollment(mockEnrollment);
      }
      
      // Mock all enrollments for this session
      const mockEnrollments: SessionEnrollment[] = [
        mockEnrollment,
        {
          id: 'enrollment-2',
          sessionId: id,
          userId: 'user-2',
          userName: 'Jane Smith',
          userEmail: 'jane@example.com',
          userProfileImage: '/path/to/jane.jpg',
          status: 'approved',
          paymentStatus: 'paid',
          createdAt: new Date('2023-11-14')
        },
        {
          id: 'enrollment-3',
          sessionId: id,
          userId: 'user-3',
          userName: 'Mike Johnson',
          userEmail: 'mike@example.com',
          status: 'pending',
          paymentStatus: 'unpaid',
          createdAt: new Date('2023-11-16')
        }
      ];
      
      setEnrollments(mockEnrollments);
      setIsLoading(false);
    }
  }, [id, currentUser]);

  const handleEnroll = async () => {
    if (!session || !currentUser) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to enroll in a session."
      });
      return;
    }
    
    try {
      await enrollInSession(session.id, currentUser.id);
      
      // Update local state with a new enrollment
      const newEnrollment: SessionEnrollment = {
        id: `temp-${Date.now()}`,
        sessionId: session.id,
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        status: 'pending',
        paymentStatus: 'unpaid',
        createdAt: new Date()
      };
      
      setEnrollment(newEnrollment);
      
      toast({
        title: "Enrollment successful",
        description: "You have been enrolled in this session."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Enrollment failed",
        description: error.message || "There was an error enrolling in this session."
      });
    }
  };

  const handleCancelEnrollment = async () => {
    if (!enrollment) return;
    
    try {
      await cancelEnrollment(enrollment.id);
      setEnrollment(null);
      
      toast({
        title: "Enrollment cancelled",
        description: "Your enrollment has been cancelled."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "There was an error cancelling your enrollment."
      });
    }
  };

  if (isLoading || !session) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg">Loading session details...</p>
          </div>
        </div>
      </div>
    );
  }

  const isPastSession = session.startTime ? new Date(session.startTime) < new Date() : false;
  const isCoach = currentUser?.id === session.coachId;

  return (
    <div className="container py-8">
      <div className="space-y-8">
        {/* Session header */}
        <div>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">{session.title}</h1>
              <p className="text-muted-foreground">Coach: {session.coachName}</p>
            </div>
            
            {isCoach && (
              <Button asChild>
                <Link to={`/sessions/${session.id}/manage`}>Manage Session</Link>
              </Button>
            )}
          </div>
        </div>
        
        {/* Session details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {session.startTime ? format(new Date(session.startTime), 'EEEE, MMMM d, yyyy') : 'Date to be announced'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {session.startTime ? format(new Date(session.startTime), 'h:mm a') : 'Time to be announced'} • {session.duration}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {session.isOnline ? (
                  <VideoIcon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">
                    {session.isOnline ? 'Online Session' : session.location || 'Location to be announced'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {session.sessionType === 'one_on_one' ? 'One-on-One Session' : `Group Session (Capacity: ${session.capacity || 'Unlimited'})`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {session.price > 0 ? `$${session.price}` : 'Free'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Badge variant={session.isActive ? 'default' : 'outline'}>
                  {session.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant="outline">
                  {session.sessionType === 'one_on_one' ? 'Individual' : 'Group'}
                </Badge>
                {session.isOnline && (
                  <Badge variant="outline">
                    Online
                  </Badge>
                )}
              </div>
            </CardContent>
            
            {!isCoach && (
              <CardFooter>
                {!enrollment ? (
                  <Button 
                    className="w-full" 
                    onClick={handleEnroll}
                    disabled={isPastSession || !session.isActive}
                  >
                    {session.price > 0 ? 'Enroll Now (Paid)' : 'Enroll Now (Free)'}
                  </Button>
                ) : (
                  <div className="w-full space-y-3">
                    <div className="bg-muted p-3 rounded-md flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Your Enrollment Status</h4>
                        <div className="flex gap-2 mt-1">
                          <Badge>{enrollment.status}</Badge>
                          <Badge variant={enrollment.paymentStatus === 'paid' ? 'default' : 'outline'}>
                            {enrollment.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                      
                      {enrollment.status !== 'rejected' && (
                        <Button 
                          variant="outline" 
                          className="text-destructive" 
                          onClick={handleCancelEnrollment}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                    
                    {enrollment.status === 'approved' && session.isOnline && session.meetingUrl && (
                      <Button className="w-full" asChild>
                        <a href={session.meetingUrl} target="_blank" rel="noopener noreferrer">
                          <VideoIcon className="mr-2 h-4 w-4" /> Join Online Session
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </CardFooter>
            )}
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>About This Session</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{session.description}</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Enrollments section (visible only to coach) */}
        {isCoach && (
          <Card>
            <CardHeader>
              <CardTitle>Enrollments</CardTitle>
              <CardDescription>Manage student enrollments for this session</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All ({enrollments.length})</TabsTrigger>
                  <TabsTrigger value="pending">
                    Pending ({enrollments.filter(e => e.status === 'pending').length})
                  </TabsTrigger>
                  <TabsTrigger value="approved">
                    Approved ({enrollments.filter(e => e.status === 'approved').length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="all">
                  {enrollments.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No enrollments yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {enrollments.map(enrollment => (
                        <div 
                          key={enrollment.id} 
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={enrollment.userProfileImage} />
                              <AvatarFallback>
                                {enrollment.userName.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{enrollment.userName}</p>
                              <p className="text-sm text-muted-foreground">{enrollment.userEmail}</p>
                              <div className="flex gap-2 mt-1">
                                <Badge variant={enrollment.status === 'pending' ? 'outline' : 'default'}>
                                  {enrollment.status}
                                </Badge>
                                <Badge variant={enrollment.paymentStatus === 'paid' ? 'default' : 'destructive'}>
                                  {enrollment.paymentStatus}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          {enrollment.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                className="text-destructive"
                                size="sm"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                className="text-primary"
                                size="sm"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="pending">
                  {enrollments.filter(e => e.status === 'pending').length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No pending enrollments.</p>
                  ) : (
                    <div className="space-y-4">
                      {enrollments
                        .filter(enrollment => enrollment.status === 'pending')
                        .map(enrollment => (
                          <div 
                            key={enrollment.id} 
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={enrollment.userProfileImage} />
                                <AvatarFallback>
                                  {enrollment.userName.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{enrollment.userName}</p>
                                <p className="text-sm text-muted-foreground">{enrollment.userEmail}</p>
                                <div className="flex gap-2 mt-1">
                                  <Badge variant="outline">Pending</Badge>
                                  <Badge variant={enrollment.paymentStatus === 'paid' ? 'default' : 'destructive'}>
                                    {enrollment.paymentStatus}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                className="text-destructive"
                                size="sm"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                className="text-primary"
                                size="sm"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="approved">
                  {enrollments.filter(e => e.status === 'approved').length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No approved enrollments.</p>
                  ) : (
                    <div className="space-y-4">
                      {enrollments
                        .filter(enrollment => enrollment.status === 'approved')
                        .map(enrollment => (
                          <div 
                            key={enrollment.id} 
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={enrollment.userProfileImage} />
                                <AvatarFallback>
                                  {enrollment.userName.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{enrollment.userName}</p>
                                <p className="text-sm text-muted-foreground">{enrollment.userEmail}</p>
                                <div className="flex gap-2 mt-1">
                                  <Badge>Approved</Badge>
                                  <Badge variant={enrollment.paymentStatus === 'paid' ? 'default' : 'destructive'}>
                                    {enrollment.paymentStatus}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SessionDetail;
