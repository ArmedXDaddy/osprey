
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await login(email, password);
      toast.success('Login successful!');
      // Navigation will happen automatically due to the useEffect
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Check for specific error types
      if (error.message === 'Email not confirmed') {
        toast.error('Your email has not been confirmed. Check your inbox for a verification link or contact support.');
      } else {
        toast.error(error.message || 'Invalid email or password');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Demo login examples - these need to exist in your Supabase auth system
  const handleQuickLogin = async (userType: string) => {
    setIsSubmitting(true);
    let email = '';
    let password = 'password123'; // All demo accounts use the same password
    
    switch (userType) {
      case 'user':
        email = 'user@example.com';
        break;
      case 'influencer':
        email = 'influencer@example.com';
        break;
      case 'coach':
        email = 'coach@example.com';
        break;
      case 'company':
        email = 'company@example.com';
        break;
      case 'admin':
        email = 'admin@example.com';
        break;
    }
    
    try {
      await login(email, password);
      toast.success(`Logged in as ${userType}!`);
      // Navigation will happen automatically due to the useEffect
    } catch (error: any) {
      console.error('Quick login error:', error);
      toast.error(`Demo account not found. Please create it in Supabase first.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold gradient-text">Osprey</h1>
          <p className="mt-2 text-gray-600">
            The ultimate platform for women's fitness & collaboration
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6">
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/auth/register" className="text-primary hover:underline">
                Register
              </Link>
            </p>
          </div>
          
          <div className="mt-8">
            <p className="text-xs text-center text-gray-500 mb-3">
              Quick login for demo purposes:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin('user')}
                className="text-xs"
                disabled={isSubmitting}
              >
                User
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin('influencer')}
                className="text-xs"
                disabled={isSubmitting}
              >
                Influencer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin('coach')}
                className="text-xs"
                disabled={isSubmitting}
              >
                Coach
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin('company')}
                className="text-xs"
                disabled={isSubmitting}
              >
                Company
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
