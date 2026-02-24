// frontend/src/pages/admin/SuccessStories.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { listSuccessStories, createSuccessStory, updateSuccessStory, deleteSuccessStory } from '@/lib/api/admin';

interface SuccessStory {
  _id: string;
  title: string;
  description: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
  category: string;
  created_at: string;
}

const SuccessStories = () => {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingStory, setEditingStory] = useState<SuccessStory | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    display_order: 0,
    is_active: true,
    category: 'general'
  });

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const data = await listSuccessStories({});
      setStories(data.stories || []);
    } catch (error) {
      console.error('Error fetching success stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingStory) {
        await updateSuccessStory(editingStory._id, formData);
      } else {
        await createSuccessStory(formData);
      }
      resetForm();
      fetchStories();
    } catch (error) {
      console.error('Error saving success story:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (story: SuccessStory) => {
    setEditingStory(story);
    setFormData({
      title: story.title,
      description: story.description,
      image_url: story.image_url,
      display_order: story.display_order,
      is_active: story.is_active,
      category: story.category
    });
    setShowForm(true);
  };

  const handleDelete = async (storyId: string) => {
    if (window.confirm('Are you sure you want to delete this success story?')) {
      try {
        setLoading(true);
        await deleteSuccessStory(storyId);
        fetchStories();
      } catch (error) {
        console.error('Error deleting success story:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      display_order: 0,
      is_active: true,
      category: 'general'
    });
    setEditingStory(null);
    setShowForm(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Success Stories Management</h1>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {showForm ? 'Cancel' : 'Add New Story'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingStory ? 'Edit Success Story' : 'Create New Success Story'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="institution">Institution</SelectItem>
                      <SelectItem value="achievement">Achievement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="image_url">Image URL *</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : editingStory ? 'Update Story' : 'Create Story'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => (
          <Card key={story._id} className="overflow-hidden">
            <div className="relative h-48">
              <img src={story.image_url} alt={story.title} className="w-full h-full object-cover" />
              {!story.is_active && (
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                  Inactive
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <div className="mb-2">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{story.category}</span>
              </div>
              <h3 className="font-bold text-lg mb-2">{story.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{story.description}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(story)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(story._id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stories.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          No success stories found. Create your first one!
        </div>
      )}
    </div>
  );
};

export default SuccessStories;
