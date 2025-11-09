import { Check, Circle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApprovalFlowchartProps {
  currentApprover: string;
  status?: "Approved" | "Pending" | "Rejected";
  className?: string;
}

const ApprovalFlowchart = ({ currentApprover, status = "Pending", className }: ApprovalFlowchartProps) => {
  // Define the fixed approval flow
  const approvalSteps = [
    { role: "Student", label: "Student" },
    { role: "Faculty", label: "Faculty" },
    { role: "HOD", label: "HOD" },
    { role: "Admin", label: "Admin" },
  ];

  // Determine which step is current
  const currentStepIndex = approvalSteps.findIndex(step => 
    currentApprover.toLowerCase().includes(step.role.toLowerCase())
  );

  const getStepStatus = (index: number) => {
    // If status is Approved, all steps are completed
    if (status === "Approved") return "completed";
    
    // If status is Rejected, show where it was rejected
    if (status === "Rejected") {
      if (index < currentStepIndex) return "completed";
      if (index === currentStepIndex) return "rejected";
      return "pending";
    }
    
    // For Pending status
    if (index < currentStepIndex) return "completed";
    if (index === currentStepIndex) return "current";
    return "pending";
  };

  return (
    <div className={cn("flex items-center justify-center gap-2 py-6", className)}>
      {approvalSteps.map((step, index) => {
        const status = getStepStatus(index);
        const isLast = index === approvalSteps.length - 1;

        return (
          <div key={step.role} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "relative flex items-center justify-center w-16 h-16 rounded-full border-2 transition-all duration-300",
                  status === "completed" && "bg-approved border-approved",
                  status === "current" && "bg-pending/20 border-pending animate-pulse",
                  status === "rejected" && "bg-rejected border-rejected",
                  status === "pending" && "bg-muted border-muted"
                )}
              >
                {status === "completed" ? (
                  <Check className="w-8 h-8 text-approved-foreground" />
                ) : status === "rejected" ? (
                  <X className="w-8 h-8 text-rejected-foreground" />
                ) : (
                  <Circle
                    className={cn(
                      "w-8 h-8",
                      status === "current" && "text-pending-foreground",
                      status === "pending" && "text-muted-foreground"
                    )}
                  />
                )}
              </div>
              <p
                className={cn(
                  "mt-2 text-sm font-medium text-center",
                  status === "completed" && "text-approved",
                  status === "current" && "text-pending-foreground font-bold",
                  status === "rejected" && "text-rejected font-bold",
                  status === "pending" && "text-muted-foreground"
                )}
              >
                {step.label}
              </p>
            </div>

            {/* Connector Line */}
            {!isLast && (
              <div
                className={cn(
                  "w-12 h-0.5 mx-2 mb-8",
                  index < currentStepIndex && "bg-approved",
                  index >= currentStepIndex && "bg-muted"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ApprovalFlowchart;
