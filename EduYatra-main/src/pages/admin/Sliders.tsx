// frontend/src/pages/admin/Sliders.tsx
import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Image, Link as LinkIcon, TrendingUp, Users } from 'lucide-react';
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

interface Slider {
  _id: string;
  title: string;
  description: string;
  image_url: string;
  link_url?: string;
  display_order: number;
  is_active: boolean;
  target_audience: 'all' | 'students' | 'teachers' | 'institutes';
  start_date?: Date;
  end_date?: Date;
  click_count: number;
  view_count: number;
}

interface SliderFormData {
  title: string;
  description: string;
  image_url: string;
  link_url: string;
  display_order: number;
  is_active: boolean;
  target_audience: string;
  start_date: string;
  end_date: string;
}

const Sliders: React.FC = () => {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSlider, setEditingSlider] = useState<Slider | null>(null);
  const [formData, setFormData] = useState<SliderFormData>({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    display_order: 1,
    is_active: true,
    target_audience: 'all',
    start_date: '',
    end_date: ''
  });

  const fetchSliders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/content/sliders');
      setSliders(response.data.sliders);
    } catch (error) {
      console.error('Error fetching sliders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSlider) {
        await api.put(`/api/admin/content/sliders/${editingSlider._id}`, formData);
        alert('Slider updated successfully!');
      } else {
        await api.post('/api/admin/content/sliders', formData);
        alert('Slider created successfully!');
      }
      setShowModal(false);
      resetForm();
      fetchSliders();
    } catch (error: unknown) {
      console.error('Error saving slider:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save slider';
      const apiError = (error as any)?.response?.data?.error;
      alert('Error: ' + (apiError || errorMessage));
    }
  };

  const handleDelete = async (sliderId: string) => {
    if (window.confirm('Are you sure you want to delete this slider?')) {
      try {
        await api.delete(`/api/admin/content/sliders/${sliderId}`);
        fetchSliders();
      } catch (error) {
        console.error('Error deleting slider:', error);
      }
    }
  };

  const toggleActive = async (sliderId: string, currentStatus: boolean) => {
    try {
      await api.put(`/api/admin/content/sliders/${sliderId}`, { is_active: !currentStatus });
      fetchSliders();
    } catch (error) {
      console.error('Error updating slider:', error);
      alert('Failed to update slider status');
    }
  };

  const openEditModal = (slider: Slider) => {
    setEditingSlider(slider);
    setFormData({
      title: slider.title,
      description: slider.description,
      image_url: slider.image_url,
      link_url: slider.link_url || '',
      display_order: slider.display_order,
      is_active: slider.is_active,
      target_audience: slider.target_audience,
      start_date: slider.start_date ? new Date(slider.start_date).toISOString().split('T')[0] : '',
      end_date: slider.end_date ? new Date(slider.end_date).toISOString().split('T')[0] : ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingSlider(null);
    setFormData({
      title: '',
      description: '',
      image_url: '',
      link_url: '',
      display_order: 1,
      is_active: true,
      target_audience: 'all',
      start_date: '',
      end_date: ''
    });
  };

  const handleChange = (field: keyof SliderFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Slider Management</h1>
              <p className="text-white/90 text-sm mt-1">Manage homepage sliders and banners</p>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-white text-primary hover:bg-white/90 shadow-lg w-full sm:w-auto"
            >
              <Plus className="mr-2" size={18} />
              Add Slider
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
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Preview</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Target</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stats</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {sliders.map((slider) => (
                          <tr key={slider._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <img
                                src={slider.image_url || '/placeholder.jpg'}
                                alt={slider.title}
                                className="w-20 h-12 object-cover rounded shadow-sm"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-semibold text-gray-900">{slider.title}</div>
                                <div className="text-sm text-gray-500 line-clamp-1">{slider.description}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant="secondary" className="capitalize">
                                <Users size={12} className="mr-1" />
                                {slider.target_audience}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-medium text-gray-700">{slider.display_order}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-3 text-sm">
                                <div className="flex items-center text-gray-600">
                                  <Eye size={14} className="mr-1" />
                                  {slider.view_count}
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <TrendingUp size={14} className="mr-1" />
                                  {slider.click_count}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {slider.is_active ? (
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
                                  onClick={() => toggleActive(slider._id, slider.is_active)}
                                  title={slider.is_active ? 'Deactivate' : 'Activate'}
                                >
                                  {slider.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openEditModal(slider)}
                                >
                                  <Edit size={16} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDelete(slider._id)}
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
              {sliders.map((slider) => (
                <Card key={slider._id} className="shadow-md border-0 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative h-40">
                      <img
                        src={slider.image_url || '/placeholder.jpg'}
                        alt={slider.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        {slider.is_active ? (
                          <Badge className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-900">{slider.title}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{slider.description}</p>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="secondary" className="capitalize">
                          <Users size={12} className="mr-1" />
                          {slider.target_audience}
                        </Badge>
                        <Badge variant="outline">Order: {slider.display_order}</Badge>
                      </div>
                      
                      <div className="mt-3 flex gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Eye size={14} className="mr-1" />
                          {slider.view_count} views
                        </div>
                        <div className="flex items-center">
                          <TrendingUp size={14} className="mr-1" />
                          {slider.click_count} clicks
                        </div>
                      </div>
                      
                      <div className="mt-4 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => toggleActive(slider._id, slider.is_active)}
                        >
                          {slider.is_active ? <EyeOff size={16} className="mr-1" /> : <Eye size={16} className="mr-1" />}
                          {slider.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(slider)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(slider._id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
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
            <DialogTitle>{editingSlider ? 'Edit Slider' : 'Create New Slider'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
                placeholder="Enter slider title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Enter slider description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="image_url">Image URL *</Label>
              <div className="flex gap-2">
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => handleChange('image_url', e.target.value)}
                  required
                  placeholder="https://example.com/image.jpg"
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="icon">
                  <Image size={18} />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="link_url">Link URL</Label>
              <div className="flex gap-2">
                <Input
                  id="link_url"
                  value={formData.link_url}
                  onChange={(e) => handleChange('link_url', e.target.value)}
                  placeholder="https://example.com/link"
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="icon">
                  <LinkIcon size={18} />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div>
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => handleChange('display_order', parseInt(e.target.value))}
                  min="1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleChange('start_date', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleChange('end_date', e.target.value)}
                />
              </div>
            </div>

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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingSlider ? 'Update Slider' : 'Create Slider'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sliders;
