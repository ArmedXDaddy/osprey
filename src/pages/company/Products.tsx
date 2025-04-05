
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Package2, Tag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const Products = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const isCompany = currentUser?.role === 'company';
  
  // This would come from an API in a real implementation
  const products = [];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products & Services</h1>
          <p className="text-gray-500">Browse products and services</p>
        </div>
        
        {isCompany && (
          <Button onClick={() => navigate('/company/products/create')}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        )}
      </div>
      
      <Separator />
      
      {products.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {products.map((product, i) => (
            <ProductCard key={i} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package2 className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No products available</h3>
          <p className="text-gray-500 mt-2">
            {isCompany 
              ? "You haven't added any products or services yet."
              : "There are no products or services available at this time."}
          </p>
          {isCompany && (
            <Button className="mt-4" onClick={() => navigate('/company/products/create')}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

const ProductCard = ({ product }: { product: any }) => {
  const navigate = useNavigate();
  
  // Example product data
  const {
    id = '1',
    title = 'Business Analytics Suite',
    company = 'Tech Company',
    companyLogo = 'https://ui-avatars.com/api/?name=Tech+Company&background=random',
    price = '$99/month',
    description = 'A comprehensive business analytics solution for small to medium businesses...',
    image = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    category = 'Software',
    tags = ['Business', 'Analytics', 'Cloud']
  } = product || {};
  
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="aspect-video w-full overflow-hidden bg-gray-100">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <img src={companyLogo} alt={company} className="h-4 w-4 rounded-full" />
              <span>{company}</span>
            </CardDescription>
          </div>
          <Badge variant="outline">{category}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2 flex-1">
        <div className="flex items-center gap-1 text-primary font-semibold mb-2">
          <Tag className="h-4 w-4" />
          <span>{price}</span>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-3 mb-3">{description}</p>
        
        <div className="flex flex-wrap gap-1 mt-auto">
          {tags.map((tag, i) => (
            <Badge key={i} variant="secondary">{tag}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button 
          variant="default" 
          className="w-full"
          onClick={() => navigate(`/company/products/${id}`)}
        >
          Learn More
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Products;
