
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarChart3, TrendingUp, Users, Clock, Download, Eye, Lock, Unlock } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { API_URL } from "@/config/api";

interface Participant {
  student_id: string;
  student_name: string;
  student_email: string;
  score: number;
  percentage: number;
  correct_answers: number;
  total_questions: number;
  time_spent_minutes: number;
  submitted_at: string;
  submission_reason: string;
  exam_name?: string; // Optional: only present when viewing all participants
}

interface ExamAnalysisData {
  exam_id: string;
  exam_name: string;
  course: string;
  date: string;
  status: string;
  participants: number;
  avgScore: number;
  avgTimeSpent: number;
  score_released: boolean;
  answers_released: boolean;
}

interface AnalysisSummary {
  totalTests: number;
  completedTests: number;
  totalParticipants: number;
  avgScore: number;
  avgTimeMinutes: number;
}

interface AnalysisResponse {
  success: boolean;
  summary: AnalysisSummary;
  exams: ExamAnalysisData[];
}

interface ParticipantsResponse {
  success: boolean;
  exam_name: string;
  total_participants: number;
  participants: Participant[];
}

const TestExamAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AnalysisSummary>({
    totalTests: 0,
    completedTests: 0,
    totalParticipants: 0,
    avgScore: 0,
    avgTimeMinutes: 0
  });
  const [exams, setExams] = useState<ExamAnalysisData[]>([]);
  const [selectedExam, setSelectedExam] = useState<ExamAnalysisData | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [isParticipantsDialogOpen, setIsParticipantsDialogOpen] = useState(false);

  useEffect(() => {
    fetchExamAnalysis();
  }, []);

  const fetchExamAnalysis = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("❌ Please log in to view analysis");
        return;
      }

      const response = await axios.get<AnalysisResponse>(
        `${API_URL}/exams/exam-analysis`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSummary(response.data.summary);
        setExams(response.data.exams);
      }
    } catch (error) {
      console.error("Error fetching exam analysis:", error);
      toast.error("Failed to load exam analysis");
    } finally {
      setLoading(false);
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

  const handleToggleScoreRelease = async (examId: string, currentValue: boolean) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("❌ Please log in to continue");
        return;
      }

      const response = await axios.post(
        `${API_URL}/exams/${examId}/toggle-score-release`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        // Update local state
        setExams(exams.map(exam => 
          exam.exam_id === examId 
            ? { ...exam, score_released: !currentValue }
            : exam
        ));
      }
    } catch (error: any) {
      console.error("Error toggling score release:", error);
      toast.error(error.response?.data?.error || "Failed to update score release");
    }
  };

  const handleToggleAnswerRelease = async (examId: string, currentValue: boolean) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("❌ Please log in to continue");
        return;
      }

      const response = await axios.post(
        `${API_URL}/exams/${examId}/toggle-answer-release`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        // Update local state
        setExams(exams.map(exam => 
          exam.exam_id === examId 
            ? { ...exam, answers_released: !currentValue }
            : exam
        ));
      }
    } catch (error: any) {
      console.error("Error toggling answer release:", error);
      toast.error(error.response?.data?.error || "Failed to update answer release");
    }
  };

  const handleViewParticipants = async (exam: ExamAnalysisData) => {
    setSelectedExam(exam);
    setIsParticipantsDialogOpen(true);
    setLoadingParticipants(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("❌ Please log in");
        return;
      }

      const response = await axios.get<ParticipantsResponse>(
        `${API_URL}/exams/${exam.exam_id}/participants`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setParticipants(response.data.participants);
      }
    } catch (error) {
      console.error("Error fetching participants:", error);
      toast.error("Failed to load participants");
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handleViewAllParticipants = async () => {
    setSelectedExam(null);
    setIsParticipantsDialogOpen(true);
    setLoadingParticipants(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("❌ Please log in");
        return;
      }

      // Fetch participants from all exams
      const allParticipants: Participant[] = [];
      for (const exam of exams) {
        const response = await axios.get<ParticipantsResponse>(
          `${API_URL}/exams/${exam.exam_id}/participants`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          // Add exam name to each participant
          const participantsWithExam = response.data.participants.map(p => ({
            ...p,
            exam_name: exam.exam_name
          }));
          allParticipants.push(...participantsWithExam);
        }
      }
      setParticipants(allParticipants);
    } catch (error) {
      console.error("Error fetching all participants:", error);
      toast.error("Failed to load all participants");
    } finally {
      setLoadingParticipants(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'completed' || statusLower === 'published') return 'default';
    if (statusLower === 'ongoing') return 'secondary';
    return 'outline';
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <p className="text-center text-muted-foreground">Loading exam analysis...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 md:space-y-8">
        <div className="space-y-3 sm:space-y-0 sm:flex sm:items-start sm:justify-between animate-fade-in">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Test/Exam Analysis
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">Detailed analysis of test and exam performance</p>
          </div>
          <Button className="bg-gradient-to-r from-primary to-primary/80 w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export Analysis
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Total Tests", value: summary.totalTests.toString(), icon: BarChart3, subtitle: "exams created", onClick: null },
            { title: "Average Score", value: `${summary.avgScore.toFixed(1)}%`, icon: TrendingUp, subtitle: "across all tests", onClick: null },
            { title: "Students Participated", value: summary.totalParticipants.toString(), icon: Users, subtitle: "total submissions", onClick: handleViewAllParticipants },
            { title: "Avg. Completion Time", value: `${summary.avgTimeMinutes} min`, icon: Clock, subtitle: "per test", onClick: null },
          ].map((stat, index) => (
            <Card 
              key={stat.title} 
              className={`glass-effect border-primary/20 animate-scale-in hover-lift ${stat.onClick ? 'cursor-pointer' : ''}`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={stat.onClick || undefined}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Tests Analysis */}
        <Card className="glass-effect border-primary/20 animate-fade-in hover-lift">
          <CardHeader>
            <CardTitle>Exam Analysis ({exams.length} exams)</CardTitle>
          </CardHeader>
          <CardContent>
            {exams.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No exams found. Create your first exam to see analysis here.</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {exams.map((exam, index) => (
                  <div key={exam.exam_id} className="flex flex-col gap-3 p-3 sm:p-4 border rounded-lg hover:bg-accent/20 transition-colors animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium break-words">{exam.exam_name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {formatDate(exam.date)} • {exam.course}
                        </p>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 h-auto text-xs text-primary hover:underline"
                          onClick={() => handleViewParticipants(exam)}
                        >
                          <Users className="h-3 w-3 mr-1" />
                          {exam.participants} participants
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                        <div className="flex-1 sm:flex-initial">
                          <p className="font-bold text-primary text-sm sm:text-base">{exam.avgScore.toFixed(1)}%</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">Average Score</p>
                        </div>
                        <div className="flex-1 sm:flex-initial">
                          <p className="font-medium text-sm sm:text-base">{exam.avgTimeSpent} min</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">Avg Time</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusColor(exam.status) as "default" | "secondary" | "outline"} className="whitespace-nowrap">
                            {exam.status}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewParticipants(exam)}
                            title="View participants"
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Release Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 pl-0 sm:pl-2 pt-3 border-t">
                      <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 flex-1">
                          {exam.score_released ? <Unlock className="h-4 w-4 text-green-600 flex-shrink-0" /> : <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                          <span className="text-xs sm:text-sm font-medium">Release Score</span>
                        </div>
                        <Switch
                          checked={exam.score_released}
                          onCheckedChange={() => handleToggleScoreRelease(exam.exam_id, exam.score_released)}
                        />
                      </div>
                      <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                        {exam.score_released ? 'Scores visible to students' : 'Scores hidden from students'}
                      </span>
                      
                      <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 flex-1">
                          {exam.answers_released ? <Unlock className="h-4 w-4 text-green-600 flex-shrink-0" /> : <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                          <span className="text-xs sm:text-sm font-medium">Release Answers</span>
                        </div>
                        <Switch
                          checked={exam.answers_released}
                          onCheckedChange={() => handleToggleAnswerRelease(exam.exam_id, exam.answers_released)}
                        />
                      </div>
                      <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                        {exam.answers_released ? 'Answers visible to students' : 'Answers hidden from students'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Charts */}
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="glass-effect border-primary/20 animate-fade-in hover-lift">
            <CardHeader>
              <CardTitle>Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-primary/30 rounded-xl bg-gradient-to-br from-accent/20 to-primary/5">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 text-primary" />
                  <p className="text-muted-foreground">Score Distribution Chart</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-primary/20 animate-fade-in hover-lift">
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-primary/30 rounded-xl bg-gradient-to-br from-accent/20 to-primary/5">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 text-primary" />
                  <p className="text-muted-foreground">Performance Trends Chart</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Participants Dialog */}
        <Dialog open={isParticipantsDialogOpen} onOpenChange={setIsParticipantsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedExam ? `${selectedExam.exam_name} - Participants` : 'All Participants - All Exams'}
              </DialogTitle>
            </DialogHeader>
            
            {loadingParticipants ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : participants.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No participants yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      {!selectedExam && <th className="text-left p-3 font-medium">Exam</th>}
                      <th className="text-left p-3 font-medium">Student Name</th>
                      <th className="text-left p-3 font-medium">Email</th>
                      <th className="text-right p-3 font-medium">Score</th>
                      <th className="text-right p-3 font-medium">Percentage</th>
                      <th className="text-right p-3 font-medium">Time Spent</th>
                      <th className="text-left p-3 font-medium">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((participant, index) => (
                      <tr key={index} className="border-b hover:bg-accent/20 transition-colors">
                        {!selectedExam && <td className="p-3 text-sm font-medium">{participant.exam_name || 'N/A'}</td>}
                        <td className="p-3">{participant.student_name || 'N/A'}</td>
                        <td className="p-3 text-sm text-muted-foreground">{participant.student_email || 'N/A'}</td>
                        <td className="p-3 text-right font-medium">
                          {participant.score}/{participant.total_questions}
                        </td>
                        <td className="p-3 text-right">
                          <Badge variant={participant.percentage >= 60 ? "default" : "secondary"}>
                            {participant.percentage.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="p-3 text-right">{participant.time_spent_minutes} min</td>
                        <td className="p-3 text-sm">{formatDateTime(participant.submitted_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default TestExamAnalysis;
