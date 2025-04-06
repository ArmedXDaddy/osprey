import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  role: z.enum(['user', 'influencer', 'coach', 'company']),
});

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register: useFormRegister,
    handleSubmit,
    formState: { errors }
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const handleRegister = async (formData: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError('');
    
    try {
      await register(
        formData.email,
        formData.password,
        formData.name,
        formData.role as UserRole
      );
      
      toast({
        title: "Registration successful",
        description: "Your account has been created. You can now login.",
      });
      
      navigate('/auth/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md p-4 bg-white dark:bg-gray-800 shadow-md rounded-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white text-center">
            Create an account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleRegister)} className="space-y-4">
            <div>
              <Label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </Label>
              <Input
                type="text"
                id="name"
                placeholder="Enter your name"
                className="mt-1 w-full rounded-md shadow-sm focus:ring focus:ring-primary/50 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                {...useFormRegister("name")}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </Label>
              <Input
                type="email"
                id="email"
                placeholder="Enter your email"
                className="mt-1 w-full rounded-md shadow-sm focus:ring focus:ring-primary/50 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                {...useFormRegister("email")}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </Label>
              <Input
                type="password"
                id="password"
                placeholder="Enter your password"
                className="mt-1 w-full rounded-md shadow-sm focus:ring focus:ring-primary/50 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                {...useFormRegister("password")}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Role
              </Label>
              <Select {...useFormRegister("role")} >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="influencer">Influencer</SelectItem>
                  <SelectItem value="coach">Coach</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
              )}
            </div>
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            <Button disabled={isLoading} className="w-full" type="submit">
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link to="/auth/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
