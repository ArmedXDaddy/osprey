import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from '@/pages/Index';
import SignUp from '@/pages/SignUp';
import Login from '@/pages/Login';
import Profile from '@/pages/Profile';
import EditProfile from '@/pages/EditProfile';
import Explore from '@/pages/Explore';
import Groups from '@/pages/Groups';
import GroupDetail from '@/pages/GroupDetail';
import CreateGroup from '@/pages/CreateGroup';
import EditGroup from '@/pages/EditGroup';
import Services from '@/pages/Services';
import ServiceDetail from '@/pages/ServiceDetail';
import CreateService from '@/pages/CreateService';
import EditService from '@/pages/EditService';
import Bookings from '@/pages/Bookings';
import CompanyProfile from '@/pages/company/CompanyProfile';
import CompanyEditProfile from '@/pages/company/CompanyEditProfile';
import Products from '@/pages/company/Products';
import ProductDetail from '@/pages/company/ProductDetail';
import CreateProduct from '@/pages/company/CreateProduct';
import EditProduct from '@/pages/company/EditProduct';
import Workshops from '@/pages/company/Workshops';
import WorkshopDetail from '@/pages/company/WorkshopDetail';
import { CreateWorkshop } from '@/pages';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/explore" element={<Explore />} />
        
        <Route path="/groups" element={<Groups />} />
        <Route path="/groups/:id" element={<GroupDetail />} />
        <Route path="/create-group" element={<CreateGroup />} />
        <Route path="/edit-group/:id" element={<EditGroup />} />

        <Route path="/services" element={<Services />} />
        <Route path="/services/:id" element={<ServiceDetail />} />
        <Route path="/create-service" element={<CreateService />} />
        <Route path="/edit-service/:id" element={<EditService />} />
        <Route path="/bookings" element={<Bookings />} />

        {/* Company Routes */}
        <Route path="/company/profile" element={<CompanyProfile />} />
        <Route path="/company/edit-profile" element={<CompanyEditProfile />} />
        
        <Route path="/company/products" element={<Products />} />
        <Route path="/company/products/:id" element={<ProductDetail />} />
        <Route path="/company/products/create" element={<CreateProduct />} />
        <Route path="/company/products/edit/:id" element={<EditProduct />} />
        
        <Route path="/company/workshops" element={<Workshops />} />
        <Route path="/company/workshops/create" element={<CreateWorkshop />} />
        <Route path="/company/workshops/:id" element={<WorkshopDetail />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
