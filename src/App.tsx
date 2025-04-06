
import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { Toaster } from './components/ui/toaster';
import EditGroup from './pages/EditGroup';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout><Outlet /></MainLayout>}>
            <Route index element={<div>Home Page</div>} />
            <Route path="auth" element={<div>Auth Page</div>} />
            <Route path="profile/:id" element={<div>Profile Page</div>} />
            <Route path="events" element={<div>Events Page</div>} />
            <Route path="events/:id" element={<div>Event Detail Page</div>} />
            <Route path="services" element={<div>Services Page</div>} />
            <Route path="services/:id" element={<div>Service Detail Page</div>} />
            <Route path="services/create" element={<div>Create Service Page</div>} />
            <Route path="services/:id/edit" element={<div>Edit Service Page</div>} />
            <Route path="sessions" element={<div>Sessions Page</div>} />
            <Route path="sessions/:id" element={<div>Session Detail Page</div>} />
            <Route path="sessions/create" element={<div>Create Session Page</div>} />
            <Route path="groups" element={<div>Groups Page</div>} />
            <Route path="groups/:id" element={<div>Group Detail Page</div>} />
            <Route path="groups/create" element={<div>Create Group Page</div>} />
            <Route path="groups/:id/edit" element={<EditGroup />} />
            <Route path="products" element={<div>Products Page</div>} />
            <Route path="products/:id" element={<div>Product Detail Page</div>} />
            <Route path="workshops" element={<div>Workshops Page</div>} />
            <Route path="workshops/:id" element={<div>Workshop Detail Page</div>} />
            <Route path="jobs" element={<div>Jobs Page</div>} />
            <Route path="jobs/:id" element={<div>Job Detail Page</div>} />
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
