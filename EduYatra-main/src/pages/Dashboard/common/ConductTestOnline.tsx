import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, Clock, Check, X, Settings, Users, Calendar, Save, Eye, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast, Toaster } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { KatexRenderer } from '@/lib/katex-rendering';
import 'katex/dist/katex.min.css';
import { API_URL } from "@/config/api";

// Shuffle array using Fisher-Yates algorithm with seed
const shuffleArray = <T,>(array: T[], seed: number): T[] => {
  const shuffled = [...array];
  let currentIndex = shuffled.length;
  let temporaryValue: T, randomIndex: number;
  
  // Seeded random function
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
  
  while (currentIndex !== 0) {
    randomIndex = Math.floor(seededRandom(seed++) * currentIndex);
    currentIndex -= 1;
    temporaryValue = shuffled[currentIndex];
    shuffled[currentIndex] = shuffled[randomIndex];
    shuffled[randomIndex] = temporaryValue;
  }
  
  return shuffled;
};

// Utility function for authenticated API calls with enhanced error handling
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

// Form validation schemas
const testFormSchema = z.object({
  testName: z.string().min(3, 'Test name must be at least 3 characters'),
  duration: z.coerce.number().min(5, 'Minimum 5 minutes').max(240, 'Maximum 240 minutes'),
  numberOfSets: z.coerce.number().min(1, 'At least 1 set required'),
  numberOfQuestionsPerSet: z.coerce.number().min(1, 'At least 1 question per set'),
  instructions: z.string().optional(),
  shuffleQuestions: z.boolean().optional(),
  shuffleOptions: z.boolean().optional(),
});

const editExamSchema = z.object({
  testName: z.string().min(3, 'Test name must be at least 3 characters'),
  duration: z.coerce.number().min(5, 'Minimum 5 minutes').max(240, 'Maximum 240 minutes'),
  numberOfSets: z.coerce.number().min(1, 'At least 1 set required'),
  numberOfQuestionsPerSet: z.coerce.number().min(1, 'At least 1 question per set'),
  instructions: z.string().optional(),
  shuffleQuestions: z.boolean().optional(),
  shuffleOptions: z.boolean().optional(),
});

type TestFormValues = z.infer<typeof testFormSchema>;
type EditExamFormValues = z.infer<typeof editExamSchema>;

interface Question {
  id: string;
  text: string;
  type: string;
  marks: number;
}

interface QuestionBank {
  id: string;
  name: string;
}

interface Group {
  id: string;
  name: string;
}

interface Exam {
  id: string;
  title: string;
  status: 'Draft' | 'Scheduled' | 'Live' | 'Completed';
  duration: number;
  numberOfSets: number;
  numberOfQuestionsPerSet: number;
  instructions?: string;
  questionIds: string[];
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  isPublished?: boolean; // Track if exam is assigned to a group
  isEnded?: boolean; // Track if exam has ended
  endTime?: string; // Track when exam ends
}

interface SecuritySettings {
  disableTabSwitching: boolean;
  disableRightClick: boolean;
  enableScreenSharing: boolean;
  enableProctoring: boolean;
  enableWebcam: boolean;
  restrictIP: boolean;
}

interface ExamSchedule {
  startTime: string;
  endTime: string;
}

