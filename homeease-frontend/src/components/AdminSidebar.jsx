import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: '' },
    { name: 'Bookings', path: '/admin/bookings', icon: '' },
    { name: 'Providers', path: '/admin/providers', icon: '' },
    { name: 'Customers', path: '/admin/customers', icon: '' },
    { name: 'Services', path: '/admin/services', icon: '' },
    { name: 'Analytics', path: '/admin/analytics', icon: '' },
    { name: 'Settings', path: '/admin/settings', icon: '' },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <span className="text-3xl">🏠</span>
          <div>
            <h2 className="text-xl font-bold">HomEase</h2>
            <p className="text-xs text-gray-400">Admin Panel</p>
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
      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-800">
        <Link
          to="/"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition"
        >
          <span className="font-medium">Back to Site</span>
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
