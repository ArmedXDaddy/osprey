
import React, { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import EventCard from '@/components/shared/EventCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, List, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { Event, UserRole } from '@/types';
import { toast } from '@/hooks/use-toast';

const Events = () => {
  const { events: contextEvents, loading: contextLoading } = useData();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'alphabetical'>('newest');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        setLoading(true);
        
        // Get all events from Supabase
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        if (data) {
          const formattedEvents: Event[] = data.map(event => ({
            id: event.id,
            title: event.title,
            description: event.description,
            creatorId: event.creator_id,
            creatorName: event.creator_name,
            creatorRole: event.creator_role as UserRole, // Cast to UserRole
            location: event.location,
            date: new Date(event.date),
            image: event.image,
            attendees: event.attendees || [],
            privacy: event.privacy,
            price: event.price,
            pendingRequests: event.pending_requests,
            createdAt: new Date(event.created_at)
          }));
          
          setEvents(formattedEvents);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        toast({
          title: "Error",
          description: "Could not load events",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllEvents();
  }, []);

  if (loading || contextLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 bg-gray-200 animate-pulse rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-200 h-72 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  // Filter events based on search term
  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.creatorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort events based on selected option
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'popular':
        return (Array.isArray(b.attendees) ? b.attendees.length : 0) - (Array.isArray(a.attendees) ? a.attendees.length : 0);
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  // Get user's events (events created by the current user)
  const userEvents = currentUser ? events.filter(event => event.creatorId === currentUser?.id) : [];

  // Get upcoming events
  const upcomingEvents = sortedEvents.filter(event => new Date(event.date) > new Date());

  // Get past events
  const pastEvents = sortedEvents.filter(event => new Date(event.date) < new Date());

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-muted-foreground">Discover and join upcoming fitness events</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search events..."
              className="w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link to="/create-event">
            <Button>Create Event</Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          {currentUser && <TabsTrigger value="my">My Events</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Filter className="h-4 w-4" />
                  Sort by: {sortBy === 'newest' ? 'Newest' : sortBy === 'popular' ? 'Popular' : 'A-Z'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy('newest')}>
                  Newest
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('popular')}>
                  Popular
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('alphabetical')}>
                  Alphabetical (A-Z)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="flex border rounded-md overflow-hidden">
              <Button variant="ghost" size="sm" className="rounded-none border-r">
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
              <Button variant="ghost" size="sm" className="rounded-none">
                <CalendarDays className="h-4 w-4 mr-2" />
                Calendar
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedEvents.map((event) => (
              <Link to={`/events/${event.id}`} key={event.id}>
                <EventCard event={event} />
              </Link>
            ))}
          </div>

          {sortedEvents.length === 0 && (
            <div className="text-center py-12">
              <CalendarDays className="h-12 w-12 mx-auto text-gray-300" />
              <h3 className="mt-4 text-lg font-medium">No events found</h3>
              <p className="text-gray-500">Try adjusting your search or create a new event</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <Link to={`/events/${event.id}`} key={event.id}>
                  <EventCard event={event} />
                </Link>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <CalendarDays className="h-12 w-12 mx-auto text-gray-300" />
                <h3 className="mt-4 text-lg font-medium">No upcoming events</h3>
                <p className="text-gray-500">Check back later or create your own event</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="past" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.length > 0 ? (
              pastEvents.map((event) => (
                <Link to={`/events/${event.id}`} key={event.id}>
                  <EventCard event={event} />
                </Link>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <CalendarDays className="h-12 w-12 mx-auto text-gray-300" />
                <h3 className="mt-4 text-lg font-medium">No past events</h3>
                <p className="text-gray-500">Past events will appear here</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        {currentUser && (
          <TabsContent value="my" className="space-y-4">
            {userEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userEvents.map((event) => (
                  <Link to={`/events/${event.id}`} key={event.id}>
                    <EventCard event={event} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarDays className="h-12 w-12 mx-auto text-gray-300" />
                <h3 className="mt-4 text-lg font-medium">You haven't created any events yet</h3>
                <Link to="/create-event" className="mt-4 inline-block">
                  <Button>Create Your First Event</Button>
                </Link>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Events;
