
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md">
        <h1 className="text-5xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">Oops! Page not found</p>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          The page you're looking for (<code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{location.pathname}</code>) doesn't exist or has been moved.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Button onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            <Home className="h-4 w-4 mr-2" />
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
