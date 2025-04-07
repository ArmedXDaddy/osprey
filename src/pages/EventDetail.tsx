import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, MapPin, Users, Share2, ArrowLeft, Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import EventAnnouncements from '@/components/events/EventAnnouncements';
import EventAttendees from '@/components/events/EventAttendees';
import { AttendeeDetail } from '@/types';

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { events, joinEvent, leaveEvent, deleteEvent, announcements, postAnnouncement } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isAttending, setIsAttending] = useState(false);
  const [attendeeDetails, setAttendeeDetails] = useState<AttendeeDetail[]>([]);
  
  const event = events.find(e => e.id === id);
  
  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <h2 className="text-2xl font-bold">Event not found</h2>
        <p className="text-muted-foreground">The event you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/events')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
      </div>
    );
  }
  
  useEffect(() => {
    if (currentUser && event.attendees) {
      const isUserAttending = event.attendees.includes(currentUser.id);
      setIsAttending(isUserAttending);
      
      const mockFetchAttendeeDetails = () => {
        return event.attendees.map((attendeeId, index) => ({
          id: attendeeId,
          name: attendeeId === currentUser.id ? currentUser.name : `Attendee ${index + 1}`,
          profileImage: attendeeId === currentUser.id 
            ? currentUser.profileImage 
            : undefined
        }));
      };
      
      setAttendeeDetails(mockFetchAttendeeDetails());
    }
  }, [currentUser, event]);
  
  const isCreator = currentUser && event.creatorId === currentUser.id;
  
  const handleAttendEvent = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to attend events.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (isAttending) {
        await leaveEvent(event.id);
        setIsAttending(false);
        setAttendeeDetails(prevDetails => 
          prevDetails.filter(attendee => attendee.id !== currentUser.id)
        );
      } else {
        await joinEvent(event.id);
        setIsAttending(true);
        if (currentUser) {
          setAttendeeDetails(prevDetails => [
            ...prevDetails, 
            {
              id: currentUser.id,
              name: currentUser.name,
              profileImage: currentUser.profileImage
            }
          ]);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  };
  
  const handleCancelEvent = async () => {
    if (!currentUser || !isCreator) return;
    
    try {
      await deleteEvent(event.id, 'cancelled');
      
      navigate('/events');
      
      toast({
        title: "Event cancelled",
        description: "The event has been cancelled and removed from the list."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel the event",
        variant: "destructive"
      });
    }
  };
  
  const handleMarkEventDone = async () => {
    if (!currentUser || !isCreator) return;
    
    try {
      await deleteEvent(event.id, 'completed');
      
      navigate('/events');
      
      toast({
        title: "Event completed",
        description: "The event has been marked as completed and archived."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to mark the event as done",
        variant: "destructive"
      });
    }
  };
  
  const handleShareEvent = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Event link has been copied to your clipboard."
    });
  };
  
  const attendeesCount = Array.isArray(event.attendees) ? event.attendees.length : 0;
  
  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" onClick={() => navigate('/events')} className="pl-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
      </div>
      
      <div className="relative rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <img 
          src={event.image || 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2882&q=80'} 
          alt={event.title} 
          className="w-full h-64 md:h-96 object-cover"
        />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
          <div className="max-w-4xl mx-auto">
            <Badge className={`mb-2 uppercase ${
              event.creatorRole === 'influencer' ? 'bg-red-500' : 
              event.creatorRole === 'coach' ? 'bg-teal-500' : 
              event.creatorRole === 'company' ? 'bg-blue-500' : 
              'bg-purple-500'
            }`}>
              {event.creatorRole}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
            <div className="flex items-center gap-2">
              <p className="text-sm md:text-base">By {event.creatorName}</p>
              <div className="w-1 h-1 rounded-full bg-white/80"></div>
              <p className="text-sm md:text-base">
                {attendeesCount} {attendeesCount === 1 ? 'person' : 'people'} attending
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-3">About this Event</h2>
            <p className="text-gray-700">{event.description}</p>
          </div>
          
          <Separator />
          
          <div>
            <h2 className="text-xl font-semibold mb-3">Host</h2>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(event.creatorName)}&background=random`} />
                <AvatarFallback>{event.creatorName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{event.creatorName}</p>
                <p className="text-sm text-muted-foreground capitalize">{event.creatorRole}</p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h2 className="text-xl font-semibold mb-3">
              Attendees <span className="text-muted-foreground font-normal text-base">({attendeesCount})</span>
            </h2>
            <EventAttendees 
              attendees={attendeeDetails} 
              totalCount={attendeesCount} 
            />
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium">Date and Time</p>
                <p className="text-gray-600">
                  {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="text-gray-600">
                  {format(new Date(event.date), 'h:mm a')}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium">Location</p>
                <p className="text-gray-600">{event.location}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium">Attendees</p>
                <p className="text-gray-600">
                  {attendeesCount} {attendeesCount === 1 ? 'person' : 'people'} attending
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium">Created</p>
                <p className="text-gray-600">
                  {format(new Date(event.createdAt), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            {isCreator ? (
              <>
                <Button 
                  variant="destructive" 
                  onClick={handleCancelEvent}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel Event
                </Button>
                <Button 
                  onClick={handleMarkEventDone}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Mark as Done
                </Button>
              </>
            ) : (
              <Button 
                onClick={handleAttendEvent}
                className={isAttending ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {isAttending ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Attending
                  </>
                ) : (
                  "Attend Event"
                )}
              </Button>
            )}
            
            <Button variant="outline" onClick={handleShareEvent}>
              <Share2 className="mr-2 h-4 w-4" />
              Share Event
            </Button>
          </div>
        </div>
      </div>
      
      {event && (
        <div className="mt-8 max-w-4xl mx-auto">
          <EventAnnouncements
            announcements={announcements.filter(a => a.eventId === event.id)}
            eventId={event.id}
            isCreator={currentUser?.id === event.creatorId}
            onPostAnnouncement={postAnnouncement}
            hasJoined={isAttending}
          />
        </div>
      )}
    </div>
  );
};

export default EventDetail;
