
import React, { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SessionCard from '@/components/shared/SessionCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Session, SessionEnrollment } from '@/types';

const Sessions = () => {
  const { currentUser } = useAuth();
  const { sessions, sessionEnrollments, loading } = useData();
  const navigate = useNavigate();
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [filter, setFilter] = useState<'all' | 'group' | 'one_on_one'>('all');
  
  // Group user's enrollments by session ID for easy lookup
  const userEnrollmentsBySessionId = sessionEnrollments
    .filter(enrollment => currentUser && enrollment.userId === currentUser.id)
    .reduce((acc, enrollment) => {
      acc[enrollment.sessionId] = enrollment;
      return acc;
    }, {} as Record<string, SessionEnrollment>);
  
  useEffect(() => {
    if (sessions) {
      setFilteredSessions(sessions.filter(session => {
        if (filter === 'all') return true;
        return session.sessionType === filter;
      }));
    }
  }, [sessions, filter]);
  
  const isCoach = currentUser?.role === 'coach';
  
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Training Sessions</h1>
          <p className="text-gray-500">Browse and enroll in training sessions</p>
        </div>
        
        {isCoach && (
          <Button onClick={() => navigate('/sessions/create')}>
            <Plus className="h-4 w-4 mr-2" /> Create Session
          </Button>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs defaultValue="all" className="w-full max-w-md" onValueChange={(value) => setFilter(value as any)}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="all">All Sessions</TabsTrigger>
            <TabsTrigger value="group">Group Classes</TabsTrigger>
            <TabsTrigger value="one_on_one">1:1 Sessions</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {filteredSessions.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No sessions available</h3>
          <p className="text-gray-500 mb-6">
            {filter !== 'all' 
              ? `There are currently no ${filter} sessions available.` 
              : "There are currently no sessions available."}
          </p>
          {isCoach && (
            <Button onClick={() => navigate('/sessions/create')}>
              <Plus className="h-4 w-4 mr-2" /> Create a Session
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map(session => {
            const enrollment = userEnrollmentsBySessionId[session.id];
            const isEnrolled = !!enrollment;
            
            return (
              <SessionCard 
                key={session.id} 
                session={session} 
                isEnrolled={isEnrolled}
                enrollment={enrollment}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Sessions;
