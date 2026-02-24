// frontend/src/pages/admin/Institutes.tsx
import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Building2, Users, Shield } from 'lucide-react';
import { listInstitutes, createInstitute, updateInstitute, deleteInstitute } from '../../lib/api/admin';
import { useNavigate } from 'react-router-dom';

const Institutes: React.FC = () => {
  const [institutes, setInstitutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingInstitute, setEditingInstitute] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
  });
  
  const navigate = useNavigate();
  const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true';
  
  // Redirect if not super admin
  useEffect(() => {
    if (!isSuperAdmin) {
      alert('Access denied. Only super admin can manage institutes.');
      navigate('/admin');
    }
  }, [isSuperAdmin, navigate]);
  
  if (!isSuperAdmin) {
    return (
      <AdminPageLayout>
        <AdminEmptyState
          message="Access Denied. Only super admin can access this page."
          icon={<Shield size={64} className="text-muted-foreground" />}
        />
      </AdminPageLayout>
    );
  }

  const fetchInstitutes = async () => {
    try {
      setLoading(true);
      const data = await listInstitutes({ page, limit: 20, search });
      setInstitutes(data.institutes);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching institutes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutes();
  }, [page, search]);

  const handleDelete = async (instituteId: string) => {
    if (window.confirm('Are you sure you want to delete this institute? This will fail if it has active users.')) {
      try {
        await deleteInstitute(instituteId);
        fetchInstitutes();
      } catch (error: any) {
        alert(error.response?.data?.error || 'Failed to delete institute');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingInstitute) {
        await updateInstitute(editingInstitute._id, formData);
      } else {
        await createInstitute(formData);
      }
      setShowModal(false);
      setEditingInstitute(null);
      setFormData({ name: '', location: '' });
      fetchInstitutes();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save institute');
    }
  };

  const openEditModal = (institute: any) => {
    setEditingInstitute(institute);
    setFormData({
      name: institute.name,
      location: institute.location || '',
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Institute Management</h1>
          <p className="text-gray-600 mt-1">Manage educational institutions in the system</p>
        </div>
        <button
          onClick={() => {
            setEditingInstitute(null);
            setFormData({ name: '', location: '' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus size={20} />
          Add Institute
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search institutes by name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : institutes.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow-sm p-12 text-center">
            <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">No institutes found</p>
          </div>
        ) : (
          institutes.map((institute) => (
            <div key={institute._id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Building2 className="text-indigo-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{institute.name}</h3>
                    {institute.location && (
                      <p className="text-sm text-gray-500">{institute.location}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Users size={16} className="text-gray-400" />
                <span>{institute.userCount || 0} users</span>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => openEditModal(institute)}
                  className="flex-1 py-2 text-blue-600 hover:bg-blue-50 rounded transition-colors text-sm font-medium"
                >
                  <Edit size={16} className="inline mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(institute._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                Created: {new Date(institute.created_at).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2 flex items-center">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === pagination.pages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingInstitute ? 'Edit Institute' : 'Add Institute'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Institute Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., SRMAP, VIT AP"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Amaravati, Andhra Pradesh"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingInstitute(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {editingInstitute ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Institutes;
