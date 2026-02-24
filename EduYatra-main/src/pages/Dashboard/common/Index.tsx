import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus, Users, FileText, Settings } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/config/api";

interface DashboardData {
  totalStudents: number;
  totalClasses: number;
  totalExams: number;
  ongoingExams: number;
  upcomingExams: number;
  recentExams: Array<{
    _id: string;
    title: string;
    class_name: string;
    start_time: string;
    status: string;
  }>;
}

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalStudents: 0,
    totalClasses: 0,
    totalExams: 0,
    ongoingExams: 0,
    upcomingExams: 0,
    recentExams: []
  });

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        navigate('/auth/teacher');
        return;
      }

      console.log('📊 Fetching dashboard data...');

      // Fetch exams
      const examsResponse = await fetch(`${API_URL}/exams/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Fetch classes
      const classesResponse = await fetch(`${API_URL}/classes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!examsResponse.ok || !classesResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const examsData = await examsResponse.json();
      const classesData = await classesResponse.json();

      console.log('✅ Dashboard data received');

      const now = new Date();
      const exams = examsData.data?.exams || examsData.exams || [];
      const classes = classesData.data?.classes || classesData.classes || [];

      // Calculate total students across all classes
      const totalStudents = classes.reduce((sum: number, cls: any) => {
        return sum + (cls.students?.length || 0);
      }, 0);

      // Categorize exams
      let ongoing = 0;
      let upcoming = 0;
      const recent: any[] = [];

      exams.forEach((exam: any) => {
        const startTime = new Date(exam.start_time);
        const endTime = new Date(exam.end_time);

        if (now >= startTime && now <= endTime) {
          ongoing++;
        } else if (now < startTime) {
          upcoming++;
          if (recent.length < 5) {
            recent.push({
              _id: exam._id,
              title: exam.title,
              class_name: exam.class_id?.class_name || 'Unknown Class',
              start_time: exam.start_time,
              status: 'upcoming'
            });
          }
        } else if (recent.length < 5) {
          recent.push({
            _id: exam._id,
            title: exam.title,
            class_name: exam.class_id?.class_name || 'Unknown Class',
            start_time: exam.start_time,
            status: 'completed'
          });
        }
      });

      setDashboardData({
        totalStudents,
        totalClasses: classes.length,
        totalExams: exams.length,
        ongoingExams: ongoing,
        upcomingExams: upcoming,
        recentExams: recent.slice(0, 5)
      });

    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-lg font-medium">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 md:space-y-8">
        {/* Header Section */}
        <div className="space-y-3 sm:space-y-0 sm:flex sm:items-start sm:justify-between animate-fade-in">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">Welcome back! Here's what's happening with your classes.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            <div className="text-xs sm:text-sm text-muted-foreground bg-card px-3 py-2 rounded-lg border glass-effect animate-slide-in w-full sm:w-auto">
              <div className="hidden sm:block">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="sm:hidden text-center">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'short',
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchDashboardData}
              className="gap-2 w-full sm:w-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
          <Card className="hover-lift glass-effect animate-scale-in border-primary/20 hover:border-primary/40 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Students</CardTitle>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center flex-shrink-0">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {dashboardData.totalStudents}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse"></span>
                Across {dashboardData.totalClasses} classes
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift glass-effect animate-scale-in border-primary/20 hover:border-primary/40 transition-all duration-300" style={{ animationDelay: '100ms' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Exams</CardTitle>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center flex-shrink-0">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {dashboardData.totalExams}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse"></span>
                Created exams
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift glass-effect animate-scale-in border-primary/20 hover:border-primary/40 transition-all duration-300" style={{ animationDelay: '200ms' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Ongoing Tests</CardTitle>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-green-500/20 to-green-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-base sm:text-lg">🟢</span>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1 bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
                {dashboardData.ongoingExams}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse"></span>
                Currently in progress
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift glass-effect animate-scale-in border-primary/20 hover:border-primary/40 transition-all duration-300" style={{ animationDelay: '300ms' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Upcoming Tests</CardTitle>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-base sm:text-lg">📅</span>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1 bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                {dashboardData.upcomingExams}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 animate-pulse"></span>
                Scheduled tests
              </p>
            </CardContent>
          </Card>
            </div>

        {/* Main Content Grid */}
        <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 lg:grid-cols-3">
          {/* Recent Exams */}
          <div className="lg:col-span-2">
            <Card className="glass-effect border-primary/20 animate-fade-in">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-lg p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <span className="text-lg sm:text-xl">📋</span>
                  Recent Exams
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6">
                    {dashboardData.recentExams.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {dashboardData.recentExams.map((exam, index) => (
                        <div 
                          key={exam._id} 
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 border rounded-xl hover:border-primary/40 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] animate-slide-in bg-gradient-to-r from-background to-accent/20 cursor-pointer"
                          style={{ animationDelay: `${index * 100}ms` }}
                          onClick={() => navigate(`/conduct-test/online?examId=${exam._id}`)}
                        >
                          <div className="space-y-2 flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground break-words">{exam.title}</p>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1 flex-shrink-0">
                                <span>🏫</span>
                                <span className="truncate max-w-[120px]">{exam.class_name}</span>
                              </span>
                              <span className="hidden sm:inline">•</span>
                              <span className="inline-flex items-center gap-1 flex-shrink-0">
                                <span>📅</span>
                                {formatDate(exam.start_time)}
                              </span>
                              <span className="hidden sm:inline">•</span>
                              <span className="inline-flex items-center gap-1 flex-shrink-0">
                                <span>⏰</span>
                                {formatTime(exam.start_time)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3">
                            <span className={`text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium whitespace-nowrap ${
                              exam.status === 'upcoming' 
                                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}>
                              {exam.status}
                            </span>
                            <Button size="sm" variant="outline" className="hover-lift whitespace-nowrap">
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No recent exams found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

          {/* Quick Actions */}
          <Card className="glass-effect border-primary/20 animate-scale-in hover-lift">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-lg p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <span className="text-lg sm:text-xl">⚡</span>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-6">
              <button 
                onClick={() => navigate('/conduct-test/online')}
                className="w-full p-3 sm:p-4 text-left border rounded-xl hover:border-primary/40 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] bg-gradient-to-r from-background to-accent/20 animate-slide-in"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center flex-shrink-0">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-sm sm:text-base">Create New Test</p>
                    <p className="text-xs text-muted-foreground truncate">Set up a new exam or quiz</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => navigate('/manage-students')}
                className="w-full p-3 sm:p-4 text-left border rounded-xl hover:border-primary/40 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] bg-gradient-to-r from-background to-accent/20 animate-slide-in"
                style={{ animationDelay: '100ms' }}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-sm sm:text-base">Manage Students</p>
                    <p className="text-xs text-muted-foreground truncate">View and manage student batches</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => navigate('/performance/ongoing')}
                className="w-full p-3 sm:p-4 text-left border rounded-xl hover:border-primary/40 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] bg-gradient-to-r from-background to-accent/20 animate-slide-in"
                style={{ animationDelay: '200ms' }}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🟢</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-sm sm:text-base">Ongoing Tests</p>
                    <p className="text-xs text-muted-foreground truncate">Monitor live exams</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => navigate('/settings/general')}
                className="w-full p-3 sm:p-4 text-left border rounded-xl hover:border-primary/40 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] bg-gradient-to-r from-background to-accent/20 animate-slide-in"
                style={{ animationDelay: '300ms' }}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center flex-shrink-0">
                    <Settings className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-sm sm:text-base">Settings</p>
                    <p className="text-xs text-muted-foreground truncate">Configure your preferences</p>
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Classes Overview */}
        <Card className="glass-effect border-primary/20 animate-fade-in hover-lift">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-lg p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <span className="text-lg sm:text-xl">🏫</span>
                    Classes Overview
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/manage-students')}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 border rounded-lg bg-gradient-to-br from-background to-accent/10">
                    <div className="text-2xl font-bold text-primary mb-1">{dashboardData.totalClasses}</div>
                    <p className="text-sm text-muted-foreground">Total Classes</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-gradient-to-br from-background to-accent/10">
                    <div className="text-2xl font-bold text-primary mb-1">{dashboardData.totalStudents}</div>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-gradient-to-br from-background to-accent/10">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {dashboardData.totalClasses > 0 ? Math.round(dashboardData.totalStudents / dashboardData.totalClasses) : 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Avg Students/Class</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Layout>
      );
    };

    export default Index;
