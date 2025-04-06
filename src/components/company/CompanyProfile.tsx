import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { User, Product, Workshop } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getProducts, getWorkshops } from '@/integrations/supabase/helpers';

const CompanyProfile = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const { currentUser } = useAuth();
  const { users } = useData();
  const [company, setCompany] = useState<User | undefined>(undefined);
  const [products, setProducts] = useState<Product[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      setIsLoading(true);
      try {
        // Find the company from the users array
        const foundCompany = users.find(user => user.id === companyId);
        setCompany(foundCompany);

        // Fetch products and workshops for the company
        const productsData = await getProducts();
        const companyProducts = productsData.filter(product => product.companyId === companyId);
        setProducts(companyProducts);

        const workshopsData = await getWorkshops();
        const companyWorkshops = workshopsData.filter(workshop => workshop.companyId === companyId);
        setWorkshops(companyWorkshops);
      } catch (error) {
        console.error("Error fetching company data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyData();
  }, [companyId, users]);

  if (isLoading) {
    return <div className="text-center py-12">Loading company profile...</div>;
  }

  if (!company) {
    return <div className="text-center py-12">Company not found.</div>;
  }

  return (
    <div className="container py-8">
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center space-x-6 mb-8">
            <Avatar className="h-24 w-24">
              <AvatarImage src={company.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=random`} alt={company.name} />
              <AvatarFallback>{company.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{company.name}</h2>
              <p className="text-gray-500">{company.bio || 'No bio available'}</p>
            </div>
          </div>

          <Tabs defaultValue="products" className="space-y-4">
            <TabsList>
              <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
              <TabsTrigger value="workshops">Workshops ({workshops.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="products" className="space-y-4">
              {products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card key={product.id} className="border">
                      <CardContent className="p-4">
                        <h3 className="text-lg font-semibold mb-2">{product.title}</h3>
                        <p className="text-gray-600">{product.description}</p>
                        <Link to={`/company/products/${product.id}`} className="text-blue-500 hover:underline block mt-2">
                          View Product
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">No products available.</div>
              )}
            </TabsContent>
            <TabsContent value="workshops" className="space-y-4">
              {workshops.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {workshops.map((workshop) => (
                    <Card key={workshop.id} className="border">
                      <CardContent className="p-4">
                        <h3 className="text-lg font-semibold mb-2">{workshop.title}</h3>
                        <p className="text-gray-600">{workshop.description}</p>
                        <Link to={`/company/workshops/${workshop.id}`} className="text-blue-500 hover:underline block mt-2">
                          View Workshop
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">No workshops available.</div>
              )}
            </TabsContent>
          </Tabs>

          {currentUser?.id === companyId && (
            <div className="mt-8 text-center">
              <Button asChild>
                <Link to="/company/profile/edit">Edit Company Profile</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyProfile;
