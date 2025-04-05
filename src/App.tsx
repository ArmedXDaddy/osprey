
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import MainLayout from "@/components/layout/MainLayout";

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
import CreateSession from "./pages/CreateSession";
import ManageSession from "./pages/ManageSession";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import CreateService from "./pages/CreateService";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <DataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="*" element={
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
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/:id" element={<Profile />} />
                    <Route path="/sessions" element={<Sessions />} />
                    <Route path="/sessions/:id" element={<SessionDetail />} />
                    <Route path="/sessions/create" element={<CreateSession />} />
                    <Route path="/sessions/:id/manage" element={<ManageSession />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/services/:id" element={<ServiceDetail />} />
                    <Route path="/services/create" element={<CreateService />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </MainLayout>
              } />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
