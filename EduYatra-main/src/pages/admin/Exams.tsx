// frontend/src/pages/admin/Exams.tsx
import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Calendar, Clock, Users } from 'lucide-react';
import { listAllExams, deleteExam, updateExamStatus } from '../../lib/api/admin';

const Exams: React.FC = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const data = await listAllExams({ 
        page, 
        limit: 20, 
        search,
        status: statusFilter || undefined 
      });
      setExams(data.exams);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [page, search, statusFilter]);

  const handleDelete = async (examId: string) => {
    if (window.confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
      try {
        await deleteExam(examId);
        fetchExams();
      } catch (error) {
        console.error('Error deleting exam:', error);
      }
    }
  };

  const handleStatusChange = async (examId: string, newStatus: string) => {
    try {
      await updateExamStatus(examId, newStatus);
      fetchExams();
    } catch (error) {
      console.error('Error updating exam status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Exam Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage all exams and tests across the platform
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg hover:opacity-90 transition-opacity shadow-md">
          <Plus size={18} />
          <span className="text-sm sm:text-base">Create Exam</span>
        </button>
      </div>

      {/* Filters */}
      <div className="glass-effect rounded-xl border border-primary/10 p-3 sm:p-4 animate-slide-in">
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search exams by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-primary/20 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 text-sm bg-background border border-primary/20 rounded-lg focus:ring-2 focus:ring-primary/50 transition-all"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Exams Grid */}
      <div className="space-y-3 sm:space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : exams.length === 0 ? (
          <div className="glass-effect rounded-xl border border-primary/10 p-12 text-center">
            <p className="text-muted-foreground">No exams found</p>
          </div>
        ) : (
          exams.map((exam, index) => (
            <div
              key={exam._id}
              className="glass-effect rounded-xl border border-primary/10 p-4 sm:p-6 hover:border-primary/30 hover:shadow-md transition-all animate-slide-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1 w-full">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground">
                      {exam.title || exam.question_set_id?.title || 'Untitled Exam'}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(exam.status)}`}>
                      {exam.status || 'draft'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground p-2 rounded-lg bg-muted/30">
                      <Calendar size={14} className="text-muted-foreground" />
                      <span>
                        {exam.start_time ? new Date(exam.start_time).toLocaleDateString() : 'Not scheduled'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground p-2 rounded-lg bg-muted/30">
                      <Clock size={14} className="text-muted-foreground" />
                      <span>{exam.duration || 'N/A'} minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground p-2 rounded-lg bg-muted/30">
                      <Users size={14} className="text-muted-foreground" />
                      <span>{exam.submissionCount || 0} submissions</span>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-gray-600">
                    <span>Teacher: {exam.created_by?.full_name || exam.created_by?.username || 'Unknown'}</span>
                    {exam.class_id && (
                      <>
                        <span className="mx-2">•</span>
                        <span>Class: {exam.class_id.class_name}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="View Details"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  
                  <select
                    value={exam.status || 'draft'}
                    onChange={(e) => handleStatusChange(exam._id, e.target.value)}
                    className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                    title="Change Status"
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <button
                    onClick={() => handleDelete(exam._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Additional Info */}
              {exam.description && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">{exam.description}</p>
                </div>
              )}
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
    </div>
  );
};

export default Exams;
