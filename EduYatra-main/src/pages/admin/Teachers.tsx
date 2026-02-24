// frontend/src/pages/admin/Teachers.tsx
import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, Lock, Unlock } from 'lucide-react';
import { listAllTeachers, deleteUser, suspendUser, activateUser } from '../../lib/api/admin';

const Teachers: React.FC = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const data = await listAllTeachers({ page, limit: 20, search });
      setTeachers(data.teachers);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [page, search]);

  const handleSuspend = async (userId: string) => {
    if (window.confirm('Are you sure you want to suspend this teacher?')) {
      try {
        await suspendUser(userId, 30);
        fetchTeachers();
      } catch (error) {
        console.error('Error suspending teacher:', error);
      }
    }
  };

  const handleActivate = async (userId: string) => {
    try {
      await activateUser(userId);
      fetchTeachers();
    } catch (error) {
      console.error('Error activating teacher:', error);
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this teacher? This action cannot be undone.')) {
      try {
        await deleteUser(userId);
        fetchTeachers();
      } catch (error) {
        console.error('Error deleting teacher:', error);
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Teachers Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage all teacher accounts and activities
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg hover:opacity-90 transition-opacity shadow-md">
          <Plus size={18} />
          <span className="text-sm sm:text-base">Add Teacher</span>
        </button>
      </div>

      {/* Filter Section */}
      <div className="glass-effect rounded-xl border border-primary/10 p-3 sm:p-4 animate-slide-in">
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search teachers by name, email, subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-primary/20 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <select className="px-4 py-2 text-sm bg-background border border-primary/20 rounded-lg focus:ring-2 focus:ring-primary/50 transition-all">
            <option value="">All Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Science">Science</option>
            <option value="English">English</option>
            <option value="Social Studies">Social Studies</option>
          </select>
          <select className="px-4 py-2 text-sm bg-background border border-primary/20 rounded-lg focus:ring-2 focus:ring-primary/50 transition-all">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3 animate-slide-in" style={{ animationDelay: '0.1s' }}>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          teachers.map((teacher, index) => (
            <div
              key={teacher._id}
              className="glass-effect rounded-xl border border-primary/10 p-4 animate-slide-in hover:border-primary/30 transition-all"
              style={{ animationDelay: `${0.1 + index * 0.05}s` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                    {teacher.username?.charAt(0).toUpperCase() || teacher.fullName?.charAt(0).toUpperCase() || 'T'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">
                      {teacher.username || teacher.fullName || teacher.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">{teacher.email}</p>
                  </div>
                </div>
                {teacher.account_locked_until ? (
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
                  <span className="text-muted-foreground">Subject:</span>
                  <span className="font-medium text-foreground">{teacher.subject || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Classes:</span>
                  <span className="font-medium text-foreground">{teacher.classCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-mono text-foreground">{teacher._id.slice(-6)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-primary/10">
                <button className="flex-1 py-2 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors font-medium">
                  <Edit size={14} className="inline mr-1" />
                  Edit
                </button>
                {teacher.account_locked_until ? (
                  <button
                    onClick={() => handleActivate(teacher._id)}
                    className="flex-1 py-2 text-xs text-green-600 dark:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors font-medium"
                  >
                    <Unlock size={14} className="inline mr-1" />
                    Activate
                  </button>
                ) : (
                  <button
                    onClick={() => handleSuspend(teacher._id)}
                    className="flex-1 py-2 text-xs text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors font-medium"
                  >
                    <Lock size={14} className="inline mr-1" />
                    Suspend
                  </button>
                )}
                <button
                  onClick={() => handleDelete(teacher._id)}
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
                      Teacher
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Classes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card/50 divide-y divide-primary/10">
                  {teachers.map((teacher) => (
                    <tr key={teacher._id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                            {teacher.username?.charAt(0).toUpperCase() || teacher.fullName?.charAt(0).toUpperCase() || 'T'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-foreground">
                              {teacher.username || teacher.fullName || teacher.name}
                            </div>
                            <div className="text-xs text-muted-foreground">ID: {teacher._id.slice(-6)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {teacher.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {teacher.subject || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {teacher.classCount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {teacher.account_locked_until ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                            Suspended
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit">
                            <Edit size={16} />
                          </button>
                          {teacher.account_locked_until ? (
                            <button
                              onClick={() => handleActivate(teacher._id)}
                              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                              title="Activate"
                            >
                              <Unlock size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSuspend(teacher._id)}
                              className="p-2 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
                              title="Suspend"
                            >
                              <Lock size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(teacher._id)}
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
            Page {page} of {pagination.pages} ({pagination.total} teachers)
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
    </div>
  );
};

export default Teachers;
