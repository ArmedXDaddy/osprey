
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sponsorship } from '@/types';
import { CalendarClock, DollarSign, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SponsorshipCardProps {
  sponsorship: Sponsorship;
}

const SponsorshipCard = ({ sponsorship }: SponsorshipCardProps) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/sponsorships/${sponsorship.id}`);
  };

  const formatDeadline = (date?: Date) => {
    if (!date) return 'No deadline';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={sponsorship.companyLogo} alt={sponsorship.companyName} />
            <AvatarFallback>{sponsorship.companyName.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <Badge variant={sponsorship.status === 'active' ? 'default' : 'outline'}>
            {sponsorship.status === 'active' ? 'Active' : 'Closed'}
          </Badge>
        </div>
        <CardTitle className="line-clamp-1">{sponsorship.title}</CardTitle>
        <CardDescription className="flex items-center text-sm gap-1">
          By {sponsorship.companyName}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm line-clamp-3 mb-3">{sponsorship.description}</p>
        
        {sponsorship.compensation && (
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <DollarSign className="h-4 w-4 mr-1" />
            {sponsorship.compensation}
          </div>
        )}
        
        {sponsorship.deadline && (
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <CalendarClock className="h-4 w-4 mr-1" />
            Deadline: {formatDeadline(sponsorship.deadline)}
          </div>
        )}
        
        {sponsorship.tags && sponsorship.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {sponsorship.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {sponsorship.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{sponsorship.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleViewDetails} className="w-full">View Details</Button>
      </CardFooter>
    </Card>
  );
};

export default SponsorshipCard;
