
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Users, DollarSign, Briefcase, GraduationCap, Edit, MapPin, Globe, Mail, Phone, PlusCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { fetchProducts, fetchWorkshops } from '@/integrations/supabase/helpers';
import { Product, Workshop } from '@/types';
import { ProductCard } from '@/components/shared/ProductCard';
import { WorkshopCard } from '@/components/shared/WorkshopCard';
import { useToast } from '@/components/ui/use-toast';

interface CompanyProfileProps {
  companyId?: string;
}

const CompanyProfile: React.FC<CompanyProfileProps> = ({ companyId }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isOwnProfile = !companyId || (currentUser && currentUser.id === companyId);
  const profileId = companyId || currentUser?.id;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingWorkshops, setLoadingWorkshops] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      if (profileId) {
        try {
          // Load products
          setLoadingProducts(true);
          const productsData = await fetchProducts();
          setProducts(productsData.filter(p => p.companyId === profileId));
          setLoadingProducts(false);
          
          // Load workshops
          setLoadingWorkshops(true);
          const workshopsData = await fetchWorkshops();
          setWorkshops(workshopsData.filter(w => w.companyId === profileId));
          setLoadingWorkshops(false);
        } catch (error) {
          console.error('Error loading company data:', error);
          toast({
            title: 'Failed to load data',
            description: 'Please try again later',
            variant: 'destructive',
          });
        }
      }
    };
    
    loadData();
  }, [profileId, toast]);
  
  // Placeholder data - would be fetched from API in a real implementation
  const companyData = {
    name: isOwnProfile ? currentUser?.name || 'Company Name' : 'Sample Company',
    logo: isOwnProfile ? currentUser?.profileImage : 'https://ui-avatars.com/api/?name=Sample+Company&background=random',
    coverImage: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    description: 'A leading technology company focused on innovation and customer satisfaction. We provide cutting-edge solutions for businesses of all sizes.',
    industry: 'Technology',
    founded: '2010',
    size: '50-200 employees',
    location: 'San Francisco, CA',
    website: 'https://example.com',
    email: 'contact@example.com',
    phone: '+1 (555) 123-4567',
    specialties: ['Software Development', 'Cloud Computing', 'AI Solutions', 'Mobile Applications'],
  };

  return (
    <div className="space-y-6">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 rounded-md overflow-hidden">
        <img 
          src={companyData.coverImage} 
          alt={`${companyData.name} cover`} 
          className="w-full h-full object-cover"
        />
        {isOwnProfile && (
          <Button 
            size="sm" 
            variant="secondary" 
            className="absolute bottom-4 right-4"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Cover
          </Button>
        )}
      </div>
      
      {/* Company Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-end -mt-12 md:-mt-16 relative z-10 px-4">
        <div className="bg-white rounded-lg p-1 border shadow-sm">
          <img 
            src={companyData.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(companyData.name)}&background=random`} 
            alt={companyData.name} 
            className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover"
          />
        </div>
        
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold">{companyData.name}</h1>
          <p className="text-gray-600">{companyData.industry} · {companyData.size}</p>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <MapPin size={16} />
            <span>{companyData.location}</span>
          </div>
        </div>
        
        {isOwnProfile ? (
          <Button className="mt-2 md:mt-0">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <Button className="mt-2 md:mt-0">
            <Users className="h-4 w-4 mr-2" />
            Follow
          </Button>
        )}
      </div>
      
      <Tabs defaultValue="about" className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-xl">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="workshops">Workshops</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="about" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>About {companyData.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{companyData.description}</p>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Company Details</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Building size={16} className="text-gray-500" />
                      <span>Founded: {companyData.founded}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Users size={16} className="text-gray-500" />
                      <span>Size: {companyData.size}</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Contact Information</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Globe size={16} className="text-gray-500" />
                      <a href={companyData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {companyData.website.replace(/^https?:\/\//, '')}
                      </a>
                    </li>
                    <li className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-500" />
                      <a href={`mailto:${companyData.email}`} className="text-blue-600 hover:underline">
                        {companyData.email}
                      </a>
                    </li>
                    <li className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-500" />
                      <span>{companyData.phone}</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {companyData.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary">{specialty}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Products & Services</CardTitle>
              <CardDescription>Products and services offered by {companyData.name}</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingProducts ? (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-72 rounded-lg border bg-card animate-pulse" />
                  ))}
                </div>
              ) : products.length > 0 ? (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                  {products.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onClick={() => navigate(`/products/${product.id}`)} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center p-8">
                  <DollarSign className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium">No products yet</h3>
                  <p className="text-gray-500 mt-2 mb-6">This company hasn't added any products or services.</p>
                  {isOwnProfile ? (
                    <Button onClick={() => navigate('/company/products/create')}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={() => navigate('/products')}>
                      Browse All Products
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="jobs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Opportunities</CardTitle>
              <CardDescription>Career opportunities at {companyData.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8">
                <Briefcase className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No job postings yet</h3>
                <p className="text-gray-500 mt-2 mb-6">This company hasn't posted any job opportunities.</p>
                {isOwnProfile ? (
                  <Button onClick={() => navigate('/company/jobs/create')}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Post Job
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => navigate('/jobs')}>
                    Browse All Jobs
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="workshops" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Workshops & Training</CardTitle>
              <CardDescription>Educational opportunities offered by {companyData.name}</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingWorkshops ? (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-72 rounded-lg border bg-card animate-pulse" />
                  ))}
                </div>
              ) : workshops.length > 0 ? (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                  {workshops.map((workshop) => (
                    <WorkshopCard 
                      key={workshop.id} 
                      workshop={workshop} 
                      onClick={() => navigate(`/workshops/${workshop.id}`)} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center p-8">
                  <GraduationCap className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium">No workshops available</h3>
                  <p className="text-gray-500 mt-2 mb-6">This company hasn't added any workshops or training sessions.</p>
                  {isOwnProfile ? (
                    <Button onClick={() => navigate('/company/workshops/create')}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Workshop
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={() => navigate('/workshops')}>
                      Browse All Workshops
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="posts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Posts</CardTitle>
              <CardDescription>Latest updates from {companyData.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8">
                <FileText className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No posts yet</h3>
                <p className="text-gray-500 mt-2 mb-6">This company hasn't published any posts.</p>
                {isOwnProfile && (
                  <Button onClick={() => navigate('/create/post')}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Post
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyProfile;
