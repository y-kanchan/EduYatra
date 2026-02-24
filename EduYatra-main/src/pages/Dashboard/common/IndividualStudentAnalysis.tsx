
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Search, TrendingUp, Award, BookOpen, Clock, User, Mail, Calendar, Eye } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { API_URL } from "@/config/api";

interface Student {
  student_id: string;
  student_name: string;
  email: string;
  class_name: string;
  class_id: string;
  tests_completed: number;
  avg_score: number;
  avg_time_minutes: number;
  joined_date: string;
  rank: number;
}

interface StudentDetail {
  student_id: string;
  name: string;
  email: string;
  class_name: string;
  joined_date: string;
}

interface Statistics {
  tests_completed: number;
  avg_score: number;
  best_score: number;
  avg_time_minutes: number;
  total_time_spent_minutes: number;
}

interface RecentTest {
  submission_id: string;
  exam_id: string;
  exam_name: string;
  subject: string;
  score: number;
  total_questions: number;
  percentage: number;
  time_spent_minutes: number;
  submitted_at: string;
  correct_answers: number;
}

interface SubjectPerformance {
  subject: string;
  avg_score: number;
  tests_attempted: number;
}

interface DetailedAnalysis {
  student: StudentDetail;
  statistics: Statistics;
  recent_tests: RecentTest[];
  subject_performance: SubjectPerformance[];
}

interface StudentsResponse {
  success: boolean;
  total_students: number;
  students: Student[];
}

interface DetailedAnalysisResponse {
  success: boolean;
  student: StudentDetail;
  statistics: Statistics;
  recent_tests: RecentTest[];
  subject_performance: SubjectPerformance[];
}

const IndividualStudentAnalysis = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<DetailedAnalysis | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStudents(students);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = students.filter(
        (student) =>
          student.student_name.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query) ||
          student.class_name.toLowerCase().includes(query)
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("❌ Please log in to view student analysis");
        return;
      }

      const response = await axios.get<StudentsResponse>(
        `${API_URL}/exams/students-analysis`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setStudents(response.data.students);
        setFilteredStudents(response.data.students);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load student data");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDetails = async (studentId: string) => {
    setLoadingDetails(true);
    setIsDetailsDialogOpen(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("❌ Please log in");
        return;
      }

      const response = await axios.get<DetailedAnalysisResponse>(
        `${API_URL}/exams/student-analysis/${studentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSelectedStudent(response.data);
      }
    } catch (error) {
      console.error("Error fetching student details:", error);
      toast.error("Failed to load student details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <p className="text-center text-muted-foreground">Loading student data...</p>
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
              Individual Student Analysis
            </h1>
            <p className="text-muted-foreground mt-2">Detailed performance analysis for individual students</p>
          </div>
        </div>

        {/* Student Search */}
        <Card className="glass-effect border-primary/20 animate-fade-in">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search student by name, email, or class..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
            </p>
          </CardContent>
        </Card>

        {/* Student List */}
        {filteredStudents.length === 0 ? (
          <Card className="glass-effect border-primary/20">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No students found matching your search.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredStudents.map((student, index) => (
              <Card 
                key={student.student_id} 
                className="glass-effect border-primary/20 animate-scale-in hover-lift cursor-pointer" 
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => fetchStudentDetails(student.student_id)}
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>{student.student_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{student.student_name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{student.class_name}</p>
                    </div>
                    <Badge variant={student.rank <= 3 ? 'default' : 'secondary'}>
                      #{student.rank}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span>{student.avg_score}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span>{student.tests_completed} Tests</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{student.avg_time_minutes} min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        <span className="text-xs truncate">{student.email.split('@')[0]}</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      View Detailed Analysis
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Student Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedStudent ? `${selectedStudent.student.name} - Detailed Analysis` : 'Student Analysis'}
              </DialogTitle>
            </DialogHeader>
            
            {loadingDetails ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : selectedStudent ? (
              <div className="space-y-6">
                {/* Student Info */}
                <Card className="glass-effect border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg">Student Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <User className="h-4 w-4" />
                          Name
                        </div>
                        <p className="font-medium">{selectedStudent.student.name}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Mail className="h-4 w-4" />
                          Email
                        </div>
                        <p className="font-medium text-sm">{selectedStudent.student.email}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <BookOpen className="h-4 w-4" />
                          Class
                        </div>
                        <p className="font-medium">{selectedStudent.student.class_name}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Calendar className="h-4 w-4" />
                          Joined
                        </div>
                        <p className="font-medium">{formatDate(selectedStudent.student.joined_date)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Stats */}
                <div className="grid gap-4 md:grid-cols-5">
                  <Card className="glass-effect border-primary/20">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold text-primary">{selectedStudent.statistics.avg_score}%</div>
                      <p className="text-sm text-muted-foreground mt-1">Overall Average</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-effect border-primary/20">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold text-green-600">{selectedStudent.statistics.tests_completed}</div>
                      <p className="text-sm text-muted-foreground mt-1">Tests Completed</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-effect border-primary/20">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold text-blue-600">{selectedStudent.statistics.best_score}%</div>
                      <p className="text-sm text-muted-foreground mt-1">Best Score</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-effect border-primary/20">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold text-purple-600">{selectedStudent.statistics.avg_time_minutes}m</div>
                      <p className="text-sm text-muted-foreground mt-1">Avg. Time</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-effect border-primary/20">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold text-orange-600">{selectedStudent.statistics.total_time_spent_minutes}m</div>
                      <p className="text-sm text-muted-foreground mt-1">Total Time</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Subject Performance */}
                {selectedStudent.subject_performance.length > 0 && (
                  <Card className="glass-effect border-primary/20">
                    <CardHeader>
                      <CardTitle>Subject Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedStudent.subject_performance.map((subject, index) => (
                          <div key={index}>
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">{subject.subject}</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{subject.tests_attempted} tests</Badge>
                                <span className="font-bold text-primary">{subject.avg_score}%</span>
                              </div>
                            </div>
                            <Progress value={subject.avg_score} className="h-3" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Tests */}
                {selectedStudent.recent_tests.length > 0 && (
                  <Card className="glass-effect border-primary/20">
                    <CardHeader>
                      <CardTitle>Recent Test Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-3 font-medium">Exam</th>
                              <th className="text-left p-3 font-medium">Subject</th>
                              <th className="text-right p-3 font-medium">Score</th>
                              <th className="text-right p-3 font-medium">Percentage</th>
                              <th className="text-right p-3 font-medium">Time</th>
                              <th className="text-left p-3 font-medium">Date</th>
                              <th className="text-center p-3 font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedStudent.recent_tests.map((test, index) => (
                              <tr key={index} className="border-b hover:bg-accent/20">
                                <td className="p-3">{test.exam_name}</td>
                                <td className="p-3">
                                  <Badge variant="outline">{test.subject}</Badge>
                                </td>
                                <td className="p-3 text-right font-medium">
                                  {test.correct_answers}/{test.total_questions}
                                </td>
                                <td className="p-3 text-right">
                                  <Badge variant={test.percentage >= 60 ? "default" : "secondary"}>
                                    {test.percentage}%
                                  </Badge>
                                </td>
                                <td className="p-3 text-right">{test.time_spent_minutes} min</td>
                                <td className="p-3 text-sm">{formatDateTime(test.submitted_at)}</td>
                                <td className="p-3 text-center">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => navigate(`/teacher/test-answers/${test.submission_id}`)}
                                    className="gap-2"
                                  >
                                    <Eye className="h-4 w-4" />
                                    View Answers
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center p-8">
                <p className="text-muted-foreground">No student selected</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default IndividualStudentAnalysis;
