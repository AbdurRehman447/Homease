import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { adminAPI } from '../services/api';
import { X } from 'lucide-react';

const AdminProviders = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, verified: 0, avgRating: 0, totalReviews: 0 });
  const [showModal, setShowModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    bio: '',
    experience: '',
    city: '',
    location: '',
    address: '',
    status: 'PENDING'
  });

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllProviders({ limit: 100 });
      const providerData = response.data.data;
      setProviders(providerData);

      // Calculate stats
      const verified = providerData.filter(p => p.isVerified).length;
      const avgRating = providerData.length > 0 
        ? (providerData.reduce((sum, p) => sum + p.rating, 0) / providerData.length).toFixed(1)
        : 0;
      const totalReviews = providerData.reduce((sum, p) => sum + p.totalReviews, 0);

      setStats({ total: providerData.length, verified, avgRating, totalReviews });
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveProvider(id);
      fetchProviders(); // Refresh list
    } catch (error) {
      console.error('Error approving provider:', error);
      alert('Failed to approve provider');
    }
  };

  const handleSuspend = async (id) => {
    const reason = prompt('Enter suspension reason:');
    if (!reason) return;

    try {
      await adminAPI.suspendProvider(id, reason);
      fetchProviders(); // Refresh list
    } catch (error) {
      console.error('Error suspending provider:', error);
      alert('Failed to suspend provider');
    }
  };

  // Open Add Modal
  const handleAddNew = () => {
    setEditingProvider(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      bio: '',
      experience: '',
      city: '',
      location: '',
      address: '',
      status: 'PENDING'
    });
    setShowModal(true);
  };

  // Open Edit Modal
  const handleEdit = (provider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      email: provider.email,
      password: '', // Don't show password
      phone: provider.phone || '',
      bio: provider.bio || '',
      experience: provider.experience || '',
      city: provider.city || '',
      location: provider.location || '',
      address: provider.address || '',
      status: provider.status
    });
    setShowModal(true);
  };

  // Handle Submit (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const dataToSend = {
        ...formData,
        experience: formData.experience ? parseInt(formData.experience) : 0
      };

      // Don't send empty password on update
      if (editingProvider && !dataToSend.password) {
        delete dataToSend.password;
      }

      if (editingProvider) {
        // Update existing provider
        await adminAPI.updateProvider(editingProvider.id, dataToSend);
        alert('Provider updated successfully!');
      } else {
        // Create new provider
        await adminAPI.createProvider(dataToSend);
        alert('Provider created successfully!');
      }
      
      setShowModal(false);
      fetchProviders();
    } catch (error) {
      console.error('Error saving provider:', error);
      alert(error.response?.data?.message || 'Failed to save provider');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete
  const handleDelete = async (providerId, providerName) => {
    const confirm = window.confirm(`Are you sure you want to delete "${providerName}"? This action cannot be undone and will fail if the provider has active bookings.`);
    if (!confirm) return;

    try {
      await adminAPI.deleteProvider(providerId);
      alert('Provider deleted successfully!');
      fetchProviders();
    } catch (error) {
      console.error('Error deleting provider:', error);
      alert(error.response?.data?.message || 'Failed to delete provider');
    }
  };
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 ml-64">
        <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Providers Management</h1>
              <p className="text-sm text-gray-600">Manage service providers on the platform</p>
            </div>
            <button 
              onClick={handleAddNew}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Add New Provider
            </button>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-gray-500 text-sm">Total Providers</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-gray-500 text-sm">Verified</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.verified}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-gray-500 text-sm">Avg Rating</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.avgRating}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-gray-500 text-sm">Total Reviews</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.totalReviews}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {providers.length > 0 ? (
                      providers.map((provider) => (
                        <tr key={provider.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img src={provider.avatar || 'https://i.pravatar.cc/100'} alt={provider.name} className="w-10 h-10 rounded-full" />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{provider.name}</div>
                                <div className="text-sm text-gray-500">{provider.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{provider.city}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{provider.experience || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-yellow-500 mr-1">⭐</span>
                              <span className="text-sm font-medium text-gray-900">{provider.rating}</span>
                              <span className="text-sm text-gray-500 ml-1">({provider.totalReviews})</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{provider.totalBookings}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {provider.status === 'APPROVED' ? (
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-700">
                                Approved
                              </span>
                            ) : provider.status === 'PENDING' ? (
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-700">
                                Pending
                              </span>
                            ) : provider.status === 'SUSPENDED' ? (
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-700">
                                Suspended
                              </span>
                            ) : (
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-700">
                                {provider.status}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                            <button 
                              onClick={() => handleEdit(provider)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                            {provider.status === 'PENDING' && (
                              <button 
                                onClick={() => handleApprove(provider.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Approve
                              </button>
                            )}
                            {(provider.status === 'APPROVED' || provider.status === 'PENDING') && (
                              <button 
                                onClick={() => handleSuspend(provider.id)}
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                Suspend
                              </button>
                            )}
                            <button 
                              onClick={() => handleDelete(provider.id, provider.name)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                          No providers found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Provider Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingProvider ? 'Edit Provider' : 'Add New Provider'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Ahmed Khan"
                />
              </div>

              {/* Email and Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="ahmed@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="+92-300-1234567"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password {editingProvider ? '(leave empty to keep unchanged)' : '*'}
                </label>
                <input
                  type="password"
                  required={!editingProvider}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter password"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio/Description
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Professional cleaner with 5 years of experience"
                ></textarea>
              </div>

              {/* Experience, City, Status */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience (years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <select
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select city</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Location and Address */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location/Area
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="DHA Phase 5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Block 7, Street 10"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Saving...' : (editingProvider ? 'Update Provider' : 'Create Provider')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProviders;
