import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BookOpen, Clock, Play, CheckCircle, Info } from "lucide-react";
import { TestInstructionsModal } from "@/components/students/TestInstructionsModal";
import { toast } from "sonner";
import { API_URL } from "@/config/api";

// Utility function for authenticated API calls (copied from ConductTestOnline.tsx and TestPage.tsx)
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No authentication token found in localStorage');
    throw new Error('No authentication token found. Please log in.');
  }
  console.log(`Making request to ${url} with token: ${token.substring(0, 10)}...`);
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const contentType = response.headers.get('content-type');
    if (!response.ok) {
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.error(`API request failed: ${url}`, data);
        throw new Error(data.error || `HTTP ${response.status}: Failed to fetch data`);
      } else {
        const text = await response.text();
        console.error(`Non-JSON response from ${url}:`, text.substring(0, 100));
        throw new Error(`HTTP ${response.status}: Non-JSON response received (likely 404 or server error)`);
      }
    }
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error(`Expected JSON but received: ${text.substring(0, 100)}`);
      throw new Error('Invalid response format: Expected JSON');
    }
    return response;
  } catch (error) {
    console.error(`fetchWithAuth error for ${url}:`, error);
    throw error;
  }
};

interface Test {
  examId: string; // Added examId
  name: string;
  duration: string;
  totalQuestions: number;
  maxMarks: number;
  instructions?: string;
}

interface Exam {
  _id: string;
  title: string;
  instructor: string;
  progress: number;
  deadline: string;
  totalQuestions: number;
  completedQuestions: number;
  timeRemaining: string;
  expiringTime?: string;
  expiringHours?: number;
  category: string;
  duration_minutes: number;
  numberOfQuestionsPerSet: number; // Added for consistency
  instructions?: string;
}

interface AttendedTest {
  _id?: string;
  examId?: string;
  test: string;
  score: number;
  date: string;
  instructor: string;
  grade: string;
  totalQuestions: number;
  correctAnswers?: number;
  timeSpent: string;
  submittedAt?: Date;
}

