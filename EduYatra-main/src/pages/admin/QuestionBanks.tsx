// frontend/src/pages/admin/QuestionBanks.tsx
import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye, BookOpen, FileQuestion } from 'lucide-react';
import { 
  listAllQuestionBanks, 
  deleteQuestionBank, 
  createQuestionBank,
  updateQuestionBank 
} from '../../lib/api/admin';
import {
  AdminPageLayout,
  AdminPageHeader,
  AdminFilterSection,
  AdminSearchInput,
  AdminSelect,
  AdminButton,
  AdminCard,
  AdminBadge,
  AdminLoading,
  AdminModal,
} from '../../components/admin';

const QuestionBanks: React.FC = () => {
  const [banks, setBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBank, setEditingBank] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    grade: '',
    difficulty_level: 'medium',
  });

  const fetchBanks = async () => {
    try {
      setLoading(true);
      const data = await listAllQuestionBanks({ 
        page, 
        limit: 20, 
        search,
        subject: subjectFilter || undefined 
      });
      setBanks(data.banks);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching question banks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, [page, search, subjectFilter]);

  const handleDelete = async (bankId: string) => {
    if (window.confirm('Are you sure you want to delete this question bank? This will not delete the questions inside.')) {
      try {
        await deleteQuestionBank(bankId);
        fetchBanks();
      } catch (error) {
        console.error('Error deleting question bank:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBank) {
        await updateQuestionBank(editingBank._id, formData);
      } else {
        await createQuestionBank(formData);
      }
      setShowModal(false);
      setEditingBank(null);
      setFormData({
        name: '',
        description: '',
        subject: '',
        grade: '',
        difficulty_level: 'medium',
      });
      fetchBanks();
    } catch (error) {
      console.error('Error saving question bank:', error);
      alert('Failed to save question bank. Please try again.');
    }
  };

  const openEditModal = (bank: any) => {
    setEditingBank(bank);
    setFormData({
      name: bank.name,
      description: bank.description || '',
      subject: bank.subject || '',
      grade: bank.grade || '',
      difficulty_level: bank.difficulty_level || 'medium',
    });
    setShowModal(true);
  };

  const getDifficultyColor = (level: string) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800',
    };
    return colors[level as keyof typeof colors] || colors.medium;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Question Banks Management</h1>
          <p className="text-gray-600 mt-1">Manage question banks and question collections</p>
        </div>
        <button
          onClick={() => {
            setEditingBank(null);
            setFormData({
              name: '',
              description: '',
              subject: '',
              grade: '',
              difficulty_level: 'medium',
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus size={20} />
          Create Question Bank
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search question banks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Science">Science</option>
            <option value="English">English</option>
            <option value="Social Studies">Social Studies</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Biology">Biology</option>
          </select>
        </div>
      </div>

      {/* Banks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : banks.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow-sm p-12 text-center">
            <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">No question banks found</p>
          </div>
        ) : (
          banks.map((bank) => (
            <div key={bank._id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{bank.name}</h3>
                  {bank.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{bank.description}</p>
                  )}
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded ${getDifficultyColor(bank.difficulty_level)}`}>
                  {bank.difficulty_level || 'medium'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {bank.subject && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen size={16} className="text-gray-400" />
                    <span>{bank.subject}</span>
                  </div>
                )}
                {bank.grade && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-gray-400">Grade:</span>
                    <span>{bank.grade}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileQuestion size={16} className="text-gray-400" />
                  <span>{bank.questionCount || 0} questions</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <button
                  className="flex-1 py-2 text-blue-600 hover:bg-blue-50 rounded transition-colors text-sm font-medium"
                  title="View Questions"
                >
                  <Eye size={16} className="inline mr-1" />
                  View
                </button>
                <button
                  onClick={() => openEditModal(bank)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                  title="Edit"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(bank._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                Created: {new Date(bank.created_at).toLocaleDateString()}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingBank ? 'Edit Question Bank' : 'Create Question Bank'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Subject</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="English">English</option>
                    <option value="Social Studies">Social Studies</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Grade</option>
                    <option value="9">Grade 9</option>
                    <option value="10">Grade 10</option>
                    <option value="11">Grade 11</option>
                    <option value="12">Grade 12</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
                <select
                  value={formData.difficulty_level}
                  onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingBank(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {editingBank ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBanks;
