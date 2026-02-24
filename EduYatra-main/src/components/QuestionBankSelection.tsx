import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { BookOpen, Plus, X, Check, Search } from "lucide-react";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  text: string;
  type: 'mcq' | 'short' | 'long' | 'true_false';
  marks: number;
  selected?: boolean;
}

interface QuestionBank {
  id: string;
  name: string;
  subject: string;
  questions: Question[];
}

interface QuestionBankSelectionProps {
  onSelectQuestions?: (questions: Question[]) => void;
  className?: string;
}

export function QuestionBankSelection({ onSelectQuestions, className }: QuestionBankSelectionProps) {
  // Mock data - in a real app, this would come from an API
  const questionBanks: QuestionBank[] = [
    {
      id: '1',
      name: 'Mathematics - Grade 10',
      subject: 'Mathematics',
      questions: [
        { id: 'q1', text: 'What is the value of π (pi) to two decimal places?', type: 'mcq', marks: 1 },
        { id: 'q2', text: 'Solve for x: 2x + 5 = 15', type: 'short', marks: 2 },
        { id: 'q3', text: 'Prove the Pythagorean theorem.', type: 'long', marks: 5 },
      ],
    },
    {
      id: '2',
      name: 'Science - Grade 9',
      subject: 'Science',
      questions: [
        { id: 'q4', text: 'What is the chemical symbol for water?', type: 'mcq', marks: 1 },
        { id: 'q5', text: 'Explain the process of photosynthesis.', type: 'long', marks: 5 },
      ],
    },
  ];

  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedBank = questionBanks.find(bank => bank.id === selectedBankId);
  
  const filteredQuestions = selectedBank?.questions.filter(q => 
    q.text.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const toggleQuestionSelection = (question: Question) => {
    setSelectedQuestions(prev => {
      const exists = prev.some(q => q.id === question.id);
      if (exists) {
        return prev.filter(q => q.id !== question.id);
      } else {
        return [...prev, { ...question, selected: true }];
      }
    });
  };

  const handleSelectAll = () => {
    if (!selectedBank) return;
    
    const allSelected = selectedBank.questions.every(q => 
      selectedQuestions.some(sq => sq.id === q.id)
    );

    if (allSelected) {
      // Deselect all questions from this bank
      setSelectedQuestions(prev => 
        prev.filter(q => !selectedBank.questions.some(sq => sq.id === q.id))
      );
    } else {
      // Select all questions from this bank
      const newSelections = selectedBank.questions.filter(q => 
        !selectedQuestions.some(sq => sq.id === q.id)
      );
      setSelectedQuestions(prev => [...prev, ...newSelections]);
    }
  };

  const handleDone = () => {
    if (onSelectQuestions) {
      onSelectQuestions(selectedQuestions);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-primary" />
            Select Questions from Question Bank
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Question Bank List */}
            <div className="space-y-2">
              <h3 className="font-medium">Question Banks</h3>
              <ScrollArea className="h-64 rounded-md border p-2">
                <div className="space-y-2">
                  {questionBanks.map((bank) => (
                    <div
                      key={bank.id}
                      onClick={() => setSelectedBankId(bank.id)}
                      className={cn(
                        "p-3 rounded-md cursor-pointer hover:bg-accent transition-colors",
                        selectedBankId === bank.id ? "bg-accent border border-primary" : "border"
                      )}
                    >
                      <div className="font-medium">{bank.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {bank.questions.length} questions • {bank.subject}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Questions List */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">
                  {selectedBank ? selectedBank.name : 'Select a question bank'}
                </h3>
                {selectedBank && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="h-8 text-xs"
                  >
                    {selectedBank.questions.every(q => 
                      selectedQuestions.some(sq => sq.id === q.id)
                    ) ? 'Deselect All' : 'Select All'}
                  </Button>
                )}
              </div>
              
              {selectedBank ? (
                <>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search questions..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <ScrollArea className="h-48 rounded-md border p-2">
                    {filteredQuestions.length > 0 ? (
                      <div className="space-y-2">
                        {filteredQuestions.map((question) => (
                          <div
                            key={question.id}
                            onClick={() => toggleQuestionSelection(question)}
                            className={cn(
                              "p-3 rounded-md cursor-pointer hover:bg-accent transition-colors flex items-start gap-3",
                              selectedQuestions.some(q => q.id === question.id) 
                                ? "bg-accent/50 border border-primary" 
                                : "border"
                            )}
                          >
                            <div className={cn(
                              "h-5 w-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5",
                              selectedQuestions.some(q => q.id === question.id)
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-muted-foreground/30"
                            )}>
                              {selectedQuestions.some(q => q.id === question.id) && (
                                <Check className="h-3.5 w-3.5" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm line-clamp-2">{question.text}</div>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <span className="capitalize">{question.type.replace('_', ' ')}</span>
                                <span>•</span>
                                <span>{question.marks} {question.marks === 1 ? 'mark' : 'marks'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No questions found. Try a different search term.
                      </div>
                    )}
                  </ScrollArea>
                </>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm border rounded-md">
                  Select a question bank to view questions
                </div>
              )}
            </div>
          </div>

          {/* Selected Questions Summary */}
          <div className="pt-2">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium">
                {selectedQuestions.length} {selectedQuestions.length === 1 ? 'question' : 'questions'} selected
              </div>
              <div className="text-sm font-medium">
                Total: {selectedQuestions.reduce((sum, q) => sum + q.marks, 0)} marks
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary/80 transition-all duration-300"
                style={{
                  width: `${Math.min(100, (selectedQuestions.length / 20) * 100)}%`
                }}
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button 
                onClick={handleDone}
                disabled={selectedQuestions.length === 0}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add {selectedQuestions.length > 0 ? `(${selectedQuestions.length})` : ''} to Test
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Questions */}
      {selectedQuestions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                Selected Questions ({selectedQuestions.length})
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedQuestions([])}
                className="text-destructive hover:text-destructive/90"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedQuestions.map((question, index) => (
                <div 
                  key={question.id} 
                  className="p-3 border rounded-md flex justify-between items-start"
                >
                  <div>
                    <div className="font-medium">Q{index + 1}. {question.text}</div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <span className="capitalize">{question.type.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>{question.marks} {question.marks === 1 ? 'mark' : 'marks'}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => toggleQuestionSelection(question)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default QuestionBankSelection;
