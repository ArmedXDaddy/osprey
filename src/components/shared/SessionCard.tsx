
import React from 'react';
import { Session } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, MapPin, Calendar, Users, Video } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/hooks/use-toast';

interface SessionCardProps {
  session: Session;
  isEnrolled?: boolean;
  enrollment?: any;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, isEnrolled = false, enrollment }) => {
  const { currentUser } = useAuth();
  const { enrollInSession, cancelEnrollment } = useData();
  const { toast } = useToast();
  
  const handleEnroll = async () => {
    try {
      if (!currentUser) {
        toast({
          title: "Authentication required",
          description: "Please log in to enroll in this session",
          variant: "destructive"
        });
        return;
      }
      
      await enrollInSession(session.id);
    } catch (error) {
      console.error('Error enrolling in session:', error);
    }
  };
  
  const handleCancel = async () => {
    if (!enrollment) return;
    
    try {
      await cancelEnrollment(enrollment.id);
    } catch (error) {
      console.error('Error canceling enrollment:', error);
    }
  };
  
  // Support for both formats of coach information
  const coachId = session.coachId || (session.coach?.id || '');
  const isCoach = currentUser?.role === 'coach';
  const isOwnSession = isCoach && currentUser?.id === coachId;
  const coachName = session.coachName || (session.coach?.name || '');
  
  // Support for both type and sessionType 
  const type = session.type || session.sessionType || 'one_on_one';
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{session.title}</CardTitle>
            <div className="text-sm text-gray-500">by {coachName}</div>
          </div>
          <Badge variant={type === 'one_on_one' ? 'outline' : 'secondary'}>
            {type === 'one_on_one' ? '1:1 Session' : 'Group Class'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <p className="text-gray-700 text-sm mb-4">{session.description}</p>
        
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
                {format(session.startTime, 'PPp')}
              </span>
            </div>
          )}
          
          {session.location && !session.isOnline && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">{session.location}</span>
            </div>
          )}
          
          {session.isOnline && (
            <div className="flex items-center gap-1">
              <Video className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">Online Session</span>
            </div>
          )}
          
          {(type === 'group' || session.capacity) && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                Capacity: {session.capacity || 'unlimited'} people
              </span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        {isOwnSession ? (
          <Button variant="outline" className="w-full" asChild>
            <a href={`/sessions/${session.id}/manage`}>Manage Session</a>
          </Button>
        ) : isEnrolled ? (
          <div className="w-full space-y-2">
            {enrollment?.status === 'pending' ? (
              <Badge className="w-full justify-center py-1" variant="outline">Pending Approval</Badge>
            ) : enrollment?.status === 'approved' ? (
              <Badge className="w-full justify-center py-1" variant="success">Approved</Badge>
            ) : (
              <Badge className="w-full justify-center py-1" variant="destructive">Rejected</Badge>
            )}
            
            <Button variant="outline" className="w-full" onClick={handleCancel}>
              Cancel Enrollment
            </Button>
          </div>
        ) : (
          <Button className="w-full" onClick={handleEnroll} disabled={!session.isActive}>
            {session.isActive ? (
              type === 'one_on_one' ? 'Request Session' : 'Enroll Now'
            ) : (
              'Currently Unavailable'
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default SessionCard;
