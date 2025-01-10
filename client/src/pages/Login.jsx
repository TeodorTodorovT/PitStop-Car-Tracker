import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import logo from '../assets/pitstop-logo.png';

const loginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email')
    .max(50, 'Email cannot exceed 50 characters'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password cannot exceed 50 characters'),
});

const Login = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle different types of errors
        if (result.errors && Array.isArray(result.errors)) {
          throw new Error(result.errors[0]?.msg || 'Login failed');
        } else if (result.message) {
          throw new Error(result.message);
        } else {
          throw new Error('An unexpected error occurred');
        }
      }

      // Store the token
      localStorage.setItem('token', result.token);
      
      addToast({
        description: 'You have successfully logged in',
        variant: 'success',
      });

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      addToast({
        description: error.message || 'An error occurred while logging in',
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
            Welcome Back! 🚗
          </h1>
          <p className="text-gray-500">
            Enter your details to access your account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" error={!!errors.email}>
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              error={!!errors.email}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" error={!!errors.password}>
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              error={!!errors.password}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Button
              variant="ghost"
              className="text-primary hover:text-primary/90 p-0"
              onClick={() => navigate('/register')}
            >
              Sign up
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 