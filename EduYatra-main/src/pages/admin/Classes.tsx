// frontend/src/pages/admin/Classes.tsx
import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, Users, X } from 'lucide-react';
import { listAllClasses, getClassDetails } from '../../lib/api/admin';

const Classes: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<any>(null);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await listAllClasses({ page, limit: 20, search });
      setClasses(data.classes);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [page, search]);

  const openDetails = async (classId: string) => {
    try {
      setDetailsLoading(true);
      setDetailsOpen(true);
      const data = await getClassDetails(classId);
      setSelectedDetails(data.class);
    } catch (err) {
      console.error('Failed to load class details', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Classes Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage all classes across the platform
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg hover:opacity-90 transition-opacity shadow-md">
          <Plus size={18} />
          <span className="text-sm sm:text-base">Add Class</span>
        </button>
      </div>

      {/* Search Section */}
      <div className="glass-effect rounded-xl border border-primary/10 p-3 sm:p-4 animate-slide-in">
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search classes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-primary/20 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          classes.map((cls, index) => (
            <div
              key={cls._id}
              className="glass-effect rounded-xl border border-primary/10 p-4 sm:p-6 hover:border-primary/30 hover:shadow-md transition-all animate-slide-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">{cls.class_name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Teacher: {cls.teacher?.name || cls.teacher_id?.username || cls.teacher_id?.fullName || 'Unknown'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-4 text-xs sm:text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30">
                  <Users size={14} className="text-muted-foreground" />
                  <span className="text-foreground font-medium">{cls.studentCount || 0} students</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 pt-4 border-t border-primary/10">
                <button
                  onClick={() => openDetails(cls._id)}
                  className="flex-1 py-2 text-xs sm:text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors font-medium"
                >
                  View Details
                </button>
                <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                  <Edit size={16} />
                </button>
                <button className="p-2 text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2 animate-slide-in">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-3 sm:px-4 py-2 text-sm border border-primary/20 rounded-lg hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>
          <span className="px-3 sm:px-4 py-2 text-sm text-muted-foreground">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === pagination.pages}
            className="px-3 sm:px-4 py-2 text-sm border border-primary/20 rounded-lg hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      )}

      {/* Details Modal */}
      {detailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="glass-effect w-full max-w-2xl rounded-xl shadow-2xl border border-primary/20 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-primary/10">
              <h3 className="text-base sm:text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Class Details
              </h3>
              <button
                onClick={() => { setDetailsOpen(false); setSelectedDetails(null); }}
                className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {detailsLoading ? (
                <div className="py-10 flex justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                </div>
              ) : selectedDetails ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/30">
                    <div className="text-xs sm:text-sm text-muted-foreground">Class Name</div>
                    <div className="text-sm sm:text-base font-medium text-foreground mt-1">{selectedDetails.class_name}</div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="p-4 rounded-lg bg-muted/30">
                      <div className="text-xs sm:text-sm text-muted-foreground">Teacher Name</div>
                      <div className="text-sm sm:text-base font-medium text-foreground mt-1">{selectedDetails.teacher?.name || '—'}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30">
                      <div className="text-xs sm:text-sm text-muted-foreground">Teacher Email</div>
                      <div className="text-sm sm:text-base font-medium text-foreground mt-1">{selectedDetails.teacher?.email || '—'}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground mb-2">Students</div>
                    <div className="overflow-x-auto border border-primary/10 rounded-lg">
                      <table className="min-w-full divide-y divide-primary/10">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                          </tr>
                        </thead>
                        <tbody className="bg-card/50 divide-y divide-primary/10">
                          {(selectedDetails.students || []).map((s: any, idx: number) => (
                            <tr key={idx} className="hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-2 whitespace-nowrap text-xs sm:text-sm text-foreground">{s.name || '—'}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-xs sm:text-sm text-muted-foreground">{s.email || '—'}</td>
                            </tr>
                          ))}
                          {(!selectedDetails.students || selectedDetails.students.length === 0) && (
                            <tr>
                              <td colSpan={2} className="px-4 py-6 text-center text-sm text-muted-foreground">No students found</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No details available.</div>
              )}
            </div>
            <div className="px-4 sm:px-6 py-4 border-t border-primary/10 flex justify-end">
              <button
                onClick={() => { setDetailsOpen(false); setSelectedDetails(null); }}
                className="px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;
