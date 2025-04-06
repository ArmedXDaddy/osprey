
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle, Briefcase, Package2, GraduationCap } from 'lucide-react';
import JobPostings from './JobPostings';
import Products from './Products';
import Workshops from './Workshops';

const CompanyDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('jobs');

  // Redirect non-company users
  if (currentUser?.role !== 'company') {
    navigate('/');
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Company Dashboard</h1>
          <p className="text-gray-500">Manage your company's jobs, products, and workshops</p>
        </div>
        
        {activeTab === 'jobs' && (
          <Button onClick={() => navigate('/company/jobs/create')}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Job Posting
          </Button>
        )}
        
        {activeTab === 'products' && (
          <Button onClick={() => navigate('/company/products/create')}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        )}
        
        {activeTab === 'workshops' && (
          <Button onClick={() => navigate('/company/workshops/create')}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Workshop
          </Button>
        )}
      </div>
      
      <Tabs 
        defaultValue="jobs" 
        className="w-full" 
        onValueChange={(value) => setActiveTab(value)}
      >
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span>Jobs</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package2 className="h-4 w-4" />
            <span>Products</span>
          </TabsTrigger>
          <TabsTrigger value="workshops" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            <span>Workshops</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="jobs" className="mt-6">
          <JobPostings />
        </TabsContent>
        
        <TabsContent value="products" className="mt-6">
          <Products />
        </TabsContent>
        
        <TabsContent value="workshops" className="mt-6">
          <Workshops />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyDashboard;
