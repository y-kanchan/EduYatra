import { useState, useEffect } from 'react';
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { BookOpen, Search, Edit, Trash2, Eye, Filter, Lock, Globe, Users, Save, X } from "lucide-react";
import { toast } from 'sonner';
import axios from "axios";
import { KatexRenderer } from "@/lib/katex-rendering";
import 'katex/dist/katex.min.css';
import { API_URL } from "@/config/api";

// Utility to format dates as "X days ago"
const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInMs = now.getTime() - past.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  return `${diffInDays} days ago`;
};

// Type definitions for API responses
interface QuestionBank {
  _id: string;
  name: string;
  course_code: string;
  questions: number;
  difficulty: string;
  visibility: 'public' | 'private' | 'shared';
  created_at: string;
  updated_at: string;
}

interface Question {
  _id: string;
  latex_code: string;
  katex_code: string;
  difficulty_rating: number;
  subject: string;
  question_type: string;
  correct_option_latex?: string;
  correct_option_katex?: string;
  incorrect_option_latex?: string[];
  incorrect_option_katex?: string[];
  solution_latex?: string;
  katex_solution?: string;
  topic?: string;
  Sub_topic?: string;
}

interface QuestionBankResponse {
  success: boolean;
  data?: QuestionBank[];
  error?: string;
}

interface CreateQuestionBankResponse {
  success: boolean;
  questionBank: QuestionBank;
  error?: string;
}

interface QuestionsResponse {
  success: boolean;
  questions: Question[];
  error?: string;
}

interface UpdateQuestionResponse {
  success: boolean;
  question?: Question;
  error?: string;
}

