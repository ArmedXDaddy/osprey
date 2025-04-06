
import React from 'react';
import { Product } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface ProductGridProps {
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden">
          <div className="aspect-video relative">
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-1">{product.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{product.description}</p>
            <div className="flex justify-between items-center mt-4">
              <span className="font-medium">{product.price}</span>
              <Link 
                to={`/company/products/${product.id}`}
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                View Details
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProductGrid;
