
// Let's update just the createSession function to fix the endTime and status issues

const createSession = async (sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'coachId' | 'coachName'>): Promise<Session> => {
  if (!currentUser) throw new Error('You must be logged in to create a session');
  console.log('Creating session:', sessionData);
  
  // Mock implementation
  const newSession: Session = {
    id: Date.now().toString(),
    title: sessionData.title,
    description: sessionData.description,
    coachId: currentUser.id,
    coachName: currentUser.name,
    sessionType: sessionData.sessionType,
    capacity: sessionData.capacity,
    price: sessionData.price,
    duration: sessionData.duration,
    startTime: sessionData.startTime,
    location: sessionData.location,
    meetingUrl: sessionData.meetingUrl,
    isOnline: sessionData.isOnline,
    isActive: sessionData.isActive !== undefined ? sessionData.isActive : true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  setSessions(prev => [newSession, ...prev]);
  return newSession;
};
