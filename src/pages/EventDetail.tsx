
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Event, EventPrivacy } from '@/types';
import { Calendar, Clock, MapPin, Users, Globe, Lock, DollarSign, Edit, Trash2, Share2, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import EventAttendeesSection from '@/components/event/EventAttendeesSection';
import EventRequestsSection from '@/components/event/EventRequestsSection';
import EventAnnouncementsSection from '@/components/event/EventAnnouncementsSection';

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { events, joinEvent, leaveEvent, deleteEvent, postAnnouncement } = useData();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [isSubmittingAnnouncement, setIsSubmittingAnnouncement] = useState(false);
  const [deleteReason, setDeleteReason] = useState<'cancelled' | 'completed'>('cancelled');

  useEffect(() => {
    if (id && events.length > 0) {
      const foundEvent = events.find(event => event.id === id);
      if (foundEvent) {
        setEvent(foundEvent);
      } else {
        toast({
          variant: "destructive",
          title: "Event not found",
          description: "The event you're looking for doesn't exist or has been removed."
        });
        navigate('/events');
      }
    }
  }, [id, events, navigate]);

  const handleJoinEvent = async () => {
    if (!event) return;
    
    try {
      await joinEvent(event.id);
      toast({
        title: "Success",
        description: "You've successfully joined this event.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "There was an error joining the event."
      });
    }
  };

  const handleLeaveEvent = async () => {
    if (!event) return;
    
    try {
      await leaveEvent(event.id);
      toast({
        title: "Success",
        description: "You've successfully left this event.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "There was an error leaving the event."
      });
    }
  };

  const handleDeleteEvent = async () => {
    if (!event) return;
    
    try {
      await deleteEvent(event.id, deleteReason);
      toast({
        title: "Event deleted",
        description: deleteReason === 'cancelled' 
          ? "The event has been cancelled." 
          : "The event has been marked as completed."
      });
      setIsDeleteDialogOpen(false);
      navigate('/events');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "There was an error deleting the event."
      });
    }
  };

  const handleSubmitAnnouncement = async () => {
    if (!event || !announcement.trim()) return;
    
    setIsSubmittingAnnouncement(true);
    try {
      await postAnnouncement(event.id, announcement);
      setAnnouncement('');
      setIsAnnouncementDialogOpen(false);
      toast({
        title: "Announcement posted",
        description: "Your announcement has been shared with all attendees."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "There was an error posting the announcement."
      });
    } finally {
      setIsSubmittingAnnouncement(false);
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link copied",
        description: "Event link has been copied to clipboard."
      });
      setIsShareDialogOpen(false);
    }).catch(() => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy link to clipboard."
      });
    });
  };

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-xl">Loading event details...</div>
      </div>
    );
  }

  const isAttending = currentUser && event.attendees?.includes(currentUser.id);
  const isCreator = currentUser && event.creatorId === currentUser.id;
  const isPaidEvent = event.privacy === 'paid' && event.price && event.price > 0;
  const eventDate = new Date(event.date);
  const isPastEvent = eventDate < new Date();

  const renderPrivacyBadge = () => {
    switch (event.privacy) {
      case 'public':
        return <Badge variant="outline" className="flex gap-1 items-center"><Globe className="h-3 w-3" /> Public</Badge>;
      case 'private':
        return <Badge variant="outline" className="flex gap-1 items-center"><Lock className="h-3 w-3" /> Private</Badge>;
      case 'paid':
        return <Badge variant="outline" className="flex gap-1 items-center"><DollarSign className="h-3 w-3" /> Paid</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container max-w-5xl py-8">
      <div className="space-y-8">
        {/* Event header */}
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold">{event.title}</h1>
              <p className="text-muted-foreground">Hosted by {event.creatorName}</p>
            </div>
            <div className="flex gap-2">
              {isCreator && !isPastEvent && (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/events/${event.id}/edit`} className="flex items-center gap-1">
                      <Edit className="h-4 w-4" /> Edit
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1 text-destructive hover:text-destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" /> Cancel
                  </Button>
                </>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => setIsShareDialogOpen(true)}
              >
                <Share2 className="h-4 w-4" /> Share
              </Button>
            </div>
          </div>

          {/* Event cover image */}
          {event.image && (
            <div className="rounded-lg overflow-hidden h-64 relative">
              <img 
                src={event.image} 
                alt={event.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Event metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</p>
                    <p className="text-sm text-muted-foreground">
                      {isPastEvent ? 'Event has ended' : 'Upcoming event'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{format(new Date(event.date), 'h:mm a')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{event.attendees?.length || 0} attendees</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {renderPrivacyBadge()}
                  {isPaidEvent && (
                    <Badge variant="secondary">${event.price}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About this event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{event.description}</p>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                {!isCreator && (
                  <>
                    {!isAttending ? (
                      <Button 
                        className="w-full" 
                        onClick={handleJoinEvent}
                        disabled={isPastEvent}
                      >
                        {isPaidEvent ? 'Buy Ticket' : 'RSVP to Event'}
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={handleLeaveEvent}
                        disabled={isPastEvent}
                      >
                        Cancel RSVP
                      </Button>
                    )}
                  </>
                )}
                
                {isCreator && !isPastEvent && (
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => setIsAnnouncementDialogOpen(true)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Post Announcement
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Event content */}
        <Tabs defaultValue="attendees" className="space-y-4">
          <TabsList>
            <TabsTrigger value="attendees">Attendees</TabsTrigger>
            {isCreator && (
              <TabsTrigger value="requests">
                Requests
                {event.pendingRequests && event.pendingRequests > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {event.pendingRequests}
                  </Badge>
                )}
              </TabsTrigger>
            )}
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="attendees" className="space-y-4">
            <EventAttendeesSection event={event} />
          </TabsContent>
          
          {isCreator && (
            <TabsContent value="requests" className="space-y-4">
              <EventRequestsSection eventId={event.id} />
            </TabsContent>
          )}
          
          <TabsContent value="announcements" className="space-y-4">
            <EventAnnouncementsSection eventId={event.id} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete/cancel event dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel or Complete Event?</DialogTitle>
            <DialogDescription>
              Choose an action for this event. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 py-4">
            <div className="flex items-center space-x-2">
              <input 
                type="radio" 
                id="cancel" 
                name="deleteReason" 
                value="cancelled" 
                checked={deleteReason === 'cancelled'} 
                onChange={() => setDeleteReason('cancelled')}
                className="text-primary focus:ring-primary"
              />
              <Label htmlFor="cancel">Cancel Event</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input 
                type="radio" 
                id="complete" 
                name="deleteReason" 
                value="completed" 
                checked={deleteReason === 'completed'} 
                onChange={() => setDeleteReason('completed')}
                className="text-primary focus:ring-primary"
              />
              <Label htmlFor="complete">Mark as Completed</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              variant={deleteReason === 'cancelled' ? 'destructive' : 'default'} 
              onClick={handleDeleteEvent}
            >
              {deleteReason === 'cancelled' ? 'Cancel Event' : 'Mark as Completed'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share event dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Event</DialogTitle>
            <DialogDescription>
              Share this event with your friends and network.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center space-x-2 py-4">
            <Input 
              readOnly 
              value={window.location.href} 
              className="flex-1"
            />
            <Button type="button" onClick={handleCopyLink}>
              Copy
            </Button>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsShareDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Post announcement dialog */}
      <Dialog open={isAnnouncementDialogOpen} onOpenChange={setIsAnnouncementDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post Announcement</DialogTitle>
            <DialogDescription>
              Share important information with all attendees of this event.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="announcement">Announcement</Label>
            <Textarea 
              id="announcement" 
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="Write your announcement here..."
              rows={5}
              className="mt-2"
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsAnnouncementDialogOpen(false)}
              disabled={isSubmittingAnnouncement}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSubmitAnnouncement}
              disabled={!announcement.trim() || isSubmittingAnnouncement}
            >
              {isSubmittingAnnouncement ? "Posting..." : "Post Announcement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventDetail;
