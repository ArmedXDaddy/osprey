
import React, { useEffect } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  useNavigate,
} from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import Index from '@/pages/Index';
import Profile from '@/pages/Profile';
import Services from '@/pages/Services';
import ServiceDetail from '@/pages/ServiceDetail';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import CompanyServices from '@/pages/company/Services';
import CompanyProducts from '@/pages/company/Products';
import CompanyProfile from '@/pages/company/Profile';
import CreateService from '@/pages/company/CreateService';
import CreateProduct from '@/pages/company/CreateProduct';
import EditService from '@/pages/company/EditService';
import EditProduct from '@/pages/company/EditProduct';
import Bookings from '@/pages/Bookings';
import CompanyBookings from '@/pages/company/Bookings';
import Workshops from '@/pages/Workshops';
import WorkshopDetail from '@/pages/WorkshopDetail';
import CompanyWorkshops from '@/pages/company/Workshops';
import CreateWorkshop from '@/pages/company/CreateWorkshop';
import EditWorkshop from '@/pages/company/EditWorkshop';

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
        <MainLayout />
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
        path: "/products",
        element: <Products />,
      },
      {
        path: "/products/:id",
        element: <ProductDetail />,
      },
      {
        path: "/bookings",
        element: <Bookings />,
      },
      
      // Company routes
      {
        path: "/company/profile",
        element: <CompanyProfile />,
      },
      {
        path: "/company/services",
        element: <CompanyServices />,
      },
      {
        path: "/company/services/create",
        element: <CreateService />,
      },
      {
        path: "/company/services/edit/:id",
        element: <EditService />,
      },
      {
        path: "/company/products",
        element: <CompanyProducts />,
      },
      {
        path: "/company/products/create",
        element: <CreateProduct />,
      },
      {
        path: "/company/products/edit/:id",
        element: <EditProduct />,
      },
      {
        path: "/company/bookings",
        element: <CompanyBookings />,
      },
      
      // Workshop routes
      {
        path: "/workshops",
        element: <Workshops />,
      },
      {
        path: "/workshops/:id",
        element: <WorkshopDetail />,
      },
      {
        path: "/company/workshops",
        element: <CompanyWorkshops />,
      },
      {
        path: "/company/workshops/:id",
        element: <WorkshopDetail />,
      },
      {
        path: "/company/workshops/create",
        element: <CreateWorkshop />,
      },
      {
        path: "/company/workshops/edit/:id",
        element: <EditWorkshop />,
      },
      
      // Add more routes here
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
    </React.StrictMode>
  );
}

export default App;
