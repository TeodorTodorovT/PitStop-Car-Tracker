import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import logo from '../assets/pitstop-logo.png';

const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string()
    .email('Please enter a valid email')
    .max(50, 'Email cannot exceed 50 characters'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password cannot exceed 50 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

const Register = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors && Array.isArray(result.errors)) {
          throw new Error(result.errors[0]?.msg || 'Registration failed');
        } else if (result.message) {
          throw new Error(result.message);
        } else {
          throw new Error('An unexpected error occurred');
        }
      }

      addToast({
        description: 'Registration successful! Please log in.',
        variant: 'success',
      });

      navigate('/login');
    } catch (error) {
      addToast({
        description: error.message || 'An error occurred during registration',
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
            Enter your details to create your account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" error={!!errors.username}>
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="johndoe"
              error={!!errors.username}
              {...register('username')}
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>

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
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Button
              variant="ghost"
              className="text-primary hover:text-primary/90 p-0"
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