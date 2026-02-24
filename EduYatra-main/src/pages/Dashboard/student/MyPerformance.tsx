
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Award, Target, Clock, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { API_URL } from "@/config/api";

// Types
interface RecentScore {
  examTitle: string;
  score: number;
  date: string;
  submittedAt: string;
  subject?: string;
  grade?: string;
}

interface SubjectPerformance {
  subject: string;
  averageScore: number;
  testsAttempted: number;
}

interface Performance {
  testsAttempted: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number;
  recentScores: RecentScore[];
  subjectPerformance?: SubjectPerformance[];
}

// Utility function for authenticated API calls
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response;
};

const MyPerformance = () => {
  const [performance, setPerformance] = useState<Performance>({
    testsAttempted: 0,
    averageScore: 0,
    bestScore: 0,
    totalTimeSpent: 0,
    recentScores: [],
    subjectPerformance: []
  });
  const [loading, setLoading] = useState(true);

  // Fetch performance data
  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        console.log('🔄 Fetching student performance data...');
        const response = await fetchWithAuth(`${API_URL}/exams/student-performance`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 Performance data received:', data);
        
        if (data.success && data.performance) {
          setPerformance(data.performance);
          console.log('✅ Performance state updated');
        } else {
          console.warn('⚠️ No performance data in response');
        }
      } catch (error) {
        console.error('❌ Error fetching performance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, []);

  // Format time spent
  const formatTimeSpent = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Calculate grade from score
  const calculateGrade = (score: number): string => {
    if (score >= 90) return "A";
    if (score >= 80) return "B+";
    if (score >= 70) return "B";
    if (score >= 60) return "C+";
    if (score >= 50) return "C";
    return "D";
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Loading performance data...</p>
        </div>
      </Layout>
    );
  }

  const subjectColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'];

  return (
    <Layout>
      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              My Performance
            </h1>
            <p className="text-muted-foreground mt-2">Track your learning progress and achievements</p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Overall Average", value: `${performance.averageScore.toFixed(1)}%`, icon: TrendingUp, color: "text-green-600" },
            { title: "Tests Completed", value: `${performance.testsAttempted}`, icon: Award, color: "text-blue-600" },
            { title: "Best Score", value: `${performance.bestScore}%`, icon: Target, color: "text-purple-600" },
            { title: "Study Time", value: formatTimeSpent(performance.totalTimeSpent), icon: Clock, color: "text-orange-600" },
          ].map((stat, index) => (
            <Card key={stat.title} className="glass-effect border-primary/20 animate-scale-in hover-lift" style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Subject Performance */}
        <Card className="glass-effect border-primary/20 animate-fade-in hover-lift">
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {performance.subjectPerformance && performance.subjectPerformance.length > 0 ? (
              <div className="space-y-6">
                {performance.subjectPerformance.map((subject, index) => (
                  <div key={subject.subject} className="animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded ${subjectColors[index % subjectColors.length]}`}></div>
                        <span className="font-medium">{subject.subject}</span>
                        <Badge variant="outline">{subject.testsAttempted} tests</Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-primary">{subject.averageScore.toFixed(1)}%</span>
                      </div>
                    </div>
                    <Progress value={subject.averageScore} className="h-3" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No subject performance data available yet.</p>
                <p className="text-sm text-muted-foreground mt-2">Complete some tests to see your subject-wise performance.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="glass-effect border-primary/20 animate-fade-in hover-lift">
            <CardHeader>
              <CardTitle>Recent Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              {performance.recentScores && performance.recentScores.length > 0 ? (
                <div className="space-y-4">
                  {performance.recentScores.slice(0, 10).map((result, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <div>
                        <p className="font-medium">{result.examTitle}</p>
                        <p className="text-sm text-muted-foreground">{result.date}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={result.score >= 90 ? 'default' : 'secondary'}>{calculateGrade(result.score)}</Badge>
                        <p className="text-sm font-bold text-primary">{result.score}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No test results available yet.</p>
                  <p className="text-sm text-muted-foreground mt-2">Complete some tests to see your results here.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-effect border-primary/20 animate-fade-in hover-lift">
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">{performance.testsAttempted}</div>
                  <p className="text-muted-foreground">Total Tests Completed</p>
                </div>
                {performance.testsAttempted > 0 && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Average Performance</span>
                        <span className="font-medium">{performance.averageScore.toFixed(1)}%</span>
                      </div>
                      <Progress value={performance.averageScore} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Best Performance</span>
                        <span className="font-medium">{performance.bestScore}%</span>
                      </div>
                      <Progress value={performance.bestScore} className="h-2" />
                    </div>
                    {performance.totalTimeSpent > 0 && (
                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total Study Time</span>
                          <span className="font-bold text-primary">{formatTimeSpent(performance.totalTimeSpent)}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goals & Achievements */}
        <Card className="glass-effect border-primary/20 animate-fade-in hover-lift">
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            {performance.testsAttempted > 0 ? (
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-2 border-blue-200 bg-blue-50/20 animate-scale-in">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-5 w-5 text-blue-500" />
                      <h3 className="font-medium">Tests Attempted</h3>
                    </div>
                    <p className="text-3xl font-bold text-primary">{performance.testsAttempted}</p>
                    <p className="text-sm text-muted-foreground mt-1">Keep up the good work!</p>
                  </CardContent>
                </Card>
                
                <Card className={`border-2 ${performance.averageScore >= 75 ? 'border-green-200 bg-green-50/20' : 'border-yellow-200 bg-yellow-50/20'} animate-scale-in`} style={{ animationDelay: '100ms' }}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className={`h-5 w-5 ${performance.averageScore >= 75 ? 'text-green-500' : 'text-yellow-500'}`} />
                      <h3 className="font-medium">Average Score</h3>
                    </div>
                    <p className="text-3xl font-bold text-primary">{performance.averageScore.toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {performance.averageScore >= 90 ? 'Excellent performance!' : 
                       performance.averageScore >= 75 ? 'Great job!' : 
                       'Keep improving!'}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-purple-200 bg-purple-50/20 animate-scale-in" style={{ animationDelay: '200ms' }}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-purple-500" />
                      <h3 className="font-medium">Best Score</h3>
                    </div>
                    <p className="text-3xl font-bold text-primary">{performance.bestScore}%</p>
                    <p className="text-sm text-muted-foreground mt-1">Your highest achievement!</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No performance data available yet.</p>
                <p className="text-sm text-muted-foreground mt-2">Start taking tests to track your progress and achievements!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default MyPerformance;
