
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Play, Award, Clock, Users, Upload, CheckCircle, AlertCircle, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { API_URL } from "@/config/api";

// Types
interface RecentScore {
  examTitle: string;
  score: number;
  date: string;
  submittedAt: string;
}

interface Performance {
  testsAttempted: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number;
  recentScores: RecentScore[];
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

const Index = () => {
  const [performance, setPerformance] = useState({
    testsAttempted: 0,
    averageScore: 0,
    bestScore: 0,
    totalTimeSpent: 0,
    recentScores: []
  });
  const [loadingPerformance, setLoadingPerformance] = useState(true);

  // Fetch performance data
  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const response = await fetchWithAuth(`${API_URL}/exams/student-performance`);
        const data = await response.json();
        
        if (data.success && data.performance) {
          setPerformance(data.performance);
        }
      } catch (error) {
        console.error('Error fetching performance:', error);
      } finally {
        setLoadingPerformance(false);
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
    return `${minutes} min`;
  };

  return (
    <Layout>
      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 md:space-y-8">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Student Dashboard
            </h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Welcome back! Continue your learning journey.</p>
          </div>
        </div>

        {/* Learn by Topic Section */}
            <Card className="glass-effect border-primary/20 animate-fade-in hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-6 w-6" />
                  Learn by Topic
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { topic: "Algebra", icon: "📐", progress: 75, lessons: 12 },
                    { topic: "Geometry", icon: "📏", progress: 60, lessons: 8 },
                    { topic: "Calculus", icon: "∫", progress: 30, lessons: 15 },
                    { topic: "Statistics", icon: "📊", progress: 90, lessons: 10 },
                  ].map((topic, index) => (
                    <Card key={topic.topic} className="border-2 transition-all duration-200 hover:shadow-lg animate-scale-in hover:border-primary/40" style={{ animationDelay: `${index * 100}ms` }}>
                      <CardContent className="p-3 sm:p-4 text-center">
                        <div className="text-3xl mb-2">{topic.icon}</div>
                        <h3 className="font-medium mb-2">{topic.topic}</h3>
                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{topic.progress}%</span>
                          </div>
                          <Progress value={topic.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground">{topic.lessons} lessons</p>
                        </div>
                        <Button size="sm" className="w-full">
                          Start Learning
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" asChild>
                    <Link to="/learn-by-topic">View All Topics</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Practice Exams Section */}
            <Card className="glass-effect border-primary/20 animate-fade-in hover-lift">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-6 w-6" />
                    Practice Exams
                  </CardTitle>
                  <div className="flex gap-2">
                    <Select>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        <SelectItem value="math">Mathematics</SelectItem>
                        <SelectItem value="physics">Physics</SelectItem>
                        <SelectItem value="chemistry">Chemistry</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { title: "Math Quiz 1", subject: "Mathematics", duration: "45 min", difficulty: "Easy", questions: 25 },
                    { title: "Physics Test", subject: "Physics", duration: "60 min", difficulty: "Medium", questions: 30 },
                    { title: "Chemistry Mock", subject: "Chemistry", duration: "90 min", difficulty: "Hard", questions: 40 },
                  ].map((exam, index) => (
                    <Card key={exam.title} className="border-2 transition-all duration-200 hover:shadow-lg animate-slide-in hover:border-primary/40" style={{ animationDelay: `${index * 100}ms` }}>
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-medium">{exam.title}</h3>
                          <Badge variant={exam.difficulty === 'Hard' ? 'destructive' : exam.difficulty === 'Medium' ? 'default' : 'secondary'}>
                            {exam.difficulty}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm mb-3">
                          <div className="flex justify-between">
                            <span>Subject:</span>
                            <span>{exam.subject}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Duration:</span>
                            <span>{exam.duration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Questions:</span>
                            <span>{exam.questions}</span>
                          </div>
                        </div>
                        <Button className="w-full">
                          <Play className="h-4 w-4 mr-1" />
                          Start Exam
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" asChild>
                    <Link to="/practice-exams">View All Exams</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* My Performance Section */}
            <Card className="glass-effect border-primary/20 animate-fade-in hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-6 w-6" />
                  My Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingPerformance ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading performance data...</p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <h3 className="font-medium">Performance Stats</h3>
                      <div className="grid gap-4">
                        <div className="flex justify-between items-center p-3 bg-accent/20 rounded-lg">
                          <span>Tests Attempted</span>
                          <span className="font-bold text-primary">{performance.testsAttempted}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-accent/20 rounded-lg">
                          <span>Average Score</span>
                          <span className="font-bold text-primary">{performance.averageScore}%</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-accent/20 rounded-lg">
                          <span>Best Score</span>
                          <span className="font-bold text-primary">{performance.bestScore}%</span>
                        </div>
                        {performance.totalTimeSpent > 0 && (
                          <div className="flex justify-between items-center p-3 bg-accent/20 rounded-lg">
                            <span>Total Time Spent</span>
                            <span className="font-bold text-primary">{formatTimeSpent(performance.totalTimeSpent)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-medium">Recent Scores</h3>
                      {performance.recentScores && performance.recentScores.length > 0 ? (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {performance.recentScores.slice(0, 5).map((score: RecentScore, index: number) => (
                            <div key={index} className="flex justify-between items-center p-2 border rounded-lg">
                              <div className="flex-1">
                                <p className="text-sm font-medium truncate">{score.examTitle}</p>
                                <p className="text-xs text-muted-foreground">{score.date}</p>
                              </div>
                              <Badge className={score.score >= 90 ? 'bg-green-500' : score.score >= 70 ? 'bg-blue-500' : 'bg-yellow-500'}>
                                {score.score}%
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-48 flex items-center justify-center border-2 border-dashed border-primary/30 rounded-xl bg-gradient-to-br from-accent/20 to-primary/5">
                          <div className="text-center">
                            <div className="text-4xl mb-2">📈</div>
                            <p className="text-muted-foreground">No test scores yet</p>
                            <p className="text-sm text-muted-foreground mt-1">Complete tests to see your progress</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" asChild>
                    <Link to="/my-performance">View Detailed Performance</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Enrollment Section */}
            <Card className="glass-effect border-primary/20 animate-fade-in hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  Enrollment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="ongoing" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="ongoing">Ongoing Tests</TabsTrigger>
                    <TabsTrigger value="attended">Attended Tests</TabsTrigger>
                  </TabsList>
                  <TabsContent value="ongoing" className="space-y-4">
                    {[
                      { test: "Mathematics Final", progress: 75, deadline: "2 days left" },
                      { test: "Physics Mid-term", progress: 50, deadline: "5 days left" },
                    ].map((test, index) => (
                      <div key={test.test} className="flex justify-between items-center p-4 border rounded-lg">
                        <div className="space-y-2">
                          <h4 className="font-medium">{test.test}</h4>
                          <div className="flex items-center gap-2">
                            <Progress value={test.progress} className="w-32 h-2" />
                            <span className="text-sm text-muted-foreground">{test.progress}%</span>
                          </div>
                        </div>
                        <Badge variant="outline">{test.deadline}</Badge>
                      </div>
                    ))}
                  </TabsContent>
                  <TabsContent value="attended" className="space-y-4">
                    {[
                      { test: "Chemistry Quiz", score: 92, date: "Dec 5, 2024" },
                      { test: "Biology Test", score: 88, date: "Dec 3, 2024" },
                    ].map((test, index) => (
                      <div key={test.test} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{test.test}</h4>
                          <p className="text-sm text-muted-foreground">{test.date}</p>
                        </div>
                        <Badge className="bg-green-500">{test.score}%</Badge>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" asChild>
                    <Link to="/enrollment">View All Enrollments</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Submit & Check Answers Section */}
            <Card className="glass-effect border-primary/20 animate-fade-in hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-6 w-6" />
                  Submit & Check Answers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="font-medium">Submit Assignment</h3>
                    <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground mb-2">Upload your answer sheet (PDF)</p>
                      <Button variant="outline">Choose File</Button>
                    </div>
                    <Button className="w-full">Submit Answers</Button>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-medium">Recent Submissions</h3>
                    <div className="space-y-3">
                      {[
                        { assignment: "Math Assignment 1", status: "Checked", score: 95 },
                        { assignment: "Physics Lab Report", status: "Pending", score: null },
                        { assignment: "Chemistry Quiz", status: "Submitted", score: null },
                      ].map((item, index) => (
                        <div key={item.assignment} className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{item.assignment}</p>
                            {item.score && <p className="text-xs text-muted-foreground">Score: {item.score}%</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              item.status === 'Checked' ? 'default' : 
                              item.status === 'Pending' ? 'secondary' : 'outline'
                            }>
                              {item.status}
                            </Badge>
                            {item.status === 'Checked' && (
                              <Button size="sm" variant="ghost">View Solution</Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Layout>
      );
    };

    export default Index;
