// frontend/src/pages/admin/Admins.tsx
import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, Lock, Unlock, Shield, Key, Copy, CheckCircle, Settings, X } from 'lucide-react';
import { toast } from 'sonner';
import { 
  listAllAdmins, 
  deleteUser, 
  suspendUser, 
  activateUser, 
  createUser,
  listAdminCodes,
  createAdminCode,
  deleteAdminCode,
  toggleAdminCodeStatus,
  updateAdminPermissions,
  createSuperAdmin 
} from '../../lib/api/admin';

const Admins: React.FC = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [adminCodes, setAdminCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [codesLoading, setCodesLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Check if current user is super admin
  const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true';
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    institution: '',
    adminCode: 'ADMIN2024',
  });
  const [codeFormData, setCodeFormData] = useState({
    code: '',
    institute: '',
    isSuperAdminCode: false,
    maxUses: '1',
    expiresAt: '',
  });

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await listAllAdmins({ page, limit: 20, search });
      setAdmins(data.admins);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminCodes = async () => {
    try {
      setCodesLoading(true);
      const data = await listAdminCodes({ page: 1, limit: 50 });
      setAdminCodes(data.codes);
    } catch (error) {
      console.error('Error fetching admin codes:', error);
    } finally {
      setCodesLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
    fetchAdminCodes();
  }, [page, search]);

  const handleSuspend = async (userId: string) => {
    if (window.confirm('Are you sure you want to suspend this admin?')) {
      try {
        await suspendUser(userId, 30);
        fetchAdmins();
      } catch (error) {
        console.error('Error suspending admin:', error);
      }
    }
  };

  const handleActivate = async (userId: string) => {
    try {
      await activateUser(userId);
      fetchAdmins();
    } catch (error) {
      console.error('Error activating admin:', error);
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this admin? This action cannot be undone.')) {
      try {
        await deleteUser(userId);
        fetchAdmins();
      } catch (error) {
        console.error('Error deleting admin:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser({ ...formData, role: 'admin' });
      setShowModal(false);
      setFormData({
        username: '',
        email: '',
        password: '',
        fullName: '',
        institution: '',
        adminCode: 'ADMIN2024',
      });
      fetchAdmins();
    } catch (error) {
      console.error('Error creating admin:', error);
      alert('Failed to create admin. Please check all fields.');
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Format data - send null/undefined for empty optional fields
      const data = {
        code: codeFormData.code,
        institute: codeFormData.institute,
        isSuperAdminCode: codeFormData.isSuperAdminCode,
        maxUses: codeFormData.maxUses ? parseInt(codeFormData.maxUses) : null,
        expiresAt: codeFormData.expiresAt || null,
      };
      const response = await createAdminCode(data);
      
      // Success
      setShowCodeModal(false);
      setCodeFormData({
        code: '',
        institute: '',
        isSuperAdminCode: false,
        maxUses: '1',
        expiresAt: '',
      });
      await fetchAdminCodes();
      toast.success(`${codeFormData.isSuperAdminCode ? 'Super admin' : 'Admin'} code created successfully`);
    } catch (error: any) {
      console.error('Error creating admin code:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to create admin code';
      toast.error(errorMsg);
    }
  };

  const handleDeleteCode = async (codeId: string) => {
    if (window.confirm('Are you sure you want to delete this admin code?')) {
      try {
        await deleteAdminCode(codeId);
        fetchAdminCodes();
      } catch (error) {
        console.error('Error deleting admin code:', error);
      }
    }
  };

  const handleToggleCodeStatus = async (codeId: string) => {
    try {
      await toggleAdminCodeStatus(codeId);
      fetchAdminCodes();
    } catch (error) {
      console.error('Error toggling admin code status:', error);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Available modules for permission management
  const availableModules = [
    { id: 'dashboard', label: 'Dashboard', description: 'View dashboard statistics' },
    { id: 'students', label: 'Students', description: 'Manage student accounts' },
    { id: 'teachers', label: 'Teachers', description: 'Manage teacher accounts' },
    { id: 'classes', label: 'Classes', description: 'Manage classes' },
    { id: 'exams', label: 'Exams', description: 'Manage exams and tests' },
    { id: 'question-banks', label: 'Question Banks', description: 'Manage question banks' },
    { id: 'content', label: 'Content', description: 'Manage sliders, posters, ads' },
    { id: 'support', label: 'Support Tickets', description: 'Handle support requests' },
    { id: 'analytics', label: 'Analytics', description: 'View analytics and reports' },
    { id: 'subscriptions', label: 'Subscriptions', description: 'Manage subscriptions' },
    { id: 'settings', label: 'Settings', description: 'System settings' },
    { id: 'audit-logs', label: 'Audit Logs', description: 'View audit logs' }
  ];

  const openPermissionsModal = (admin: any) => {
    setSelectedAdmin(admin);
    setShowPermissionsModal(true);
  };

  const handlePermissionToggle = (moduleId: string) => {
    if (!selectedAdmin) return;
    
    const currentPermissions = selectedAdmin.permissions || [];
    const newPermissions = currentPermissions.includes(moduleId)
      ? currentPermissions.filter((p: string) => p !== moduleId)
      : [...currentPermissions, moduleId];
    
    setSelectedAdmin({ ...selectedAdmin, permissions: newPermissions });
  };

  const handleSavePermissions = async () => {
    if (!selectedAdmin) return;
    
    try {
      console.log('Saving permissions for admin:', selectedAdmin._id);
      console.log('Permissions to save:', selectedAdmin.permissions);
      
      const response = await updateAdminPermissions(selectedAdmin._id, selectedAdmin.permissions || []);
      console.log('Update response:', response);
      
      alert('Permissions updated successfully!');
      setShowPermissionsModal(false);
      setSelectedAdmin(null);
      fetchAdmins();
    } catch (error: any) {
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update permissions';
      alert(`Error: ${errorMessage}`);
    }
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCodeFormData({ ...codeFormData, code });
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Admin Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage administrator accounts and permissions
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg hover:opacity-90 transition-opacity shadow-md"
          >
            <Plus size={18} />
            <span className="text-sm sm:text-base">Add Admin</span>
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="glass-effect rounded-xl border border-primary/10 p-3 sm:p-4 animate-slide-in">
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search admins by name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-primary/20 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3 animate-slide-in" style={{ animationDelay: '0.1s' }}>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          admins.map((admin, index) => (
            <div
              key={admin._id}
              className="glass-effect rounded-xl border border-primary/10 p-4 animate-slide-in hover:border-primary/30 transition-all"
              style={{ animationDelay: `${0.1 + index * 0.05}s` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white shadow-md">
                    <Shield size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">
                      {admin.username || admin.fullName || admin.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
                  </div>
                </div>
                {admin.account_locked_until ? (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                    Suspended
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                    Active
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Institution:</span>
                  <span className="font-medium text-foreground">{admin.institution || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Joined:</span>
                  <span className="font-medium text-foreground">{new Date(admin.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-mono text-foreground">{admin._id.slice(-6)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-primary/10">
                {isSuperAdmin && admin.email !== 'admin@gmail.com' && (
                  <button
                    onClick={() => openPermissionsModal(admin)}
                    className="flex-1 py-2 text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors font-medium"
                  >
                    <Settings size={14} className="inline mr-1" />
                    Permissions
                  </button>
                )}
                <button className="flex-1 py-2 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors font-medium">
                  <Edit size={14} className="inline mr-1" />
                  Edit
                </button>
                {admin.account_locked_until ? (
                  <button
                    onClick={() => handleActivate(admin._id)}
                    className="p-2 text-green-600 dark:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                  >
                    <Unlock size={14} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleSuspend(admin._id)}
                    className="p-2 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
                  >
                    <Lock size={14} />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(admin._id)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block glass-effect rounded-xl border border-primary/10 overflow-hidden animate-slide-in" style={{ animationDelay: '0.2s' }}>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-primary/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Institution
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card/50 divide-y divide-primary/10">
                  {admins.map((admin) => (
                    <tr key={admin._id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white shadow-md">
                            <Shield size={18} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-foreground">
                              {admin.username || admin.fullName || admin.name}
                            </div>
                            <div className="text-xs text-muted-foreground">ID: {admin._id.slice(-6)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {admin.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {admin.institution || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {admin.account_locked_until ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                            Suspended
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(admin.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {isSuperAdmin && admin.email !== 'admin@gmail.com' && (
                            <button
                              onClick={() => openPermissionsModal(admin)}
                              className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                              title="Manage Permissions"
                            >
                              <Settings size={16} />
                            </button>
                          )}
                          <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit">
                            <Edit size={16} />
                          </button>
                          {admin.account_locked_until ? (
                            <button
                              onClick={() => handleActivate(admin._id)}
                              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                              title="Activate"
                            >
                              <Unlock size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSuspend(admin._id)}
                              className="p-2 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
                              title="Suspend"
                            >
                              <Lock size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(admin._id)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Desktop Pagination */}
            {pagination && (
              <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-primary/10 bg-muted/30">
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{(page - 1) * pagination.limit + 1}</span> to{' '}
                  <span className="font-medium text-foreground">
                    {Math.min(page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium text-foreground">{pagination.total}</span> results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 sm:px-4 py-2 text-sm border border-primary/20 rounded-lg hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.pages}
                    className="px-3 sm:px-4 py-2 text-sm border border-primary/20 rounded-lg hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mobile Pagination */}
      {!loading && pagination && (
        <div className="block md:hidden px-4 py-3 glass-effect rounded-xl border border-primary/10">
          <div className="text-xs text-center text-muted-foreground mb-3">
            Page {page} of {pagination.pages} ({pagination.total} admins)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="flex-1 px-4 py-2 text-sm border border-primary/20 rounded-lg hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.pages}
              className="flex-1 px-4 py-2 text-sm border border-primary/20 rounded-lg hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Admin</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Code Management Section - Only visible to Super Admin */}
      {isSuperAdmin && (
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Key className="text-indigo-600" size={24} />
                Admin Signup Codes
              </h2>
              <p className="text-gray-600 mt-1">Generate signup codes for new admins and super admins</p>
            </div>
            <button
              onClick={() => setShowCodeModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus size={20} />
              Generate Code
            </button>
          </div>

        {codesLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : adminCodes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No admin codes generated yet. Click "Generate Code" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Used By</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {adminCodes.map((code) => (
                  <tr key={code._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-gray-100 rounded font-mono text-sm">
                          {code.code}
                        </code>
                        <button
                          onClick={() => copyToClipboard(code.code)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Copy code"
                        >
                          {copiedCode === code.code ? (
                            <CheckCircle size={16} className="text-green-600" />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {code.description || '-'}
                    </td>
                    <td className="px-4 py-3">
                      {code.used_by ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          Used
                        </span>
                      ) : code.is_active ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {code.used_by ? (
                        <div>
                          <div>{code.used_by.username || code.used_by.fullName}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(code.used_at).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(code.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {code.expires_at ? new Date(code.expires_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!code.used_by && (
                          <button
                            onClick={() => handleToggleCodeStatus(code._id)}
                            className={`${
                              code.is_active
                                ? 'text-yellow-600 hover:text-yellow-900'
                                : 'text-green-600 hover:text-green-900'
                            }`}
                            title={code.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {code.is_active ? <Lock size={18} /> : <Unlock size={18} />}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteCode(code._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
      )}

      {/* Create Admin Code Modal - Only visible to Super Admin */}
      {isSuperAdmin && showCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Key className="text-indigo-600" size={24} />
              Generate Admin Code
            </h3>
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Code *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={codeFormData.code}
                    onChange={(e) => setCodeFormData({ ...codeFormData, code: e.target.value.toUpperCase() })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                    placeholder="Enter or generate"
                    required
                  />
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    title="Generate Random Code"
                  >
                    <Key size={20} />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Institute *</label>
                <input
                  type="text"
                  value={codeFormData.institute}
                  onChange={(e) => setCodeFormData({ ...codeFormData, institute: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., SRM, IIT, Harvard"
                  required
                />
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={codeFormData.isSuperAdminCode}
                    onChange={(e) => setCodeFormData({ ...codeFormData, isSuperAdminCode: e.target.checked })}
                    className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-purple-900 flex items-center gap-2">
                      <Shield size={16} />
                      Create Super Admin Code
                    </div>
                    <div className="text-sm text-purple-700 mt-1">
                      This code will create a super admin with full system access
                    </div>
                  </div>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses *</label>
                <input
                  type="number"
                  value={codeFormData.maxUses}
                  onChange={(e) => setCodeFormData({ ...codeFormData, maxUses: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Default: 1"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date *</label>
                <input
                  type="date"
                  value={codeFormData.expiresAt}
                  onChange={(e) => setCodeFormData({ ...codeFormData, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCodeModal(false);
                    setCodeFormData({ code: '', institute: '', isSuperAdminCode: false, maxUses: '1', expiresAt: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-4 py-2 text-white rounded-lg ${
                    codeFormData.isSuperAdminCode
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {codeFormData.isSuperAdminCode ? 'Generate Super Admin Code' : 'Generate Admin Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Manage Admin Permissions</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedAdmin.name} ({selectedAdmin.email})
                </p>
              </div>
              <button
                onClick={() => {
                  setShowPermissionsModal(false);
                  setSelectedAdmin(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Select which modules this admin can access:
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                {availableModules.map((module) => (
                  <div
                    key={module.id}
                    className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      id={`permission-${module.id}`}
                      checked={selectedAdmin.permissions?.includes(module.id) || false}
                      onChange={() => handlePermissionToggle(module.id)}
                      className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`permission-${module.id}`}
                      className="ml-3 flex-1 cursor-pointer"
                    >
                      <div className="font-medium text-gray-900">{module.name}</div>
                      <div className="text-sm text-gray-500">{module.description}</div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowPermissionsModal(false);
                  setSelectedAdmin(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePermissions}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admins;
