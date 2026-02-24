import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface TestInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTest: () => void;
  testName: string;
  duration: string;
  totalQuestions: number;
  maxMarks: number;
  instructions?: string; // Teacher's custom instructions
}

export function TestInstructionsModal({
  isOpen,
  onClose,
  onStartTest,
  testName,
  duration,
  totalQuestions,
  maxMarks,
  instructions,
}: TestInstructionsModalProps) {
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      onStartTest();
    }
    return () => clearTimeout(timer);
  }, [countdown, onStartTest]);

  const handleProceed = () => {
    setCountdown(15); // Start 15-second countdown
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-primary">
            {testName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {instructions ? (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Instructions</h3>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 p-4 rounded-md">
                {instructions}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Instructions</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                <li>Total duration of the test is {duration} minutes.</li>
                <li>The test contains {totalQuestions} questions.</li>
                <li>Maximum marks for this test are {maxMarks}.</li>
                <li>Do not refresh the page or close the browser during the test.</li>
                <li>Use the navigation buttons to move between questions.</li>
              </ul>
            </div>
          )}

          {countdown !== null ? (
            <div className="text-center py-6">
              <div className="text-4xl font-bold text-primary">{countdown}</div>
              <p className="text-muted-foreground mt-2">Test will start in...</p>
            </div>
          ) : (
            <div className="flex justify-center gap-4 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleProceed} className="bg-gradient-to-r from-primary to-primary/80">
                I'm Ready - Start Test
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
