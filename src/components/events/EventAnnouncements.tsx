
import React, { useState } from 'react';
import { Megaphone, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Announcement } from '@/types';

interface EventAnnouncementsProps {
  announcements: Announcement[];
  eventId: string;
  isCreator: boolean;
  onPostAnnouncement: (eventId: string, content: string) => Promise<void>;
  hasJoined?: boolean;
}

const EventAnnouncements = ({
  announcements,
  eventId,
  isCreator,
  onPostAnnouncement,
  hasJoined = false
}: EventAnnouncementsProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [announcementContent, setAnnouncementContent] = useState('');
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const handlePostAnnouncement = async () => {
    if (!announcementContent.trim()) {
      toast({
        title: "Cannot post empty announcement",
        variant: "destructive"
      });
      return;
    }

    try {
      await onPostAnnouncement(eventId, announcementContent);
      setAnnouncementContent('');
      setIsCreating(false);
    } catch (error) {
      toast({
        title: "Failed to post announcement",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  // If the user is not the creator and hasn't joined, show a message to join first
  if (!isCreator && !hasJoined) {
    return (
      <div className="py-8 text-center border rounded-lg bg-muted/20">
        <Megaphone className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-lg font-medium">Join to see announcements</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Attend this event to access announcements from the organizer
        </p>
      </div>
    );
  }

  if (!announcements || announcements.length === 0) {
    if (!isCreator) {
      return (
        <div className="py-8 text-center border rounded-lg bg-muted/20">
          <Megaphone className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium">No announcements yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Check back later for updates from the organizer
          </p>
        </div>
      );
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          Announcements
        </h3>
        {isCreator && !isCreating && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            New Announcement
          </Button>
        )}
      </div>

      {isCreating && (
        <div className="border rounded-md p-4 space-y-4 bg-background">
          <Textarea
            placeholder="Type your announcement here..."
            value={announcementContent}
            onChange={(e) => setAnnouncementContent(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setIsCreating(false);
                setAnnouncementContent('');
              }}
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handlePostAnnouncement}
            >
              Post Announcement
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {announcements && announcements.length > 0 && announcements.map((announcement) => (
          <div 
            key={announcement.id} 
            className="border rounded-md p-4 bg-background"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-primary" />
                <span className="font-medium">{announcement.creatorName}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
            <p className="mt-2 whitespace-pre-wrap">{announcement.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventAnnouncements;
