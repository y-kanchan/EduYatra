import { useState, useRef, ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Printer, Download, Clock, BookOpen, FileDigit, Plus, Upload, FileCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuestionBankSelection } from "@/components/QuestionBankSelection";
import { toast } from "sonner";

interface SelectedQuestion {
  id: string;
  text: string;
  type: string;
  marks: number;
}

type TestStatus = 'draft' | 'published' | 'completed' | 'grading';

interface TestPaper {
  id: string;
  name: string;
  className: string;
  totalMarks: number;
  timeLimit: number;
  status: TestStatus;
  createdAt: Date;
  paperCount: number;
  questionCount?: number;
}

const testFormSchema = z.object({
  paperName: z.string().min(3, 'Paper name must be at least 3 characters'),
  className: z.string().min(1, 'Class is required'),
  totalMarks: z.coerce.number().min(1, 'Must be at least 1').max(500, 'Maximum 500 marks allowed'),
  timeLimit: z.coerce.number().min(0.5, 'Minimum 0.5 hours').max(8, 'Maximum 8 hours allowed'),
  questionBank: z.string().min(1, 'Please select a question bank')
});

type TestFormValues = z.infer<typeof testFormSchema>;

const statusVariant = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-800', darkBg: 'dark:bg-gray-800/50', darkText: 'dark:text-gray-300' },
  published: { bg: 'bg-blue-100', text: 'text-blue-800', darkBg: 'dark:bg-blue-900/30', darkText: 'dark:text-blue-400' },
  completed: { bg: 'bg-green-100', text: 'text-green-800', darkBg: 'dark:bg-green-900/30', darkText: 'dark:text-green-400' },
  grading: { bg: 'bg-yellow-100', text: 'text-yellow-800', darkBg: 'dark:bg-yellow-900/30', darkText: 'dark:text-yellow-400' },
};

