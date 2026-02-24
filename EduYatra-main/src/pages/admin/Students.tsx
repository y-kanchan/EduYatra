// frontend/src/pages/admin/Students.tsx
import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, Lock, Unlock, RefreshCw, Download } from 'lucide-react';
import { listAllStudents, deleteUser, suspendUser, activateUser } from '../../lib/api/admin';

const Students: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listAllStudents({ page, limit: 20, search });
      console.log('Students data received:', data);
      setStudents(data.students || []);
      setPagination(data.pagination);
    } catch (error: any) {
      console.error('Error fetching students:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.error || 'Failed to load students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, search]);

  const handleSuspend = async (userId: string) => {
    if (window.confirm('Are you sure you want to suspend this student?')) {
      try {
        await suspendUser(userId, 30);
        fetchStudents();
      } catch (error) {
        console.error('Error suspending student:', error);
      }
    }
  };

  const handleActivate = async (userId: string) => {
    try {
      await activateUser(userId);
      fetchStudents();
    } catch (error) {
      console.error('Error activating student:', error);
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      try {
        await deleteUser(userId);
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Students Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage all student accounts and activities</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-primary/90 text-white rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-[1.02] w-full sm:w-auto">
          <Plus size={20} />
          <span className="font-medium">Add Student</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl shadow-sm border border-primary/10 p-3 sm:p-4 glass-effect animate-slide-in">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search students by name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <select className="px-3 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm">
              <option value="">All Grades</option>
              <option value="9">Grade 9</option>
              <option value="10">Grade 10</option>
              <option value="11">Grade 11</option>
              <option value="12">Grade 12</option>
            </select>
            <select className="px-3 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
            <button className="col-span-2 sm:col-span-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 hover:shadow-md transition-all duration-200 text-sm font-medium">
              <Download size={18} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl shadow-sm border border-primary/10 overflow-hidden glass-effect animate-fade-in">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Loading students...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-destructive p-4">
            <div className="text-center space-y-3">
              <p className="text-lg font-semibold">Error Loading Students</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <button 
                onClick={fetchStudents}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : students.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold">No Students Found</p>
              <p className="text-sm">There are no students in the system yet.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block md:hidden divide-y divide-border">
              {students.map((student, index) => (
                <div key={student._id} className="p-4 hover:bg-accent/50 transition-colors animate-slide-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {student.username?.charAt(0) || student.fullName?.charAt(0) || 'S'}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <div className="text-sm font-semibold text-foreground truncate">
                          {student.username || student.fullName || student.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{student.email}</div>
                        <div className="text-xs text-muted-foreground">ID: {student._id.slice(-6)}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {student.grade && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            Grade {student.grade}
                          </span>
                        )}
                        {student.account_locked_until ? (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                            Suspended
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                            Active
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(student.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-md transition-colors" title="Edit">
                          <Edit size={16} />
                        </button>
                        {student.account_locked_until ? (
                          <button onClick={() => handleActivate(student._id)} className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 rounded-md transition-colors" title="Activate">
                            <Unlock size={16} />
                          </button>
                        ) : (
                          <button onClick={() => handleSuspend(student._id)} className="p-1.5 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950 rounded-md transition-colors" title="Suspend">
                            <Lock size={16} />
                          </button>
                        )}
                        <button className="p-1.5 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950 rounded-md transition-colors" title="Reset Password">
                          <RefreshCw size={16} />
                        </button>
                        <button onClick={() => handleDelete(student._id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-md transition-colors" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {students.map((student, index) => (
                    <tr key={student._id} className="hover:bg-accent/50 transition-colors animate-slide-in" style={{ animationDelay: `${index * 50}ms` }}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-semibold">
                            {student.username?.charAt(0) || student.fullName?.charAt(0) || 'S'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-foreground">
                              {student.username || student.fullName || student.name}
                            </div>
                            <div className="text-xs text-muted-foreground">ID: {student._id.slice(-6)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                        {student.email}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                        {student.grade || 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {student.account_locked_until ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                            Suspended
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(student.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-md transition-colors" title="Edit">
                            <Edit size={18} />
                          </button>
                          {student.account_locked_until ? (
                            <button onClick={() => handleActivate(student._id)} className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 rounded-md transition-colors" title="Activate">
                              <Unlock size={18} />
                            </button>
                          ) : (
                            <button onClick={() => handleSuspend(student._id)} className="p-1.5 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950 rounded-md transition-colors" title="Suspend">
                              <Lock size={18} />
                            </button>
                          )}
                          <button className="p-1.5 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950 rounded-md transition-colors" title="Reset Password">
                            <RefreshCw size={18} />
                          </button>
                          <button onClick={() => handleDelete(student._id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-md transition-colors" title="Delete">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && (
              <div className="px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border bg-muted/30">
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{(page - 1) * pagination.limit + 1}</span> to{' '}
                  <span className="font-medium text-foreground">
                    {Math.min(page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium text-foreground">{pagination.total}</span> results
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="flex-1 sm:flex-initial px-4 py-2 border border-input bg-background rounded-lg hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.pages}
                    className="flex-1 sm:flex-initial px-4 py-2 border border-input bg-background rounded-lg hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Students;
