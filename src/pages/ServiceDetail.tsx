import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  Edit,
  MapPin,
  Users,
  Video,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Service, Booking } from '@/types';
import PaymentModal from '@/components/payment/PaymentModal';
import ServiceChatAccess from '@/components/service/ServiceChatAccess';

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getServiceById, getUserBookings, getUserBookingForService } = useData();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [hasBooked, setHasBooked] = useState(false);
  const [userBooking, setUserBooking] = useState<Booking | null>(null);

  const fetchServiceAndBookingDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      console.log("Fetching service with ID:", id);
      const serviceData = await getServiceById(id);
      
      if (!serviceData) {
        console.error("Service not found for ID:", id);
        toast({
          variant: "destructive",
          title: "Service not found",
          description: "The requested service could not be found."
        });
        navigate('/services');
        return;
      }
      
      console.log("Service data retrieved:", serviceData);
      setService(serviceData);
      
      if (currentUser) {
        try {
          const booking = await getUserBookingForService(serviceData.id, currentUser.id);
          if (booking) {
            console.log("User has an existing booking:", booking);
            setUserBooking(booking);
            setHasBooked(true);
          } else {
            setHasBooked(false);
          }
        } catch (error) {
          console.error("Error checking user booking:", error);
        }
      }
    } catch (error: any) {
      console.error("Error loading service:", error);
      toast({
        variant: "destructive",
        title: "Error loading service",
        description: error.message || "There was an error loading this service."
      });
      navigate('/services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceAndBookingDetails();
  }, [id, currentUser]);

  const handleBook = () => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to book this service."
      });
      navigate('/auth/login');
      return;
    }
    
    setShowPaymentModal(true);
  };

  const handleBookingSuccess = () => {
    setHasBooked(true);
    fetchServiceAndBookingDetails();
  };

  const isProvider = currentUser && service && currentUser.id === service.providerId;

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center min-h-[300px]">
          <p>Loading service details...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center min-h-[300px]">
          <p>Service not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/services')}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Service Details</h1>
          </div>

          {isProvider && (
            <Button 
              variant="outline" 
              className="mt-4 md:mt-0 gap-2"
              onClick={() => navigate(`/services/${id}/manage`)}
            >
              <Edit className="h-4 w-4" />
              Manage Service
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {service.coverImage ? (
              <img 
                src={service.coverImage} 
                alt={service.title} 
                className="w-full h-auto rounded-lg object-cover aspect-video" 
              />
            ) : (
              <div className="w-full rounded-lg bg-muted flex items-center justify-center aspect-video">
                <p className="text-muted-foreground">No cover image</p>
              </div>
            )}

            <div>
              <h2 className="text-3xl font-bold">{service.title}</h2>
              
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant={service.price > 0 ? "default" : "outline"}>
                  {service.price > 0 ? `$${service.price}` : 'Free'}
                </Badge>
                <Badge variant="outline">
                  {service.serviceType === 'one_on_one' ? '1-on-1' : 
                   service.serviceType === 'group' ? 'Group' : 
                   service.serviceType === 'webinar' ? 'Webinar' : 'Course'}
                </Badge>
                <Badge variant="outline">
                  {service.isOnline ? 'Online' : 'In-person'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-500 mr-2" />
                  <span>{service.duration}</span>
                </div>
                
                {service.location && (
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                    <span>{service.location}</span>
                  </div>
                )}
                
                {service.isOnline && (
                  <div className="flex items-center">
                    <Video className="h-5 w-5 text-gray-500 mr-2" />
                    <span>Online Service</span>
                  </div>
                )}
                
                {service.capacity && service.capacity > 1 && (
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-500 mr-2" />
                    <span>Group (up to {service.capacity})</span>
                  </div>
                )}
                
                {service.price > 0 && (
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-gray-500 mr-2" />
                    <span>${service.price}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-3">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">{service.description}</p>
              </div>
            </div>
            
            {currentUser && !isProvider && hasBooked && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-3">Service Chat</h3>
                <ServiceChatAccess service={service} booking={userBooking} />
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border shadow-sm p-6 sticky top-20">
              <div className="flex flex-col space-y-6">
                <div>
                  <h3 className="text-xl font-semibold">Provider</h3>
                  <p className="mt-2">{service.providerName}</p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold">Service Details</h3>
                  <div className="mt-2 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span>
                        {service.serviceType === 'one_on_one' ? 'One-on-One' : 
                         service.serviceType === 'group' ? 'Group' : 
                         service.serviceType === 'webinar' ? 'Webinar' : 'Course'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{service.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price:</span>
                      <span>{service.price > 0 ? `$${service.price}` : 'Free'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span>{service.isOnline ? 'Online' : service.location}</span>
                    </div>
                  </div>
                </div>

                {!isProvider && (
                  <div className="pt-4">
                    {hasBooked ? (
                      <Button className="w-full" disabled>
                        Already Booked
                      </Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={handleBook}
                        disabled={!service.available}
                      >
                        {service.price > 0 ? 'Book Now' : 'Request Free Service'}
                      </Button>
                    )}
                    {!service.available && (
                      <p className="text-sm text-muted-foreground text-center mt-2">
                        This service is currently unavailable
                      </p>
                    )}
                  </div>
                )}
                
                {isProvider && (
                  <div className="pt-4">
                    <Button 
                      className="w-full" 
                      onClick={() => navigate(`/services/${id}/manage`)}
                    >
                      Manage Service
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal
          open={showPaymentModal}
          service={service}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default ServiceDetail;
