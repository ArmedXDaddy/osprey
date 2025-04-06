
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, MapPin, Users, Share2, ArrowLeft, Check, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Event, UserRole, EventPrivacy } from '@/types';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isAttending, setIsAttending] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        
        if (!id) return;
        
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          console.error('Error fetching event:', error);
          return;
        }
        
        if (data) {
          // Format the event data to match our Event type
          const formattedEvent: Event = {
            id: data.id,
            title: data.title,
            description: data.description,
            creatorId: data.creator_id,
            creatorName: data.creator_name,
            creatorRole: data.creator_role as UserRole,
            location: data.location,
            date: new Date(data.date),
            image: data.image,
            attendees: data.attendees || [],
            privacy: data.privacy as EventPrivacy,
            price: data.price,
            pendingRequests: data.pending_requests,
            createdAt: new Date(data.created_at)
          };
          
          setEvent(formattedEvent);
          
          // Check if current user is attending
          if (currentUser && Array.isArray(data.attendees)) {
            setIsAttending(data.attendees.includes(currentUser.id));
          }
          
          // Check if current user is the creator
          if (currentUser && data.creator_id === currentUser.id) {
            setIsCreator(true);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvent();
  }, [id, currentUser]);
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="h-8 w-40 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-4 w-64 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }
  
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
  
  const handleAttendEvent = async () => {
    if (!currentUser) {
      toast({
        title: "Login required",
        description: "Please log in to attend events",
        variant: "destructive"
      });
      return;
    }
    
    try {
      let updatedAttendees = [...event.attendees];
      
      if (isAttending) {
        // Remove user from attendees
        updatedAttendees = updatedAttendees.filter(id => id !== currentUser.id);
      } else {
        // Add user to attendees
        updatedAttendees.push(currentUser.id);
      }
      
      // Update event in Supabase
      const { error } = await supabase
        .from('events')
        .update({ attendees: updatedAttendees })
        .eq('id', event.id);
      
      if (error) throw error;
      
      // Update local state
      setEvent({
        ...event,
        attendees: updatedAttendees
      });
      
      setIsAttending(!isAttending);
      
      if (!isAttending) {
        toast({
          title: "You're attending this event!",
          description: "You've been added to the attendee list."
        });
      } else {
        toast({
          title: "You're no longer attending",
          description: "You've been removed from the attendee list."
        });
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast({
        title: "Error",
        description: "There was a problem updating your attendance status.",
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
  
  const handleDeleteEvent = async () => {
    if (!currentUser || !isCreator || !event) {
      toast({
        title: "Error",
        description: "You don't have permission to delete this event.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id);
      
      if (error) throw error;
      
      toast({
        title: "Event deleted",
        description: "The event has been successfully deleted."
      });
      
      // Navigate back to events page
      navigate('/events');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "There was a problem deleting the event.",
        variant: "destructive"
      });
    }
  };
  
  const handleEditEvent = () => {
    navigate(`/events/edit/${event.id}`);
  };
  
  const attendeesCount = Array.isArray(event.attendees) ? event.attendees.length : 0;
  
  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <div>
        <Button variant="ghost" onClick={() => navigate('/events')} className="pl-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
      </div>
      
      {/* Event header */}
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
              <p className="text-sm md:text-base">{attendeesCount} attendees</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
        {/* Event details */}
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
            <h2 className="text-xl font-semibold mb-3">Attendees</h2>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: Math.min(8, attendeesCount) }).map((_, i) => (
                <Avatar key={i} className="h-10 w-10">
                  <AvatarImage src={`https://i.pravatar.cc/150?img=${i + 10}`} />
                  <AvatarFallback>U{i}</AvatarFallback>
                </Avatar>
              ))}
              {attendeesCount > 8 && (
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm">
                  +{attendeesCount - 8}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
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
                <p className="text-gray-600">{attendeesCount} people attending</p>
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
            {/* Show edit and delete buttons only if the current user is the creator */}
            {isCreator && (
              <>
                <Button variant="outline" onClick={handleEditEvent}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Event
                </Button>
                
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Event
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the event
                        and remove it from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteEvent} className="bg-red-600 hover:bg-red-700">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
            
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
            
            <Button variant="outline" onClick={handleShareEvent}>
              <Share2 className="mr-2 h-4 w-4" />
              Share Event
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
