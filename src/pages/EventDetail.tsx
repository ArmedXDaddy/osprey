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
import EventPaymentButton from '@/components/event/EventPaymentButton';
import EventRegistrationDialog from '@/components/events/EventRegistrationDialog';
import EventAttendeesDetail from '@/components/events/EventAttendeesDetail';
import { AttendeeDetail, EventRegistration } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { events, joinEvent, leaveEvent, deleteEvent, announcements, postAnnouncement } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isAttending, setIsAttending] = useState(false);
  const [attendeeDetails, setAttendeeDetails] = useState<AttendeeDetail[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [showRegistration, setShowRegistration] = useState(false);
  const [eventAnnouncements, setEventAnnouncements] = useState(announcements.filter(a => a.eventId === id));
  
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
    if (event) {
      const fetchEventAnnouncements = async () => {
        const { data, error } = await supabase
          .from('event_announcements')
          .select('*')
          .eq('event_id', event.id)
          .order('created_at', { ascending: false });
          
        if (!error && data) {
          const formattedAnnouncements = data.map(item => ({
            id: item.id,
            eventId: item.event_id,
            creatorId: item.creator_id,
            creatorName: item.creator_name,
            content: item.content,
            createdAt: new Date(item.created_at)
          }));
          setEventAnnouncements(formattedAnnouncements);
        }
      };
      
      fetchEventAnnouncements();
    }
  }, [event?.id]);
  
  useEffect(() => {
    if (currentUser && event) {
      const isUserAttending = event.attendees && event.attendees.includes(currentUser.id);
      setIsAttending(isUserAttending);
      
      const fetchAttendeeDetails = async () => {
        try {
          const attendeeIds = event.attendees || [];
          
          if (attendeeIds.length === 0) {
            setAttendeeDetails([]);
            setRegistrations([]);
            return;
          }
          
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, name, profile_image')
            .in('id', attendeeIds);
            
          if (profilesError) throw profilesError;
          
          if (profilesData) {
            const details: AttendeeDetail[] = profilesData.map(profile => ({
              id: profile.id,
              name: profile.name,
              profileImage: profile.profile_image
            }));
            
            setAttendeeDetails(details);
          }
          
          const { data: registrationsData, error: registrationsError } = await supabase
            .from('event_attendee_details')
            .select('*')
            .eq('event_id', event.id);
            
          if (registrationsError) throw registrationsError;
          
          if (registrationsData) {
            const regDetails: EventRegistration[] = registrationsData.map(reg => ({
              userId: reg.user_id,
              name: reg.name,
              email: reg.email,
              age: reg.age || undefined,
              gender: reg.gender || undefined,
              phone: reg.phone || undefined,
              emergencyContact: reg.emergency_contact || undefined,
              instagram: reg.instagram || undefined,
              twitter: reg.twitter || undefined,
              additionalInfo: reg.additional_info || undefined,
              registeredAt: new Date(reg.registered_at),
              profileImage: reg.profile_image
            }));
            
            setRegistrations(regDetails);
          }
        } catch (error) {
          console.error("Error fetching attendee details:", error);
        }
      };
      
      fetchAttendeeDetails();
    }
  }, [currentUser, event]);
  
  const isCreator = currentUser && event.creatorId === currentUser.id;
  
  const showRegistration = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to attend events.",
        variant: "destructive"
      });
      return;
    }
    
    setShowRegistration(true);
  };
  
  const handleAttendEvent = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to attend events.",
        variant: "destructive"
      });
      return;
    }
    
    if (isAttending) {
      try {
        await leaveEvent(event.id);
        setIsAttending(false);
        setAttendeeDetails(prevDetails => 
          prevDetails.filter(attendee => attendee.id !== currentUser.id)
        );
        setRegistrations(prevRegs => 
          prevRegs.filter(reg => reg.userId !== currentUser.id)
        );
        toast({
          title: "You're no longer attending",
          description: "You've been removed from the attendee list."
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "An error occurred",
          variant: "destructive"
        });
      }
    } else {
      if (event.privacy === 'paid' && event.price) {
        showRegistration();
      } else {
        showRegistration();
      }
    }
  };
  
  const handleRegister = async (registrationData: EventRegistration) => {
    try {
      await joinEvent(event.id);
      setIsAttending(true);
      
      if (currentUser) {
        const newAttendeeDetail: AttendeeDetail = {
          id: currentUser.id,
          name: registrationData.name,
          profileImage: currentUser.profileImage
        };
        
        setAttendeeDetails(prevDetails => {
          const existingIndex = prevDetails.findIndex(a => a.id === currentUser.id);
          if (existingIndex >= 0) {
            const updatedDetails = [...prevDetails];
            updatedDetails[existingIndex] = newAttendeeDetail;
            return updatedDetails;
          } else {
            return [...prevDetails, newAttendeeDetail];
          }
        });
        
        setRegistrations(prevRegs => {
          const existingIndex = prevRegs.findIndex(r => r.userId === currentUser.id);
          if (existingIndex >= 0) {
            const updatedRegs = [...prevRegs];
            updatedRegs[existingIndex] = registrationData;
            return updatedRegs;
          } else {
            return [...prevRegs, registrationData];
          }
        });
      }
      
      const { data } = await supabase
        .from('event_announcements')
        .select('*')
        .eq('event_id', event.id)
        .order('created_at', { ascending: false });
        
      if (data) {
        const formattedAnnouncements = data.map(item => ({
          id: item.id,
          eventId: item.event_id,
          creatorId: item.creator_id,
          creatorName: item.creator_name,
          content: item.content,
          createdAt: new Date(item.created_at)
        }));
        setEventAnnouncements(formattedAnnouncements);
      }
      
      toast({
        title: "Registration successful!",
        description: event.privacy === 'paid' && event.price 
          ? "Registration completed. Please proceed with payment." 
          : "You're now registered for this event."
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const handleCancelEvent = async () => {
    if (!currentUser || !isCreator) return;
    
    try {
      navigate('/events');
      
      await deleteEvent(event.id, 'cancelled');
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
      navigate('/events');
      
      await deleteEvent(event.id, 'completed');
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
  
  const attendeesCount = attendeeDetails.length;
  
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
          
          {isCreator ? (
            <Tabs defaultValue="attendees">
              <TabsList className="mb-4">
                <TabsTrigger value="attendees">Attendees</TabsTrigger>
                <TabsTrigger value="details">Registration Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="attendees">
                <h2 className="text-xl font-semibold mb-3">
                  Attendees <span className="text-muted-foreground font-normal text-base">({attendeesCount})</span>
                </h2>
                <EventAttendees 
                  attendees={attendeeDetails} 
                  totalCount={attendeesCount} 
                />
              </TabsContent>
              
              <TabsContent value="details">
                <EventAttendeesDetail 
                  attendees={registrations}
                  isCreator={isCreator}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-3">
                Attendees <span className="text-muted-foreground font-normal text-base">({attendeesCount})</span>
              </h2>
              <EventAttendees 
                attendees={attendeeDetails} 
                totalCount={attendeesCount} 
              />
            </div>
          )}
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
              <>
                {event.privacy === 'paid' && event.price ? (
                  <EventPaymentButton 
                    event={event}
                    isAttending={isAttending}
                    onJoin={handleAttendEvent}
                  />
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
                      "Register for Event"
                    )}
                  </Button>
                )}
              </>
            )}
            
            <Button variant="outline" onClick={handleShareEvent}>
              <Share2 className="mr-2 h-4 w-4" />
              Share Event
            </Button>
          </div>
        </div>
      </div>
      
      {event && (
        <div className="mt-8">
          <EventAnnouncements
            announcements={eventAnnouncements}
            eventId={event.id}
            isCreator={currentUser?.id === event.creatorId}
            onPostAnnouncement={postAnnouncement}
            hasJoined={isAttending}
          />
        </div>
      )}
      
      <EventRegistrationDialog
        isOpen={showRegistration}
        onClose={() => setShowRegistration(false)}
        eventTitle={event.title}
        eventId={event.id}
        onSubmit={handleRegister}
        isPaidEvent={event.privacy === 'paid'}
        price={event.price}
      />
    </div>
  );
};

export default EventDetail;