const ReviewQuestionSets = () => {
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<QuestionBank | null>(null);
  const [newBank, setNewBank] = useState({ name: "", course_code: "", visibility: "private" });
  const [searchQuery, setSearchQuery] = useState("");
  const [questionSearchQuery, setQuestionSearchQuery] = useState("");
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editedQuestion, setEditedQuestion] = useState<Question | null>(null);
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    const fetchQuestionBanks = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("❌ Please log in to view question banks");
          return;
        }

        const res = await axios.get<QuestionBankResponse>(`${API_URL}/question-banks/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success && res.data.data) {
          const enrichedData = await Promise.all(
            res.data.data.map(async (bank) => {
              try {
                const questionsRes = await axios.get<QuestionsResponse>(
                  `${API_URL}/question-banks/questions?questionBankId=${bank._id}`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );

                const questions = questionsRes.data.success ? questionsRes.data.questions : [];
                const totalDifficulty = questions.reduce(
                  (sum, q) => sum + (q.difficulty_rating || 1),
                  0
                );
                const avgDifficulty = questions.length > 0 ? totalDifficulty / questions.length : 1;
                const difficultyLabel =
                  avgDifficulty >= 3 ? 'Hard' : avgDifficulty >= 2 ? 'Medium' : 'Easy';

                return {
                  _id: bank._id,
                  name: bank.name,
                  course_code: bank.course_code,
                  questions: questions.length,
                  difficulty: difficultyLabel,
                  visibility: bank.visibility,
                  created_at: bank.created_at,
                  updated_at: bank.updated_at,
                };
              } catch (error) {
                console.error(`Error fetching questions for bank ${bank._id}:`, error);
                return {
                  _id: bank._id,
                  name: bank.name || 'Untitled Question Bank',
                  course_code: bank.course_code || 'Unknown',
                  questions: 0,
                  difficulty: 'Unknown',
                  visibility: bank.visibility || 'private',
                  created_at: bank.created_at,
                  updated_at: bank.updated_at || bank.created_at,
                };
              }
            })
          );

          setQuestionBanks(enrichedData);
        } else {
          toast.error(`❌ Failed to fetch question banks: ${res.data.error || 'Unknown error'}`);
        }
      } catch (error: unknown) {
        console.error('Error fetching question banks:', error);
        const axiosError = error as { response?: { data?: { error?: string } } };
        toast.error(axiosError.response?.data?.error || "⚠️ Error fetching question banks");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionBanks();
  }, []);

  const handleCreateBank = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("❌ Please log in to create a question bank");
        return;
      }

      if (!newBank.name || !newBank.course_code) {
        toast.error("❌ Name and course code are required");
        return;
      }

      const res = await axios.post<CreateQuestionBankResponse>(
        `${API_URL}/question-banks/create`,
        newBank,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        const bank = res.data.questionBank;
        setQuestionBanks([
          ...questionBanks,
          {
            _id: bank._id,
            name: bank.name,
            course_code: bank.course_code,
            questions: bank.questions,
            difficulty: bank.difficulty,
            visibility: bank.visibility,
            created_at: bank.created_at,
            updated_at: bank.updated_at,
          },
        ]);
        setNewBank({ name: "", course_code: "", visibility: "private" });
        setIsCreateOpen(false);
        toast.success("✅ Question bank created successfully!");
      } else {
        toast.error(`❌ Failed to create question bank: ${res.data.error || 'Unknown error'}`);
      }
    } catch (error: unknown) {
      console.error("Error creating question bank:", error);
      const axiosError = error as { response?: { data?: { error?: string } } };
      toast.error(axiosError.response?.data?.error || "⚠️ Failed to create question bank");
    }
  };

  const handlePreview = async (bank: QuestionBank) => {
    setSelectedBank(bank);
    setIsPreviewOpen(true);
    setLoadingQuestions(true);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("❌ Please log in to view questions");
        return;
      }

      console.log('🔍 Fetching questions for bank:', bank._id);
      const response = await axios.get<QuestionsResponse>(
        `${API_URL}/question-banks/questions?questionBankId=${bank._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('📥 Questions response:', response.data);

      if (response.data.success && response.data.questions) {
        console.log('✅ Setting preview questions:', response.data.questions);
        console.log('📊 Number of questions:', response.data.questions.length);
        
        // Log first question details for debugging
        if (response.data.questions.length > 0) {
          const firstQ = response.data.questions[0];
          console.log('🔍 First question details:', {
            id: firstQ._id,
            hasKatexCode: !!firstQ.katex_code,
            hasLatexCode: !!firstQ.latex_code,
            katexCodeLength: firstQ.katex_code?.length || 0,
            latexCodeLength: firstQ.latex_code?.length || 0,
            katexCodePreview: firstQ.katex_code?.substring(0, 100),
            latexCodePreview: firstQ.latex_code?.substring(0, 50),
            subject: firstQ.subject,
            questionType: firstQ.question_type,
            correctOption: !!firstQ.correct_option_katex,
            incorrectOptions: firstQ.incorrect_option_katex?.length || 0,
            hasSolutionLatex: !!firstQ.solution_latex,
            hasKatexSolution: !!firstQ.katex_solution,
            solutionLatexLength: firstQ.solution_latex?.length || 0,
            katexSolutionLength: firstQ.katex_solution?.length || 0,
            solutionLatexPreview: firstQ.solution_latex?.substring(0, 50) || 'NO SOLUTION'
          });
        }
        
        setPreviewQuestions(response.data.questions);
        console.log(`✅ Loaded ${response.data.questions.length} questions`);
        
        if (response.data.questions.length === 0) {
          toast.info("ℹ️ This question bank has no questions yet");
        }
      } else {
        setPreviewQuestions([]);
        toast.warning("⚠️ No questions found in this question bank");
      }
    } catch (error: unknown) {
      console.error('❌ Error fetching questions:', error);
      toast.error("⚠️ Failed to load questions");
      setPreviewQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestionId(question._id);
    setEditedQuestion({ 
      ...question, 
      incorrect_option_latex: question.incorrect_option_latex ? [...question.incorrect_option_latex] : [] 
    });
  };

  const handleSaveQuestion = async (questionId: string) => {
    if (!editedQuestion) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("❌ Please log in to save changes");
        return;
      }

      console.log('💾 Saving question:', questionId, editedQuestion);

      // Update the question via API
      const response = await axios.put<UpdateQuestionResponse>(
        `${API_URL}/questions/${questionId}`,
        editedQuestion,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Update local state
        setPreviewQuestions((prev) =>
          prev.map((q) =>
            q._id === questionId ? { ...editedQuestion } : q
          )
        );
        setEditingQuestionId(null);
        setEditedQuestion(null);
        toast.success("✅ Question updated successfully!");
      } else {
        toast.error("❌ Failed to update question");
      }
    } catch (error: unknown) {
      console.error('❌ Error saving question:', error);
      toast.error("⚠️ Failed to save question changes");
    }
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setEditedQuestion(null);
  };

  const handleOptionChange = (index: number, value: string) => {
    if (!editedQuestion) return;
    const newOptions = [...(editedQuestion.incorrect_option_latex || [])];
    newOptions[index] = value;
    setEditedQuestion({ ...editedQuestion, incorrect_option_latex: newOptions });
  };

  // Filter question banks based on search query
  const filteredBanks = questionBanks.filter(
    (bank) =>
      bank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bank.course_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter questions based on question search query
  const filteredQuestions = previewQuestions.filter(
    (question) =>
      (question.latex_code && question.latex_code.toLowerCase().includes(questionSearchQuery.toLowerCase())) ||
      (question.katex_code && question.katex_code.toLowerCase().includes(questionSearchQuery.toLowerCase())) ||
      (question.subject && question.subject.toLowerCase().includes(questionSearchQuery.toLowerCase())) ||
      (question.topic && question.topic.toLowerCase().includes(questionSearchQuery.toLowerCase()))
  );
  
  // Log filtered questions
  console.log('🔍 Preview Dialog - filteredQuestions:', filteredQuestions.length, 'questions');
  if (filteredQuestions.length > 0) {
    console.log('📊 First filtered question:', {
      id: filteredQuestions[0]._id,
      hasKatex: !!filteredQuestions[0].katex_code,
      hasLatex: !!filteredQuestions[0].latex_code,
      katexLength: filteredQuestions[0].katex_code?.length,
      latexLength: filteredQuestions[0].latex_code?.length
    });
  }

  return (
    <Layout>
      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Review Question Sets
            </h1>
            <p className="text-muted-foreground mt-2">Manage and review all question sets</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-primary/80">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Create New Set
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] glass-effect border-primary/20">
                <DialogHeader>
                  <DialogTitle>Create New Question Set</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Set Name</Label>
                    <Input
                      id="name"
                      value={newBank.name}
                      onChange={(e) => setNewBank({ ...newBank, name: e.target.value })}
                      placeholder="Enter set name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="course_code">Course Code</Label>
                    <Input
                      id="course_code"
                      value={newBank.course_code}
                      onChange={(e) => setNewBank({ ...newBank, course_code: e.target.value })}
                      placeholder="Enter course code (e.g., CS101)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="visibility">Visibility</Label>
                    <select
                      id="visibility"
                      value={newBank.visibility}
                      onChange={(e) => setNewBank({ ...newBank, visibility: e.target.value })}
                      className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="private">Private</option>
                      <option value="public">Public</option>
                      <option value="shared">Shared</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateBank}>Create</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="glass-effect border-primary/20 animate-fade-in">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search question sets..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline">Search</Button>
            </div>
          </CardContent>
        </Card>

        {/* Question Sets Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p className="text-muted-foreground">Loading question banks...</p>
          ) : filteredBanks.length === 0 ? (
            <p className="text-destructive">No question banks available.</p>
          ) : (
            filteredBanks.map((set, index) => (
              <Card
                key={set._id}
                className="glass-effect border-primary/20 animate-scale-in hover-lift"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{set.name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge
                        variant={
                          set.difficulty === 'Hard'
                            ? 'destructive'
                            : set.difficulty === 'Medium'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {set.difficulty}
                      </Badge>
                      <Badge variant="outline">
                        {set.visibility === 'public' ? (
                          <Globe className="h-3 w-3 mr-1" />
                        ) : set.visibility === 'shared' ? (
                          <Users className="h-3 w-3 mr-1" />
                        ) : (
                          <Lock className="h-3 w-3 mr-1" />
                        )}
                        {set.visibility}
                      </Badge>
                    </div>
                  </div>
                  <Badge variant="outline">{set.course_code}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Questions:</span>
                      <span className="font-medium">{set.questions}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last Modified:</span>
                      <span className="font-medium">{formatRelativeTime(set.updated_at)}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handlePreview(set)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col glass-effect border-primary/20">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>{selectedBank?.name} - Preview</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto space-y-6">
              {/* Search and Actions Bar */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search questions by content, subject, or topic..."
                    className="pl-10 h-10"
                    value={questionSearchQuery}
                    onChange={(e) => setQuestionSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" className="h-10 px-6">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" className="h-10 px-4">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Set
                </Button>
              </div>
              {/* Questions List */}
              <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-6">
                {loadingQuestions ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading questions...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredQuestions.length === 0 ? (
                      <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed">
                        <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                        <p className="text-lg font-medium text-muted-foreground">No questions found</p>
                        <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or add questions to this bank.</p>
                      </div>
                    ) : (
                    filteredQuestions.map((question, index) => {
                      return (
                      <Card key={question._id} className="overflow-hidden border-2 hover:border-primary/50 transition-all shadow-sm hover:shadow-md">
                        <CardContent className="p-0">
                          {editingQuestionId === question._id ? (
                            <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
                              <div className="flex items-center justify-between pb-4 border-b">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                  <Edit className="h-5 w-5 text-primary" />
                                  Editing Question #{index + 1}
                                </h3>
                                <Badge variant="secondary">{question.question_type || 'MCQ'}</Badge>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`latex-${question._id}`} className="text-base font-semibold">Question Text</Label>
                                <Textarea
                                  id={`latex-${question._id}`}
                                  value={editedQuestion?.latex_code || ''}
                                  onChange={(e) =>
                                    setEditedQuestion({ ...editedQuestion!, latex_code: e.target.value })
                                  }
                                  placeholder="Enter question in LaTeX format (e.g., $x^2 + 3x$)"
                                  rows={3}
                                  className="font-mono text-sm"
                                />
                                {/* Live Preview */}
                                {editedQuestion?.latex_code && (
                                  <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">Preview:</p>
                                    <div className="text-base">
                                      <KatexRenderer>
                                        {editedQuestion.latex_code}
                                      </KatexRenderer>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`subject-${question._id}`}>Subject</Label>
                                  <Input
                                    id={`subject-${question._id}`}
                                    value={editedQuestion?.subject || ''}
                                    onChange={(e) =>
                                      setEditedQuestion({ ...editedQuestion!, subject: e.target.value })
                                    }
                                    placeholder="Enter subject"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`topic-${question._id}`}>Topic</Label>
                                  <Input
                                    id={`topic-${question._id}`}
                                    value={editedQuestion?.topic || ''}
                                    onChange={(e) =>
                                      setEditedQuestion({ ...editedQuestion!, topic: e.target.value })
                                    }
                                    placeholder="Enter topic"
                                  />
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`difficulty-${question._id}`}>Difficulty Rating (1-5)</Label>
                                <Input
                                  id={`difficulty-${question._id}`}
                                  type="number"
                                  min="1"
                                  max="5"
                                  value={editedQuestion?.difficulty_rating || 1}
                                  onChange={(e) =>
                                    setEditedQuestion({
                                      ...editedQuestion!,
                                      difficulty_rating: parseInt(e.target.value),
                                    })
                                  }
                                  className="w-32"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`correct-${question._id}`} className="text-base font-semibold">Correct Answer</Label>
                                <Textarea
                                  id={`correct-${question._id}`}
                                  value={editedQuestion?.correct_option_latex || ''}
                                  onChange={(e) =>
                                    setEditedQuestion({ ...editedQuestion!, correct_option_latex: e.target.value })
                                  }
                                  placeholder="Enter correct answer in LaTeX format"
                                  rows={2}
                                  className="font-mono text-sm"
                                />
                                {editedQuestion?.correct_option_latex && (
                                  <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border-2 border-green-200 dark:border-green-800">
                                    <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">Preview:</p>
                                    <div className="text-sm">
                                      <KatexRenderer>
                                        {editedQuestion.correct_option_latex}
                                      </KatexRenderer>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <div className="space-y-2">
                                <Label className="text-base font-semibold">Incorrect Options</Label>
                                {editedQuestion?.incorrect_option_latex?.map((option, idx) => (
                                  <div key={idx} className="space-y-2">
                                    <Textarea
                                      value={option}
                                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                                      placeholder={`Incorrect option ${idx + 1}`}
                                      rows={2}
                                      className="font-mono text-sm"
                                    />
                                    {option && (
                                      <div className="p-2 bg-white dark:bg-gray-900 rounded border-2 border-gray-200 dark:border-gray-800">
                                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Preview:</p>
                                        <div className="text-sm">
                                          <KatexRenderer>
                                            {option}
                                          </KatexRenderer>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`solution-${question._id}`} className="text-base font-semibold">Solution (Optional)</Label>
                                <Textarea
                                  id={`solution-${question._id}`}
                                  value={editedQuestion?.solution_latex || ''}
                                  onChange={(e) =>
                                    setEditedQuestion({ ...editedQuestion!, solution_latex: e.target.value })
                                  }
                                  placeholder="Enter solution in LaTeX format"
                                  rows={4}
                                  className="font-mono text-sm"
                                />
                                {editedQuestion?.solution_latex && (
                                  <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                                    <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-1">Preview:</p>
                                    <div className="text-sm">
                                      <KatexRenderer>
                                        {editedQuestion.solution_latex}
                                      </KatexRenderer>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button
                                  variant="outline"
                                  size="default"
                                  onClick={handleCancelEdit}
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Cancel
                                </Button>
                                <Button
                                  size="default"
                                  onClick={() => handleSaveQuestion(question._id)}
                                  className="bg-gradient-to-r from-primary to-primary/80"
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  Save Changes
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="divide-y">
                              {/* Header Section */}
                              <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                      <Badge variant="default" className="text-sm px-3 py-1">
                                        Question #{index + 1}
                                      </Badge>
                                      <Badge variant="secondary" className="text-sm">
                                        {question.question_type || 'MCQ'}
                                      </Badge>
                                      <Badge variant={question.difficulty_rating >= 3 ? 'destructive' : question.difficulty_rating >= 2 ? 'default' : 'secondary'}>
                                        {question.difficulty_rating >= 3 ? 'Hard' : question.difficulty_rating >= 2 ? 'Medium' : 'Easy'}
                                      </Badge>
                                    </div>
                                    <div className="text-lg font-medium text-gray-900 dark:text-gray-100 leading-relaxed break-words whitespace-normal">
                                      {question.latex_code ? (
                                        <KatexRenderer>
                                          {question.latex_code}
                                        </KatexRenderer>
                                      ) : question.katex_code ? (
                                        <div dangerouslySetInnerHTML={{ __html: question.katex_code }} />
                                      ) : (
                                        <span className="italic text-gray-500">No question text available</span>
                                      )}
                                    </div>
                                    {(question.subject || question.topic) && (
                                      <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                                        {question.subject && <span>📚 {question.subject}</span>}
                                        {question.topic && <span>🏷️ {question.topic}</span>}
                                      </div>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditQuestion(question)}
                                    className="hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                  >
                                    <Edit className="h-5 w-5" />
                                  </Button>
                                </div>
                              </div>
                              
                              {/* Options Section */}
                              <div className="p-5 space-y-4">
                                {/* Correct Answer */}
                                {(question.correct_option_latex || question.correct_option_katex) && (
                                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border-2 border-green-200 dark:border-green-800">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">
                                        ✓
                                      </div>
                                      <span className="font-semibold text-green-700 dark:text-green-300">Correct Answer</span>
                                    </div>
                                    <div className="text-base text-green-900 dark:text-green-100 ml-8 break-words whitespace-normal">
                                      {question.correct_option_latex ? (
                                        <KatexRenderer>
                                          {question.correct_option_latex}
                                        </KatexRenderer>
                                      ) : question.correct_option_katex ? (
                                        <div dangerouslySetInnerHTML={{ __html: question.correct_option_katex }} />
                                      ) : null}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Incorrect Options */}
                                {((question.incorrect_option_latex && question.incorrect_option_latex.length > 0) || 
                                  (question.incorrect_option_katex && question.incorrect_option_katex.length > 0)) && (
                                  <div className="space-y-2">
                                    <span className="font-semibold text-sm text-muted-foreground">Incorrect Options:</span>
                                    {(question.incorrect_option_latex || question.incorrect_option_katex || []).map((option, idx) => (
                                      <div key={idx} className="p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 rounded-lg border border-red-200 dark:border-red-800">
                                        <div className="flex items-start gap-3">
                                          <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                            ✗
                                          </div>
                                          <div className="text-base text-red-900 dark:text-red-100 flex-1 break-words whitespace-normal">
                                            {question.incorrect_option_latex && question.incorrect_option_latex[idx] ? (
                                              <KatexRenderer>
                                                {question.incorrect_option_latex[idx]}
                                              </KatexRenderer>
                                            ) : question.incorrect_option_katex && question.incorrect_option_katex[idx] ? (
                                              <div dangerouslySetInnerHTML={{ __html: question.incorrect_option_katex[idx] }} />
                                            ) : null}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              {/* Solution Section */}
                              {(() => {
                                const hasSolution = question.solution_latex || question.katex_solution;
                                console.log(`🔍 Question ${question._id} solution check:`, {
                                  hasSolution,
                                  solution_latex: question.solution_latex,
                                  katex_solution: question.katex_solution,
                                  solutionLatexLength: question.solution_latex?.length || 0,
                                  katexSolutionLength: question.katex_solution?.length || 0
                                });
                                return hasSolution;
                              })() && (
                                <div className="p-5 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30">
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="h-7 w-7 rounded-full bg-purple-500 flex items-center justify-center text-white text-lg">
                                      💡
                                    </div>
                                    <span className="font-bold text-lg text-purple-700 dark:text-purple-300">Solution</span>
                                  </div>
                                  <div className="text-base text-purple-900 dark:text-purple-100 ml-9 leading-relaxed break-words whitespace-normal">
                                    {question.solution_latex ? (
                                      <KatexRenderer>
                                        {question.solution_latex}
                                      </KatexRenderer>
                                    ) : question.katex_solution ? (
                                      <div dangerouslySetInnerHTML={{ __html: question.katex_solution }} />
                                    ) : null}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                    })
                  )}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ReviewQuestionSets;