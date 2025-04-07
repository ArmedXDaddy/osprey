
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import MainLayout from "@/components/layout/MainLayout";
import { ThemeProvider } from "@/pages/Settings";

// Pages
import Index from "./pages/Index";
import Explore from "./pages/Explore";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import CreateEvent from "./pages/CreateEvent";
import Groups from "./pages/Groups";
import GroupDetail from "./pages/GroupDetail";
import CreateGroup from "./pages/CreateGroup";
import Profile from "./pages/Profile";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import NotFound from "./pages/NotFound";
import Networking from "./pages/Networking";
import Sessions from "./pages/Sessions";
import SessionDetail from "./pages/SessionDetail";
import ServiceDetail from "./pages/ServiceDetail";
import CreateSession from "./pages/CreateSession";
import ManageSession from "./pages/ManageSession";
import Services from "./pages/Services";
import CreateService from "./pages/CreateService";
import ManageService from "./pages/ManageService";
import Settings from "./pages/Settings";

// Company Pages
import JobPostings from "./pages/company/JobPostings";
import CreateJobPosting from "./pages/company/CreateJobPosting";
import Products from "./pages/company/Products";
import Workshops from "./pages/company/Workshops";
import CreateProduct from "./pages/company/CreateProduct";
import CreateWorkshop from "./pages/company/CreateWorkshop";
import CompanyProfile from "./components/company/CompanyProfile";

// New Job, Product, Workshop Detail Pages
import JobPostingDetail from "./pages/company/JobPostingDetail";
import ProductDetail from "./pages/company/ProductDetail";
import WorkshopDetail from "./pages/company/WorkshopDetail";

// Sponsorships Pages
import Sponsorships from "./pages/sponsorships/Sponsorships";
import SponsorshipDetail from "./pages/sponsorships/SponsorshipDetail";
import CreateSponsorship from "./pages/sponsorships/CreateSponsorship";
import SponsorshipApplications from "./pages/sponsorships/SponsorshipApplications";
import MyApplications from "./pages/sponsorships/MyApplications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ThemeProvider>
          <DataProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/networking" element={<Networking />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/events/:id" element={<EventDetail />} />
                  <Route path="/create-event" element={<CreateEvent />} />
                  <Route path="/groups" element={<Groups />} />
                  <Route path="/groups/:id" element={<GroupDetail />} />
                  <Route path="/create-group" element={<CreateGroup />} />
                  <Route path="/sessions" element={<Sessions />} />
                  <Route path="/sessions/:id" element={<SessionDetail />} />
                  <Route path="/sessions/create" element={<CreateSession />} />
                  <Route path="/sessions/:id/manage" element={<ManageSession />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/services/create" element={<CreateService />} />
                  <Route path="/services/:id" element={<ServiceDetail />} />
                  <Route path="/services/:id/manage" element={<ManageService />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/:id" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/auth/login" element={<Login />} />
                  <Route path="/auth/register" element={<Register />} />
                  
                  {/* Jobs Routes */}
                  <Route path="/jobs" element={<JobPostings />} />
                  <Route path="/jobs/:id" element={<JobPostingDetail />} />
                  
                  {/* Products Routes */}
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  
                  {/* Workshops Routes */}
                  <Route path="/workshops" element={<Workshops />} />
                  <Route path="/workshops/:id" element={<WorkshopDetail />} />
                  
                  {/* Sponsorships Routes */}
                  <Route path="/sponsorships" element={<Sponsorships />} />
                  <Route path="/sponsorships/create" element={<CreateSponsorship />} />
                  <Route path="/sponsorships/:id" element={<SponsorshipDetail />} />
                  <Route path="/sponsorships/:id/applications" element={<SponsorshipApplications />} />
                  <Route path="/sponsorships/my-applications" element={<MyApplications />} />
                  
                  {/* Company Routes - redirected through individual management pages */}
                  <Route path="/company/jobs" element={<JobPostings />} />
                  <Route path="/company/jobs/create" element={<CreateJobPosting />} />
                  <Route path="/company/jobs/:id" element={<JobPostingDetail />} />
                  <Route path="/company/products" element={<Products />} />
                  <Route path="/company/products/create" element={<CreateProduct />} />
                  <Route path="/company/products/:id" element={<ProductDetail />} />
                  <Route path="/company/workshops" element={<Workshops />} />
                  <Route path="/company/workshops/create" element={<CreateWorkshop />} />
                  <Route path="/company/workshops/:id" element={<WorkshopDetail />} />
                  <Route path="/company/profile" element={<Profile />} />
                  <Route path="/company/profile/:id" element={<Profile />} />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </MainLayout>
            </BrowserRouter>
          </DataProvider>
        </ThemeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
