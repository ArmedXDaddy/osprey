
import React, { useEffect } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  useNavigate,
  Outlet,
} from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import Index from '@/pages/Index';
import Profile from '@/pages/Profile';
import Services from '@/pages/Services';
import ServiceDetail from '@/pages/ServiceDetail';
import { Toaster } from "@/components/ui/toaster";

// A wrapper for routes that require authentication
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser && !isLoading) {
      navigate('/profile');
    }
  }, [currentUser, isLoading, navigate]);

  return currentUser ? <>{children}</> : null;
};

// Define routes
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoute>
        <MainLayout>
          <Outlet />
        </MainLayout>
      </PrivateRoute>
    ),
    children: [
      {
        path: "/",
        element: <Index />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/services",
        element: <Services />,
      },
      {
        path: "/services/:id",
        element: <ServiceDetail />,
      },
      {
        path: "/workshops",
        element: <Workshops />,
      },
      {
        path: "/workshops/:id",
        element: <WorkshopDetail />,
      },
    ],
  },
  {
    path: "/profile",
    element: <Profile />,
  },
]);

function App() {
  return (
    <React.StrictMode>
      <RouterProvider router={router} />
      <Toaster />
    </React.StrictMode>
  );
}

export default App;
