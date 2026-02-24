// frontend/src/pages/admin/Video.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Video as VideoIcon, Save, Trash2, Eye, EyeOff, Plus, X } from 'lucide-react';
import { listVideos, createVideo, updateVideo, deleteVideo } from '@/lib/api/admin';
import { toast } from 'sonner';

const Video = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    feature_points: [''],
    is_active: true
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const data = await listVideos({});
      setVideos(data.videos || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Convert regular YouTube URL to embed format if needed
      let videoUrl = formData.video_url;
      if (videoUrl.includes('youtube.com/watch?v=')) {
        const videoId = videoUrl.split('v=')[1]?.split('&')[0];
        if (videoId) {
          videoUrl = `https://www.youtube.com/embed/${videoId}`;
        }
      } else if (videoUrl.includes('youtu.be/')) {
        const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
        if (videoId) {
          videoUrl = `https://www.youtube.com/embed/${videoId}`;
        }
      }
      
      // Filter out empty feature points
      const filteredFeaturePoints = formData.feature_points.filter(point => point.trim() !== '');
      
      const dataToSubmit = { ...formData, video_url: videoUrl, feature_points: filteredFeaturePoints };
      
      if (editingVideo) {
        await updateVideo(editingVideo._id, dataToSubmit);
        toast.success('Video updated successfully');
      } else {
        await createVideo(dataToSubmit);
        toast.success('Video created successfully');
      }
      
      resetForm();
      fetchVideos();
    } catch (error: any) {
      console.error('Error saving video:', error);
      toast.error(error.response?.data?.error || 'Failed to save video');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (video: any) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description,
      video_url: video.video_url,
      thumbnail_url: video.thumbnail_url || '',
      feature_points: video.feature_points && video.feature_points.length > 0 ? video.feature_points : [''],
      is_active: video.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (videoId: string) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    
    try {
      setLoading(true);
      await deleteVideo(videoId);
      toast.success('Video deleted successfully');
      fetchVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Failed to delete video');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      video_url: '',
      feature_points: [''],
      is_active: true
    });
    setEditingVideo(null);
    setShowForm(false);
  };

  const addFeaturePoint = () => {
    setFormData({ ...formData, feature_points: [...formData.feature_points, ''] });
  };

  const removeFeaturePoint = (index: number) => {
    const newPoints = formData.feature_points.filter((_, i) => i !== index);
    setFormData({ ...formData, feature_points: newPoints.length > 0 ? newPoints : [''] });
  };

  const updateFeaturePoint = (index: number, value: string) => {
    const newPoints = [...formData.feature_points];
    newPoints[index] = value;
    setFormData({ ...formData, feature_points: newPoints });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Video Management</h1>
          <p className="text-gray-600 mt-1">Manage introduction video for homepage</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
        >
          {showForm ? (
            <>
              <X className="mr-2 w-4 h-4" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="mr-2 w-4 h-4" />
              Add Video
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingVideo ? 'Edit Video' : 'Add New Video'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter video title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter video description"
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="video_url">Video URL</Label>
                <Input
                  id="video_url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=VIDEO_ID or https://youtube.com/embed/VIDEO_ID"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste any YouTube URL (regular or embed format). It will be automatically converted to embed format.
                </p>
              </div>

              <div>
                <Label htmlFor="thumbnail_url">Thumbnail URL (Optional)</Label>
                <Input
                  id="thumbnail_url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Feature Points (Highlights to show beside video)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addFeaturePoint}
                    disabled={formData.feature_points.length >= 6}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Point
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Add key features or benefits to highlight (up to 6 points)
                </p>
                <div className="space-y-2">
                  {formData.feature_points.map((point, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={point}
                        onChange={(e) => updateFeaturePoint(index, e.target.value)}
                        placeholder={`Feature point ${index + 1}`}
                        className="flex-1"
                      />
                      {formData.feature_points.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeFeaturePoint(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600"
                />
                <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
              </div>

              <div className="flex space-x-3">
                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="mr-2 w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Video'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {loading && videos.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              Loading videos...
            </CardContent>
          </Card>
        ) : videos.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              <VideoIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No videos found. Add your first video to get started.</p>
            </CardContent>
          </Card>
        ) : (
          videos.map((video) => (
            <Card key={video._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <VideoIcon className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">{video.title}</h3>
                      <Badge variant={video.is_active ? 'default' : 'secondary'}>
                        {video.is_active ? (
                          <>
                            <Eye className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{video.description}</p>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-500">
                        <span className="font-medium">Video URL:</span>{' '}
                        <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {video.video_url}
                        </a>
                      </p>
                      {video.thumbnail_url && (
                        <p className="text-gray-500">
                          <span className="font-medium">Thumbnail:</span>{' '}
                          <a href={video.thumbnail_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            View
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(video)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(video._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Video;
