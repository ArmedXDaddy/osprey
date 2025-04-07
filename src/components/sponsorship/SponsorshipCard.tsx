
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, BriefcaseIcon, CheckCircleIcon } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Sponsorship } from '@/types/sponsorship';

interface SponsorshipCardProps {
  sponsorship: Sponsorship;
}

const SponsorshipCard: React.FC<SponsorshipCardProps> = ({ sponsorship }) => {
  const navigate = useNavigate();
  
  const handleViewDetails = () => {
    navigate(`/sponsorships/${sponsorship.id}`);
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3 mb-2">
          {sponsorship.companyLogo && (
            <img 
              src={sponsorship.companyLogo} 
              alt={sponsorship.companyName} 
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          <div>
            <CardTitle className="text-lg">{sponsorship.title}</CardTitle>
            <CardDescription>{sponsorship.companyName}</CardDescription>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {sponsorship.tags?.map(tag => (
            <Badge key={tag} variant="outline" className="bg-gray-100">{tag}</Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 line-clamp-3">{sponsorship.description}</p>
        
        <div className="mt-4 space-y-2">
          {sponsorship.compensation && (
            <div className="flex items-center text-sm">
              <BriefcaseIcon className="w-4 h-4 mr-2 text-green-500" />
              <span>Compensation: {sponsorship.compensation}</span>
            </div>
          )}
          {sponsorship.deadline && (
            <div className="flex items-center text-sm">
              <CalendarIcon className="w-4 h-4 mr-2 text-red-500" />
              <span>Deadline: {sponsorship.deadline.toLocaleDateString()}</span>
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <div className="text-xs font-medium">Requirements:</div>
          <ul className="text-xs text-gray-500 mt-1 list-disc pl-4">
            {sponsorship.requirements.slice(0, 2).map((requirement, index) => (
              <li key={index}>{requirement}</li>
            ))}
            {sponsorship.requirements.length > 2 && <li>+ {sponsorship.requirements.length - 2} more</li>}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-xs text-gray-500">
          Posted {formatDistanceToNow(sponsorship.createdAt, { addSuffix: true })}
        </div>
        <Button onClick={handleViewDetails} size="sm">View Details</Button>
      </CardFooter>
    </Card>
  );
};

export default SponsorshipCard;
