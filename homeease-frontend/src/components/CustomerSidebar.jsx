import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CustomerSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/customer/dashboard', icon: '' },
    { name: 'My Bookings', path: '/customer/bookings', icon: '' },
    { name: 'Browse Services', path: '/select-city', icon: '' },
    { name: 'Profile', path: '/customer/profile', icon: '' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <span className="text-3xl">🏠</span>
          <div>
            <h2 className="text-xl font-bold">HomEase</h2>
            <p className="text-xs text-gray-400">Customer Portal</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <img
            src={currentUser?.avatar || 'https://i.pravatar.cc/300?img=1'}
            alt={currentUser?.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-medium text-sm">{currentUser?.name}</p>
            <p className="text-xs text-gray-400">Customer</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  location.pathname === item.path
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <span className="font-medium">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-800 space-y-2">
        <Link
          to="/"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition"
        >
          <span className="font-medium">Back to Site</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-gray-800 transition"
        >
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default CustomerSidebar;