const ConductTestOffline = () => {
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestion[]>([]);
  
  // Mock question banks - in a real app, this would come from an API
  const questionBanks = [
    { id: '1', name: 'Mathematics - Grade 10' },
    { id: '2', name: 'Science - Grade 9' },
    { id: '3', name: 'History - Grade 8' },
  ];
  const [testPapers, setTestPapers] = useState<TestPaper[]>([
    {
      id: '1',
      name: 'Final Examination - Mathematics',
      className: '10th Grade',
      totalMarks: 100,
      timeLimit: 3,
      status: 'completed',
      createdAt: new Date('2024-06-10'),
      paperCount: 45,
      questionCount: 25
    },
    {
      id: '2',
      name: 'Mid-term Test - Science',
      className: '9th Grade',
      totalMarks: 50,
      timeLimit: 1.5,
      status: 'grading',
      createdAt: new Date('2024-06-05'),
      paperCount: 38,
      questionCount: 15
    },
  ]);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<TestFormValues>({
    resolver: zodResolver(testFormSchema),
    defaultValues: {
      paperName: '',
      className: '',
      totalMarks: 100,
      timeLimit: 3,
      questionBank: ''
    }
  });

  const questionBank = watch('questionBank');

  const handleSelectQuestions = (questions: SelectedQuestion[]) => {
    setSelectedQuestions(questions);
    setIsQuestionBankOpen(false);
  };

  const onSubmit = (data: TestFormValues) => {
    const newTest: TestPaper = {
      id: Date.now().toString(),
      name: data.paperName,
      className: data.className,
      totalMarks: selectedQuestions.reduce((sum, q) => sum + q.marks, 0) || data.totalMarks,
      timeLimit: data.timeLimit,
      status: 'draft',
      createdAt: new Date(),
      paperCount: 0,
      questionCount: selectedQuestions.length
    };

    setTestPapers(prev => [newTest, ...prev]);
    setSelectedQuestions([]);
    // TODO: Add API call to save the test paper
  };

  const handleDownloadPaper = (id: string) => {
    const paper = testPapers.find(p => p.id === id);
    if (paper) {
      // TODO: Implement actual PDF generation and download
      alert(`Downloading ${paper.name}...`);
    }
  };
  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Offline Test Management
            </h1>
            <p className="text-muted-foreground">
              Create, manage, and track offline examinations with ease
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Generate Test Paper Form */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  Create New Test Paper
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="paperName">Paper Name *</Label>
                    <Input
                      id="paperName"
                      placeholder="E.g., Mid-term Mathematics Test"
                      className={errors.paperName ? 'border-destructive' : ''}
                      {...register('paperName')}
                    />
                    {errors.paperName && (
                      <p className="text-sm text-destructive">{errors.paperName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="className">Class/Grade *</Label>
                    <Input
                      id="className"
                      placeholder="E.g., 10th Grade"
                      className={errors.className ? 'border-destructive' : ''}
                      {...register('className')}
                    />
                    {errors.className && (
                      <p className="text-sm text-destructive">{errors.className.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="totalMarks">Total Marks</Label>
                      <div className="relative">
                        <FileDigit className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="totalMarks"
                          type="number"
                          placeholder={selectedQuestions.length > 0 
                            ? selectedQuestions.reduce((sum, q) => sum + q.marks, 0).toString() 
                            : '100'}
                          className={cn(
                            'pl-10',
                            errors.totalMarks ? 'border-destructive' : '',
                            selectedQuestions.length > 0 ? 'bg-muted/50' : ''
                          )}
                          disabled={selectedQuestions.length > 0}
                          {...register('totalMarks', { 
                            valueAsNumber: true,
                            value: selectedQuestions.length > 0 
                              ? selectedQuestions.reduce((sum, q) => sum + q.marks, 0) 
                              : 100
                          })}
                        />
                      </div>
                      {selectedQuestions.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Based on {selectedQuestions.length} selected questions
                        </p>
                      )}
                      {errors.totalMarks && (
                        <p className="text-sm text-destructive">{errors.totalMarks.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timeLimit">Time Limit (hours) *</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="timeLimit"
                          type="number"
                          step="0.5"
                          placeholder="3"
                          className={cn(
                            'pl-10',
                            errors.timeLimit ? 'border-destructive' : ''
                          )}
                          {...register('timeLimit', { valueAsNumber: true })}
                        />
                      </div>
                      {errors.timeLimit && (
                        <p className="text-sm text-destructive">{errors.timeLimit.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Question Bank Upload Section */}
                  <div className="space-y-4 border-t pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="questionBank">Question Bank *</Label>
                      <select
                        id="questionBank"
                        {...register('questionBank')}
                        className={cn(
                          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                          'disabled:cursor-not-allowed disabled:opacity-50',
                          errors.questionBank ? 'border-destructive' : 'border-border'
                        )}
                      >
                        <option value="">Select a question bank</option>
                        {questionBanks.map((bank) => (
                          <option key={bank.id} value={bank.id}>
                            {bank.name}
                          </option>
                        ))}
                      </select>
                      {errors.questionBank && (
                        <p className="text-sm text-destructive">
                          {errors.questionBank.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Question Selection */}
                  <div className="space-y-4 border-t pt-4">
                    <div className="space-y-2">
                      <Label>Questions</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setIsQuestionBankOpen(true)}
                        disabled={!questionBank}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {selectedQuestions.length > 0 
                          ? `Edit Questions (${selectedQuestions.length} selected)` 
                          : 'Select Questions'}
                      </Button>
                      {!questionBank && (
                        <p className="text-xs text-muted-foreground">
                          Please select a question bank first
                        </p>
                      )}
                    </div>
                    
                    {/* Selected Questions Preview */}
                    {selectedQuestions.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Selected Questions ({selectedQuestions.length})</h4>
                        <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                          {selectedQuestions.map((q) => (
                            <div key={q.id} className="text-sm p-2 bg-muted/50 rounded">
                              <div className="flex justify-between">
                                <span className="font-medium">Q: {q.text}</span>
                                <span className="text-muted-foreground">{q.marks} marks</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full mt-4"
                    disabled={selectedQuestions.length === 0}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Generate & Print
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Recent Tests */}
            <div className="space-y-6">
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Recent Test Papers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {testPapers.length > 0 ? (
                      testPapers.map((paper) => (
                        <div
                          key={paper.id}
                          className="flex flex-col p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{paper.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {paper.className} • {paper.totalMarks} marks • {paper.timeLimit} {paper.timeLimit === 1 ? 'hour' : 'hours'}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Created: {paper.createdAt.toLocaleDateString()} • {paper.paperCount} {paper.paperCount === 1 ? 'paper' : 'papers'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  'px-2 py-1 rounded-full text-xs font-medium',
                                  statusVariant[paper.status].bg,
                                  statusVariant[paper.status].text,
                                  statusVariant[paper.status].darkBg,
                                  statusVariant[paper.status].darkText
                                )}
                              >
                                {paper.status.charAt(0).toUpperCase() + paper.status.slice(1)}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadPaper(paper.id)}
                                title="Download Test Paper"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No test papers created yet</p>
                        <p className="text-sm">Create your first test paper to get started</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Help Card */}
              <Card className="bg-muted/50 border-dashed">
                <CardContent className="p-4 text-sm">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <span className="text-primary">💡</span> Tips for Creating Tests
                  </h4>
                  <ul className="space-y-1.5 text-muted-foreground">
                    <li>• Include clear instructions and marking scheme</li>
                    <li>• Review the test before finalizing</li>
                    <li>• Save a digital copy of each test for your records</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ConductTestOffline;
