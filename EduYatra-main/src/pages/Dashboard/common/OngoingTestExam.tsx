import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Users, Eye, Pause, Play, StopCircle, RefreshCw, Calendar, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/config/api";

interface Exam {
  _id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  class_id: {
    _id: string;
    class_name: string;
    students: string[];
  };
  status?: string;
  activeStudents?: number;
  completedStudents?: number;
  totalStudents?: number;
  avgProgress?: number;
}

const OngoingTestExam = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [ongoingExams, setOngoingExams] = useState<Exam[]>([]);
  const [scheduledExams, setScheduledExams] = useState<Exam[]>([]);

  // Fetch exams data
  const fetchExams = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        navigate('/login');
        return;
      }

      console.log('📊 Fetching all exams...');
      
      const response = await fetch(`${API_URL}/exams/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch exams');
      }

      const data = await response.json();
      console.log('✅ Exams data received:', data);

      const now = new Date();
      const exams = data.data?.exams || data.exams || [];

      // Separate ongoing and scheduled exams
      const ongoing: Exam[] = [];
      const scheduled: Exam[] = [];

      exams.forEach((exam: Exam & { is_ended?: boolean }) => {
        const startTime = new Date(exam.start_time);
        const endTime = new Date(exam.end_time);

        // Skip exams that have been manually ended
        if (exam.is_ended) {
          console.log(`⏹️ Skipping ended exam: ${exam.title}`);
          return;
        }

        if (now >= startTime && now <= endTime) {
          // Ongoing exam
          ongoing.push({
            ...exam,
            status: 'live',
            totalStudents: exam.class_id?.students?.length || 0,
            activeStudents: Math.floor((exam.class_id?.students?.length || 0) * 0.8), // Mock for now
            completedStudents: Math.floor((exam.class_id?.students?.length || 0) * 0.2), // Mock for now
            avgProgress: 50 // Mock for now
          });
        } else if (now < startTime) {
          // Scheduled exam
          scheduled.push({
            ...exam,
            status: 'scheduled',
            totalStudents: exam.class_id?.students?.length || 0
          });
        }
      });

      setOngoingExams(ongoing);
      setScheduledExams(scheduled);
      
      if (ongoing.length === 0 && scheduled.length === 0) {
        toast.info('No ongoing or scheduled exams found');
      }
    } catch (error) {
      console.error('❌ Error fetching exams:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handleEndTest = async (examId: string, examTitle: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/exams/end-test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ examId })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Test ended successfully', {
          description: 'The test has been ended for all students',
          action: {
            label: 'Delete Exam',
            onClick: () => {
              if (window.confirm(`Do you want to delete "${examTitle}" permanently?`)) {
                handleDeleteExam(examId, examTitle);
              }
            }
          }
        });
        fetchExams(); // Refresh data
      } else {
        throw new Error(data.error || 'Failed to end test');
      }
    } catch (error) {
      console.error('Error ending test:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to end test');
    }
  };

  const handleDeleteExam = async (examId: string, examTitle: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/exams/${examId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`"${examTitle}" deleted successfully`);
        fetchExams(); // Refresh data
      } else {
        throw new Error(data.error || 'Failed to delete exam');
      }
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete exam');
    }
  };

  const calculateTimeRemaining = (endTime: string): string => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return '0 min';
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} min`;
  };

  const calculateElapsedTime = (startTime: string): string => {
    const now = new Date();
    const start = new Date(startTime);
    const diff = now.getTime() - start.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''} ago`;
    }
    return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
  };

  const formatScheduledTime = (startTime: string): string => {
    const start = new Date(startTime);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if it's today
    if (start.toDateString() === now.toDateString()) {
      return start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    
    // Check if it's tomorrow
    if (start.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow ${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    }

    // Otherwise show date and time
    return start.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-lg font-medium">Loading exams...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Ongoing Tests & Exams
            </h1>
            <p className="text-muted-foreground mt-2">Monitor and manage live tests and examinations</p>
          </div>
          <Button 
            className="bg-gradient-to-r from-primary to-primary/80"
            onClick={fetchExams}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Live Tests */}
        {ongoingExams.length > 0 ? (
          <div className="space-y-6">
            {ongoingExams.map((exam, index) => (
              <Card 
                key={exam._id} 
                className="glass-effect border-green-500/30 bg-green-50/20 animate-fade-in hover-lift"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        {exam.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Started {calculateElapsedTime(exam.start_time)}
                      </p>
                    </div>
                    <Badge className="bg-green-500 text-white">Live</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {exam.activeStudents || 0}/{exam.totalStudents || 0}
                      </div>
                      <p className="text-sm text-muted-foreground">Students Active</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {calculateTimeRemaining(exam.end_time)}
                      </div>
                      <p className="text-sm text-muted-foreground">Remaining</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {exam.duration_minutes} min
                      </div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {exam.completedStudents || 0}
                      </div>
                      <p className="text-sm text-muted-foreground">Submitted</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {exam.avgProgress || 0}%
                      </span>
                    </div>
                    <Progress value={exam.avgProgress || 0} className="h-3" />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/dashboard/common/monitor/${exam._id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Monitor
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to end this test for all students?')) {
                          handleEndTest(exam._id, exam.title);
                        }
                      }}
                    >
                      <StopCircle className="h-4 w-4 mr-1" />
                      End Test
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-red-500 text-red-500 hover:bg-red-50"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${exam.title}"? This action cannot be undone.`)) {
                          handleDeleteExam(exam._id, exam.title);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass-effect border-primary/20 animate-fade-in">
            <CardContent className="py-12 text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Ongoing Tests</h3>
              <p className="text-muted-foreground">
                There are no tests currently in progress
              </p>
            </CardContent>
          </Card>
        )}

        {/* Scheduled Tests */}
        <Card className="glass-effect border-primary/20 animate-fade-in hover-lift">
          <CardHeader>
            <CardTitle>Scheduled Tests</CardTitle>
          </CardHeader>
          <CardContent>
            {scheduledExams.length > 0 ? (
              <div className="space-y-4">
                {scheduledExams.map((exam, index) => (
                  <div 
                    key={exam._id} 
                    className="flex justify-between items-center p-4 border rounded-lg hover:bg-accent/20 transition-colors animate-slide-in" 
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div>
                      <p className="font-medium">{exam.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatScheduledTime(exam.start_time)} • {exam.duration_minutes} min
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {exam.totalStudents || 0}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/dashboard/common/conduct-test?examId=${exam._id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-red-500 text-red-500 hover:bg-red-50"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete "${exam.title}"? This action cannot be undone.`)) {
                            handleDeleteExam(exam._id, exam.title);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No scheduled tests</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default OngoingTestExam;
