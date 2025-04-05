import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { SessionEnrollment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ManageSession = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { sessionEnrollments, updateEnrollmentStatus } = useData();
  const [enrollments, setEnrollments] = useState<SessionEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();
  
  useEffect(() => {
    if (sessionId && sessionEnrollments) {
      const filteredEnrollments = sessionEnrollments.filter(e => e.sessionId === sessionId);
      setEnrollments(filteredEnrollments);
      setLoading(false);
    }
  }, [sessionId, sessionEnrollments, refreshKey]);
  
  if (loading) {
    return <div>Loading...</div>;
  }

  const handleStatusUpdate = async (enrollmentId: string, newStatus: 'approved' | 'rejected') => {
    try {
      // Cast the status to SessionStatus to satisfy TypeScript
      await updateEnrollmentStatus(enrollmentId, newStatus as any);
      
      // Update local state with type casting to handle the mismatch
      setEnrollments(prevEnrollments => 
        prevEnrollments.map(e => 
          e.id === enrollmentId ? { ...e, status: newStatus as any } : e
        )
      );
      
      toast({
        title: `Enrollment ${newStatus === 'approved' ? 'Approved' : 'Rejected'}`,
        description: `You have ${newStatus} the enrollment request.`
      });
    } catch (error: any) {
      console.error(`Error updating enrollment status:`, error);
      toast({
        title: "Error",
        description: error.message || "Failed to update enrollment status",
        variant: "destructive"
      });
    }
  };

  const handleApprove = (enrollmentId: string) => {
    handleStatusUpdate(enrollmentId, 'approved');
  };

  const handleReject = (enrollmentId: string) => {
    handleStatusUpdate(enrollmentId, 'rejected');
  };

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Manage Session Enrollments</h1>
      
      {enrollments.length === 0 ? (
        <p>No enrollment requests found for this session.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrollments.map(enrollment => (
            <Card key={enrollment.id}>
              <CardHeader>
                <CardTitle>Enrollment Request</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                  <strong>User:</strong> {enrollment.userName}
                </div>
                <div className="mb-2">
                  <strong>Email:</strong> {enrollment.userEmail}
                </div>
                <div className="mb-2">
                  <strong>Status:</strong>
                  {enrollment.status === 'pending' && (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                  {enrollment.status === 'approved' && (
                    <Badge variant="success">Approved</Badge>
                  )}
                  {enrollment.status === 'rejected' && (
                    <Badge variant="destructive">Rejected</Badge>
                  )}
                </div>
                <div className="flex justify-between">
                  {enrollment.status === 'pending' && (
                    <>
                      <Button variant="outline" onClick={() => handleApprove(enrollment.id)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button variant="destructive" onClick={() => handleReject(enrollment.id)}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageSession;
