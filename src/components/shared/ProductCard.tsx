
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tag, ArrowRight } from 'lucide-react';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export const ProductCard = ({ product, onClick }: ProductCardProps) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="aspect-video w-full overflow-hidden bg-gray-100">
        <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-lg">{product.title}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <img src={product.companyLogo} alt={product.companyName} className="h-4 w-4 rounded-full" />
              <span>{product.companyName}</span>
            </CardDescription>
          </div>
          {product.category && <Badge variant="outline">{product.category}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="pb-2 flex-1">
        <div className="flex items-center gap-1 text-primary font-semibold mb-2">
          <Tag className="h-4 w-4" />
          <span>{product.price}</span>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-3 mb-3">{product.description}</p>
        
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto">
            {product.tags.map((tag, i) => (
              <Badge key={i} variant="secondary">{tag}</Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <Button 
          variant="default" 
          className="w-full"
          onClick={onClick}
        >
          Learn More
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
