
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { UserRole, Product } from '@/types';
import ProductGrid from '@/components/company/ProductGrid';
import { Plus } from 'lucide-react';
import { getProducts } from '@/integrations/supabase/helpers';
import { mapDbProductToProduct } from '@/utils/typeMappers';

const Products = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!currentUser) return;
      setIsLoading(true);
      try {
        const productsData = await getProducts();
        // Filter products to only show the current company's products
        const companyProducts = productsData.filter(product => product.companyId === currentUser.id);
        setProducts(companyProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [currentUser]);

  if (!currentUser || currentUser.role !== 'company') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-gray-600">Only company accounts can access this page.</p>
        <Button 
          className="mt-4" 
          variant="outline" 
          onClick={() => navigate('/profile')}
        >
          Go to Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Products</h2>
        <Button onClick={() => navigate('/company/products/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading products...</p>
        </div>
      ) : products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No products created yet.</p>
          <Button 
            className="mt-4" 
            onClick={() => navigate('/company/products/create')}
          >
            Create Your First Product
          </Button>
        </div>
      )}
    </div>
  );
};

export default Products;
