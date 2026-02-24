import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, CheckCircle2, XCircle, Clock, Award, AlertCircle } from "lucide-react";
import { KatexRenderer } from '@/lib/katex-rendering';
import 'katex/dist/katex.min.css';
import { API_URL } from "@/config/api";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  studentAnswer: string | null;
  isCorrect: boolean;
  subject: string;
  difficulty_rating: number;
}

interface SubmissionDetails {
  score: number;
  percentage: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  submittedAt: Date;
}

interface ExamInfo {
  title: string;
  description: string;
}

const ViewTestAnswers: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [submission, setSubmission] = useState<SubmissionDetails | null>(null);
  const [exam, setExam] = useState<ExamInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Get user role from localStorage
    const role = localStorage.getItem('role');
    setUserRole(role);
    fetchTestAnswers();
  }, [submissionId]);

  const handleBackNavigation = () => {
    if (userRole === 'teacher') {
      navigate('/performance/individual');
    } else {
      navigate('/student/enrollment');
    }
  };

  const fetchTestAnswers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to continue');
        setTimeout(() => navigate('/SIgnin'), 2000);
        return;
      }

      const response = await fetch(
        `${API_URL}/exams/test-answers/${submissionId}`,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch test answers');
      }

      const data = await response.json();

      if (data.success) {
        setQuestions(data.questions);
        setSubmission(data.submission);
        setExam(data.exam);
      } else {
        throw new Error(data.error || 'Failed to fetch test answers');
      }
    } catch (error) {
      console.error('Error fetching test answers:', error);
      setError('Failed to load test answers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  };

  const getOptionLabel = (index: number): string => {
    return String.fromCharCode(65 + index); // A, B, C, D
  };

  const getDifficultyColor = (rating: number): string => {
    if (rating <= 2) return 'bg-green-100 text-green-800';
    if (rating <= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getScoreColor = (percentage: number): string => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading test answers...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !submission || !exam || questions.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error || 'No test data available.'}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={handleBackNavigation} 
            className="mt-4"
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Button 
            onClick={handleBackNavigation} 
            variant="ghost" 
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{exam.title}</h1>
          {exam.description && (
            <p className="text-gray-600">{exam.description}</p>
          )}
        </div>

        {/* Summary Card */}
        <Card className="mb-8 border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Award className="h-5 w-5" />
              Test Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(submission.percentage)}`}>
                  {submission.percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 mt-1">Score</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">
                  {submission.correctAnswers}/{submission.totalQuestions}
                </div>
                <div className="text-sm text-gray-600 mt-1">Correct Answers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600">
                  {formatTime(submission.timeSpent)}
                </div>
                <div className="text-sm text-gray-600 mt-1">Time Spent</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {new Date(submission.submittedAt).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-600 mt-1">Submitted</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Question Review</h2>
          {questions.map((question, questionIndex) => (
            <Card 
              key={question.id}
              className={`border-2 ${
                question.isCorrect 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-red-300 bg-red-50'
              }`}
            >
              <CardHeader>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary" className="font-semibold">
                    Question {questionIndex + 1}
                  </Badge>
                  <Badge variant="outline" className="bg-white">
                    {question.subject}
                  </Badge>
                  <Badge className={getDifficultyColor(question.difficulty_rating)}>
                    ⭐ {question.difficulty_rating}/5
                  </Badge>
                  <Badge 
                    className={
                      question.isCorrect 
                        ? 'bg-green-600 text-white' 
                        : 'bg-red-600 text-white'
                    }
                  >
                    {question.isCorrect ? (
                      <>
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Correct
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-1 h-3 w-3" />
                        Incorrect
                      </>
                    )}
                  </Badge>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <KatexRenderer className="text-base text-gray-900 leading-relaxed">
                    {question.text}
                  </KatexRenderer>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {question.options.map((option, optionIndex) => {
                    const isCorrect = option === question.correctAnswer;
                    const isStudentAnswer = option === question.studentAnswer;
                    
                    return (
                      <div
                        key={optionIndex}
                        className={`p-4 rounded-lg border-2 ${
                          isCorrect
                            ? 'border-green-500 bg-green-100'
                            : isStudentAnswer && !isCorrect
                            ? 'border-red-500 bg-red-100'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="font-bold text-gray-900 min-w-[24px]">
                            {getOptionLabel(optionIndex)}.
                          </span>
                          <div className="flex-1">
                            <KatexRenderer className="text-gray-700">
                              {option}
                            </KatexRenderer>
                          </div>
                          {(isCorrect || isStudentAnswer) && (
                            <Badge 
                              className={
                                isCorrect 
                                  ? 'bg-green-600 text-white' 
                                  : 'bg-red-600 text-white'
                              }
                            >
                              {isCorrect && isStudentAnswer
                                ? 'Your Answer ✓'
                                : isCorrect
                                ? 'Correct'
                                : 'Your Answer'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {!question.studentAnswer && (
                    <div className="p-4 rounded-lg border-2 border-gray-400 bg-gray-100">
                      <p className="text-center text-gray-600 font-semibold">
                        You did not answer this question
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Button */}
        <div className="mt-8 flex justify-center">
          <Button 
            onClick={handleBackNavigation} 
            size="lg"
            className="min-w-[200px]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default ViewTestAnswers;
