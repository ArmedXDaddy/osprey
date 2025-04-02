
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
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
      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Check if it's a "Email not confirmed" error
      if (error instanceof AuthError && error.message === 'Email not confirmed') {
        // Try to sign in with the "auto confirm" option
        try {
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: window.location.origin,
              data: {
                name: email.split('@')[0],
                role: 'user'
              }
            }
          });
          
          if (!signUpError) {
            toast.success('Login successful!');
            navigate('/');
          } else {
            toast.error(signUpError.message || 'Invalid email or password');
          }
        } catch (signUpError: any) {
          toast.error(signUpError.message || 'Authentication failed');
        }
      } else {
        toast.error(error.message || 'Invalid email or password');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Demo accounts for quick login
  const handleDemoLogin = async (type: string) => {
    setIsSubmitting(true);
    let demoEmail = '';
    let demoPassword = 'password123';
    
    switch(type) {
      case 'user':
        demoEmail = 'user@example.com';
        break;
      case 'influencer':
        demoEmail = 'influencer@example.com';
        break;
      case 'coach':
        demoEmail = 'coach@example.com';
        break;
      case 'company':
        demoEmail = 'company@example.com';
        break;
    }
    
    try {
      await login(demoEmail, demoPassword);
      toast.success(`Logged in as ${type}!`);
      navigate('/');
    } catch (error: any) {
      console.error('Demo login error:', error);
      
      // If demo account doesn't exist, create it
      if (error instanceof AuthError && error.message === 'Email not confirmed') {
        try {
          const { error: signUpError } = await supabase.auth.signUp({
            email: demoEmail,
            password: demoPassword,
            options: {
              emailRedirectTo: window.location.origin,
              data: {
                name: type,
                role: type === 'user' ? 'user' : type
              }
            }
          });
          
          if (!signUpError) {
            toast.success(`Created and logged in as ${type}!`);
            navigate('/');
          } else {
            toast.error(`Demo login failed: ${signUpError.message}`);
          }
        } catch (signUpError: any) {
          toast.error(`Demo login failed: ${signUpError.message}`);
        }
      } else {
        toast.error(`Demo login failed: ${error.message}`);
        toast.info('Demo account may not exist yet. Trying to create it...');
        
        try {
          // Try to create the demo account
          const { error: signUpError } = await supabase.auth.signUp({
            email: demoEmail,
            password: demoPassword,
            options: {
              emailRedirectTo: window.location.origin,
              data: {
                name: type,
                role: type === 'user' ? 'user' : type
              }
            }
          });
          
          if (!signUpError) {
            // Try login again after signup
            await login(demoEmail, demoPassword);
            toast.success(`Created and logged in as ${type}!`);
            navigate('/');
          } else {
            toast.error(`Failed to create demo account: ${signUpError.message}`);
          }
        } catch (signUpError: any) {
          toast.error(`Failed to create demo account: ${signUpError.message}`);
        }
      }
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
                onClick={() => handleDemoLogin('user')}
                className="text-xs"
                disabled={isSubmitting}
              >
                User
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('influencer')}
                className="text-xs"
                disabled={isSubmitting}
              >
                Influencer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('coach')}
                className="text-xs"
                disabled={isSubmitting}
              >
                Coach
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('company')}
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
