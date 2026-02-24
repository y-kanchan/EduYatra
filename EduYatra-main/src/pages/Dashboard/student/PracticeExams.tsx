import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Award, Play, RotateCcw, Info } from "lucide-react";
import { TestInstructionsModal } from "@/components/students/TestInstructionsModal";

interface Exam {
  title: string;
  subject: string;
  duration: string;
  questions: number;
  difficulty: string;
  attempts: number;
  bestScore: number | null;
  lastAttempt: string | null;
}

interface SelectedExam {
  name: string;
  duration: string;
  totalQuestions: number;
  maxMarks: number;
}

const PracticeExams: React.FC = () => {
  const navigate = useNavigate();
  const [isExamStarting, setIsExamStarting] = useState<boolean>(false);
  const [selectedExam, setSelectedExam] = useState<SelectedExam | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const exams: Exam[] = [
    {
      title: "Mathematics Mock Test 1",
      subject: "Mathematics",
      duration: "180 min",
      questions: 50,
      difficulty: "Medium",
      attempts: 2,
      bestScore: 87,
      lastAttempt: "3 days ago"
    },
    {
      title: "Physics Final Practice",
      subject: "Physics",
      duration: "150 min",
      questions: 40,
      difficulty: "Hard",
      attempts: 1,
      bestScore: 76,
      lastAttempt: "1 week ago"
    },
    {
      title: "Chemistry Quick Test",
      subject: "Chemistry",
      duration: "60 min",
      questions: 25,
      difficulty: "Easy",
      attempts: 3,
      bestScore: 94,
      lastAttempt: "2 days ago"
    },
    {
      title: "Biology Comprehensive",
      subject: "Biology",
      duration: "120 min",
      questions: 35,
      difficulty: "Medium",
      attempts: 0,
      bestScore: null,
      lastAttempt: null
    },
    {
      title: "Mixed Science Test",
      subject: "Science",
      duration: "90 min",
      questions: 30,
      difficulty: "Medium",
      attempts: 1,
      bestScore: 82,
      lastAttempt: "5 days ago"
    },
    {
      title: "Advanced Mathematics",
      subject: "Mathematics",
      duration: "200 min",
      questions: 60,
      difficulty: "Hard",
      attempts: 0,
      bestScore: null,
      lastAttempt: null
    },
  ];

  const handleStartPractice = (exam: { title: string; duration: string; questions: number }) => {
    setSelectedExam({
      name: exam.title,
      duration: exam.duration.split(' ')[0], // Extract just the number
      totalQuestions: exam.questions,
      maxMarks: 100
    });
    setIsExamStarting(true);
  };

  const handleExamStart = () => {
    if (selectedExam) {
      navigate('/test', {
        state: {
          testName: selectedExam.name,
          totalQuestions: selectedExam.totalQuestions,
          duration: selectedExam.duration,
          maxMarks: selectedExam.maxMarks,
          redirectPath: '/student/practice'
        }
      });
    }
  };

  const toggleDetails = (title: string) => {
    setShowDetails(showDetails === title ? null : title);
  };

  return (
    <Layout>
      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">
              Practice Exams
            </h1>
            <p className="text-gray-500 mt-2">Test your knowledge with practice examinations</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          {[
            { title: "Exams Available", value: "24", icon: Award },
            { title: "Completed", value: "12", icon: Award },
            { title: "Best Score", value: "94%", icon: Award },
            { title: "Total Time", value: "18h", icon: Clock },
          ].map((stat, index) => (
            <Card key={stat.title} className="border border-gray-200 shadow-md animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="p-6 text-center">
                <stat.icon className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                <p className="text-sm text-gray-500">{stat.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Available Practice Exams */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam, index) => (
            <div key={exam.title}>
              <Card className="border border-gray-200 shadow-md animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg text-gray-800">{exam.title}</CardTitle>
                    <Badge variant={exam.difficulty === 'Hard' ? 'destructive' : exam.difficulty === 'Medium' ? 'default' : 'secondary'} className={exam.difficulty === 'Hard' ? 'bg-red-500' : exam.difficulty === 'Medium' ? 'bg-blue-500' : 'bg-gray-500'}>
                      {exam.difficulty}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="border-gray-300 text-gray-700">{exam.subject}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{exam.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-gray-500" />
                        <span>{exam.questions} Questions</span>
                      </div>
                    </div>
                    
                    {exam.attempts > 0 && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between text-sm text-gray-700">
                          <span>Best Score:</span>
                          <span className="font-bold text-blue-500">{exam.bestScore}%</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-700">
                          <span>Attempts:</span>
                          <span>{exam.attempts}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-700">
                          <span>Last Attempt:</span>
                          <span className="text-gray-500">{exam.lastAttempt}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        variant="default" 
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
                        onClick={() => handleStartPractice({
                          title: exam.title,
                          duration: exam.duration,
                          questions: exam.questions
                        })}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        {exam.attempts > 0 ? 'Retake' : 'Start'}
                      </Button>
                      {exam.attempts > 0 && (
                        <Button 
                          variant="outline" 
                          className="border-blue-500 text-blue-500 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        className="border-blue-500 text-blue-500 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
                        onClick={() => toggleDetails(exam.title)}
                      >
                        <Info className="h-4 w-4 mr-1" />
                        {showDetails === exam.title ? 'Hide Details' : 'Details'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {showDetails === exam.title && (
                <Card className="mt-4 border border-gray-200 shadow-md animate-fade-in">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-800">Exam Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-gray-700">
                      <p><strong>Title:</strong> {exam.title}</p>
                      <p><strong>Subject:</strong> {exam.subject}</p>
                      <p><strong>Duration:</strong> {exam.duration}</p>
                      <p><strong>Total Questions:</strong> {exam.questions}</p>
                      <p><strong>Difficulty:</strong> {exam.difficulty}</p>
                      <p><strong>Attempts:</strong> {exam.attempts}</p>
                      {exam.bestScore !== null && <p><strong>Best Score:</strong> {exam.bestScore}%</p>}
                      {exam.lastAttempt && <p><strong>Last Attempt:</strong> {exam.lastAttempt}</p>}
                    </div>
                    <Button
                      className="mt-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
                      onClick={() => toggleDetails(exam.title)}
                    >
                      Close
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          ))}
        </div>

        {/* Recent Results */}
        <Card className="border border-gray-200 shadow-md animate-fade-in">
          <CardHeader>
            <CardTitle className="text-gray-800">Recent Practice Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { exam: "Chemistry Quick Test", score: 94, date: "Dec 8, 2024", time: "58 min" },
                { exam: "Mathematics Mock Test 1", score: 87, date: "Dec 7, 2024", time: "165 min" },
                { exam: "Mixed Science Test", score: 82, date: "Dec 5, 2024", time: "85 min" },
                { exam: "Physics Final Practice", score: 76, date: "Dec 3, 2024", time: "142 min" },
              ].map((result, index) => (
                <div key={result.exam} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <div>
                    <p className="font-medium text-gray-800">{result.exam}</p>
                    <p className="text-sm text-gray-500">{result.date} • Completed in {result.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-500">{result.score}%</p>
                    <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600">View Details</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedExam && (
        <TestInstructionsModal
          isOpen={isExamStarting}
          onClose={() => {
            setIsExamStarting(false);
            setSelectedExam(null);
          }}
          onStartTest={handleExamStart}
          testName={selectedExam.name}
          duration={selectedExam.duration}
          totalQuestions={selectedExam.totalQuestions}
          maxMarks={selectedExam.maxMarks}
        />
      )}
    </Layout>
  );
};

export default PracticeExams;