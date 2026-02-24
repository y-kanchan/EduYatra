import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, ListFilter } from "lucide-react";

interface BatchActionsProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddBatch: () => void;
  onFilterChange: (value: string) => void;
  selectedCount: number;
  onBulkAction: (action: string) => void;
}

export function BatchActions({
  searchQuery,
  onSearchChange,
  onAddBatch,
  onFilterChange,
  selectedCount,
  onBulkAction,
}: BatchActionsProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search students..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Select onValueChange={onFilterChange}>
          <SelectTrigger className="w-[180px] pl-3">
            <ListFilter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filter by batch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Batches</SelectItem>
            <SelectItem value="withStudents">With Students</SelectItem>
            <SelectItem value="empty">Empty Batches</SelectItem>
          </SelectContent>
        </Select>
        
        <Button onClick={onAddBatch} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Batch
        </Button>
      </div>
      
      {selectedCount > 0 && (
        <div className="flex items-center gap-2 bg-primary/10 p-2 rounded-md">
          <span className="text-sm text-primary">
            {selectedCount} {selectedCount === 1 ? 'student' : 'students'} selected
          </span>
          <Select onValueChange={onBulkAction}>
            <SelectTrigger className="h-8 w-[120px] bg-background">
              <SelectValue placeholder="Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="move">Move to Batch</SelectItem>
              <SelectItem value="export">Export</SelectItem>
              <SelectItem value="remove" className="text-destructive">
                Remove
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
