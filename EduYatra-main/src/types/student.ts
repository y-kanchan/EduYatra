export interface Student {
  id: string;
  name: string;
  email: string;
  userId?: string; // Optional - will be created automatically if not provided
  batchId: string;
  isSelected: boolean; // Changed to required
}

export interface Batch {
  id: string;
  name: string;
  students: Student[];
  isExpanded?: boolean;
}