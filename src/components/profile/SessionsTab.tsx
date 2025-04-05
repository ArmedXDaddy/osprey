
import React from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Session, SessionEnrollment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface SessionsTabProps {
  userId: string;
  isOwnProfile: boolean;
}

const SessionsTab: React.FC<SessionsTabProps> = ({ userId, isOwnProfile }) => {
  const { currentUser } = useAuth();
  const { 
    sessions, 
    sessionEnrollments, 
    getUserSessions, 
    getCoachSessions,
    getUserEnrollments,
    loading 
  } = useData();
  
  const isCoach = isOwnProfile ? currentUser?.role === 'coach' : false;
  
  // Get sessions data
  const userEnrollments = getUserEnrollments(userId);
  const coachSessions = isCoach ? getCoachSessions(userId) : [];
  
  // Process enrollments to group by status
  const pendingEnrollments = userEnrollments.filter(e => e.status === 'pending');
  const approvedEnrollments = userEnrollments.filter(e => e.status === 'approved');
  const rejectedEnrollments = userEnrollments.filter(e => e.status === 'rejected');
  
  if (loading) {
    return <div className="text-center py-6">Loading...</div>;
  }
  
  if (!isCoach && userEnrollments.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 mx-auto text-gray-300" />
        <h3 className="mt-4 text-lg font-medium">No Sessions</h3>
        <p className="text-gray-500 mb-6">
          {isOwnProfile 
            ? "You haven't enrolled in any sessions yet." 
            : "This user hasn't enrolled in any sessions yet."}
        </p>
        {isOwnProfile && (
          <Link to="/sessions">
            <Button>Browse Sessions</Button>
          </Link>
        )}
      </div>
    );
  }
  
  if (isCoach && coachSessions.length === 0 && userEnrollments.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 mx-auto text-gray-300" />
        <h3 className="mt-4 text-lg font-medium">No Sessions</h3>
        <p className="text-gray-500 mb-6">
          {isOwnProfile 
            ? "You haven't created any sessions yet." 
            : "This coach hasn't created any sessions yet."}
        </p>
        {isOwnProfile && (
          <Link to="/sessions/create">
            <Button>Create Session</Button>
          </Link>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {isCoach && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">My Sessions</h3>
            {isOwnProfile && (
              <Link to="/sessions/create">
                <Button size="sm">Create Session</Button>
              </Link>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coachSessions.map(session => (
              <CoachSessionCard
                key={session.id}
                session={session}
                sessionEnrollments={sessionEnrollments.filter(e => e.sessionId === session.id)}
              />
            ))}
          </div>
          
          {userEnrollments.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-medium mb-4">
                {isOwnProfile ? "Sessions I'm Enrolled In" : "Sessions Enrolled In"}
              </h3>
            </div>
          )}
        </>
      )}
      
      {pendingEnrollments.length > 0 && (
        <>
          <h4 className="text-md font-medium">Pending Enrollment Requests</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingEnrollments.map(enrollment => {
              const session = sessions.find(s => s.id === enrollment.sessionId);
              if (!session) return null;
              
              return (
                <EnrollmentCard
                  key={enrollment.id}
                  session={session}
                  status={enrollment.status}
                />
              );
            })}
          </div>
        </>
      )}
      
      {approvedEnrollments.length > 0 && (
        <>
          <h4 className="text-md font-medium">Upcoming Sessions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvedEnrollments.map(enrollment => {
              const session = sessions.find(s => s.id === enrollment.sessionId);
              if (!session) return null;
              
              return (
                <EnrollmentCard
                  key={enrollment.id}
                  session={session}
                  status={enrollment.status}
                />
              );
            })}
          </div>
        </>
      )}
      
      {rejectedEnrollments.length > 0 && isOwnProfile && (
        <>
          <h4 className="text-md font-medium">Declined Requests</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rejectedEnrollments.map(enrollment => {
              const session = sessions.find(s => s.id === enrollment.sessionId);
              if (!session) return null;
              
              return (
                <EnrollmentCard
                  key={enrollment.id}
                  session={session}
                  status={enrollment.status}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

interface EnrollmentCardProps {
  session: Session;
  status: string;
}

const EnrollmentCard: React.FC<EnrollmentCardProps> = ({ session, status }) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">{session.title}</CardTitle>
            <div className="text-sm text-gray-500">by {session.coachName}</div>
          </div>
          <Badge 
            variant={
              status === 'approved' 
                ? 'success' 
                : status === 'rejected' 
                ? 'destructive' 
                : 'outline'
            }
          >
            {status === 'approved' ? 'Approved' : status === 'rejected' ? 'Declined' : 'Pending'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">{session.duration}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">${session.price}</span>
            </div>
          </div>
          
          {session.startTime && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {format(new Date(session.startTime), 'MMM d, yyyy')}
              </span>
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <Link to={`/sessions/${session.id}`}>
            <Button variant="outline" size="sm" className="w-full">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

interface CoachSessionCardProps {
  session: Session;
  sessionEnrollments: SessionEnrollment[];
}

const CoachSessionCard: React.FC<CoachSessionCardProps> = ({ session, sessionEnrollments }) => {
  const pendingCount = sessionEnrollments.filter(e => e.status === 'pending').length;
  const approvedCount = sessionEnrollments.filter(e => e.status === 'approved').length;
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">{session.title}</CardTitle>
          <Badge variant={session.isActive ? 'success' : 'destructive'}>
            {session.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Session Type:</span>
            <Badge variant={session.sessionType === 'one_on_one' ? 'outline' : 'secondary'}>
              {session.sessionType === 'one_on_one' ? '1:1 Session' : 'Group Class'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Price:</span>
            <span className="font-medium">${session.price}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Enrollments:</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{approvedCount}</Badge>
              {pendingCount > 0 && (
                <Badge variant="secondary">{pendingCount} pending</Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <Link to={`/sessions/${session.id}/manage`}>
            <Button size="sm" className="w-full">
              Manage Session
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionsTab;