const ConductTestOnline: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const examRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    disableTabSwitching: true,
    disableRightClick: true,
    enableScreenSharing: false,
    enableProctoring: false,
    enableWebcam: false,
    restrictIP: false,
  });
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [schedule, setSchedule] = useState<ExamSchedule>({ startTime: '', endTime: '' });
  const [timeLimit, setTimeLimit] = useState('60');
  const [customTimeLimit, setCustomTimeLimit] = useState('');
  const [expiringHours, setExpiringHours] = useState('1');
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isManageExamOpen, setIsManageExamOpen] = useState(true);
  const [showQuestionSets, setShowQuestionSets] = useState(false);
  const [questionBankId, setQuestionBankId] = useState('');
  const manageExamRef = useRef<HTMLDivElement>(null);
  const previewQuestionPaperRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, formState: { errors }, watch, reset, setValue } = useForm<TestFormValues>({
    resolver: zodResolver(testFormSchema),
    defaultValues: {
      testName: '',
      duration: 60,
      numberOfSets: 1,
      numberOfQuestionsPerSet: 1,
      instructions: '',
      shuffleQuestions: true,
      shuffleOptions: true,
    },
  });

  const { register: registerEdit, handleSubmit: handleEditSubmit, formState: { errors: editErrors }, reset: resetEdit, watch: watchEdit, setValue: setValueEdit } = useForm<EditExamFormValues>({
    resolver: zodResolver(editExamSchema),
    defaultValues: {
      testName: '',
      duration: 60,
      numberOfSets: 1,
      numberOfQuestionsPerSet: 1,
      instructions: '',
      shuffleQuestions: true,
      shuffleOptions: true,
    },
  });

  const numberOfQuestionsPerSet = watch('numberOfQuestionsPerSet');

  // Check authentication and redirect if no token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to continue');
      navigate('/signin');
    }
  }, [navigate]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoadingBanks(true);
      try {
        const [banksRes, groupsRes, examsRes] = await Promise.all([
          fetchWithAuth(`${API_URL}/exams/question-banks`),
          fetchWithAuth(`${API_URL}/exams/groups`),
          fetchWithAuth(`${API_URL}/exams/all`),
        ]);

        const [banksData, groupsData, examsData] = await Promise.all([
          banksRes.json(),
          groupsRes.json(),
          examsRes.json(),
        ]);

        console.log('Question Banks Response:', banksData);
        if (!banksRes.ok) throw new Error(banksData.error || 'Failed to fetch question banks');
        setQuestionBanks(
          (banksData.success ? banksData.questionBanks : banksData.data?.questionBanks || banksData.question_banks || banksData || []).map(bank => ({
            id: bank._id || bank.id || '',
            name: bank.name || `Unnamed Bank (${bank._id || bank.id || 'unknown'})`
          }))
        );

        console.log('Groups Response:', groupsData);
        if (!groupsRes.ok) throw new Error(groupsData.error || 'Failed to fetch groups');
        const newGroups = (groupsData.success ? groupsData.classes : groupsData.data?.classes || groupsData || []).map(group => ({
          id: group._id || group.id || '',
          name: group.class_name || `Unnamed Group (${group._id || group.id || 'unknown'})`
        }));
        setGroups(newGroups);
        console.log('Parsed Groups:', newGroups);

        if (!examsRes.ok) throw new Error(examsData.error || 'Failed to fetch exams');
        setExams((examsData.success ? examsData.exams : examsData.data?.exams || []).map((e: any) => ({
          id: e._id,
          title: e.title || 'Untitled Exam',
          status: e.status || 'Draft',
          duration: e.duration_minutes || 60,
          numberOfSets: e.number_of_sets || 1,
          numberOfQuestionsPerSet: e.number_of_questions_per_set || 1,
          instructions: e.description || '',
          questionIds: e.question_ids || [],
          isPublished: e.is_published || false, // Track if exam is assigned
          isEnded: e.is_ended || false, // Track if exam has ended
          endTime: e.end_time || '', // Track when exam ends
        })));
      } catch (error) {
        console.error('Fetch Data Error:', error);
        toast.error(`Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setQuestionBanks([]);
        setGroups([]);
        setExams([]);
      } finally {
        setLoadingBanks(false);
      }
    };
    fetchData();
  }, []);

  // Scroll to exam when examId is present in URL
  useEffect(() => {
    const examId = searchParams.get('examId');
    if (examId && exams.length > 0) {
      // Small delay to ensure DOM is rendered
      setTimeout(() => {
        const examElement = examRefs.current[examId];
        if (examElement) {
          examElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          // Add highlight effect
          examElement.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
          // Remove highlight after 3 seconds
          setTimeout(() => {
            examElement.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
          }, 3000);
        }
      }, 300);
    }
  }, [searchParams, exams]);

  // Fetch questions when question bank changes
  useEffect(() => {
    if (!questionBankId) {
      setQuestions([]);
      return;
    }
    const fetchQuestions = async () => {
      setLoadingQuestions(true);
      try {
        const res = await fetchWithAuth(`${API_URL}/exams/questions?questionBankId=${questionBankId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch questions');
        setQuestions(data.questions?.map((q: any) => ({
          id: q._id,
          text: q.latex_code || q.text || 'Untitled Question',
          type: q.question_type || 'MCQ',
          marks: q.difficulty_rating || 1,
        })) || []);
      } catch (error) {
        toast.error(`Failed to fetch questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setQuestions([]);
      } finally {
        setLoadingQuestions(false);
      }
    };
    fetchQuestions();
  }, [questionBankId]);

  // Sync edit form with selected exam AND fetch questions for preview
  useEffect(() => {
    const exam = exams.find(e => e.id === selectedExamId);
    if (exam) {
      resetEdit({
        testName: exam.title,
        duration: exam.duration,
        numberOfSets: exam.numberOfSets,
        numberOfQuestionsPerSet: exam.numberOfQuestionsPerSet,
        instructions: exam.instructions || '',
        shuffleQuestions: exam.shuffleQuestions ?? true,
        shuffleOptions: exam.shuffleOptions ?? true,
      });
      setTimeLimit(exam.duration.toString());
      setCustomTimeLimit('');
      
      // Fetch question details for preview
      const fetchExamQuestions = async () => {
        if (exam.questionIds && exam.questionIds.length > 0) {
          try {
            const res = await fetchWithAuth(`${API_URL}/exams/questions-by-ids`, {
              method: 'POST',
              body: JSON.stringify({ questionIds: exam.questionIds }),
            });
            const data = await res.json();
            if (res.ok && data.questions) {
              setQuestions(data.questions.map((q: any) => ({
                id: q._id,
                text: q.latex_code || 'Untitled Question',
                type: q.question_type || 'MCQ',
                marks: q.difficulty_rating || 1,
              })));
            }
          } catch (error) {
            console.error('Error fetching exam questions:', error);
          }
        }
      };
      
      fetchExamQuestions();
    }
  }, [selectedExamId, exams, resetEdit]);

  // Check for ended exams and mark them automatically
  useEffect(() => {
    const checkEndedExams = () => {
      const now = new Date();
      const updatedExams = exams.map(exam => {
        if (exam.isPublished && exam.endTime && !exam.isEnded) {
          const endTime = new Date(exam.endTime);
          if (now >= endTime) {
            // Mark exam as ended
            console.log(`Exam ${exam.title} has ended, marking as ended...`);
            // Call backend to mark as ended
            fetchWithAuth(`${API_URL}/exams/end-test`, {
              method: 'POST',
              body: JSON.stringify({ examId: exam.id }),
            }).then(res => {
              if (res.ok) {
                console.log(`✅ Exam ${exam.title} marked as ended in backend`);
              }
            }).catch(err => {
              console.error(`Failed to mark exam ${exam.title} as ended:`, err);
            });
            
            return { ...exam, isEnded: true, status: 'Completed' as const };
          }
        }
        return exam;
      });

      // Update state if any exam status changed
      const hasChanges = updatedExams.some((exam, idx) => 
        exam.isEnded !== exams[idx].isEnded
      );
      if (hasChanges) {
        setExams(updatedExams);
      }
    };

    // Check immediately
    checkEndedExams();

    // Check every minute
    const interval = setInterval(checkEndedExams, 60000);

    return () => clearInterval(interval);
  }, [exams]);

  const handleAddToTest = (question: Question) => {
    setSelectedQuestions(prev => prev.some(q => q.id === question.id) ? prev : [...prev, question]);
  };

  const handleRemoveFromTest = (questionId: string) => {
    setSelectedQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const handleSecuritySettingChange = (setting: keyof SecuritySettings) => {
    setSecuritySettings(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  const handleSaveSecuritySettings = async () => {
    if (!selectedExamId) {
      toast.error('Please select an exam');
      return;
    }
    try {
      const res = await fetchWithAuth(`${API_URL}/exams/${selectedExamId}/security`, {
        method: 'PATCH',
        body: JSON.stringify(securitySettings),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save security settings');
      }
      toast.success('Security settings saved');
    } catch (error) {
      toast.error(`Failed to save security settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleAssignGroup = async (examId: string, groupId: string) => {
    if (!examId || !groupId) {
      toast.error('Please select an exam and a group');
      console.error('handleAssignGroup: Missing examId or groupId', { examId, groupId });
      return;
    }
    
    const expiringHoursValue = parseFloat(expiringHours);
    if (isNaN(expiringHoursValue) || expiringHoursValue < 0.5 || expiringHoursValue > 168) {
      toast.error('Expiring time must be between 0.5 and 168 hours');
      return;
    }
    
    try {
      console.log(`Assigning exam ${examId} to group ${groupId} with expiring hours: ${expiringHoursValue}`);
      const res = await fetchWithAuth(`${API_URL}/exams/${examId}/assign-group`, {
        method: 'POST',
        body: JSON.stringify({ 
          groupId,
          expiring_hours: expiringHoursValue 
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('Assign group failed:', data);
        throw new Error(data.error || 'Failed to assign exam');
      }
      toast.success('Exam assigned to class successfully');
      console.log('Assign group success:', data);
      setExams(exams.map(exam =>
        exam.id === examId ? { ...exam, status: 'Scheduled', isPublished: true } : exam
      ));
    } catch (error) {
      toast.error(`Failed to assign exam: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('handleAssignGroup error:', error);
    }
  };

  const handleSaveTimeLimit = async () => {
    if (!selectedExamId) {
      toast.error('Please select an exam');
      return;
    }
    const duration = timeLimit === 'custom' ? parseInt(customTimeLimit) : parseInt(timeLimit);
    if (isNaN(duration) || duration < 5 || duration > 240) {
      toast.error('Time limit must be between 5 and 240 minutes');
      return;
    }
    try {
      const res = await fetchWithAuth(`${API_URL}/exams/${selectedExamId}`, {
        method: 'PATCH',
        body: JSON.stringify({ duration_minutes: duration }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update time limit');
      }
      setExams(exams.map(exam => 
        exam.id === selectedExamId ? { ...exam, duration } : exam
      ));
      toast.success('Time limit updated');
    } catch (error) {
      toast.error(`Failed to update time limit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEditExam = async (data: EditExamFormValues) => {
    if (!selectedExamId) {
      toast.error('Please select an exam to edit');
      return;
    }
    try {
      const res = await fetchWithAuth(`${API_URL}/exams/${selectedExamId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: data.testName,
          duration_minutes: data.duration,
          number_of_sets: data.numberOfSets,
          number_of_questions_per_set: data.numberOfQuestionsPerSet,
          description: data.instructions,
          shuffle_questions: data.shuffleQuestions || false,
          shuffle_options: data.shuffleOptions || false,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update exam');
      }
      setExams(exams.map(exam => 
        exam.id === selectedExamId ? { 
          ...exam, 
          title: data.testName,
          duration: data.duration,
          numberOfSets: data.numberOfSets,
          numberOfQuestionsPerSet: data.numberOfQuestionsPerSet,
          instructions: data.instructions,
        } : exam
      ));
      toast.success('Exam updated successfully');
      setIsEditFormOpen(false);
    } catch (error) {
      toast.error(`Failed to update exam: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleScheduleExam = async () => {
    if (!selectedExamId || !schedule.startTime || !schedule.endTime) {
      toast.error('Please select an exam and provide valid schedule times');
      return;
    }
    try {
      const res = await fetchWithAuth(`${API_URL}/exams/${selectedExamId}/schedule`, {
        method: 'PATCH',
        body: JSON.stringify(schedule),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to schedule exam');
      }
      setExams(exams.map(exam => 
        exam.id === selectedExamId ? { ...exam, status: 'Scheduled' } : exam
      ));
      toast.success('Exam scheduled');
    } catch (error) {
      toast.error(`Failed to schedule exam: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handlePreviewQuestionPaper = () => {
    if (!selectedExamId) {
      toast.error('Please select an exam to preview');
      return;
    }
    setShowQuestionSets(true); // Automatically show question sets when previewing
    toast.success('Question paper preview opened (simulated)');
    console.log('Preview question paper:', { examId: selectedExamId });
  };

  const toggleQuestionSets = () => setShowQuestionSets(!showQuestionSets);
  const toggleManageExam = () => setIsManageExamOpen(!isManageExamOpen);

  const handleSelectExam = (examId: string, action: 'view' | 'manage') => {
    setSelectedExamId(examId);
    setIsManageExamOpen(true);
    if (action === 'view' && previewQuestionPaperRef.current) {
      setShowQuestionSets(true); // Show question sets for view action
      previewQuestionPaperRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (action === 'manage' && manageExamRef.current) {
      manageExamRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await fetchWithAuth(`${API_URL}/exams/${examId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete exam');
      }
      setExams(exams.filter(exam => exam.id !== examId));
      toast.success('Exam deleted successfully');
      if (selectedExamId === examId) {
        setSelectedExamId('');
      }
    } catch (error) {
      toast.error(`Failed to delete exam: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const onSubmit = async (data: TestFormValues) => {
    if (!questionBankId) {
      toast.error('Please select a question bank');
      return;
    }
    if (selectedQuestions.length === 0) {
      toast.error('Please select at least one question');
      return;
    }
    if (selectedQuestions.length < data.numberOfQuestionsPerSet) {
      toast.error(`Please select at least ${data.numberOfQuestionsPerSet} question${data.numberOfQuestionsPerSet > 1 ? 's' : ''}`);
      return;
    }

    const examData = {
      title: data.testName,
      description: data.instructions,
      question_bank_id: questionBankId,
      question_ids: selectedQuestions.map(q => q.id),
      number_of_sets: data.numberOfSets,
      number_of_questions_per_set: data.numberOfQuestionsPerSet,
      duration_minutes: data.duration,
      is_published: false,
      allow_review: true,
      shuffle_questions: data.shuffleQuestions || false,
      shuffle_options: data.shuffleOptions || false,
      security_settings: securitySettings,
    };

    try {
      const res = await fetchWithAuth(`${API_URL}/exams/create`, {
        method: 'POST',
        body: JSON.stringify(examData),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to create exam');
      setExams([...exams, {
        id: result.exam._id,
        title: data.testName,
        status: 'Draft',
        duration: data.duration,
        numberOfSets: data.numberOfSets,
        numberOfQuestionsPerSet: data.numberOfQuestionsPerSet,
        instructions: data.instructions,
        questionIds: selectedQuestions.map(q => q.id),
      }]);
      toast.success('Exam created successfully');
      reset();
      setSelectedQuestions([]);
      setQuestionBankId('');
    } catch (error) {
      toast.error(`Failed to create exam: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Layout>
      <Toaster position="top-center" richColors />
      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Online Test
            </h1>
            <p className="text-muted-foreground mt-2">Create and manage online examinations</p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="glass-effect border-primary/20 animate-scale-in hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Create New Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="testName">Test Name *</Label>
                  <Input
                    id="testName"
                    placeholder="E.g., Mid-term Mathematics"
                    className={cn(errors.testName && 'border-destructive')}
                    {...register('testName')}
                  />
                  {errors.testName && <p className="text-sm text-destructive">{errors.testName.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes) *</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="duration"
                        type="number"
                        placeholder="60"
                        className={cn('pl-10', errors.duration && 'border-destructive')}
                        {...register('duration')}
                      />
                    </div>
                    {errors.duration && <p className="text-sm text-destructive">{errors.duration.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numberOfSets">Number of Sets *</Label>
                    <Input
                      id="numberOfSets"
                      type="number"
                      placeholder="1"
                      className={cn(errors.numberOfSets && 'border-destructive')}
                      {...register('numberOfSets')}
                    />
                    {errors.numberOfSets && <p className="text-sm text-destructive">{errors.numberOfSets.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalQuestions">Total Questions</Label>
                    <Input
                      id="totalQuestions"
                      type="number"
                      value={selectedQuestions.length}
                      disabled
                      className="bg-muted/50"
                    />
                    <p className="text-xs text-muted-foreground">{selectedQuestions.length} questions selected</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numberOfQuestionsPerSet">Questions per Set *</Label>
                    <Input
                      id="numberOfQuestionsPerSet"
                      type="number"
                      placeholder="1"
                      className={cn(errors.numberOfQuestionsPerSet && 'border-destructive')}
                      {...register('numberOfQuestionsPerSet')}
                    />
                    {errors.numberOfQuestionsPerSet && <p className="text-sm text-destructive">{errors.numberOfQuestionsPerSet.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>&nbsp;</Label>
                    <div className="h-10"></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions (Optional)</Label>
                  <Textarea
                    id="instructions"
                    rows={3}
                    placeholder="Enter test instructions..."
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground prioritize-visible:outline-none prioritize-visible:ring-2 prioritize-visible:ring-ring prioritize-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register('instructions')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="shuffleQuestions"
                      checked={watch('shuffleQuestions')}
                      onCheckedChange={(checked) => setValue('shuffleQuestions', checked)}
                    />
                    <Label htmlFor="shuffleQuestions" className="cursor-pointer">
                      Shuffle Questions
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="shuffleOptions"
                      checked={watch('shuffleOptions')}
                      onCheckedChange={(checked) => setValue('shuffleOptions', checked)}
                    />
                    <Label htmlFor="shuffleOptions" className="cursor-pointer">
                      Shuffle Options
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="questionBank">Question Bank *</Label>
                  <Select value={questionBankId} onValueChange={setQuestionBankId} disabled={loadingBanks}>
                    <SelectTrigger id="questionBank">
                      <SelectValue placeholder={loadingBanks ? 'Loading...' : 'Select a question bank'} />
                    </SelectTrigger>
                    <SelectContent>
                      {questionBanks.length ? (
                        questionBanks.map(bank => {
                          console.log('Rendering Question Bank:', bank);
                          return bank.id && (
                            <SelectItem key={bank.id} value={bank.id}>
                              {bank.name || `Unnamed Bank (${bank.id})`}
                            </SelectItem>
                          );
                        }).filter(Boolean)
                      ) : (
                        <div className="text-sm text-muted-foreground p-2">No question banks available</div>
                      )}
                    </SelectContent>
                  </Select>
                  {!questionBankId && <p className="text-sm text-destructive">Please select a question bank</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-primary/80"
                  disabled={selectedQuestions.length === 0}
                >
                  Create Test
                </Button>
              </form>
            </CardContent>
          </Card>

          {questionBankId && (
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  Questions in Selected Bank ({questions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingQuestions ? (
                  <p className="text-sm text-muted-foreground">Loading questions...</p>
                ) : !questions.length ? (
                  <p className="text-sm text-destructive">No questions available</p>
                ) : (
                  <div className="max-h-[500px] overflow-y-auto space-y-2 pr-2">
                    {questions.map(q => (
                      <div key={q.id} className="text-sm p-3 bg-muted/50 rounded flex justify-between items-center">
                        <div>
                          <div className="font-medium">
                            <KatexRenderer>{q.text}</KatexRenderer>
                          </div>
                          <div className="text-muted-foreground">{q.type} • {q.marks} marks</div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => selectedQuestions.some(sq => sq.id === q.id) ? handleRemoveFromTest(q.id) : handleAddToTest(q)}
                        >
                          {selectedQuestions.some(sq => sq.id === q.id) ? (
                            <>
                              <X className="h-4 w-4 mr-1" /> Remove
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-1" /> Add to Test
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div ref={manageExamRef}>
          {isManageExamOpen && (
            <Card className="glass-effect border-primary/20 animate-fade-in hover-lift">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Manage Exam
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={toggleManageExam}>
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="examSelect">Select Exam *</Label>
                  <div className="flex gap-2">
                    <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                      <SelectTrigger id="examSelect" className="flex-1">
                        <SelectValue placeholder={exams.length ? 'Select an exam' : 'No exams available'} />
                      </SelectTrigger>
                      <SelectContent>
                        {exams.length ? (
                          exams.map(exam => (
                            exam.id && (
                              <SelectItem key={exam.id} value={exam.id}>
                                {exam.title} ({exam.status})
                              </SelectItem>
                            )
                          )).filter(Boolean)
                        ) : (
                          <div className="text-sm text-muted-foreground p-2">No exams available</div>
                        )}
                      </SelectContent>
                    </Select>
                    {selectedExamId && (
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleDeleteExam(selectedExamId)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {!exams.length && <p className="text-sm text-destructive">No exams available</p>}
                </div>

                {selectedExamId && (
                  <>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Set Expiring Time</h3>
                      <div className="space-y-2">
                        <Label htmlFor="manageExpiringHours">Expiring Time (hours) *</Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="manageExpiringHours"
                            type="number"
                            step="0.5"
                            min="0.5"
                            max="168"
                            value={expiringHours}
                            onChange={(e) => setExpiringHours(e.target.value)}
                            placeholder="1"
                            className="pl-10"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">Test will expire after this time from start (0.5 to 168 hours)</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Assign to Group</h3>
                      <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                        <SelectTrigger>
                          <SelectValue placeholder={groups.length ? 'Select a group' : 'No groups available'} />
                        </SelectTrigger>
                        <SelectContent>
                          {groups.length ? (
                            groups.map(group => (
                              group.id && (
                                <SelectItem key={group.id} value={group.id}>
                                  {group.name || `Unnamed Group (${group.id})`}
                                </SelectItem>
                              )
                            )).filter(Boolean)
                          ) : (
                            <div className="text-sm text-muted-foreground p-2">No groups available</div>
                          )}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => handleAssignGroup(selectedExamId, selectedGroup)}
                        disabled={!selectedExamId || !selectedGroup}
                        className="bg-green-600 hover:bg-green-700 w-32"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Assign
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Security Settings</h3>
                        <div className="space-y-3">
                          {[
                            { id: 'disableTabSwitching', label: 'Disable Tab Switching' },
                            { id: 'disableRightClick', label: 'Disable Right Click' },
                            { id: 'enableScreenSharing', label: 'Enable Screen Sharing' },
                            { id: 'enableProctoring', label: 'Enable AI Proctoring' },
                            { id: 'enableWebcam', label: 'Require Webcam Monitoring' },
                            { id: 'restrictIP', label: 'Restrict IP Addresses' },
                          ].map(setting => (
                            <div key={setting.id} className="flex items-center justify-between">
                              <Label htmlFor={setting.id}>{setting.label}</Label>
                              <Switch
                                id={setting.id}
                                checked={securitySettings[setting.id as keyof SecuritySettings]}
                                onCheckedChange={() => handleSecuritySettingChange(setting.id as keyof SecuritySettings)}
                              />
                            </div>
                          ))}
                        </div>
                        <Button onClick={handleSaveSecuritySettings} className="w-full">
                          <Save className="h-4 w-4 mr-2" />
                          Save Security Settings
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Time Limit</h3>
                        <div className="space-y-2">
                          <Label htmlFor="timeLimit">Select Time Limit (minutes)</Label>
                          <Select value={timeLimit} onValueChange={value => {
                            setTimeLimit(value);
                            if (value !== 'custom') setCustomTimeLimit('');
                          }}>
                            <SelectTrigger id="timeLimit">
                              <SelectValue placeholder="Select time limit" />
                            </SelectTrigger>
                            <SelectContent>
                              {['30', '60', '90', '120', 'custom'].map(value => (
                                <SelectItem key={value} value={value}>
                                  {value === 'custom' ? 'Custom' : `${value} minutes`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {timeLimit === 'custom' && (
                          <div className="space-y-2">
                            <Label htmlFor="customTimeLimit">Custom Time Limit (minutes)</Label>
                            <Input
                              id="customTimeLimit"
                              type="number"
                              value={customTimeLimit}
                              onChange={e => setCustomTimeLimit(e.target.value)}
                              placeholder="Enter custom time limit"
                              min={5}
                              max={240}
                            />
                          </div>
                        )}
                        <Button onClick={handleSaveTimeLimit} className="w-full">
                          <Clock className="h-4 w-4 mr-2" />
                          Save Time Limit
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Edit Exam</h3>
                      <Button
                        onClick={() => setIsEditFormOpen(!isEditFormOpen)}
                        className="w-full"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        {isEditFormOpen ? 'Close Edit Form' : 'Edit Exam'}
                      </Button>
                      {isEditFormOpen && (
                        <form onSubmit={handleEditSubmit(handleEditExam)} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="editTestName">Test Name *</Label>
                            <Input
                              id="editTestName"
                              placeholder="E.g., Mid-term Mathematics"
                              className={cn(editErrors.testName && 'border-destructive')}
                              {...registerEdit('testName')}
                            />
                            {editErrors.testName && <p className="text-sm text-destructive">{editErrors.testName.message}</p>}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="editDuration">Duration (minutes) *</Label>
                              <div className="relative">
                                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  id="editDuration"
                                  type="number"
                                  placeholder="60"
                                  className={cn('pl-10', editErrors.duration && 'border-destructive')}
                                  {...registerEdit('duration')}
                                />
                              </div>
                              {editErrors.duration && <p className="text-sm text-destructive">{editErrors.duration.message}</p>}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="editNumberOfSets">Number of Sets *</Label>
                              <Input
                                id="editNumberOfSets"
                                type="number"
                                placeholder="1"
                                className={cn(editErrors.numberOfSets && 'border-destructive')}
                                {...registerEdit('numberOfSets')}
                              />
                              {editErrors.numberOfSets && <p className="text-sm text-destructive">{editErrors.numberOfSets.message}</p>}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="editNumberOfQuestionsPerSet">Questions per Set *</Label>
                            <Input
                              id="editNumberOfQuestionsPerSet"
                              type="number"
                              placeholder="1"
                              className={cn(editErrors.numberOfQuestionsPerSet && 'border-destructive')}
                              {...registerEdit('numberOfQuestionsPerSet')}
                            />
                            {editErrors.numberOfQuestionsPerSet && <p className="text-sm text-destructive">{editErrors.numberOfQuestionsPerSet.message}</p>}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="editInstructions">Instructions (Optional)</Label>
                            <Textarea
                              id="editInstructions"
                              rows={3}
                              placeholder="Enter test instructions..."
                              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground prioritize-visible:outline-none prioritize-visible:ring-2 prioritize-visible:ring-ring prioritize-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...registerEdit('instructions')}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="editShuffleQuestions"
                                checked={watchEdit('shuffleQuestions')}
                                onCheckedChange={(checked) => setValueEdit('shuffleQuestions', checked)}
                              />
                              <Label htmlFor="editShuffleQuestions" className="cursor-pointer">
                                Shuffle Questions
                              </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch
                                id="editShuffleOptions"
                                checked={watchEdit('shuffleOptions')}
                                onCheckedChange={(checked) => setValueEdit('shuffleOptions', checked)}
                              />
                              <Label htmlFor="editShuffleOptions" className="cursor-pointer">
                                Shuffle Options
                              </Label>
                            </div>
                          </div>

                          <Button type="submit" className="w-full">
                            <Save className="h-4 w-4 mr-2" />
                            Save Exam Changes
                          </Button>
                        </form>
                      )}
                    </div>

                    <div ref={previewQuestionPaperRef} className="space-y-4">
                      <h3 className="text-lg font-semibold">Preview Question Paper</h3>
                      <Button onClick={toggleQuestionSets} className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        {showQuestionSets ? 'Hide Question Sets' : 'Show Question Sets'}
                      </Button>
                      {showQuestionSets && (
                        exams.find(exam => exam.id === selectedExamId)?.questionIds.length ? (
                          Array.from({ length: exams.find(exam => exam.id === selectedExamId)?.numberOfSets || 1 }, (_, setIndex) => {
                            const selectedExam = exams.find(exam => exam.id === selectedExamId);
                            const questionsPerSet = selectedExam?.numberOfQuestionsPerSet || 0;
                            
                            // Only shuffle if shuffleQuestions is enabled
                            const questionIds = selectedExam?.questionIds || [];
                            const setQuestions = selectedExam?.shuffleQuestions 
                              ? shuffleArray(questionIds, setIndex).slice(0, questionsPerSet)
                              : questionIds.slice(setIndex * questionsPerSet, (setIndex + 1) * questionsPerSet);
                            
                            return (
                              <div key={setIndex} className="p-4 bg-muted/50 rounded">
                                <h4 className="font-medium">Set {setIndex + 1}</h4>
                                <ul className="mt-2 space-y-2">
                                  {setQuestions.map((questionId, qIndex) => {
                                    const question = questions.find(q => q.id === questionId);
                                    return (
                                      <li key={questionId} className="text-sm">
                                        Question {qIndex + 1}: <KatexRenderer>{question?.text || `Question ${questionId}`}</KatexRenderer>
                                        <span className="text-muted-foreground"> ({question?.type || 'MCQ'}, {question?.marks || 1} marks)</span>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-sm text-destructive">No questions assigned to this exam</p>
                        )
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {!isManageExamOpen && (
          <Button
            onClick={toggleManageExam}
            className="w-full bg-gradient-to-r from-primary to-primary/80"
          >
            <Settings className="h-4 w-4 mr-2" />
            Open Manage Exam
          </Button>
        )}

        <Card className="glass-effect border-primary/20 animate-fade-in hover-lift">
          <CardHeader>
            <CardTitle>Active Tests</CardTitle>
          </CardHeader>
          <CardContent>
            {exams.filter(exam => exam.isPublished && !exam.isEnded).length ? (
              exams.filter(exam => exam.isPublished && !exam.isEnded).map((test, index) => (
                <div
                  key={test.id}
                  ref={(el) => { examRefs.current[test.id] = el; }}
                  className="flex justify-between items-center p-4 border rounded-lg animate-slide-in transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${test.status === 'Live' ? 'bg-green-500' : test.status === 'Scheduled' ? 'bg-yellow-500' : 'bg-gray-500'}`} />
                    <div>
                      <p className="font-medium">{test.title}</p>
                      <p className="text-sm text-muted-foreground">{test.status}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleSelectExam(test.id, 'view')}>View</Button>
                    <Button variant="outline" size="sm" onClick={() => handleSelectExam(test.id, 'manage')}>Manage</Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/common/monitor/${test.id}`)}>Monitor</Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteExam(test.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-destructive">No active or scheduled exams. Please assign exams to groups to see them here.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ConductTestOnline;