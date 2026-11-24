import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button, Input } from '../components/ui';
import { useNavigate } from 'react-router-dom';
import { login } from '../store/store';
import { useToast } from '../components/ToastProvider';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { toast } = useToast();
  
  // Zod schema for validation
  const schema = z.object({
    email: z.string().email('Valid email required').min(1),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  });

  // Extract types from schema
  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    isSubmitting,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await dispatch(login(data)).unwrap();
      toast({
        title: 'Success',
        description: 'Logged in successfully!',
        variant: 'success',
      });
      navigate('/campus');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err || 'Login failed',
        variant: 'error',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-campus-primary to-campus-secondary flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-campus-secondary text-center mb-6">Welcome Back</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <Input
              type="email"
              name="email"
              placeholder="student@university.edu"
              {...register()}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-campus-primary"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <Input
              type="password"
              name="password"
              placeholder="••••••••"
              {...register()}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-campus-primary"
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full py-2 bg-campus-primary text-white rounded font-medium hover:bg-campus-secondary transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
        
        <p className="text-center mt-6 text-sm">
          Don't have an account? <Link to="/register" className="text-campus-primary font-medium hover underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;