import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import Home from '@/pages/Home';
import Auth from '@/pages/Auth';
import Profile from '@/pages/Profile';
import Events from '@/pages/Events';
import EventDetail from '@/pages/EventDetail';
import Services from '@/pages/Services';
import ServiceDetail from '@/pages/ServiceDetail';
import CreateService from '@/pages/CreateService';
import EditService from '@/pages/EditService';
import Sessions from '@/pages/Sessions';
import SessionDetail from '@/pages/SessionDetail';
import CreateSession from '@/pages/CreateSession';
import Groups from '@/pages/Groups';
import GroupDetail from '@/pages/GroupDetail';
import CreateGroup from '@/pages/CreateGroup';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import Workshops from '@/pages/Workshops';
import WorkshopDetail from '@/pages/WorkshopDetail';
import Jobs from '@/pages/Jobs';
import JobDetail from '@/pages/JobDetail';
import EditGroup from '@/pages/EditGroup';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="auth" element={<Auth />} />
          <Route path="profile/:id" element={<Profile />} />
          <Route path="events" element={<Events />} />
          <Route path="events/:id" element={<EventDetail />} />
          <Route path="services" element={<Services />} />
          <Route path="services/:id" element={<ServiceDetail />} />
          <Route path="services/create" element={<CreateService />} />
          <Route path="services/:id/edit" element={<EditService />} />
          <Route path="sessions" element={<Sessions />} />
          <Route path="sessions/:id" element={<SessionDetail />} />
          <Route path="sessions/create" element={<CreateSession />} />
          <Route path="groups" element={<Groups />} />
          <Route path="groups/:id" element={<GroupDetail />} />
          <Route path="groups/create" element={<CreateGroup />} />
          <Route path="groups/:id/edit" element={<EditGroup />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="workshops" element={<Workshops />} />
          <Route path="workshops/:id" element={<WorkshopDetail />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="jobs/:id" element={<JobDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
