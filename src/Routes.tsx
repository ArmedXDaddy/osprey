import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from '@/pages/Index';
import Profile from '@/pages/Profile';
import Explore from '@/pages/Explore';
import Groups from '@/pages/Groups';
import GroupDetail from '@/pages/GroupDetail';
import CreateGroup from '@/pages/CreateGroup';
import Services from '@/pages/Services';
import ServiceDetail from '@/pages/ServiceDetail';
import CreateService from '@/pages/CreateService';
import { CreateWorkshop } from '@/pages/company/CreateWorkshop';
import Products from '@/pages/company/Products';
import ProductDetail from '@/pages/company/ProductDetail';
import CreateProduct from '@/pages/company/CreateProduct';
import WorkshopDetail from '@/pages/company/WorkshopDetail';
import Workshops from '@/pages/company/Workshops';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/explore" element={<Explore />} />
        
        <Route path="/groups" element={<Groups />} />
        <Route path="/groups/:id" element={<GroupDetail />} />
        <Route path="/create-group" element={<CreateGroup />} />

        <Route path="/services" element={<Services />} />
        <Route path="/services/:id" element={<ServiceDetail />} />
        <Route path="/create-service" element={<CreateService />} />

        {/* Company Routes */}
        <Route path="/company/products" element={<Products />} />
        <Route path="/company/products/:id" element={<ProductDetail />} />
        <Route path="/company/products/create" element={<CreateProduct />} />
        
        <Route path="/company/workshops" element={<Workshops />} />
        <Route path="/company/workshops/create" element={<CreateWorkshop />} />
        <Route path="/company/workshops/:id" element={<WorkshopDetail />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
