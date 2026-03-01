import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, ChevronDown } from 'lucide-react';
import { servicesAPI } from '../services/api';
import staticServices from '../data/services.json';

const Navbar = () => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const closeTimeoutRef = React.useRef(null);
  
  const mapStaticServices = (list) =>
    list.map((s) => ({
      ...s,
      isPopular: s.isPopular ?? s.popular,
    }));

  const [popularServices, setPopularServices] = useState(() =>
    mapStaticServices(staticServices).filter((s) => s.isPopular).slice(0, 6)
  );

  // Get popular services for dropdown (from backend so IDs match DB)
  useEffect(() => {
    let isMounted = true;

    const fetchPopularServices = async () => {
      try {
        const res = await servicesAPI.getAll({
          popular: true,
          active: true,
          limit: 50,
        });
        const list = res?.data?.data || [];
        const source = list.length ? list : staticServices;
        if (isMounted)
          setPopularServices(
            mapStaticServices(source).filter((s) => s.isPopular).slice(0, 6)
          );
      } catch (e) {
        console.error('Failed to load services for navbar:', e);
        if (isMounted)
          setPopularServices(
            mapStaticServices(staticServices)
              .filter((s) => s.isPopular)
              .slice(0, 6)
          );
      }
    };

    fetchPopularServices();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleServicesClick = (e) => {
    e.preventDefault();
    navigate('/select-city');
    setServicesDropdownOpen(false);
  };

  const handleServiceSelect = (service) => {
    if (service?.id) sessionStorage.setItem('selectedServiceId', service.id);
    if (service?.name) sessionStorage.setItem('selectedServiceName', service.name);
    navigate('/select-city');
    setServicesDropdownOpen(false);
  };

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setServicesDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setServicesDropdownOpen(false);
    }, 150);
  };

  const toggleServicesDropdown = () => {
    setServicesDropdownOpen(prev => !prev);
  };

  const getDashboardLink = () => {
    if (!currentUser) return '/login';
    
    switch (currentUser.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'provider':
        return '/provider/dashboard';
      case 'customer':
      default:
        return '/customer/dashboard';
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Left: Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group"
            title="HomEase - Home services made easy"
          >
            <img 
              src="/HomEase icon.png" 
              alt="HomEase Logo" 
              className="w-10 h-10 object-contain"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-blue-900 transition-all">
              HomEase
            </span>
          </Link>

          {/* Center: Primary Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Services with Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button 
                onClick={toggleServicesDropdown}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition font-medium py-2 border-b-2 border-transparent hover:border-blue-600"
              >
                <span>Services</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${servicesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              {servicesDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Popular Services</p>
                  </div>
                  {popularServices.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-blue-50 transition group/item"
                    >
                      <span className="text-2xl">{service.icon}</span>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-800 group-hover/item:text-blue-600">{service.name}</p>
                        <p className="text-xs text-gray-500">{service.description}</p>
                      </div>
                      <span className="text-xs text-gray-400">From Rs. {service.basePrice}</span>
                    </button>
                  ))}
                  <div className="border-t border-gray-100 mt-2 pt-2 px-4 pb-2">
                    <button
                      onClick={handleServicesClick}
                      className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-semibold py-2 hover:bg-blue-50 rounded transition"
                    >
                      View All Services →
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <Link 
              to="/how-it-works" 
              className="text-gray-700 hover:text-blue-600 transition font-medium py-2 border-b-2 border-transparent hover:border-blue-600"
            >
              How It Works
            </Link>
            
            <Link 
              to="/about" 
              className="text-gray-700 hover:text-blue-600 transition font-medium py-2 border-b-2 border-transparent hover:border-blue-600"
            >
              About
            </Link>
            
            <Link 
              to="/faq" 
              className="text-gray-700 hover:text-blue-600 transition font-medium py-2 border-b-2 border-transparent hover:border-blue-600"
            >
              FAQs
            </Link>
          </div>

          {/* Right: Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="text-gray-700 hover:text-blue-600 transition font-medium"
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                  <img
                    src={currentUser?.avatar || 'https://i.pravatar.cc/300?img=1'}
                    alt={currentUser?.name}
                    className="w-9 h-9 rounded-full border-2 border-blue-200"
                  />
                  <span className="text-sm font-medium text-gray-700">{currentUser?.name}</span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Become a Provider Button */}
                <Link
                  to="/provider/signup"
                  className="flex items-center space-x-2 px-5 py-2.5 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Become a Provider</span>
                </Link>
                
                {/* Login Button */}
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-gray-700 hover:text-blue-600 transition font-semibold"
                >
                  Login
                </Link>
                
                {/* Sign Up Button - Primary CTA */}
                <Link
                  to="/signup"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-sm hover:shadow-md"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {/* Navigation Links */}
            <button
              onClick={(e) => { handleServicesClick(e); setMobileMenuOpen(false); }}
              className="block w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition"
            >
              Services
            </button>
            <Link
              to="/how-it-works"
              className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              to="/about"
              className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/faq"
              className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              FAQs
            </Link>

            {/* Divider */}
            <div className="border-t border-gray-200 my-3"></div>

            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <div className="px-4 py-3 flex items-center space-x-3 bg-gray-50 rounded-lg">
                  <img
                    src={currentUser?.avatar || 'https://i.pravatar.cc/300?img=1'}
                    alt={currentUser?.name}
                    className="w-10 h-10 rounded-full border-2 border-blue-200"
                  />
                  <span className="text-sm font-medium text-gray-700">{currentUser?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 font-medium transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Become a Provider - Mobile */}
                <Link
                  to="/provider/signup"
                  className="flex items-center justify-center space-x-2 w-full px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Become a Provider</span>
                </Link>
                
                {/* Login - Mobile */}
                <Link
                  to="/login"
                  className="block w-full px-4 py-3 text-center rounded-lg text-gray-700 hover:bg-gray-100 font-semibold transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                
                {/* Sign Up - Mobile */}
                <Link
                  to="/signup"
                  className="block w-full px-4 py-3 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
