import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, Briefcase, Shield } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, currentUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'customer'
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      if (currentUser.role.toLowerCase() === 'admin') {
        navigate('/admin/dashboard');
      } else if (currentUser.role.toLowerCase() === 'provider') {
        navigate('/provider/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    }
  }, [isAuthenticated, currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(formData.email, formData.password, formData.role);

    if (result.success) {
      const userRole = result.user.role.toLowerCase();
      // Redirect based on actual user role from server
      if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else if (userRole === 'provider') {
        navigate('/provider/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } else {
      setError(result.message || 'Invalid credentials');
    }

    setIsLoading(false);
  };

  // Demo credentials helper
  const fillDemoAccount = (role) => {
    const demoCredentials = {
      customer: { email: 'umar.farooq@example.com', password: 'demo123' },
      provider: { email: 'ahmed.khan@example.com', password: 'demo123' },
      admin: { email: 'admin@homeease.com', password: 'admin123' }
    };

    setFormData({
      email: demoCredentials[role].email,
      password: demoCredentials[role].password,
      role: role
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-100 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Card Container with Enhanced Shadow */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-10">
          {/* Logo - Larger & Centered */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-500 text-base">Sign in to your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Modern Role Selector - Segmented Buttons */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Login As
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'customer' })}
                  className={`relative px-4 py-3.5 rounded-lg text-sm font-medium transition-all duration-200 flex flex-col items-center justify-center space-y-1 ${formData.role === 'customer'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                >
                  <User className="w-4 h-4" />
                  <span>Customer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'provider' })}
                  className={`relative px-4 py-3.5 rounded-lg text-sm font-medium transition-all duration-200 flex flex-col items-center justify-center space-y-1 ${formData.role === 'provider'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Provider</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'admin' })}
                  className={`relative px-4 py-3.5 rounded-lg text-sm font-medium transition-all duration-200 flex flex-col items-center justify-center space-y-1 ${formData.role === 'admin'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </button>
              </div>
            </div>

            {/* Email - Enhanced Input with Icon */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password - Enhanced with Show/Hide Toggle */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-11 pr-12 py-3.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Primary CTA Button - Enhanced with Animations */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all duration-200 font-semibold text-base shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Demo Accounts - Soft & Helpful Design */}
          <div className="mt-8 p-5 bg-gray-50 border border-gray-200 rounded-xl">
            <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
              <span>👋</span>
              <span>Try a demo account</span>
            </p>
            <div className="flex flex-col space-y-2.5">
              <button
                onClick={() => fillDemoAccount('customer')}
                className="flex items-center space-x-3 text-left hover:bg-white px-3 py-2.5 rounded-lg transition-colors group"
              >
                <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-700 group-hover:text-blue-600">Customer</div>
                  <div className="text-xs text-gray-500">umar.farooq@example.com</div>
                </div>
              </button>
              <button
                onClick={() => fillDemoAccount('provider')}
                className="flex items-center space-x-3 text-left hover:bg-white px-3 py-2.5 rounded-lg transition-colors group"
              >
                <Briefcase className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-700 group-hover:text-blue-600">Provider</div>
                  <div className="text-xs text-gray-500">ahmed.khan@example.com</div>
                </div>
              </button>
              <button
                onClick={() => fillDemoAccount('admin')}
                className="flex items-center space-x-3 text-left hover:bg-white px-3 py-2.5 rounded-lg transition-colors group"
              >
                <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-700 group-hover:text-blue-600">Admin</div>
                  <div className="text-xs text-gray-500">admin@homeease.com</div>
                </div>
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
