import { useState, useMemo, ChangeEvent, useEffect } from "react";
import { Batch, Student } from "@/types/student";
import { BatchAccordion } from "./BatchAccordion";
import { BatchActions } from "./BatchActions";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, UserPlus } from "lucide-react";
import axios from "axios";
import { API_URL } from "@/config/api";

interface Institute {
  _id: string;
  name: string;
}

interface Course {
  _id: string;
  course_code: string;
  name: string;
}

interface InstituteResponse {
  success: boolean;
  institutes: Institute[];
}

interface CourseResponse {
  success: boolean;
  courses: Course[];
}

interface ClassesResponse {
  success: boolean;
  classes: {
    _id: string;
    class_name: string;
    students: {
      _id: string;
      name: string;
      email: string;
      userId: string;
      isSelected: boolean;
    }[];
  }[];
}

interface ClassResponse {
  success: boolean;
  class: {
    _id: string;
    class_name: string;
    students: {
      _id: string;
      name: string;
      email: string;
      userId: string;
      isSelected: boolean;
    }[];
  };
}

export function StudentBatchList() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditStudentDialogOpen, setIsEditStudentDialogOpen] = useState(false);
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [batchName, setBatchName] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [instituteId, setInstituteId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentUserId, setNewStudentUserId] = useState("");
  const [pastedStudentData, setPastedStudentData] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isCreatingBatch, setIsCreatingBatch] = useState(false);
  const [isSavingStudent, setIsSavingStudent] = useState(false);
  const { toast } = useToast();

  // Fetch institutes, courses, and classes on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast({
            title: "Authentication Error",
            description: "Please log in to continue.",
            variant: "destructive",
          });
          return;
        }

        // Fetch institutes
        const institutesResponse = await axios.get<InstituteResponse>(
          `${API_URL}/exams/institutes`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setInstitutes(institutesResponse.data.institutes);

        // Fetch courses
        const coursesResponse = await axios.get<CourseResponse>(
          `${API_URL}/exams/courses`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCourses(coursesResponse.data.courses);

        // Fetch classes
        const classesResponse = await axios.get<ClassesResponse>(
          `${API_URL}/classes`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const classes = classesResponse.data.classes.map((cls) => ({
          id: cls._id,
          name: cls.class_name,
          students: cls.students.map((s) => ({
            id: s._id.toString(),
            name: s.name,
            email: s.email,
            userId: s.userId,
            batchId: cls._id,
            isSelected: s.isSelected,
          })),
          isExpanded: false,
        }));
        setBatches(classes);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.error || "Failed to fetch data.",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [toast]);

  // Filter and search logic
  const filteredBatches = useMemo(() => {
    return batches
      .map(batch => {
        const filteredStudents = batch.students?.filter(
          student =>
            student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.userId.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return { ...batch, students: filteredStudents };
      })
      .filter(batch => {
        if (filter === "withStudents") return batch.students?.length > 0;
        if (filter === "empty") return !batch.students?.length;
        return true;
      });
  }, [batches, searchQuery, filter]);

  // Toggle batch expansion
  const toggleBatch = (batchId: string) => {
    setBatches(prevBatches =>
      prevBatches.map(batch =>
        batch.id === batchId
          ? { ...batch, isExpanded: !batch.isExpanded }
          : batch
      )
    );
  };

  // Handle student selection
  const handleSelectStudent = async (studentId: string, selected: boolean, batchId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to continue.",
          variant: "destructive",
        });
        return;
      }

      await axios.patch(
        `${API_URL}/classes/${batchId}/students/${studentId}`,
        { isSelected: selected },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBatches(prevBatches =>
        prevBatches.map(batch =>
          batch.id === batchId
            ? {
                ...batch,
                students: batch.students?.map(student =>
                  student.id === studentId
                    ? { ...student, isSelected: selected }
                    : student
                ),
              }
            : batch
        )
      );
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update student selection.",
        variant: "destructive",
      });
    }
  };

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    toast({
      title: "Action triggered",
      description: `${action} action for selected students`,
    });
  };

  // Open dialog for new batch
  const handleAddBatch = () => {
    setEditingBatchId(null);
    setBatchName(`Batch ${batches.length + 1}`);
    setInvitationCode(Math.random().toString(36).substring(2, 10));
    setInstituteId("");
    setCourseId("");
    setNewStudentName("");
    setNewStudentEmail("");
    setNewStudentUserId("");
    setPastedStudentData("");
    setUploadedFile(null);
    setIsDialogOpen(true);
  };

  // Open dialog for adding student to existing batch
  const handleAddStudentToBatch = (batchId: string) => {
    setEditingBatchId(batchId);
    setNewStudentName("");
    setNewStudentEmail("");
    setNewStudentUserId("");
    setPastedStudentData("");
    setUploadedFile(null);
    setIsAddStudentDialogOpen(true);
  };

  // Open dialog for editing batch
  const handleEditBatch = (batchId: string, batchName: string) => {
    setEditingBatchId(batchId);
    setBatchName(batchName);
    setInvitationCode("");
    setInstituteId("");
    setCourseId("");
    setNewStudentName("");
    setNewStudentEmail("");
    setNewStudentUserId("");
    setPastedStudentData("");
    setUploadedFile(null);
    setIsDialogOpen(true);
  };

  // Handle file selection
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setUploadedFile(file || null);
  };

  // Add single student
  const addSingleStudent = (students: Student[]) => {
    if (!newStudentName || !newStudentEmail) {
      return students;
    }
    return [
      ...students,
      {
        id: `student-${Date.now()}`,
        name: newStudentName.trim(),
        email: newStudentEmail.trim(),
        userId: newStudentUserId.trim() || undefined,
        batchId: editingBatchId || `batch-${Date.now()}`,
        isSelected: false,
      },
    ];
  };

  // Add students from pasted data
  const addPastedStudents = (students: Student[]) => {
    if (!pastedStudentData) return students;

    const newStudents = pastedStudentData.split('\n').map(line => {
      const [name, email, userId] = line.split(',').map(s => s?.trim());
      if (name && email) {
        return {
          id: `student-${Date.now()}-${Math.random()}`,
          name: name,
          email: email,
          userId: userId || undefined,
          batchId: editingBatchId || `batch-${Date.now()}`,
          isSelected: false,
        } as Student;
      }
      return null;
    }).filter((student): student is Student => student !== null);

    return [...students, ...newStudents];
  };

  // Add students from file
  const addStudentsFromFile = (students: Student[]) => {
    if (!uploadedFile) return Promise.resolve(students);

    return new Promise<Student[]>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const newStudents = text.split('\n').map(line => {
          const [name, email, userId] = line.split(',').map(s => s?.trim());
          if (name && email) {
            return {
              id: `student-${Date.now()}-${Math.random()}`,
              name: name,
              email: email,
              userId: userId || undefined,
              batchId: editingBatchId || `batch-${Date.now()}`,
              isSelected: false,
            } as Student;
          }
          return null;
        }).filter((student): student is Student => student !== null);
        resolve([...students, ...newStudents]);
      };
      reader.readAsText(uploadedFile);
    });
  };

  // Save batch (create or update)
  const saveBatch = async () => {
    if (!batchName || (!editingBatchId && (!invitationCode || !instituteId || !courseId))) {
      toast({
        title: "Invalid input",
        description: "Please fill all required fields (Batch Name, Invitation Code, Institute, and Course)",
        variant: "destructive",
      });
      return;
    }

    let students: Student[] = [];
    // Add single student if name and email are provided (userId is optional)
    if (newStudentName && newStudentEmail) {
      students = addSingleStudent(students);
    }
    students = addPastedStudents(students);
    if (uploadedFile) {
      students = await addStudentsFromFile(students);
    }

    if (students.length === 0 && !editingBatchId) {
      toast({
        title: "No students added",
        description: "Please add at least one student to create a batch",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingBatch(true);
    
    // Show loading toast
    toast({
      title: "Creating batch...",
      description: `Setting up "${batchName}" with ${students.length} student${students.length > 1 ? 's' : ''}. This may take a moment.`,
    });

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to continue.",
          variant: "destructive",
        });
        setIsCreatingBatch(false);
        return;
      }

      if (editingBatchId) {
        toast({
          title: "Not Implemented",
          description: "Batch editing is not supported in the backend yet.",
          variant: "destructive",
        });
        setIsCreatingBatch(false);
      } else {
        // Create new batch
        console.log('🚀 Creating batch with data:', {
          class_name: batchName,
          invitation_code: invitationCode,
          students_count: students.length
        });

        const response = await axios.post<ClassResponse>(
          `${API_URL}/classes/create`,
          {
            class_name: batchName,
            invitation_code: invitationCode,
            institute_id: instituteId,
            course_id: courseId,
            max_students: null,
            students,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('✅ Batch created successfully:', response.data);

        const newClass = response.data.class;
        setBatches(prev => [
          ...prev,
          {
            id: newClass._id,
            name: newClass.class_name,
            students: newClass.students.map((s) => ({
              id: s._id.toString(),
              name: s.name,
              email: s.email,
              userId: s.userId,
              batchId: newClass._id,
              isSelected: s.isSelected,
            })),
            isExpanded: true,
          },
        ]);
        
        toast({
          title: "✅ Batch created successfully!",
          description: `"${batchName}" has been created with ${students.length} student${students.length > 1 ? 's' : ''}. ${students.length > 0 ? 'New student accounts have been created automatically.' : ''}`,
        });
      }

      setIsDialogOpen(false);
      setBatchName("");
      setInvitationCode("");
      setInstituteId("");
      setCourseId("");
      setNewStudentName("");
      setNewStudentEmail("");
      setNewStudentUserId("");
      setPastedStudentData("");
      setUploadedFile(null);
    } catch (error: any) {
      console.error('❌ Error creating batch:', error);
      
      let errorMessage = "Failed to create batch.";
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please check if all required fields are valid and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "❌ Failed to create batch",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsCreatingBatch(false);
    }
  };

  // Save student to existing batch
  const saveStudentToBatch = async () => {
    if (!editingBatchId || (!newStudentName && !pastedStudentData && !uploadedFile)) {
      toast({
        title: "Invalid input",
        description: "Please provide student details",
        variant: "destructive",
      });
      return;
    }

    let students: Student[] = [];
    if (newStudentName && newStudentEmail && newStudentUserId) {
      students = addSingleStudent(students);
    }
    students = addPastedStudents(students);
    if (uploadedFile) {
      students = await addStudentsFromFile(students);
    }

    setIsSavingStudent(true);
    
    toast({
      title: "Adding students...",
      description: `Adding ${students.length} student${students.length > 1 ? 's' : ''} to batch. Please wait...`,
    });

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to continue.",
          variant: "destructive",
        });
        setIsSavingStudent(false);
        return;
      }

      const response = await axios.post(
        `${API_URL}/classes/${editingBatchId}/students`,
        { students },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBatches(prevBatches =>
        prevBatches.map(batch =>
          batch.id === editingBatchId
            ? {
                ...batch,
                students: [
                  ...(batch.students || []),
                  ...students.map(s => ({
                    ...s,
                    id: s.id,
                    batchId: editingBatchId,
                  })),
                ],
              }
            : batch
        )
      );

      toast({
        title: "✅ Students added successfully!",
        description: `Added ${students.length} student${students.length > 1 ? 's' : ''} to batch`,
      });

      setIsAddStudentDialogOpen(false);
      setNewStudentName("");
      setNewStudentEmail("");
      setNewStudentUserId("");
      setPastedStudentData("");
      setUploadedFile(null);
      setEditingBatchId(null);
    } catch (error: any) {
      console.error('❌ Error adding students:', error);
      toast({
        title: "❌ Failed to add students",
        description: error.response?.data?.error || "Failed to add students.",
        variant: "destructive",
      });
    } finally {
      setIsSavingStudent(false);
    }
  };

  // Open edit student dialog
  const handleEditStudent = (batchId: string, student: Student) => {
    setEditingBatchId(batchId);
    setEditingStudent(student);
    setNewStudentName(student.name);
    setNewStudentEmail(student.email);
    setNewStudentUserId(student.userId);
    setIsEditStudentDialogOpen(true);
  };

  // Save edited student
  const saveEditedStudent = async () => {
    if (!newStudentName || !newStudentEmail || !editingStudent || !editingBatchId) {
      toast({
        title: "Invalid input",
        description: "Please fill required fields (Name and Email)",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to continue.",
          variant: "destructive",
        });
        return;
      }

      await axios.patch(
        `${API_URL}/classes/${editingBatchId}/students/${editingStudent.id}`,
        {
          name: newStudentName.trim(),
          email: newStudentEmail.trim(),
          userId: newStudentUserId.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBatches(prevBatches =>
        prevBatches.map(batch =>
          batch.id === editingBatchId
            ? {
                ...batch,
                students: batch.students?.map(student =>
                  student.id === editingStudent.id
                    ? {
                        ...student,
                        name: newStudentName.trim(),
                        email: newStudentEmail.trim(),
                        userId: newStudentUserId.trim(),
                      }
                    : student
                ),
              }
            : batch
        )
      );

      toast({
        title: "Student updated",
        description: `${newStudentName} has been updated.`,
      });

      setIsEditStudentDialogOpen(false);
      setEditingStudent(null);
      setNewStudentName("");
      setNewStudentEmail("");
      setNewStudentUserId("");
      setEditingBatchId(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update student.",
        variant: "destructive",
      });
    }
  };

  // Remove student
  const removeStudent = async (batchId: string, studentId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to continue.",
          variant: "destructive",
        });
        return;
      }

      await axios.delete(`${API_URL}/classes/${batchId}/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBatches(prevBatches =>
        prevBatches.map(batch =>
          batch.id === batchId
            ? {
                ...batch,
                students: batch.students?.filter(student => student.id !== studentId),
              }
            : batch
        )
      );

      toast({
        title: "Student removed",
        description: "Student removed from batch",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to remove student.",
        variant: "destructive",
      });
    }
  };

  // Delete entire batch
  const deleteBatch = async (batchId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to continue.",
          variant: "destructive",
        });
        return;
      }

      const batch = batches.find(b => b.id === batchId);
      console.log(`🗑️ Deleting batch: ${batch?.name} (ID: ${batchId})`);

      await axios.delete(
        `${API_URL}/classes/${batchId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove batch from state
      setBatches(prevBatches => prevBatches.filter(b => b.id !== batchId));

      toast({
        title: "✅ Batch deleted successfully",
        description: `"${batch?.name}" and all its students have been removed.`,
      });

      console.log(`✅ Batch deleted successfully: ${batch?.name}`);
    } catch (error: any) {
      console.error('❌ Error deleting batch:', error);
      toast({
        title: "❌ Failed to delete batch",
        description: error.response?.data?.error || "Failed to delete batch.",
        variant: "destructive",
      });
    }
  };

  // View all students in a batch
  const handleViewAll = (batchId: string) => {
    const batch = batches.find(b => b.id === batchId);
    toast({
      title: `Viewing all students in ${batch?.name}`,
      description: `Showing all ${batch?.students?.length} students.`,
    });
  };

  // Calculate total selected students
  const selectedCount = batches.reduce(
    (count, batch) =>
      count + (batch.students?.filter(s => s.isSelected).length || 0),
    0
  );

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Student Batch Management</h1>
        <p className="text-muted-foreground">
          Manage students and their batch assignments
        </p>
      </div>

      <BatchActions
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddBatch={handleAddBatch}
        onFilterChange={setFilter}
        selectedCount={selectedCount}
        onBulkAction={handleBulkAction}
      />

      <div className="space-y-4">
        {filteredBatches.length > 0 ? (
          filteredBatches.map(batch => (
            <div key={batch.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{batch.name}</h2>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAddStudentToBatch(batch.id)}
                    size="sm"
                    variant="outline"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Student
                  </Button>
                  <Button
                    onClick={() => handleEditBatch(batch.id, batch.name)}
                    size="sm"
                    variant="outline"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => toggleBatch(batch.id)}
                    size="sm"
                    variant="outline"
                  >
                    {batch.isExpanded ? 'Collapse' : 'Expand'}
                  </Button>
                </div>
              </div>

              {batch.isExpanded && (
                <BatchAccordion
                  batch={batch}
                  onToggle={toggleBatch}
                  onEditStudent={handleEditStudent}
                  onSelectStudent={(studentId, selected) => handleSelectStudent(studentId, selected, batch.id)}
                  onViewAll={handleViewAll}
                  onRemoveStudent={removeStudent}
                  onDeleteBatch={deleteBatch}
                />
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery
                ? "No batches or students match your search."
                : "No batches found. Create your first batch to get started."}
            </p>
            {!searchQuery && (
              <Button
                onClick={handleAddBatch}
                className="mt-4"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Batch
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Batch Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBatchId ? 'Edit Batch' : 'Create New Batch'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Batch Name</label>
              <Input
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                placeholder="Enter batch name"
              />
            </div>
            {!editingBatchId && (
              <>
                <div>
                  <label className="text-sm font-medium">Invitation Code</label>
                  <Input
                    value={invitationCode}
                    onChange={(e) => setInvitationCode(e.target.value)}
                    placeholder="Enter invitation code"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Institute</label>
                  <Select value={instituteId} onValueChange={setInstituteId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select institute" />
                    </SelectTrigger>
                    <SelectContent>
                      {institutes.map(institute => (
                        <SelectItem key={institute._id} value={institute._id}>
                          {institute.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Course</label>
                  <Select value={courseId} onValueChange={setCourseId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(course => (
                        <SelectItem key={course._id} value={course._id}>
                          {course.name} ({course.course_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Add Single Student</label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Student Name *"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                />
                <Input
                  placeholder="Email *"
                  type="email"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                />
                <Input
                  placeholder="User ID (optional)"
                  value={newStudentUserId}
                  onChange={(e) => setNewStudentUserId(e.target.value)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                If User ID is not provided, a new student account will be created automatically
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Paste Student Data</label>
              <Textarea
                placeholder="Format: name,email or name,email,userId (one per line)"
                value={pastedStudentData}
                onChange={(e) => setPastedStudentData(e.target.value)}
                className="h-32"
              />
              <p className="text-sm text-muted-foreground">
                Example: John Doe,john@example.com or Jane Smith,jane@example.com,507f1f77bcf86cd799439011
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Upload CSV/TXT File</label>
              <Input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileChange}
              />
              <p className="text-sm text-muted-foreground">
                Format: name,email or name,email,userId (one per line). New accounts will be created for students not in the system.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isCreatingBatch}
            >
              Cancel
            </Button>
            <Button 
              onClick={saveBatch}
              disabled={isCreatingBatch}
            >
              {isCreatingBatch ? (
                <>
                  <span className="mr-2">⏳</span>
                  Creating...
                </>
              ) : (
                editingBatchId ? 'Save Changes' : 'Create Batch'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Student to Existing Batch Dialog */}
      <Dialog open={isAddStudentDialogOpen} onOpenChange={setIsAddStudentDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Student to Batch</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Add Single Student</label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Student Name *"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                />
                <Input
                  placeholder="Email *"
                  type="email"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                />
                <Input
                  placeholder="User ID (optional)"
                  value={newStudentUserId}
                  onChange={(e) => setNewStudentUserId(e.target.value)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                If User ID is not provided, a new student account will be created automatically
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Paste Student Data</label>
              <Textarea
                placeholder="Format: name,email or name,email,userId (one per line)"
                value={pastedStudentData}
                onChange={(e) => setPastedStudentData(e.target.value)}
                className="h-32"
              />
              <p className="text-sm text-muted-foreground">
                Example: John Doe,john@example.com or Jane Smith,jane@example.com,507f1f77bcf86cd799439011
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Upload CSV/TXT File</label>
              <Input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileChange}
              />
              <p className="text-sm text-muted-foreground">
                Format: name,email or name,email,userId (one per line). New accounts will be created for students not in the system.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddStudentDialogOpen(false);
                setNewStudentName("");
                setNewStudentEmail("");
                setNewStudentUserId("");
                setPastedStudentData("");
                setUploadedFile(null);
                setEditingBatchId(null);
              }}
              disabled={isSavingStudent}
            >
              Cancel
            </Button>
            <Button 
              onClick={saveStudentToBatch}
              disabled={isSavingStudent}
            >
              {isSavingStudent ? (
                <>
                  <span className="mr-2">⏳</span>
                  Adding...
                </>
              ) : (
                'Add Students'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={isEditStudentDialogOpen} onOpenChange={setIsEditStudentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Student Name</label>
              <Input
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                placeholder="Enter student name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                value={newStudentEmail}
                onChange={(e) => setNewStudentEmail(e.target.value)}
                placeholder="Enter email"
              />
            </div>
            <div>
              <label className="text-sm font-medium">User ID</label>
              <Input
                value={newStudentUserId}
                onChange={(e) => setNewStudentUserId(e.target.value)}
                placeholder="Enter user ID"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditStudentDialogOpen(false);
                setEditingStudent(null);
                setNewStudentName("");
                setNewStudentEmail("");
                setNewStudentUserId("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={saveEditedStudent}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}