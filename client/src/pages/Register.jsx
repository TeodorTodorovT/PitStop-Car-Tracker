import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { useEffect } from 'react';
import logo from '../assets/pitstop-logo.png';

const registerSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Register = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    trigger,
    watch,
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Watch password field for confirm password validation
  const password = watch('password');

  // Update schema with dynamic password matching
  useEffect(() => {
    if (password) {
      trigger('confirmPassword');
    }
  }, [password, trigger]);

  const onSubmit = async (data) => {
    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.errors?.[0]?.msg || result.message || 'Registration failed');
      }

      addToast({
        description: 'Account created successfully. Please log in.',
        variant: 'success',
      });

      // Redirect to login
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      addToast({
        description: error.message,
        variant: 'error',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bgColor">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-3xl shadow-xl">
        <div className="space-y-2 text-center">
          <img 
            src={logo} 
            alt="PitStop Logo" 
            className="h-20 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold tracking-tighter text-primary">
            Create Account 🚙
          </h1>
          <p className="text-gray-500">
            Join us to track your car maintenance
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" error={errors.username}>
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="johndoe"
              error={errors.username}
              {...register('username')}
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" error={errors.email}>
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              error={errors.email}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" error={errors.password}>
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              error={errors.password}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" error={errors.confirmPassword}>
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Button
              variant="ghost"
              className="text-primary hover:text-primary/80 p-0"
              onClick={() => navigate('/login')}
            >
              Sign in
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 