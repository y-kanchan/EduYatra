// frontend/src/pages/admin/Advertisements.tsx
import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, DollarSign, TrendingUp, Monitor, Smartphone } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { listAds, createAd, updateAd, deleteAd } from '../../lib/api/admin';

interface Advertisement {
  _id: string;
  title: string;
  description?: string;
  ad_type: 'banner' | 'popup' | 'sidebar' | 'inline' | 'video';
  placement: 'home' | 'dashboard' | 'class' | 'exam' | 'global';
  image_url: string;
  video_url?: string;
  link_url?: string;
  display_duration: number;
  display_order: number;
  is_active: boolean;
  target_audience: 'all' | 'students' | 'teachers' | 'institutes';
  start_date?: Date;
  end_date?: Date;
  budget?: number;
  spent?: number;
  sponsor_name?: string;
  sponsor_contact?: string;
  click_count: number;
  view_count: number;
  ctr: number;
}

interface AdFormData {
  title: string;
  description: string;
  ad_type: string;
  placement: string;
  image_url: string;
  video_url: string;
  link_url: string;
  display_duration: number;
  display_order: number;
  is_active: boolean;
  target_audience: string;
  start_date: string;
  end_date: string;
  budget: string;
  spent: string;
  sponsor_name: string;
  sponsor_contact: string;
}

