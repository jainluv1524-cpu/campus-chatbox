import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button, Input, Select } from '../components/ui';
import { useNavigate } from 'react-router-dom';
import { register } from '../store/store';
import { useToast } from '../components/ToastProvider';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { toast } = useToast();
  
  // Zod schema for validation
  const schema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    displayName: z.string().min(2, 'Display name must be at least 2 characters'),
    email: z.string().email('Valid email required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
    phoneNumber: z.string().optional(),
    college: z.string().min(2, 'College must be at least 2 characters'),
    department: z.string().optional(),
    academicYear: z.enum(['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate', 'PhD']),
  });

  // Extract types from schema
  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const onSubmit = async (data: FormValues) => {
    try {
      await dispatch(
        register({
          fullName: data.fullName,
          displayName: data.displayName,
          email: data.email,
          password: data.password,
          phoneNumber: data.phoneNumber || undefined,
          college: data.college,
          department: data.department,
          academicYear: data.academicYear,
        })
      ).unwrap();
      
      toast({
        title: 'Success',
        description: 'Account created successfully! Please login.',
        variant: 'success',
      });
      setTimeout(() => setSuccess(''), 3000);
      navigate('/login');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err || 'Registration failed',
        variant: 'error',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-campus-primary to-campus-secondary flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-campus-secondary text-center mb-6">Create Account</h2>
        
        {error && (
          <div className="bg-red-100 text-red-800 rounded-b border border-red-300 p-3 mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 text-green-800 rounded-b border border-green-300 p-3 mb-4">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <Input
                type="text"
                name="fullName"
                {...register()}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-campus-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
              <Input
                type="text"
                name="displayName"
                {...register()}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-campus-primary"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <Input
              type="email"
              name="email"
              {...register()}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus-border-campus-primary"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <Input
                type="phone"
                name="phoneNumber"
                {...register()}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-campus-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">College/University</label>
              <Input
                type="text"
                name="college"
                {...register()}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus-border-campus-primary"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <Input
                type="text"
                name="department"
                {...register()}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus-border-campus-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
              <Select
                name="academicYear"
                {...register()}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus-border-campus-primary"
              >
                <option value="">Select Academic Year</option>
                <option value="Freshman">Freshman</option>
                <option value="Sophomore">Sophomore</option>
                <option value="Junior">Junior</option>
                <option value="Senior">Senior</option>
                <option value="Graduate">Graduate</option>
                <option value="PhD">PhD</option>
              </Select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <Input
              type="password"
              name="password"
              {...register()}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus-border-campus-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <Input
              type="password"
              name="confirmPassword"
              {...register({ validate: (value: string) => value === register().password })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus-border-campus-primary"
            />
          </div>
          
          <Button
            type="submit"
            className="w-full py-2 bg-campus-primary text-white rounded font-medium hover:bg-campus-secondary transition-colors"
          >
            Create Account
          </Button>
        </form>
        
        <p className="text-center mt-6 text-sm">
          Already have an account? <Link to="/login" className="text-campus-primary font-medium hover underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;