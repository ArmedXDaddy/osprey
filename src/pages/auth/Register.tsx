
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UserRole } from '@/types';
import { toast } from 'sonner';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await register(email, password, name, role);
      toast.success('Registration successful!');
      navigate('/');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create demo accounts
  const handleCreateDemoAccount = async (type: string) => {
    setIsSubmitting(true);
    let demoEmail = '';
    let demoName = '';
    let demoRole: UserRole = 'user';
    const demoPassword = 'password123';
    
    switch(type) {
      case 'user':
        demoEmail = 'user@example.com';
        demoName = 'Emma Johnson';
        demoRole = 'user';
        break;
      case 'influencer':
        demoEmail = 'influencer@example.com';
        demoName = 'Sophia Williams';
        demoRole = 'influencer';
        break;
      case 'coach':
        demoEmail = 'coach@example.com';
        demoName = 'Alexandra Chen';
        demoRole = 'coach';
        break;
      case 'company':
        demoEmail = 'company@example.com';
        demoName = 'FitTech Apparel';
        demoRole = 'company';
        break;
    }
    
    try {
      await register(demoEmail, demoPassword, demoName, demoRole);
      toast.success(`Demo ${type} account created!`);
      toast.info('You can now log in with this account');
      navigate('/auth/login');
    } catch (error: any) {
      console.error('Demo account creation error:', error);
      
      if (error.message?.includes('already exists')) {
        toast.info(`Demo ${type} account already exists. You can log in with it.`);
        navigate('/auth/login');
      } else {
        toast.error(`Failed to create demo account: ${error.message}`);
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
          <h2 className="text-2xl font-bold text-center mb-6">Create an Account</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
              />
            </div>
            
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
            
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <Label>I am a:</Label>
              <RadioGroup 
                value={role} 
                onValueChange={(value) => setRole(value as UserRole)}
                className="mt-2 grid grid-cols-2 gap-2"
              >
                <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="user" id="user" />
                  <Label htmlFor="user" className="cursor-pointer">User/Follower</Label>
                </div>
                
                <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="influencer" id="influencer" />
                  <Label htmlFor="influencer" className="cursor-pointer">Influencer/Athlete</Label>
                </div>
                
                <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="coach" id="coach" />
                  <Label htmlFor="coach" className="cursor-pointer">Coach</Label>
                </div>
                
                <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="company" id="company" />
                  <Label htmlFor="company" className="cursor-pointer">Company/Sponsor</Label>
                </div>
              </RadioGroup>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Register'}
            </Button>
          </form>
          
          <div className="mt-6">
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/auth/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </div>
          
          <div className="mt-8 border-t pt-6">
            <p className="text-xs text-center text-gray-500 mb-3">
              Create demo accounts:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleCreateDemoAccount('user')}
                className="text-xs"
                disabled={isSubmitting}
              >
                Create User Demo
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleCreateDemoAccount('influencer')}
                className="text-xs"
                disabled={isSubmitting}
              >
                Create Influencer Demo
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleCreateDemoAccount('coach')}
                className="text-xs"
                disabled={isSubmitting}
              >
                Create Coach Demo
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleCreateDemoAccount('company')}
                className="text-xs"
                disabled={isSubmitting}
              >
                Create Company Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
