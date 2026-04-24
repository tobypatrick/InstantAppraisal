import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, ArrowUpRight } from "lucide-react";

interface LimitReachedModalProps {
  open: boolean;
  onClose: () => void;
  currentUsage: number;
  limit: number;
  agentName?: string;
}

export function LimitReachedModal({
  open,
  onClose,
  currentUsage,
  limit,
  agentName,
}: LimitReachedModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <AlertDialogTitle className="text-xl">
              Report Limit Reached
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left space-y-4">
            <p>
              {agentName ? `${agentName} has` : "This agent has"} reached their monthly
              report generation limit.
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Reports this month</span>
                <span className="font-medium">
                  {currentUsage} / {limit}
                </span>
              </div>
              <Progress value={100} className="h-2" />
            </div>

            <p className="text-sm text-muted-foreground">
              New reports will be available at the start of next month, or the agent
              can upgrade their plan for a higher limit.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>
            Understood
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
