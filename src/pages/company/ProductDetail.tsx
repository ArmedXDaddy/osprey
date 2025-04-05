
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Tag, Calendar, CheckCircle, ExternalLink } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  // In a real implementation, we would fetch the product details by ID
  // For now, using placeholder data
  const product = {
    id: id,
    title: 'Enterprise Analytics Suite',
    company: 'DataViz Technologies',
    companyLogo: 'https://ui-avatars.com/api/?name=DataViz&background=random',
    price: '$199/month per user',
    description: 'Our Enterprise Analytics Suite is a comprehensive business intelligence platform designed to help organizations make data-driven decisions with ease.',
    longDescription: 'Transform your organization\'s data into actionable insights with our powerful enterprise analytics platform. Designed for businesses of all sizes, our solution combines advanced data visualization, machine learning-powered predictions, and intuitive reporting tools in one seamless package.',
    features: [
      'Interactive dashboards with drag-and-drop functionality',
      'Real-time data monitoring and alerts',
      'Automated report generation and scheduling',
      'Customizable KPIs and performance metrics',
      'Advanced data visualization tools',
      'Integration with all major data sources and APIs',
      'Machine learning-powered predictive analytics',
      'Secure, role-based access controls'
    ],
    useCases: [
      'Executive dashboards for C-suite decision making',
      'Sales forecasting and pipeline visualization',
      'Marketing campaign performance analysis',
      'Operations and supply chain optimization',
      'Financial reporting and budget tracking',
      'Customer behavior analysis'
    ],
    pricingTiers: [
      { name: 'Basic', price: '$99/month', features: ['5 users', 'Standard dashboards', 'Email support'] },
      { name: 'Professional', price: '$199/month', features: ['20 users', 'Custom dashboards', 'Priority support', 'API access'] },
      { name: 'Enterprise', price: 'Custom pricing', features: ['Unlimited users', 'All features', 'Dedicated account manager', 'Custom integrations'] }
    ],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80&ixlib=rb-4.0.3',
    category: 'Business Intelligence',
    tags: ['Analytics', 'Data Visualization', 'Enterprise', 'BI Tools'],
    releaseDate: '2025-01-10',
    demoUrl: 'https://example.com/demo',
    websiteUrl: 'https://example.com/product'
  };
  
  const formattedDate = new Date(product.releaseDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="overflow-hidden">
        <div className="w-full h-64 overflow-hidden bg-gray-100">
          <img src={product.image} alt={product.title} className="w-full h-full object-cover object-center" />
        </div>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border">
              <img src={product.companyLogo} alt={product.company} className="h-full w-full object-cover" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{product.title}</CardTitle>
                <Badge variant="outline">{product.category}</Badge>
              </div>
              <div className="flex items-center text-gray-500">
                <Building className="h-4 w-4 mr-1" />
                <span>{product.company}</span>
              </div>
              <div className="flex flex-wrap gap-3 mt-2">
                <div className="flex items-center text-primary font-medium">
                  <Tag className="h-4 w-4 mr-1" />
                  <span>{product.price}</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Released: {formattedDate}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Product Overview</h3>
            <p className="text-gray-700 mb-3">{product.description}</p>
            <p className="text-gray-700">{product.longDescription}</p>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-2">Key Features</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {product.features.map((feature, i) => (
                <li key={i} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Use Cases</h3>
            <ul className="list-disc pl-5 space-y-1">
              {product.useCases.map((useCase, i) => (
                <li key={i} className="text-gray-700">{useCase}</li>
              ))}
            </ul>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-4">Pricing Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {product.pricingTiers.map((tier, i) => (
                <Card key={i} className="border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{tier.name}</CardTitle>
                    <p className="font-bold text-primary">{tier.price}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {tier.features.map((feature, j) => (
                        <li key={j} className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag, i) => (
                <Badge key={i} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </div>
          
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Button size="lg" className="flex-1" onClick={() => window.open(product.demoUrl, "_blank")}>
              Request a Demo
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="flex-1" onClick={() => window.open(product.websiteUrl, "_blank")}>
              Visit Website
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductDetail;
