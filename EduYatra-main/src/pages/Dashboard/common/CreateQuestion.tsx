import { useState, useRef, useEffect } from 'react';
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Save, Eye, X, Upload, Check, Loader2, Settings, ChevronDown, ChevronUp } from "lucide-react";
import 'katex/dist/katex.min.css';
import { renderKatex, KatexRenderer } from '@/lib/katex-rendering';
import ReactDOMServer from 'react-dom/server';
import { toast } from "sonner";
import { jwtDecode } from 'jwt-decode';
import { API_URL } from "@/config/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

const subjects = ["Mathematics", "Physics", "Chemistry", "Biology"];
const questionSubjects = ["Mathematics", "Physics", "Chemistry", "Biology"];
const questionTypes = ["MCQ", "True/False", "Fill in the Blanks", "Short Answer"];
const difficultyLevels = ["Easy", "Medium", "Hard"];

interface FormData {
  question: string;
  subject: string;
  difficulty: string;
  correctOption: string;
  incorrectOptions: string[];
  image: File | null;
  courseCode: string;
  visibility: 'public' | 'private';
  topic: string;
  isDefault: boolean;
  solution: string;
  questionType: string;
  instituteName: string;
  questionBankName: string;
}

interface ParsedQuestion {
  question: string;
  correctOption: string;
  incorrectOptions: string[];
  solution?: string;
  selected: boolean;
}

