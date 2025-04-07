
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Check, X, User, Users, Clipboard, Copy, Instagram, Twitter, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EventRegistration } from '@/types';
import { toast } from '@/hooks/use-toast';

interface EventAttendeesDetailProps {
  attendees: EventRegistration[];
  isCreator: boolean;
}

const AttendeeDetailDialog = ({ 
  attendee, 
  isOpen, 
  onClose 
}: { 
  attendee: EventRegistration; 
  isOpen: boolean; 
  onClose: () => void; 
}) => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${label} has been copied to clipboard.`
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={attendee.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(attendee.name)}&background=random`} />
              <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
            </Avatar>
            <span>{attendee.name}</span>
          </DialogTitle>
          <DialogDescription>
            Registered on {format(new Date(attendee.registeredAt), 'MMMM d, yyyy')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Email</p>
              <div className="flex items-center justify-between">
                <p className="text-sm">{attendee.email}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => copyToClipboard(attendee.email, 'Email')}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            
            {attendee.phone && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Phone</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm">{attendee.phone}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyToClipboard(attendee.phone || '', 'Phone')}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
            
            {attendee.age && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Age</p>
                <p className="text-sm">{attendee.age}</p>
              </div>
            )}
            
            {attendee.gender && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Gender</p>
                <p className="text-sm capitalize">{attendee.gender}</p>
              </div>
            )}
          </div>
          
          {attendee.emergencyContact && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Emergency Contact</p>
              <div className="flex items-center justify-between">
                <p className="text-sm">{attendee.emergencyContact}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => copyToClipboard(attendee.emergencyContact || '', 'Emergency contact')}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Social Media</p>
            <div className="flex flex-wrap gap-3">
              {attendee.instagram && (
                <Badge variant="outline" className="flex items-center gap-1.5">
                  <Instagram className="h-3 w-3" />
                  {attendee.instagram}
                </Badge>
              )}
              
              {attendee.twitter && (
                <Badge variant="outline" className="flex items-center gap-1.5">
                  <Twitter className="h-3 w-3" />
                  {attendee.twitter}
                </Badge>
              )}
              
              {!attendee.instagram && !attendee.twitter && (
                <p className="text-sm text-muted-foreground">No social media provided</p>
              )}
            </div>
          </div>
          
          {attendee.additionalInfo && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Additional Information</p>
              <p className="text-sm whitespace-pre-line bg-muted p-3 rounded-md">
                {attendee.additionalInfo}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const EventAttendeesDetail = ({ attendees, isCreator }: EventAttendeesDetailProps) => {
  const [selectedAttendee, setSelectedAttendee] = useState<EventRegistration | null>(null);
  
  if (!isCreator) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" /> Participant Details
        </CardTitle>
        <CardDescription>
          View detailed information about event participants
        </CardDescription>
      </CardHeader>
      <CardContent>
        {attendees.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center">No registrations yet</p>
        ) : (
          <>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {attendees.map((attendee) => (
                  <div 
                    key={attendee.userId} 
                    className="flex items-center justify-between p-3 rounded-md hover:bg-muted cursor-pointer"
                    onClick={() => setSelectedAttendee(attendee)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage 
                          src={attendee.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(attendee.name)}&background=random`}
                          alt={attendee.name} 
                        />
                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{attendee.name}</p>
                        <p className="text-xs text-muted-foreground">{attendee.email}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="opacity-60">
                      <Clipboard className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
        
        {selectedAttendee && (
          <AttendeeDetailDialog 
            attendee={selectedAttendee} 
            isOpen={!!selectedAttendee} 
            onClose={() => setSelectedAttendee(null)} 
          />
        )}
      </CardContent>
    </Card>
  );
};

export default EventAttendeesDetail;
