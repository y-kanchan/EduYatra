import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Student } from "@/types/student";
import { Pencil, Trash2 } from "lucide-react";

interface StudentCardProps {
  student: Student;
  onEdit: (student: Student) => void;
  onSelect: (studentId: string, selected: boolean) => void;
  onRemove: () => void; // Added
}

export function StudentCard({ student, onEdit, onSelect, onRemove }: StudentCardProps) {
  return (
    <Card className="mb-2 overflow-hidden hover:bg-accent/50 transition-colors">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <Checkbox 
            checked={student.isSelected} // Removed || false
            onCheckedChange={(checked) => onSelect(student.id, checked as boolean)}
            className="h-5 w-5 rounded"
          />
          <div className="grid gap-1">
            <p className="font-medium">{student.name}</p>
            <p className="text-sm text-muted-foreground">{student.email}</p>
            <p className="text-xs text-muted-foreground">ID: {student.userId}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => onEdit(student)}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Are you sure you want to remove ${student.name} from this batch?`)) {
                onRemove();
              }
            }}
            title="Remove student"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}