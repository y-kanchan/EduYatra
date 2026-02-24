import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Lock } from "lucide-react";
import { KatexRenderer } from '@/lib/katex-rendering';
import 'katex/dist/katex.min.css';
import { API_URL } from "@/config/api";

// Utility function for shuffling an array (Fisher-Yates algorithm)
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Utility function for authenticated API calls
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
        throw new Error(`HTTP ${response.status}: Non-JSON response received`);
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

interface Question {
  id: string;
  text: string; // latex_code
  options: string[]; // correct_option_latex + incorrect_option_latex
  correctAnswer: string; // correct_option_latex
  subject: string;
  difficulty_rating: number;
}

interface TestState {
  examId?: string;
  testName?: string;
  totalQuestions?: number;
  duration?: string;
  maxMarks?: number;
  redirectPath?: string;
}

const TestPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { examId, testName, totalQuestions, duration = '60', maxMarks, redirectPath = '/student/practice' } = location.state as TestState || {};
  
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [warningCount, setWarningCount] = useState<number>(0);
  const [isTestActive, setIsTestActive] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState<number>(parseInt(duration) * 60);
  const [initialTime] = useState<number>(parseInt(duration) * 60);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [isDevToolsOpen, setIsDevToolsOpen] = useState<boolean>(false);
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string>('');
  const [showSecurityNotice, setShowSecurityNotice] = useState<boolean>(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [fullscreenExitCount, setFullscreenExitCount] = useState<number>(0);
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);

  // Default questions as fallback
  const defaultQuestions: Question[] = [
    {
      id: '1',
      text: "What is the capital of France?",
      options: ["Paris", "London", "Berlin", "Madrid"],
      correctAnswer: "Paris",
      subject: "Geography",
      difficulty_rating: 1,
    },
    {
      id: '2',
      text: "What is \\(2 + 2\\)?",
      options: ["3", "4", "5", "6"],
      correctAnswer: "4",
      subject: "Math",
      difficulty_rating: 1,
    },
  ];

  // Fetch questions from backend and shuffle options
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!examId) {
        console.error('No examId provided in location.state');
        setError('No exam ID provided. Using default questions.');
        setQuestions(defaultQuestions.map(q => ({
          ...q,
          options: shuffleArray(q.options),
        })));
        setIsLoadingQuestions(false);
        return;
      }
      setIsLoadingQuestions(true);
      try {
        const response = await fetchWithAuth(`${API_URL}/exams/${examId}/questions`, {
          method: 'GET',
        });
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch questions');
        }
        if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
          throw new Error('No questions returned for this exam');
        }
        // Shuffle options for each question
        const shuffledQuestions = data.questions.map((q: Question) => ({
          ...q,
          options: shuffleArray(q.options),
        }));
        setQuestions(shuffledQuestions);
        setError(null);
        console.log('Questions fetched successfully with shuffled options:', shuffledQuestions);
      } catch (err: any) {
        console.error('Error fetching questions:', err);
        setError('Failed to load questions from the server. Using default questions.');
        setQuestions(defaultQuestions.map(q => ({
          ...q,
          options: shuffleArray(q.options),
        })));
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, [examId]);

  // Fullscreen and DevTools detection
  useEffect(() => {
    const requestFullScreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          setIsFullScreen(true);
        } else {
          console.warn("Fullscreen API is not supported in this browser.");
          setWarningMessage("Your browser does not support fullscreen mode. Please use a modern browser.");
          setShowWarning(true);
        }
      } catch (err) {
        console.error("Failed to enter fullscreen:", err);
        setWarningMessage("Unable to enter fullscreen mode. Please ensure your browser allows fullscreen.");
        setShowWarning(true);
      }
    };

    const handleFullScreenChange = () => {
      const isCurrentlyFullScreen = document.fullscreenElement !== null;
      setIsFullScreen(isCurrentlyFullScreen);
      if (!isCurrentlyFullScreen && isTestActive) {
        setFullscreenExitCount(prev => prev + 1);
        setWarningMessage("Fullscreen mode is required! Please enable fullscreen to continue the test.");
        setShowWarning(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && isTestActive) {
        setTabSwitchCount(prev => prev + 1);
        setWarningCount(prev => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            setIsTestActive(false);
            setWarningMessage("Test terminated due to multiple tab switches!");
            setShowWarning(true);
            handleSubmit("Terminated due to tab switching");
            return prev;
          }
          setWarningMessage(`Warning ${newCount}/3: Do not switch tabs! Your screen is being recorded.`);
          setShowWarning(true);
          return newCount;
        });
      }
    };

    const handleContextMenu = (e: Event) => {
      e.preventDefault();
      setWarningMessage("Right-click is disabled during the test!");
      setShowWarning(true);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'J'))
      ) {
        e.preventDefault();
        setIsDevToolsOpen(true);
        setIsTestActive(false);
        setWarningMessage("Test terminated: Developer tools detected!");
        setShowWarning(true);
        handleSubmit("Terminated due to developer tools detection");
      }
      if (e.ctrlKey || e.altKey) {
        e.preventDefault();
        setWarningMessage("Keyboard shortcuts are disabled during the test!");
        setShowWarning(true);
      }
    };

    const detectDevTools = () => {
      const threshold = 100;
      const width = window.outerWidth - window.innerWidth;
      const height = window.outerHeight - window.innerHeight;
      if ((width > threshold || height > threshold) && isTestActive) {
        setIsDevToolsOpen(true);
        setIsTestActive(false);
        setWarningMessage("Test terminated: Developer tools detected!");
        setShowWarning(true);
        handleSubmit("Terminated due to developer tools detection");
      }
    };

    requestFullScreen();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    window.addEventListener('resize', detectDevTools);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      window.removeEventListener('resize', detectDevTools);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.error("Failed to exit fullscreen:", err));
      }
    };
  }, [isTestActive]);

  // Timer implementation
  useEffect(() => {
    if (!isTestActive || !isFullScreen) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          setIsTestActive(false);
          setWarningMessage("Time's up! Test submitted automatically.");
          setShowWarning(true);
          handleSubmit("Time expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTestActive, isFullScreen]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async (reason: string = "Manual submission") => {
    // Stop the test timer/guards
    setIsTestActive(false);

    // Calculate score
    let calculatedScore = 0;
    if (questions && questions.length > 0) {
      questions.forEach(q => {
        if (answers[q.id] === q.correctAnswer) {
          calculatedScore += (maxMarks || 100) / questions.length;
        }
      });
    }
    // Ensure score is set so the submitted UI renders
    setScore(calculatedScore);

    // Compute time spent
    const timeSpentSeconds = Math.max(0, initialTime - timeLeft);

    try {
      // Use the same auth helper and HTTPS base as other requests
      // IMPORTANT: The correct endpoint is /api/exams/submit-test (note the /exams prefix)
      const response = await fetchWithAuth(`${API_URL}/exams/submit-test`, {
        method: 'POST',
        body: JSON.stringify({
          examId,
          testName,
          answers,
          score: calculatedScore,
          reason,
          timeSpentSeconds,
          userId: localStorage.getItem('userId') || 'unknown',
          tabSwitches: tabSwitchCount,
          fullscreenExits: fullscreenExitCount,
        }),
      });
      // fetchWithAuth ensures non-OK responses throw, but parse the body for logging
      const data = await response.json();
      console.log('✅ Test submitted successfully to backend:', data);
      setWarningMessage(`Test submitted! Your score: ${calculatedScore}/${maxMarks || 100}`);
      setShowWarning(true);
    } catch (err) {
      console.error('❌ Error submitting test to backend:', err);
      setWarningMessage(`Test submitted locally! Your score: ${calculatedScore}/${maxMarks || 100}. Failed to save to server.`);
      setShowWarning(true);
    } finally {
      // Exit fullscreen so the post-submit screen doesn't incorrectly show the fullscreen-required notice
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.error('Failed to exit fullscreen after submit:', err));
      }
      setIsFullScreen(false);
    }
  };

  const handleReturn = () => {
    // Navigate to the enrollment/practice page
    navigate(redirectPath, { replace: true });
    // Small delay to ensure backend has committed the changes, then force a full reload
    setTimeout(() => {
      window.location.href = redirectPath;
    }, 500);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Loading state
  if (isLoadingQuestions) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Card className="border border-gray-200 shadow-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-700">Loading questions...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-md w-full shadow-lg border-red-300">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertTitle className="text-lg font-bold text-gray-800">Error</AlertTitle>
          <AlertDescription className="mt-2 text-gray-700">
            {error}
            <div className="mt-4">
              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
                onClick={() => navigate(redirectPath)}
              >
                Return to {redirectPath.includes('practice') ? 'Practice Exams' : 'Enrollment'}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Score display after test submission
  if (!isTestActive && score !== null) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Alert className="max-w-md w-full shadow-lg border-gray-200">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-lg font-bold text-gray-800">Test Submitted</AlertTitle>
          <AlertDescription className="mt-2 text-gray-700">
            {warningMessage}
            <div className="mt-4">
              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
                onClick={handleReturn}
              >
                Return to {redirectPath.includes('practice') ? 'Practice Exams' : 'Enrollment'}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Prevent rendering if not in fullscreen or test is terminated
  if (!isFullScreen || isDevToolsOpen) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-md w-full shadow-lg border-red-300">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertTitle className="text-lg font-bold text-gray-800">
            {isDevToolsOpen ? "Test Terminated" : "Fullscreen Required"}
          </AlertTitle>
          <AlertDescription className="mt-2 text-gray-700">
            {warningMessage || (
              isDevToolsOpen
                ? "The test was terminated due to developer tools detection."
                : "This test requires fullscreen mode. Please enable fullscreen to start the test."
            )}
            <div className="mt-4 flex flex-col gap-2">
              {!isFullScreen && !isDevToolsOpen && isTestActive && (
                <Button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
                  onClick={async () => {
                    try {
                      await document.documentElement.requestFullscreen();
                      setIsFullScreen(true);
                      setShowWarning(false);
                    } catch (err) {
                      console.error("Failed to enter fullscreen:", err);
                      setWarningMessage("Unable to enter fullscreen mode. Please ensure your browser allows fullscreen.");
                      setShowWarning(true);
                    }
                  }}
                >
                  Enter Fullscreen
                </Button>
              )}
              {(showWarning || isDevToolsOpen) && (
                <Button
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
                  onClick={() => {
                    setShowWarning(false);
                    if (isDevToolsOpen) {
                      navigate(redirectPath);
                      window.location.reload();
                    }
                  }}
                >
                  {isDevToolsOpen ? `Return to ${redirectPath.includes('practice') ? 'Practice Exams' : 'Enrollment'}` : "Acknowledge"}
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Main test page
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-center">
        <Button
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-300 flex items-center gap-2"
          onClick={() => setShowSecurityNotice(!showSecurityNotice)}
        >
          <AlertCircle className="h-5 w-5 text-gray-600" />
          {showSecurityNotice ? "Hide Security Notice" : "Show Security Notice"}
        </Button>
      </div>
      {showSecurityNotice && (
        <div className="max-w-2xl mx-auto bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-md animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Your screen is being recorded. Do not switch tabs, use keyboard shortcuts, or open developer tools. {warningCount}/3 warnings.
            </span>
          </div>
          <Button
            className="mt-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-lg shadow-md transition-all duration-300"
            onClick={() => setShowSecurityNotice(false)}
          >
            Hide
          </Button>
          {showWarning && (
            <div className="mt-4">
              <p className="text-red-500 font-semibold">{warningMessage}</p>
              <Button
                className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded-lg shadow-md transition-all duration-300"
                onClick={() => setShowWarning(false)}
              >
                Acknowledge
              </Button>
            </div>
          )}
        </div>
      )}

      <Card className="border border-gray-200 shadow-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-gray-800">{testName || 'Untitled Test'}</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-red-500" />
                <span className="font-medium text-gray-700">Time Left: {formatTime(timeLeft)}</span>
              </div>
              <span className="font-medium text-gray-700">
                Question {currentQuestion + 1}/{questions.length}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                <KatexRenderer>{questions[currentQuestion]?.text || 'No question available'}</KatexRenderer>
              </h3>
              {questions[currentQuestion]?.options.length > 0 ? (
                <RadioGroup
                  value={answers[questions[currentQuestion]?.id || ''] || ''}
                  onValueChange={(value) => handleAnswerChange(questions[currentQuestion]?.id || '', value)}
                  disabled={!questions[currentQuestion]}
                >
                  {questions[currentQuestion].options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="text-gray-700">
                        <KatexRenderer>{option}</KatexRenderer>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <p className="text-red-500">No options available for this question</p>
              )}
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
                className="border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
              >
                Previous
              </Button>
              <div className="flex gap-2">
                {currentQuestion < questions.length - 1 ? (
                  <Button
                    onClick={handleNextQuestion}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
                    disabled={!questions[currentQuestion]}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSubmit()}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
                    disabled={!questions[currentQuestion]}
                  >
                    Submit Test
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestPage;