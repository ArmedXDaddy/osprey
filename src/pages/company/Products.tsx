
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { PlusCircle, Package2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { fetchProducts } from '@/integrations/supabase/helpers';
import { Product } from '@/types';
import { ProductCard } from '@/components/shared/ProductCard';
import { useToast } from '@/components/ui/use-toast';

const Products = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isCompany = currentUser?.role === 'company';
  const isCompanyRoute = location.pathname.startsWith('/company');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        // If on company route and user is a company, only show their products
        const productsData = await fetchProducts();
        
        // Filter by company if needed
        const filteredProducts = isCompanyRoute && isCompany && currentUser?.id
          ? productsData.filter(p => p.companyId === currentUser.id)
          : productsData;
          
        setProducts(filteredProducts);
      } catch (error) {
        console.error('Error loading products:', error);
        toast({
          title: 'Failed to load products',
          description: 'Please try again later',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, [currentUser, isCompany, isCompanyRoute, toast]);
  
  const handleCreateProduct = () => {
    navigate('/company/products/create');
  };
  
  const handleViewProduct = (id: string) => {
    navigate(isCompanyRoute ? `/company/products/${id}` : `/products/${id}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products & Services</h1>
          <p className="text-gray-500">Browse products and services</p>
        </div>
        
        {isCompany && (
          <Button onClick={handleCreateProduct}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        )}
      </div>
      
      <Separator />
      
      {loading ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 rounded-lg border bg-card animate-pulse" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onClick={() => handleViewProduct(product.id)} />
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
            <Button className="mt-4" onClick={handleCreateProduct}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Products;
