import { ChevronDown, ChevronRight, Users, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Batch, Student } from "@/types/student";
import { StudentCard } from "./StudentCard";

interface BatchAccordionProps {
  batch: Batch;
  onToggle: (batchId: string) => void;
  onEditStudent: (batchId: string, student: Student) => void;
  onSelectStudent: (studentId: string, selected: boolean) => void;
  onViewAll: (batchId: string) => void;
  onRemoveStudent: (batchId: string, studentId: string) => void;
  onDeleteBatch: (batchId: string) => void;
}

export function BatchAccordion({
  batch,
  onToggle,
  onEditStudent,
  onSelectStudent,
  onViewAll,
  onRemoveStudent,
  onDeleteBatch,
}: BatchAccordionProps) {
  const hasStudents = batch.students && batch.students.length > 0;
  const studentCount = batch.students?.length || 0;

  return (
    <div className="border rounded-lg overflow-hidden mb-4">
      <div 
        className="flex items-center justify-between p-4 bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
        onClick={() => onToggle(batch.id)}
      >
        <div className="flex items-center space-x-3">
          {batch.isExpanded ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          )}
          <h3 className="font-medium">{batch.name}</h3>
          <span className="text-sm text-muted-foreground flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {studentCount} {studentCount === 1 ? 'student' : 'students'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {hasStudents && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewAll(batch.id);
              }}
              className="text-primary hover:text-primary/80"
            >
              View All
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Are you sure you want to delete the batch "${batch.name}" and all its students?`)) {
                onDeleteBatch(batch.id);
              }
            }}
            className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
            title="Delete batch"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {batch.isExpanded && (
        <div className="p-4 bg-background">
          {hasStudents ? (
            <div className="space-y-2">
              {batch.students.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onEdit={() => onEditStudent(batch.id, student)} // Updated to pass batch.id
                  onSelect={onSelectStudent}
                  onRemove={() => onRemoveStudent(batch.id, student.id)}
                />
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-muted-foreground">
              <p>No students in this batch</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}