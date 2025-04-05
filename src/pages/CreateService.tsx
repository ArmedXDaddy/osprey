import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { createService } from '@/api/services';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from 'date-fns';
import { CalendarIcon } from "@radix-ui/react-icons"
import { Service } from '@/types';

const CreateService = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sessionType, setSessionType] = useState('one_on_one');
  const [price, setPrice] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [duration, setDuration] = useState('');
  const [startTime, setStartTime] = useState<Date | undefined>(undefined);
  const [location, setLocation] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [meetingUrl, setMeetingUrl] = useState('');
  const [capacity, setCapacity] = useState('');

  const navigate = useNavigate();
  const { toast } = useToast();

  const createServiceMutation = useMutation({
    mutationFn: (serviceData: Omit<Service, "id" | "createdAt" | "providerName" | "providerId">) => 
      createService(serviceData),
    onSuccess: () => {
      toast({
        title: "Service Created",
        description: "Your service has been created successfully",
      });
      navigate('/services');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Make sure all required fields are present
    const serviceData: Omit<Service, "id" | "createdAt" | "providerName" | "providerId"> = {
      title: title,  // Required field
      description: description || "",
      sessionType: sessionType as "one_on_one" | "group",
      price: Number(price),
      isFree: isFree,
      duration: duration || "60 minutes",
      location: location || "",
      isOnline: isOnline,
      meetingUrl: meetingUrl || "",
      capacity: sessionType === "group" ? Number(capacity) : undefined,
      available: true
    };

    createServiceMutation.mutate(serviceData);
  };

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Create New Service</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="sessionType">Session Type</Label>
          <Select onValueChange={value => setSessionType(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select session type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="one_on_one">One-on-One</SelectItem>
              <SelectItem value="group">Group</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="price">Price</Label>
          <Input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="isFree">Is Free</Label>
          <Checkbox
            id="isFree"
            checked={isFree}
            onCheckedChange={(checked) => setIsFree(!!checked)}
          />
        </div>
        <div>
          <Label htmlFor="duration">Duration</Label>
          <Input
            type="text"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>
        <div>
          <Label>Start Time</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !startTime && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startTime ? format(startTime, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startTime}
                onSelect={setStartTime}
                disabled={(date) =>
                  date < new Date()
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="isOnline">Is Online</Label>
          <Checkbox
            id="isOnline"
            checked={isOnline}
            onCheckedChange={(checked) => setIsOnline(!!checked)}
          />
        </div>
        <div>
          <Label htmlFor="meetingUrl">Meeting URL</Label>
          <Input
            type="url"
            id="meetingUrl"
            value={meetingUrl}
            onChange={(e) => setMeetingUrl(e.target.value)}
          />
        </div>
        {sessionType === 'group' && (
          <div>
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              type="number"
              id="capacity"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </div>
        )}
        <Button type="submit" disabled={createServiceMutation.isPending}>
          {createServiceMutation.isPending ? 'Creating...' : 'Create Service'}
        </Button>
      </form>
    </div>
  );
};

export default CreateService;
