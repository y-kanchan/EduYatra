// frontend/src/pages/admin/Posters.tsx
import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Bell, Calendar, Pin, Users, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import axios from 'axios';
import { BASE_URL } from '../../config/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface Poster {
  _id: string;
  title: string;
  content: string;
  poster_type: 'announcement' | 'notice' | 'event' | 'exam' | 'holiday' | 'important' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  image_url?: string;
  is_active: boolean;
  is_pinned: boolean;
  target_audience: 'all' | 'students' | 'teachers' | 'institutes';
  target_classes?: string[];
  view_count: number;
  likes_count: number;
  created_at: Date;
}

interface PosterFormData {
  title: string;
  content: string;
  poster_type: string;
  priority: string;
  image_url: string;
  is_active: boolean;
  is_pinned: boolean;
  target_audience: string;
  target_classes: string[];
}

const Posters: React.FC = () => {
  const [posters, setPosters] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPoster, setEditingPoster] = useState<Poster | null>(null);
  const [formData, setFormData] = useState<PosterFormData>({
    title: '',
    content: '',
    poster_type: 'announcement',
    priority: 'medium',
    image_url: '',
    is_active: true,
    is_pinned: false,
    target_audience: 'all',
    target_classes: []
  });

  const fetchPosters = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/content/posters');
      setPosters(response.data.posters);
    } catch (error) {
      console.error('Error fetching posters:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosters();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPoster) {
        await api.put(`/api/admin/content/posters/${editingPoster._id}`, formData);
        alert('Poster updated successfully!');
      } else {
        await api.post('/api/admin/content/posters', formData);
        alert('Poster created successfully!');
      }
      setShowModal(false);
      resetForm();
      fetchPosters();
    } catch (error: unknown) {
      console.error('Error saving poster:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save poster';
      const apiError = (error as any)?.response?.data?.error;
      alert('Error: ' + (apiError || errorMessage));
    }
  };

  const handleDelete = async (posterId: string) => {
    if (window.confirm('Are you sure you want to delete this poster?')) {
      try {
        await api.delete(`/api/admin/content/posters/${posterId}`);
        fetchPosters();
      } catch (error) {
        console.error('Error deleting poster:', error);
      }
    }
  };

  const toggleActive = async (posterId: string, currentStatus: boolean) => {
    try {
      await api.put(`/api/admin/content/posters/${posterId}`, { is_active: !currentStatus });
      fetchPosters();
    } catch (error) {
      console.error('Error updating poster:', error);
      alert('Failed to update poster status');
    }
  };

  const togglePin = async (posterId: string, currentStatus: boolean) => {
    try {
      await api.put(`/api/admin/content/posters/${posterId}`, { is_pinned: !currentStatus });
      fetchPosters();
    } catch (error) {
      console.error('Error updating poster:', error);
    }
  };

  const openEditModal = (poster: Poster) => {
    setEditingPoster(poster);
    setFormData({
      title: poster.title,
      content: poster.content,
      poster_type: poster.poster_type,
      priority: poster.priority,
      image_url: poster.image_url || '',
      is_active: poster.is_active,
      is_pinned: poster.is_pinned,
      target_audience: poster.target_audience,
      target_classes: poster.target_classes || []
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingPoster(null);
    setFormData({
      title: '',
      content: '',
      poster_type: 'announcement',
      priority: 'medium',
      image_url: '',
      is_active: true,
      is_pinned: false,
      target_audience: 'all',
      target_classes: []
    });
  };

  const handleChange = (field: keyof PosterFormData, value: string | number | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500',
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      announcement: Bell,
      notice: AlertCircle,
      event: Calendar,
      exam: AlertCircle,
      holiday: Calendar,
      important: AlertCircle,
      general: Bell
    };
    const Icon = icons[type as keyof typeof icons] || Bell;
    return <Icon size={14} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Posters & Announcements</h1>
              <p className="text-white/90 text-sm mt-1">Manage all notices, events, and announcements</p>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-white text-primary hover:bg-white/90 shadow-lg w-full sm:w-auto"
            >
              <Plus className="mr-2" size={18} />
              Add Poster
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden md:block">
              <Card className="shadow-lg border-0">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Target</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stats</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {posters.map((poster) => (
                          <tr key={poster._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-start gap-2">
                                {poster.is_pinned && <Pin size={16} className="text-primary mt-1" />}
                                <div>
                                  <div className="font-semibold text-gray-900">{poster.title}</div>
                                  <div className="text-sm text-gray-500 line-clamp-1">{poster.content}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant="secondary" className="capitalize flex items-center gap-1 w-fit">
                                {getTypeIcon(poster.poster_type)}
                                {poster.poster_type}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <Badge className={`${getPriorityColor(poster.priority)} capitalize`}>
                                {poster.priority}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant="outline" className="capitalize">
                                <Users size={12} className="mr-1" />
                                {poster.target_audience}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-3 text-sm">
                                <div className="flex items-center text-gray-600">
                                  <Eye size={14} className="mr-1" />
                                  {poster.view_count}
                                </div>
                                <div className="flex items-center text-gray-600">
                                  ❤️ {poster.likes_count}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {poster.is_active ? (
                                <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                              ) : (
                                <Badge variant="secondary">Inactive</Badge>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => togglePin(poster._id, poster.is_pinned)}
                                  title={poster.is_pinned ? 'Unpin' : 'Pin'}
                                  className={poster.is_pinned ? 'text-primary' : ''}
                                >
                                  <Pin size={16} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => toggleActive(poster._id, poster.is_active)}
                                  title={poster.is_active ? 'Deactivate' : 'Activate'}
                                >
                                  {poster.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openEditModal(poster)}
                                >
                                  <Edit size={16} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDelete(poster._id)}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
              {posters.map((poster) => (
                <Card key={poster._id} className="shadow-md border-0 overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        {poster.is_pinned && <Pin size={16} className="text-primary mt-1" />}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900">{poster.title}</h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{poster.content}</p>
                        </div>
                      </div>
                      {poster.is_active ? (
                        <Badge className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="secondary" className="capitalize flex items-center gap-1">
                        {getTypeIcon(poster.poster_type)}
                        {poster.poster_type}
                      </Badge>
                      <Badge className={`${getPriorityColor(poster.priority)} capitalize`}>
                        {poster.priority}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        <Users size={12} className="mr-1" />
                        {poster.target_audience}
                      </Badge>
                    </div>
                    
                    <div className="mt-3 flex gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Eye size={14} className="mr-1" />
                        {poster.view_count} views
                      </div>
                      <div className="flex items-center">
                        ❤️ {poster.likes_count} likes
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => togglePin(poster._id, poster.is_pinned)}
                        className={poster.is_pinned ? 'border-primary text-primary' : ''}
                      >
                        <Pin size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => toggleActive(poster._id, poster.is_active)}
                      >
                        {poster.is_active ? <EyeOff size={16} className="mr-1" /> : <Eye size={16} className="mr-1" />}
                        {poster.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(poster)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(poster._id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={showModal} onOpenChange={(open) => {
        setShowModal(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPoster ? 'Edit Poster' : 'Create New Poster'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
                placeholder="Enter poster title"
              />
            </div>

            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                required
                placeholder="Enter poster content"
                rows={5}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="poster_type">Type</Label>
                <Select value={formData.poster_type} onValueChange={(value) => handleChange('poster_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="notice">Notice</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="holiday">Holiday</SelectItem>
                    <SelectItem value="important">Important</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="image_url">Image URL (Optional)</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => handleChange('image_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <Label htmlFor="target_audience">Target Audience</Label>
              <Select value={formData.target_audience} onValueChange={(value) => handleChange('target_audience', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="students">Students</SelectItem>
                  <SelectItem value="teachers">Teachers</SelectItem>
                  <SelectItem value="institutes">Institutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => handleChange('is_active', e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_pinned"
                  checked={formData.is_pinned}
                  onChange={(e) => handleChange('is_pinned', e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="is_pinned" className="cursor-pointer">Pinned</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingPoster ? 'Update Poster' : 'Create Poster'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Posters;