interface AdsResponse {
  ads: Advertisement[];
  pagination?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

const Advertisements: React.FC = () => {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [formData, setFormData] = useState<AdFormData>({
    title: '',
    description: '',
    ad_type: 'banner',
    placement: 'home',
    image_url: '',
    video_url: '',
    link_url: '',
    display_duration: 5,
    display_order: 1,
    is_active: true,
    target_audience: 'all',
    start_date: '',
    end_date: '',
    budget: '',
    spent: '0',
    sponsor_name: '',
    sponsor_contact: ''
  });

  const fetchAds = async () => {
    try {
      setLoading(true);
      const response = await listAds({}) as AdsResponse;
      setAds(response.ads || []);
    } catch (error) {
      console.error('Error fetching advertisements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        spent: formData.spent ? parseFloat(formData.spent) : 0
      };
      
      if (editingAd) {
        await updateAd(editingAd._id, submitData);
        alert('Advertisement updated successfully!');
      } else {
        await createAd(submitData);
        alert('Advertisement created successfully!');
      }
      setShowModal(false);
      resetForm();
      fetchAds();
    } catch (error: unknown) {
      console.error('Error saving advertisement:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save advertisement';
      const apiError = (error as { response?: { data?: { error?: string } } })?.response?.data?.error;
      alert('Error: ' + (apiError || errorMessage));
    }
  };

  const handleDelete = async (adId: string) => {
    if (window.confirm('Are you sure you want to delete this advertisement?')) {
      try {
        await deleteAd(adId);
        fetchAds();
      } catch (error) {
        console.error('Error deleting advertisement:', error);
      }
    }
  };

  const toggleActive = async (adId: string, currentStatus: boolean) => {
    try {
      await updateAd(adId, { is_active: !currentStatus });
      fetchAds();
    } catch (error) {
      console.error('Error updating advertisement:', error);
    }
  };

  const openEditModal = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      description: ad.description || '',
      ad_type: ad.ad_type,
      placement: ad.placement,
      image_url: ad.image_url,
      video_url: ad.video_url || '',
      link_url: ad.link_url || '',
      display_duration: ad.display_duration,
      display_order: ad.display_order,
      is_active: ad.is_active,
      target_audience: ad.target_audience,
      start_date: ad.start_date ? new Date(ad.start_date).toISOString().split('T')[0] : '',
      end_date: ad.end_date ? new Date(ad.end_date).toISOString().split('T')[0] : '',
      budget: ad.budget?.toString() || '',
      spent: ad.spent?.toString() || '0',
      sponsor_name: ad.sponsor_name || '',
      sponsor_contact: ad.sponsor_contact || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingAd(null);
    setFormData({
      title: '',
      description: '',
      ad_type: 'banner',
      placement: 'home',
      image_url: '',
      video_url: '',
      link_url: '',
      display_duration: 5,
      display_order: 1,
      is_active: true,
      target_audience: 'all',
      start_date: '',
      end_date: '',
      budget: '',
      spent: '0',
      sponsor_name: '',
      sponsor_contact: ''
    });
  };

  const handleChange = (field: keyof AdFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getAdTypeIcon = (type: string) => {
    const icons = {
      banner: Monitor,
      popup: Smartphone,
      sidebar: Monitor,
      inline: Monitor,
      video: Monitor
    };
    const Icon = icons[type as keyof typeof icons] || Monitor;
    return <Icon size={14} />;
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0';
    return `$${amount.toLocaleString()}`;
  };

  const getBudgetPercentage = (spent?: number, budget?: number) => {
    if (!budget || budget === 0) return 0;
    return Math.round((spent || 0) / budget * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Advertisement Management</h1>
              <p className="text-white/90 text-sm mt-1">Manage sponsored content and advertisements</p>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-white text-primary hover:bg-white/90 shadow-lg w-full sm:w-auto"
            >
              <Plus className="mr-2" size={18} />
              Add Advertisement
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
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type/Placement</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Budget</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Performance</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {ads.map((ad) => (
                          <tr key={ad._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <img
                                src={ad.image_url || '/placeholder.jpg'}
                                alt={ad.title}
                                className="w-20 h-12 object-cover rounded shadow-sm"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-semibold text-gray-900">{ad.title}</div>
                                {ad.sponsor_name && (
                                  <div className="text-xs text-gray-500">By {ad.sponsor_name}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1">
                                <Badge variant="secondary" className="capitalize w-fit flex items-center gap-1">
                                  {getAdTypeIcon(ad.ad_type)}
                                  {ad.ad_type}
                                </Badge>
                                <Badge variant="outline" className="capitalize w-fit text-xs">
                                  {ad.placement}
                                </Badge>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {ad.budget ? (
                                <div className="space-y-1">
                                  <div className="text-sm font-medium text-gray-900">
                                    {formatCurrency(ad.spent)} / {formatCurrency(ad.budget)}
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div
                                      className="bg-primary h-1.5 rounded-full"
                                      style={{ width: `${Math.min(getBudgetPercentage(ad.spent, ad.budget), 100)}%` }}
                                    ></div>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {getBudgetPercentage(ad.spent, ad.budget)}% spent
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500">No budget set</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-3 text-sm">
                                  <div className="flex items-center text-gray-600">
                                    <Eye size={14} className="mr-1" />
                                    {ad.view_count}
                                  </div>
                                  <div className="flex items-center text-gray-600">
                                    <TrendingUp size={14} className="mr-1" />
                                    {ad.click_count}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500">
                                  CTR: {(ad.ctr * 100).toFixed(2)}%
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {ad.is_active ? (
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
                                  onClick={() => toggleActive(ad._id, ad.is_active)}
                                  title={ad.is_active ? 'Deactivate' : 'Activate'}
                                >
                                  {ad.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openEditModal(ad)}
                                >
                                  <Edit size={16} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDelete(ad._id)}
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
              {ads.map((ad) => (
                <Card key={ad._id} className="shadow-md border-0 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative h-40">
                      <img
                        src={ad.image_url || '/placeholder.jpg'}
                        alt={ad.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        {ad.is_active ? (
                          <Badge className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-900">{ad.title}</h3>
                      {ad.sponsor_name && (
                        <p className="text-sm text-gray-500">By {ad.sponsor_name}</p>
                      )}
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="secondary" className="capitalize flex items-center gap-1">
                          {getAdTypeIcon(ad.ad_type)}
                          {ad.ad_type}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {ad.placement}
                        </Badge>
                      </div>
                      
                      {ad.budget && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Budget</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {formatCurrency(ad.spent)} / {formatCurrency(ad.budget)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${Math.min(getBudgetPercentage(ad.spent, ad.budget), 100)}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {getBudgetPercentage(ad.spent, ad.budget)}% spent
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-3 flex gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Eye size={14} className="mr-1" />
                          {ad.view_count} views
                        </div>
                        <div className="flex items-center">
                          <TrendingUp size={14} className="mr-1" />
                          {ad.click_count} clicks
                        </div>
                        <div>CTR: {(ad.ctr * 100).toFixed(2)}%</div>
                      </div>
                      
                      <div className="mt-4 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => toggleActive(ad._id, ad.is_active)}
                        >
                          {ad.is_active ? <EyeOff size={16} className="mr-1" /> : <Eye size={16} className="mr-1" />}
                          {ad.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(ad)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(ad._id)}
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAd ? 'Edit Advertisement' : 'Create New Advertisement'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                  placeholder="Enter ad title"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Enter ad description"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="ad_type">Ad Type</Label>
                <Select value={formData.ad_type} onValueChange={(value) => handleChange('ad_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banner">Banner</SelectItem>
                    <SelectItem value="popup">Popup</SelectItem>
                    <SelectItem value="sidebar">Sidebar</SelectItem>
                    <SelectItem value="inline">Inline</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="placement">Placement</Label>
                <Select value={formData.placement} onValueChange={(value) => handleChange('placement', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="dashboard">Dashboard</SelectItem>
                    <SelectItem value="class">Class</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="global">Global</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="image_url">Image URL *</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => handleChange('image_url', e.target.value)}
                  required
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <Label htmlFor="video_url">Video URL (Optional)</Label>
                <Input
                  id="video_url"
                  value={formData.video_url}
                  onChange={(e) => handleChange('video_url', e.target.value)}
                  placeholder="https://example.com/video.mp4"
                />
              </div>

              <div>
                <Label htmlFor="link_url">Link URL</Label>
                <Input
                  id="link_url"
                  value={formData.link_url}
                  onChange={(e) => handleChange('link_url', e.target.value)}
                  placeholder="https://example.com"
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

              <div>
                <Label htmlFor="display_duration">Display Duration (seconds)</Label>
                <Input
                  id="display_duration"
                  type="number"
                  value={formData.display_duration}
                  onChange={(e) => handleChange('display_duration', parseInt(e.target.value))}
                  min="1"
                />
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

              <div>
                <Label htmlFor="budget">Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => handleChange('budget', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="sponsor_name">Sponsor Name</Label>
                <Input
                  id="sponsor_name"
                  value={formData.sponsor_name}
                  onChange={(e) => handleChange('sponsor_name', e.target.value)}
                  placeholder="Company Name"
                />
              </div>

              <div>
                <Label htmlFor="sponsor_contact">Sponsor Contact</Label>
                <Input
                  id="sponsor_contact"
                  value={formData.sponsor_contact}
                  onChange={(e) => handleChange('sponsor_contact', e.target.value)}
                  placeholder="contact@company.com"
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
                {editingAd ? 'Update Advertisement' : 'Create Advertisement'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Advertisements;