const Enrollment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isTestStarting, setIsTestStarting] = useState<boolean>(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [showAttendedDetails, setShowAttendedDetails] = useState<string | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [attendedTests, setAttendedTests] = useState<AttendedTest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingAttended, setLoadingAttended] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Fetch assigned (ongoing) exams
  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      try {
        // Add cache-busting timestamp to force fresh data
        const timestamp = new Date().getTime();
        const response = await fetchWithAuth(`${API_URL}/exams/assigned?_t=${timestamp}`);
        const data = await response.json();
        console.log('Assigned exams response:', data);

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch exams');
        }

        if (!data.success || !data.exams) {
          throw new Error('Invalid response format');
        }

        if (data.exams.length === 0) {
          console.warn('No exams found for the student');
          toast("No exams are assigned to your classes yet.", {
            description: "Please check back later or contact your instructor.",
          });
        } else {
          console.log('Exams fetched successfully:', data.exams);
        }

        // Map backend exams to Exam interface
        const mappedExams = data.exams.map((exam: {
          _id: string;
          title?: string;
          instructor?: string;
          progress?: number;
          deadline?: string;
          number_of_questions_per_set?: number;
          totalQuestions?: number;
          completedQuestions?: number;
          timeRemaining?: string;
          expiringTime?: string;
          expiringHours?: number;
          category?: string;
          duration_minutes?: number;
          instructions?: string;
        }) => ({
          _id: exam._id,
          title: exam.title || 'Untitled Exam',
          instructor: exam.instructor || 'Unknown',
          progress: exam.progress || 0,
          deadline: exam.deadline || 'Unknown',
          totalQuestions: exam.number_of_questions_per_set || exam.totalQuestions || 0,
          completedQuestions: exam.completedQuestions || 0,
          timeRemaining: exam.timeRemaining || 'Unknown',
          expiringTime: exam.expiringTime || 'Unknown',
          expiringHours: exam.expiringHours || 1,
          category: exam.category || 'Unknown',
          duration_minutes: exam.duration_minutes || 60,
          numberOfQuestionsPerSet: exam.number_of_questions_per_set || exam.totalQuestions || 0,
          instructions: exam.instructions || '',
        }));
        setExams(mappedExams);
      } catch (error) {
        console.error('Fetch exams error:', error);
        toast.error(`Failed to load exams: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setExams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [navigate, location.key, refreshKey]); // Refetch when location key changes (navigation) or manual refresh

  // Fetch attended tests
  useEffect(() => {
    const fetchAttendedTests = async () => {
      setLoadingAttended(true);
      try {
        console.log('🔍 Fetching attended tests from backend...');
        // Add cache-busting timestamp to force fresh data
        const timestamp = new Date().getTime();
        const response = await fetchWithAuth(`${API_URL}/exams/attended-tests?_t=${timestamp}`);
        const data = await response.json();
        console.log('📥 Attended tests RAW response:', data);
        console.log('📊 Response status:', response.status, response.ok);

        if (!response.ok) {
          console.error('❌ Response not OK:', data);
          throw new Error(data.error || 'Failed to fetch attended tests');
        }

        if (data.success && data.attendedTests) {
          console.log('✅ Setting attended tests:', data.attendedTests);
          console.log('📈 Number of attended tests:', data.attendedTests.length);
          // Log the first test's release status for debugging
          if (data.attendedTests.length > 0) {
            console.log('🔍 First test release status:', {
              test: data.attendedTests[0].test,
              scoreReleased: data.attendedTests[0].scoreReleased,
              answersReleased: data.attendedTests[0].answersReleased,
              score: data.attendedTests[0].score
            });
          }
          setAttendedTests(data.attendedTests);
        } else {
          console.warn('⚠️ No attended tests in response or success=false');
          setAttendedTests([]);
        }
      } catch (error) {
        console.error('❌ Fetch attended tests error:', error);
        console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
        // Show error toast to help debug
        toast.error(`Failed to load attended tests: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setAttendedTests([]);
      } finally {
        setLoadingAttended(false);
        console.log('🏁 Attended tests loading finished');
      }
    };

    fetchAttendedTests();
  }, [location.key, refreshKey]); // Refetch when location key changes or manual refresh

  const handleContinueTest = (test: Pick<Exam, '_id' | 'title' | 'numberOfQuestionsPerSet' | 'duration_minutes' | 'instructions'>) => {
    console.log('handleContinueTest called with test:', test); // Debug log
    setSelectedTest({
      examId: test._id,
      name: test.title,
      duration: test.duration_minutes.toString(),
      totalQuestions: test.numberOfQuestionsPerSet,
      maxMarks: test.numberOfQuestionsPerSet * 1, // Adjust marks per question as needed
      instructions: test.instructions,
    });
    setIsTestStarting(true);
  };

  const handleTestStart = () => {
    if (selectedTest) {
      console.log('Navigating to /test with state:', selectedTest); // Debug log
      navigate('/test', {
        state: {
          examId: selectedTest.examId,
          testName: selectedTest.name,
          totalQuestions: selectedTest.totalQuestions,
          duration: selectedTest.duration,
          maxMarks: selectedTest.maxMarks,
          redirectPath: '/student/enrollment'
        }
      });
      setIsTestStarting(false);
      setSelectedTest(null);
    } else {
      console.error('No selectedTest found in handleTestStart');
      toast.error('Failed to start test: No test selected');
    }
  };

  const toggleDetails = (id: string) => {
    setShowDetails(showDetails === id ? null : id);
  };

  const toggleAttendedDetails = (test: string) => {
    setShowAttendedDetails(showAttendedDetails === test ? null : test);
  };

  return (
    <Layout>
      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">
              Enrollment
            </h1>
            <p className="text-gray-500 mt-2">Manage your ongoing and completed enrollments</p>
          </div>
        </div>

        <Card className="border border-gray-200 shadow-md animate-fade-in">
          <CardContent className="p-6">
            <Tabs defaultValue="ongoing" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                <TabsTrigger value="ongoing">Ongoing Tests</TabsTrigger>
                <TabsTrigger value="attended">Attended Tests</TabsTrigger>
              </TabsList>
              
              <TabsContent value="ongoing" className="space-y-6 mt-6">
                {loading ? (
                  <p className="text-sm text-gray-500">Loading exams...</p>
                ) : exams.length === 0 ? (
                  <p className="text-sm text-destructive">No exams assigned to your classes.</p>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {exams.map((test, index) => (
                      <div key={test._id}>
                        <Card className="border border-gray-200 transition-all duration-200 hover:shadow-lg animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                          <CardHeader>
                            <CardTitle className="text-lg text-gray-800">{test.title}</CardTitle>
                            <p className="text-sm text-gray-500">by {test.instructor}</p>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-medium text-gray-700">Progress</span>
                                  <span className="text-sm text-gray-500">{test.completedQuestions}/{test.numberOfQuestionsPerSet} questions</span>
                                </div>
                                <Progress value={test.progress} className="h-3" />
                                <p className="text-xs text-gray-500 mt-1">{test.progress}% complete</p>
                              </div>
                              
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="h-4 w-4 text-blue-500" />
                                  <span className="font-medium text-gray-700">Time Remaining:</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{test.timeRemaining}</p>
                              </div>

                              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="h-4 w-4 text-orange-500" />
                                  <span className="font-medium text-orange-700">Expires In:</span>
                                </div>
                                <p className="text-sm text-orange-600 mt-1 font-semibold">{test.expiringTime || 'Unknown'}</p>
                                <p className="text-xs text-gray-500 mt-0.5">Test will be unavailable after this time</p>
                              </div>

                              <div className="flex gap-2">
                                <Button 
                                  variant="default" 
                                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
                                  onClick={() => handleContinueTest({
                                    _id: test._id,
                                    title: test.title,
                                    numberOfQuestionsPerSet: test.numberOfQuestionsPerSet,
                                    duration_minutes: test.duration_minutes
                                  })}
                                  disabled={test.deadline === 'Expired'}
                                >
                                  <Play className="h-4 w-4 mr-1" />
                                  Continue
                                </Button>
                                <Button 
                                  variant="outline" 
                                  className="border-blue-500 text-blue-500 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
                                  onClick={() => toggleDetails(test._id)}
                                >
                                  <Info className="h-4 w-4 mr-1" />
                                  {showDetails === test._id ? 'Hide Details' : 'Details'}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        {showDetails === test._id && (
                          <Card className="mt-4 border border-gray-200 shadow-md animate-fade-in">
                            <CardHeader>
                              <CardTitle className="text-lg text-gray-800">Exam Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2 text-gray-700">
                                <p><strong>Title:</strong> {test.title}</p>
                                <p><strong>Instructor:</strong> {test.instructor}</p>
                                <p><strong>Category:</strong> {test.category}</p>
                                <p><strong>Total Questions:</strong> {test.numberOfQuestionsPerSet}</p>
                                <p><strong>Completed Questions:</strong> {test.completedQuestions}</p>
                                <p><strong>Progress:</strong> {test.progress}%</p>
                                <p><strong>Duration:</strong> {test.duration_minutes} minutes</p>
                                <p><strong>Deadline:</strong> {test.deadline}</p>
                                <p><strong>Time Remaining:</strong> {test.timeRemaining}</p>
                                <p className="text-orange-600"><strong>Expires In:</strong> {test.expiringTime || 'Unknown'}</p>
                              </div>
                              <Button
                                className="mt-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
                                onClick={() => toggleDetails(test._id)}
                              >
                                Close
                              </Button>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="attended" className="space-y-6 mt-6">
                {loadingAttended ? (
                  <p className="text-sm text-gray-500">Loading attended tests...</p>
                ) : attendedTests.length === 0 ? (
                  <p className="text-sm text-gray-500">No tests attended yet.</p>
                ) : (
                  <>
                    <div className="space-y-4">
                      {attendedTests.map((result, index) => (
                        <div key={result._id || result.test}>
                          <Card className="border border-gray-200 transition-all duration-200 hover:shadow-lg animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                            <CardContent className="p-4 sm:p-6">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                <div className="space-y-2 flex-1">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                    <h3 className="font-medium text-gray-800 break-words">{result.test}</h3>
                                  </div>
                                  <p className="text-sm text-gray-500">by {result.instructor}</p>
                                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                                    <span>{result.date}</span>
                                    <span>•</span>
                                    <span>{result.totalQuestions} questions</span>
                                    <span>•</span>
                                    <span className="break-words">Completed in {result.timeSpent}</span>
                                  </div>
                                </div>
                                <div className="flex flex-col sm:text-right space-y-3">
                                  {result.scoreReleased === true ? (
                                    <>
                                      <div className="text-2xl font-bold text-blue-500">{result.score}%</div>
                                      <Badge variant={result.score >= 90 ? 'default' : 'secondary'} className={`${result.score >= 90 ? 'bg-blue-500' : 'bg-gray-500'} w-fit`}>
                                        Grade: {result.grade}
                                      </Badge>
                                    </>
                                  ) : (
                                    <div className="flex items-center gap-2 text-amber-600">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                      </svg>
                                      <span className="text-sm font-semibold">Score Pending</span>
                                    </div>
                                  )}
                                  <div className="flex flex-col sm:flex-row gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="border-blue-500 text-blue-500 hover:bg-blue-50 font-semibold py-2 px-3 rounded-lg shadow-md transition-all duration-300 whitespace-nowrap"
                                      onClick={() => toggleAttendedDetails(result._id || result.test)}
                                    >
                                      <Info className="h-4 w-4 mr-1" />
                                      {showAttendedDetails === (result._id || result.test) ? 'Hide Details' : 'View Details'}
                                    </Button>
                                    <Button 
                                      variant="default" 
                                      size="sm" 
                                      className={`${result.answersReleased === true ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'} text-white font-semibold py-2 px-3 rounded-lg shadow-md transition-all duration-300 whitespace-nowrap`}
                                      onClick={() => result.answersReleased === true && navigate(`/student/test-answers/${result._id}`)}
                                      disabled={result.answersReleased !== true}
                                    >
                                      <BookOpen className="h-4 w-4 mr-1" />
                                      {result.answersReleased === true ? 'View Answers' : '🔒 Answers Locked'}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          {showAttendedDetails === (result._id || result.test) && (
                            <Card className="mt-4 border border-gray-200 shadow-md animate-fade-in">
                              <CardHeader>
                                <CardTitle className="text-lg text-gray-800">Test Details</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2 text-gray-700">
                                  <p><strong>Test Name:</strong> {result.test}</p>
                                  <p><strong>Instructor:</strong> {result.instructor}</p>
                                  {result.scoreReleased === true ? (
                                    <>
                                      <p><strong>Score:</strong> {result.score}%</p>
                                      <p><strong>Grade:</strong> {result.grade}</p>
                                    </>
                                  ) : (
                                    <p className="text-amber-600 font-semibold">🔒 Score not yet released by instructor</p>
                                  )}
                                  <p><strong>Date:</strong> {result.date}</p>
                                  <p><strong>Total Questions:</strong> {result.totalQuestions}</p>
                                  {result.correctAnswers !== undefined && (
                                    <p><strong>Correct Answers:</strong> {result.correctAnswers}/{result.totalQuestions}</p>
                                  )}
                                  <p><strong>Time Spent:</strong> {result.timeSpent}</p>
                                </div>
                                <Button
                                  className="mt-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
                                  onClick={() => toggleAttendedDetails(result._id || result.test)}
                                >
                                  Close
                                </Button>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      ))}
                    </div>

                    <Card className="border border-gray-200 shadow-md">
                      <CardHeader>
                        <CardTitle className="text-gray-800">Attendance Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                          <div className="text-center p-3 bg-gradient-to-br from-background to-accent/10 rounded-lg">
                            <div className="text-xl sm:text-2xl font-bold text-blue-500">{attendedTests.length}</div>
                            <p className="text-xs sm:text-sm text-gray-500">Total Tests</p>
                          </div>
                          <div className="text-center p-3 bg-gradient-to-br from-background to-accent/10 rounded-lg">
                            <div className="text-xl sm:text-2xl font-bold text-green-500">
                              {attendedTests.length > 0 && attendedTests.filter(t => t.scoreReleased === true).length > 0
                                ? (attendedTests.filter(t => t.scoreReleased === true).reduce((sum, t) => sum + t.score, 0) / attendedTests.filter(t => t.scoreReleased === true).length).toFixed(1)
                                : '—'}%
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500">Average Score</p>
                          </div>
                          <div className="text-center p-3 bg-gradient-to-br from-background to-accent/10 rounded-lg">
                            <div className="text-xl sm:text-2xl font-bold text-blue-500">
                              {attendedTests.length > 0 && attendedTests.filter(t => t.scoreReleased === true).length > 0
                                ? Math.max(...attendedTests.filter(t => t.scoreReleased === true).map(t => t.score))
                                : '—'}%
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500">Best Score</p>
                          </div>
                          <div className="text-center p-3 bg-gradient-to-br from-background to-accent/10 rounded-lg">
                            <div className="text-xl sm:text-2xl font-bold text-gray-500">
                              {attendedTests.length > 0 
                                ? attendedTests.reduce((sum, t) => {
                                    const time = t.timeSpent.match(/(\d+)/g);
                                    if (!time) return sum;
                                    if (t.timeSpent.includes('h')) {
                                      return sum + parseInt(time[0]) * 60 + (time[1] ? parseInt(time[1]) : 0);
                                    }
                                    return sum + parseInt(time[0]);
                                  }, 0)
                                : 0} min
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500">Total Time</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {selectedTest && (
        <TestInstructionsModal
          isOpen={isTestStarting}
          onClose={() => {
            console.log('TestInstructionsModal closed'); // Debug log
            setIsTestStarting(false);
            setSelectedTest(null);
          }}
          onStartTest={() => {
            console.log('TestInstructionsModal onStartTest triggered'); // Debug log
            handleTestStart();
          }}
          testName={selectedTest.name}
          duration={selectedTest.duration}
          totalQuestions={selectedTest.totalQuestions}
          maxMarks={selectedTest.maxMarks}
          instructions={selectedTest.instructions}
        />
      )}
    </Layout>
  );
};

export default Enrollment;