const CreateQuestion = () => {
  const [formData, setFormData] = useState<FormData>({
    question: '',
    subject: '',
    difficulty: 'Medium',
    correctOption: '',
    incorrectOptions: ['', '', ''],
    image: null,
    courseCode: '',
    visibility: 'public',
    topic: '',
    isDefault: false,
    solution: '',
    questionType: 'MCQ',
    instituteName: '',
    questionBankName: ''
  });

  const [questionBanks, setQuestionBanks] = useState<string[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [templateText, setTemplateText] = useState('');
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [showParsedQuestions, setShowParsedQuestions] = useState(false);
  const [institutes, setInstitutes] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [includeSolution, setIncludeSolution] = useState(false);

  // Authenticate user and fetch data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("⚠️ Please log in to create a question");
      window.location.href = "/signin";
      return;
    }
    try {
      const decodedToken: { id: string } = jwtDecode(token);
      setUserId(decodedToken.id);
    } catch (error) {
      console.error("Error decoding token:", error);
      toast.error("⚠️ Invalid authentication token");
      window.location.href = "/signin";
    }

    const fetchData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

        const qbResponse = await fetch(`${API_URL}/questions/questionBanks`, { headers });
        const qbResult = await qbResponse.json();
        if (qbResponse.ok) {
          setQuestionBanks(qbResult.questionBanks.map((qb: any) => qb.name));
        }

        const courseResponse = await fetch(`${API_URL}/questions/courses`, { headers });
        const courseResult = await courseResponse.json();
        if (courseResponse.ok) {
          setCourses(courseResult.courses.map((course: any) => course.course_code));
        }

        const instituteResponse = await fetch(`${API_URL}/questions/institutes`, { headers });
        const instituteResult = await instituteResponse.json();
        if (instituteResponse.ok) {
          setInstitutes(instituteResult.institutes.map((institute: any) => institute.name));
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleIncorrectOptionChange = (index: number, value: string) => {
    const newIncorrectOptions = [...formData.incorrectOptions];
    newIncorrectOptions[index] = value;
    setFormData(prev => ({
      ...prev,
      incorrectOptions: newIncorrectOptions
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Parse template text into questions
  const parseTemplate = () => {
    // Don't filter out empty lines yet, we need them as separators
    const allLines = templateText.trim().split('\n');
    
    if (allLines.length === 0) {
      toast.error("❌ Please enter questions in the template");
      return;
    }

    // Validate that main form fields are filled
    if (!formData.subject.trim()) {
      toast.error("❌ Please fill in Subject in the question details!");
      setShowTemplateForm(true);
      return;
    }
    if (!formData.questionBankName.trim()) {
      toast.error("❌ Please fill in Question Bank Name in the question details!");
      setShowTemplateForm(true);
      return;
    }
    if (!formData.courseCode.trim()) {
      toast.error("❌ Please fill in Course Code in the question details!");
      setShowTemplateForm(true);
      return;
    }
    if (!formData.instituteName.trim()) {
      toast.error("❌ Please fill in Institute Name in the question details!");
      setShowTemplateForm(true);
      return;
    }

    const questions: ParsedQuestion[] = [];
    
    if (!includeSolution) {
      // Without solution: exactly 5 lines per question (filter empty lines)
      const lines = allLines.filter(line => line.trim());
      
      if (lines.length % 5 !== 0) {
        toast.error("❌ Invalid format. Each question must have exactly 5 lines:\n1. Question\n2. Correct Answer\n3-5. Three Incorrect Answers");
        return;
      }
      
      for (let i = 0; i < lines.length; i += 5) {
        questions.push({
          question: lines[i],
          correctOption: lines[i + 1],
          incorrectOptions: [lines[i + 2], lines[i + 3], lines[i + 4]],
          selected: true
        });
      }
    } else {
      // With solution: Split by blank lines to separate questions
      const questionBlocks: string[][] = [];
      let currentBlock: string[] = [];
      
      for (const line of allLines) {
        if (line.trim() === '') {
          // Empty line - if we have content, save the block
          if (currentBlock.length > 0) {
            questionBlocks.push(currentBlock);
            currentBlock = [];
          }
        } else {
          currentBlock.push(line);
        }
      }
      
      // Don't forget the last block
      if (currentBlock.length > 0) {
        questionBlocks.push(currentBlock);
      }
      
      if (questionBlocks.length === 0) {
        toast.error("❌ No questions found. Please separate each question with a blank line.");
        return;
      }
      
      // Parse each block
      for (let blockIndex = 0; blockIndex < questionBlocks.length; blockIndex++) {
        const block = questionBlocks[blockIndex];
        
        if (block.length < 6) {
          toast.error(`❌ Question ${blockIndex + 1} is incomplete. Each question needs:\n• Line 1: Question\n• Line 2: Correct answer\n• Lines 3-5: Three incorrect answers\n• Lines 6+: Solution (can be multiple lines)\n\nSeparate each question with a blank line.`);
          return;
        }
        
        const question = block[0];
        const correctOption = block[1];
        const incorrectOptions = [block[2], block[3], block[4]];
        const solutionLines = block.slice(5); // All lines after the 5th line
        
        questions.push({
          question,
          correctOption,
          incorrectOptions,
          solution: solutionLines.join('\n'),
          selected: true
        });
      }
    }

    if (questions.length === 0) {
      toast.error("❌ No valid questions found in the template");
      return;
    }

    setParsedQuestions(questions);
    setShowParsedQuestions(true);
    toast.success(`✅ Parsed ${questions.length} question(s) successfully!`);
  };

  // Toggle selection of a question
  const toggleQuestionSelection = (index: number) => {
    setParsedQuestions(prev => 
      prev.map((q, i) => i === index ? { ...q, selected: !q.selected } : q)
    );
  };

  // Save selected questions directly
  const saveFromTemplate = async () => {
    const selectedQuestions = parsedQuestions.filter(q => q.selected);

    if (selectedQuestions.length === 0) {
      toast.error("❌ Please select at least one question to save");
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("⚠️ Please log in to create questions");
      return;
    }

    setIsSaving(true);
    toast.loading(`Creating ${selectedQuestions.length} question(s)...`, { id: 'saving-template' });

    try {
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < selectedQuestions.length; i++) {
        const q = selectedQuestions[i];
        toast.loading(`Creating question ${i + 1} of ${selectedQuestions.length}...`, { id: 'saving-template' });
        
        const questionData = {
          latex_code: q.question,
          katex_code: ReactDOMServer.renderToString(<>{renderKatex(q.question)}</>),
          subject: formData.subject,
          level: formData.difficulty,
          difficulty_rating: 0,
          correct_option_latex: q.correctOption,
          correct_option_katex: ReactDOMServer.renderToString(<>{renderKatex(q.correctOption)}</>),
          incorrect_option_latex: q.incorrectOptions,
          incorrect_option_katex: q.incorrectOptions.map(option => ReactDOMServer.renderToString(<>{renderKatex(option)}</>)),
          courseCode: formData.courseCode,
          visibility: formData.visibility,
          topic: formData.topic,
          question_type: formData.questionType,
          instituteName: formData.instituteName,
          questionBankName: formData.questionBankName,
          image: '',
          solution_latex: q.solution || '',
          katex_solution: q.solution ? ReactDOMServer.renderToString(<>{renderKatex(q.solution)}</>) : '',
          Sub_topic: '',
          bloom_level: '',
          question_stats: {},
          updated_at: new Date()
        };

        try {
          const response = await fetch(`${API_URL}/questions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(questionData)
          });

          if (response.ok) {
            successCount++;
          } else {
            const errorData = await response.json();
            console.error('Failed to save question:', errorData);
            failCount++;
          }
        } catch (error) {
          console.error('Error saving question:', error);
          failCount++;
        }
      }

      toast.dismiss('saving-template');

      if (successCount > 0) {
        toast.success(`✅ Successfully created ${successCount} question(s)!`);
      }
      if (failCount > 0) {
        toast.error(`❌ Failed to create ${failCount} question(s)`);
      }

      // Close modal and reset
      setIsTemplateModalOpen(false);
      setTemplateText('');
      setParsedQuestions([]);
      setShowParsedQuestions(false);

    } catch (error) {
      console.error("Error saving questions:", error);
      toast.dismiss('saving-template');
      toast.error("❌ Failed to save questions");
    } finally {
      setIsSaving(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error("⚠️ Please log in to create a question");
      return;
    }

    if (!formData.questionBankName.trim()) {
      toast.error("❌ Please enter a question bank name.");
      return;
    }
    if (!formData.courseCode.trim()) {
      toast.error("❌ Please enter a course code.");
      return;
    }
    if (!formData.instituteName.trim()) {
      toast.error("❌ Please enter an institute name.");
      return;
    }

    let imageUrl = "";

    if (formData.image) {
      const imageData = new FormData();
      imageData.append("file", formData.image);
      imageData.append("upload_preset", "ExamZone");

      try {
        const cloudinaryRes = await fetch("https://api.cloudinary.com/v1_1/dxfgcelyx/image/upload", {
          method: "POST",
          body: imageData
        });
        const cloudinaryData = await cloudinaryRes.json();
        imageUrl = cloudinaryData.secure_url;
      } catch (err) {
        toast.error("❌ Failed to upload image to Cloudinary.");
        return;
      }
    }

    const payload = {
      latex_code: formData.question,
      katex_code: ReactDOMServer.renderToString(<>{renderKatex(formData.question)}</>),
      level: formData.difficulty,
      image: imageUrl,
      uploaded_by: userId,
      created_by: userId,
      question_type: formData.questionType,
      correct_option_latex: formData.correctOption,
      correct_option_katex: ReactDOMServer.renderToString(<>{renderKatex(formData.correctOption)}</>),
      incorrect_option_latex: formData.incorrectOptions,
      incorrect_option_katex: formData.incorrectOptions.map(option => ReactDOMServer.renderToString(<>{renderKatex(option)}</>)),
      topic: formData.topic,
      Sub_topic: "",
      bloom_level: "",
      solution_latex: formData.solution,
      katex_solution: ReactDOMServer.renderToString(<>{renderKatex(formData.solution)}</>),
      subject: formData.subject,
      question_stats: {},
      courseCode: formData.courseCode,
      instituteName: formData.instituteName,
      visibility: formData.visibility,
      questionBankName: formData.questionBankName,
      difficulty_rating: 0,
      updated_at: new Date()
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/questions`, {
        method: "POST",
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("✅ Question saved successfully!");
        console.log(result);
        const refreshData = async () => {
          const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
          const qbResponse = await fetch(`${API_URL}/questions/questionBanks`, { headers });
          if (qbResponse.ok) {
            const qbResult = await qbResponse.json();
            setQuestionBanks(qbResult.questionBanks.map((qb: any) => qb.name));
          }
          const courseResponse = await fetch(`${API_URL}/questions/courses`, { headers });
          if (courseResponse.ok) {
            const courseResult = await courseResponse.json();
            setCourses(courseResult.courses.map((course: any) => course.course_code));
          }
          const instituteResponse = await fetch(`${API_URL}/questions/institutes`, { headers });
          if (instituteResponse.ok) {
            const instituteResult = await instituteResponse.json();
            setInstitutes(instituteResult.institutes.map((institute: any) => institute.name));
          }
        };
        await refreshData();
        // Reset only specific Question Details fields, preserving subject and topic
        setFormData(prev => ({
          ...prev,
          question: '',
          difficulty: 'Medium',
          correctOption: '',
          incorrectOptions: ['', '', ''],
          image: null,
          solution: '',
          questionType: 'MCQ'
        }));
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toast.error(`❌ Failed to save question: ${result.error || result.message || 'Unknown error'}`);
      }
    } catch (err: any) {
      toast.error(`⚠️ Error submitting form: ${err.message}`);
    }
  };

  return (
    <Layout>
      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Create Question
            </h1>
            <p className="text-muted-foreground mt-2">Add new questions to your question bank</p>
          </div>
          <Button type="submit" className="bg-gradient-to-r from-primary to-primary/80">
            <Save className="h-4 w-4 mr-2" />
            Save Question
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-effect border-primary/20 animate-scale-in hover-lift">
              <CardHeader>
                <CardTitle>Question Details</CardTitle>
                <CardDescription>Enter the question and its details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="question">Question (LaTeX supported)</Label>
                  <Textarea
                    id="question"
                    name="question"
                    value={formData.question}
                    onChange={handleInputChange}
                    placeholder="Enter your question here..."
                    className="min-h-24 font-mono"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use $...$ for inline LaTeX and $$...$$ for block LaTeX
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select 
                      value={formData.subject}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select 
                      value={formData.difficulty}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        {difficultyLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="questionType">Question Type</Label>
                    <Select 
                      value={formData.questionType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, questionType: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select question type" />
                      </SelectTrigger>
                      <SelectContent>
                        {questionTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic</Label>
                    <Input
                      id="topic"
                      name="topic"
                      value={formData.topic}
                      onChange={handleInputChange}
                      placeholder="Enter topic"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="correctOption">Correct Option (LaTeX supported)</Label>
                    <Textarea
                      id="correctOption"
                      name="correctOption"
                      value={formData.correctOption}
                      onChange={handleInputChange}
                      placeholder="Enter the correct answer..."
                      className="min-h-20 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Incorrect Options (LaTeX supported, min 3)</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          incorrectOptions: [...prev.incorrectOptions, '']
                        }))}
                        className="text-primary"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Option
                      </Button>
                    </div>
                    
                    {formData.incorrectOptions.map((option, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Textarea
                          value={option}
                          onChange={(e) => handleIncorrectOptionChange(index, e.target.value)}
                          placeholder={`Incorrect option ${index + 1}...`}
                          className="flex-1 font-mono min-h-16"
                          required={index < 3}
                        />
                        {formData.incorrectOptions.length > 3 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              incorrectOptions: prev.incorrectOptions.filter((_, i) => i !== index)
                            }))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Image (Optional)</Label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-accent/20 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          SVG, PNG, JPG or GIF (MAX. 5MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                      />
                    </label>
                  </div>
                  {previewUrl && (
                    <div className="mt-2 relative">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="h-32 w-auto rounded-md border"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-white hover:bg-destructive/90"
                        onClick={removeImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="solution">Solution (Optional, LaTeX supported)</Label>
                  <Textarea
                    id="solution"
                    name="solution"
                    value={formData.solution}
                    onChange={handleInputChange}
                    placeholder="Provide a detailed solution..."
                    className="min-h-24 font-mono"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-primary/20">
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>Additional settings for this question</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="courseCode">Course Code</Label>
                    <Input
                      id="courseCode"
                      name="courseCode"
                      value={formData.courseCode}
                      onChange={handleInputChange}
                      placeholder="Enter course code"
                      list="courses"
                      required
                    />
                    <datalist id="courses">
                      {courses.map((code) => (
                        <option key={code} value={code} />
                      ))}
                    </datalist>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="questionBankName">Question Bank Name</Label>
                    <Input
                      id="questionBankName"
                      name="questionBankName"
                      value={formData.questionBankName}
                      onChange={handleInputChange}
                      placeholder="Enter question bank name"
                      list="questionBanks"
                      required
                    />
                    <datalist id="questionBanks">
                      {questionBanks.map((name) => (
                        <option key={name} value={name} />
                      ))}
                    </datalist>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instituteName">Institute Name</Label>
                    <Input
                      id="instituteName"
                      name="instituteName"
                      value={formData.instituteName}
                      onChange={handleInputChange}
                      placeholder="Enter institute name"
                      list="institutes"
                      required
                    />
                    <datalist id="institutes">
                      {institutes.map((name) => (
                        <option key={name} value={name} />
                      ))}
                    </datalist>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-1">
                      <Label htmlFor="visibility">Visibility</Label>
                      <p className="text-xs text-muted-foreground">
                        {formData.visibility === 'public' ? 'Visible to all' : 'Private'}
                      </p>
                    </div>
                    <Switch
                      id="visibility"
                      checked={formData.visibility === 'public'}
                      onCheckedChange={(checked) =>
                        setFormData(prev => ({
                          ...prev,
                          visibility: checked ? 'public' : 'private'
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-1">
                      <Label htmlFor="isDefault">Set as default template</Label>
                      <p className="text-xs text-muted-foreground">
                        {formData.isDefault ? 'Will be used as default' : 'Not set as default'}
                      </p>
                    </div>
                    <Switch
                      id="isDefault"
                      checked={formData.isDefault}
                      onCheckedChange={(checked) =>
                        setFormData(prev => ({
                          ...prev,
                          isDefault: checked
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Save Button at Bottom of Form */}
                <div className="flex justify-end pt-4 border-t">
                  <Button type="submit" className="bg-gradient-to-r from-primary to-primary/80">
                    <Save className="h-4 w-4 mr-2" />
                    Save Question
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="glass-effect border-primary/20 animate-fade-in hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Preview
                </CardTitle>
                <CardDescription>See how your question will appear to students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-background">
                    <h3 className="font-medium mb-2">Question Preview</h3>
                    {formData.question ? (
                      <div className="prose max-w-none">
                        <KatexRenderer>{formData.question}</KatexRenderer>
                        
                        <div className="mt-4 space-y-2">
                          {formData.correctOption && (
                            <div className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                              <span className="text-green-600 dark:text-green-400 font-medium">A.</span>
                              <KatexRenderer>{formData.correctOption}</KatexRenderer>
                            </div>
                          )}
                          
                          {formData.incorrectOptions.map((option, index) => (
                            option && (
                              <div key={index} className="flex items-start gap-2 p-2 border rounded-md">
                                <span className="text-muted-foreground">{String.fromCharCode(66 + index)}.</span>
                                <KatexRenderer>{option}</KatexRenderer>
                              </div>
                            )
                          ))}
                        </div>
                        
                        {formData.solution && (
                          <div className="mt-4 pt-4 border-t">
                            <h4 className="font-medium mb-2">Solution:</h4>
                            <KatexRenderer>{formData.solution}</KatexRenderer>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Your question will appear here as you type...
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    type="button"
                    onClick={() => setIsPreviewModalOpen(true)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Full Screen
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-primary/20 animate-fade-in hover-lift">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common actions for this question</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  type="button"
                  onClick={() => setIsTemplateModalOpen(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import from Template
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Import from Template Modal */}
      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent className={`${showParsedQuestions ? 'max-w-[95vw] max-h-[95vh]' : 'max-w-[90vw] max-h-[95vh]'} overflow-hidden flex flex-col`}>
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Import Questions from Template</DialogTitle>
            <DialogDescription>
              {!showParsedQuestions ? (
                <>
                  Fill in the details below and paste your questions. 
                  {includeSolution ? (
                    <>
                      <br /><strong>With Solution Format:</strong>
                      <br />• <strong>Line 1:</strong> Question text (LaTeX supported)
                      <br />• <strong>Line 2:</strong> Correct answer
                      <br />• <strong>Line 3-5:</strong> Three incorrect answers
                      <br />• <strong>Line 6+:</strong> Solution (can be multiple lines)
                      <br />• <strong>⚠️ Important:</strong> Separate each question with a blank line
                    </>
                  ) : (
                    <>
                      <br /><strong>Without Solution Format:</strong>
                      <br />• <strong>Line 1:</strong> Question text (LaTeX supported)
                      <br />• <strong>Line 2:</strong> Correct answer
                      <br />• <strong>Line 3-5:</strong> Three incorrect answers
                    </>
                  )}
                </>
              ) : (
                <>Review and select questions to import. LaTeX expressions will be rendered.</>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4 flex-1 overflow-y-auto">
            {!showParsedQuestions ? (
              <>
                {/* Include Solution Checkbox */}
                <Card className={`p-4 transition-all duration-200 ${includeSolution ? 'border-primary bg-primary/5' : 'border-muted bg-muted/30'}`}>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="includeSolution"
                      checked={includeSolution}
                      onCheckedChange={(checked) => setIncludeSolution(checked as boolean)}
                      className="h-5 w-5"
                    />
                    <div className="flex-1">
                      <Label htmlFor="includeSolution" className="cursor-pointer font-medium text-base">
                        Include solution in template
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {includeSolution 
                          ? "Each question: 5 lines (Q + CA + 3 IA) + solution lines. Separate questions with a blank line." 
                          : "Each question will have exactly 5 lines (question + correct answer + 3 incorrect answers)"}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Manage Details Button */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setShowTemplateForm(!showTemplateForm)}
                >
                  <span className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Manage Question Details
                  </span>
                  {showTemplateForm ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>

                {/* Template Form Fields - Collapsible - Uses main formData */}
                {showTemplateForm && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg border-2 border-primary/20 animate-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <Label>Subject *</Label>
                      <Select 
                        value={formData.subject}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Difficulty Level *</Label>
                      <Select 
                        value={formData.difficulty}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          {difficultyLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Question Type *</Label>
                      <Select 
                        value={formData.questionType}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, questionType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select question type" />
                        </SelectTrigger>
                        <SelectContent>
                          {questionTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Topic</Label>
                      <Input
                        value={formData.topic}
                        onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                        placeholder="Enter topic"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Course Code *</Label>
                      <Input
                        value={formData.courseCode}
                        onChange={(e) => setFormData(prev => ({ ...prev, courseCode: e.target.value }))}
                        placeholder="Enter course code"
                        list="courses-template"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Question Bank *</Label>
                      <Input
                        value={formData.questionBankName}
                        onChange={(e) => setFormData(prev => ({ ...prev, questionBankName: e.target.value }))}
                        placeholder="Enter question bank name"
                        list="questionBanks-template"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Institute Name *</Label>
                      <Input
                        value={formData.instituteName}
                        onChange={(e) => setFormData(prev => ({ ...prev, instituteName: e.target.value }))}
                        placeholder="Enter institute name"
                        list="institutes-template"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Visibility *</Label>
                      <div className="flex items-center gap-3 h-10">
                        <Button
                          type="button"
                          variant={formData.visibility === 'public' ? 'default' : 'outline'}
                          className="flex-1"
                          onClick={() => setFormData(prev => ({ ...prev, visibility: 'public' }))}
                        >
                          Public
                        </Button>
                        <Button
                          type="button"
                          variant={formData.visibility === 'private' ? 'default' : 'outline'}
                          className="flex-1"
                          onClick={() => setFormData(prev => ({ ...prev, visibility: 'private' }))}
                        >
                          Private
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="template">Paste Questions Here *</Label>
                  <Textarea
                    id="template"
                    placeholder={includeSolution 
                      ? "\\text{Find derivative of } f(x) = x^2 + 3x\n2x + 3\nx^2 + 3\n2x\nx + 3\n\\text{Solution: Using power rule } \\frac{d}{dx}(x^n) = nx^{n-1}:\n\\frac{d}{dx}(x^2 + 3x) = 2x + 3\n\\text{Therefore, } f'(x) = 2x + 3\n\n\\text{Solve } \\int x^2 dx\n\\frac{x^3}{3} + C\nx^3 + C\n\\frac{x^2}{2} + C\n2x + C\n\\text{Solution: Using power rule for integration:}\n\\int x^n dx = \\frac{x^{n+1}}{n+1} + C\n\\text{Therefore, } \\int x^2 dx = \\frac{x^3}{3} + C"
                      : "Solve $\\int x^2 dx$\n$\\frac{x^3}{3} + C$\n$x^3 + C$\n$\\frac{x^2}{2} + C$\n$2x + C$"}
                    value={templateText}
                    onChange={(e) => setTemplateText(e.target.value)}
                    className="min-h-[400px] font-mono text-sm"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsTemplateModalOpen(false);
                      setTemplateText('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={parseTemplate}>
                    <Check className="h-4 w-4 mr-2" />
                    Parse Questions
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col h-full space-y-4">
                  <div className="flex items-center justify-between flex-shrink-0">
                    <h3 className="text-lg font-semibold">
                      Parsed Questions ({parsedQuestions.filter(q => q.selected).length} selected)
                    </h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setShowParsedQuestions(false);
                        setParsedQuestions([]);
                      }}
                    >
                      Edit Template
                    </Button>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                    {parsedQuestions.map((q, index) => (
                      <Card key={index} className={`p-5 ${q.selected ? 'border-primary border-2' : 'border-muted'}`}>
                        <div className="flex items-start gap-4">
                          <Checkbox
                            checked={q.selected}
                            onCheckedChange={() => toggleQuestionSelection(index)}
                            className="mt-1.5 flex-shrink-0"
                          />
                          <div className="flex-1 space-y-4 min-w-0">
                            <div className="space-y-2">
                              <div className="flex items-start gap-2">
                                <span className="font-bold text-base text-primary flex-shrink-0">Q{index + 1}.</span>
                                <div className="font-medium text-base leading-relaxed w-full overflow-x-auto">
                                  <KatexRenderer>{q.question}</KatexRenderer>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2.5 pl-6">
                              <div className="flex items-start gap-3 p-2 bg-green-50 dark:bg-green-950/20 rounded-md border border-green-200 dark:border-green-900">
                                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-green-800 dark:text-green-300 font-medium flex-1 overflow-x-auto">
                                  <KatexRenderer isInline>{q.correctOption}</KatexRenderer>
                                </div>
                              </div>
                              {q.incorrectOptions.map((option, i) => (
                                <div key={i} className="flex items-start gap-3 p-2 bg-muted/30 rounded-md">
                                  <X className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                  <div className="text-sm text-muted-foreground flex-1 overflow-x-auto">
                                    <KatexRenderer isInline>{option}</KatexRenderer>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {q.solution && (
                              <div className="mt-4 pt-4 border-t pl-6">
                                <h4 className="font-medium text-sm mb-2 text-primary">Solution:</h4>
                                <div className="text-sm text-muted-foreground overflow-x-auto">
                                  <KatexRenderer>{q.solution}</KatexRenderer>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="flex gap-2 justify-end pt-4 border-t flex-shrink-0">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsTemplateModalOpen(false);
                        setTemplateText('');
                        setParsedQuestions([]);
                        setShowParsedQuestions(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={saveFromTemplate}
                    disabled={!parsedQuestions.some(q => q.selected) || isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Questions...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Selected ({parsedQuestions.filter(q => q.selected).length})
                      </>
                    )}
                  </Button>
                </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Screen Preview Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Question Preview</DialogTitle>
            <DialogDescription>
              Full screen preview of how the question will appear to students
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-6">
              {formData.question ? (
                <>
                  <div className="p-6 border-2 rounded-lg bg-background">
                    <div className="space-y-6">
                      <div className="prose max-w-none">
                        <h3 className="text-xl font-bold mb-4">Question:</h3>
                        <div className="text-lg leading-relaxed">
                          <KatexRenderer>{formData.question}</KatexRenderer>
                        </div>
                      </div>

                      {previewUrl && (
                        <div className="mt-4">
                          <img 
                            src={previewUrl} 
                            alt="Question" 
                            className="max-w-full h-auto rounded-lg border"
                          />
                        </div>
                      )}

                      <div className="space-y-3 mt-6">
                        <h4 className="text-lg font-semibold mb-3">Options:</h4>
                        
                        {formData.correctOption && (
                          <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border-2 border-green-200 dark:border-green-900">
                            <span className="text-green-600 dark:text-green-400 font-bold text-lg flex-shrink-0">A.</span>
                            <div className="text-base flex-1">
                              <KatexRenderer>{formData.correctOption}</KatexRenderer>
                            </div>
                          </div>
                        )}
                        
                        {formData.incorrectOptions.map((option, index) => (
                          option && (
                            <div key={index} className="flex items-start gap-3 p-4 border-2 rounded-lg bg-muted/30">
                              <span className="text-muted-foreground font-bold text-lg flex-shrink-0">
                                {String.fromCharCode(66 + index)}.
                              </span>
                              <div className="text-base flex-1">
                                <KatexRenderer>{option}</KatexRenderer>
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                      
                      {formData.solution && (
                        <div className="mt-6 pt-6 border-t-2">
                          <h4 className="text-lg font-semibold mb-3">Solution:</h4>
                          <div className="text-base leading-relaxed">
                            <KatexRenderer>{formData.solution}</KatexRenderer>
                          </div>
                        </div>
                      )}

                      <div className="mt-6 pt-6 border-t-2 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-semibold">Subject:</span> {formData.subject || 'Not specified'}
                        </div>
                        <div>
                          <span className="font-semibold">Difficulty:</span> {formData.difficulty}
                        </div>
                        <div>
                          <span className="font-semibold">Question Type:</span> {formData.questionType}
                        </div>
                        <div>
                          <span className="font-semibold">Topic:</span> {formData.topic || 'Not specified'}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-lg text-muted-foreground">
                    No question content to preview. Please fill in the question field.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
            <Button 
              variant="outline" 
              onClick={() => setIsPreviewModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Global Datalists for Template Modal - Must be outside Dialog for browser autocomplete */}
      <datalist id="courses-template">
        {courses.map((code) => (
          <option key={code} value={code} />
        ))}
      </datalist>
      <datalist id="questionBanks-template">
        {questionBanks.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <datalist id="institutes-template">
        {institutes.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
    </Layout>
  );
};

export default CreateQuestion;