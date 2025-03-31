
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick login buttons for demo
  const handleQuickLogin = async (userType: string) => {
    setIsSubmitting(true);
    let email = '';
    
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
      await login(email, 'password');
      toast.success(`Logged in as ${userType}!`);
      navigate('/');
    } catch (error) {
      console.error('Quick login error:', error);
      toast.error('Login failed');
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
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
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
