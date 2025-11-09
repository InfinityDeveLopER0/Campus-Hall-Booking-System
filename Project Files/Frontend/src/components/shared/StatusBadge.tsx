import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "Approved" | "Pending" | "Rejected";
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const variants = {
    Approved: "bg-approved text-approved-foreground hover:bg-approved/90",
    Pending: "bg-pending text-pending-foreground hover:bg-pending/90",
    Rejected: "bg-rejected text-rejected-foreground hover:bg-rejected/90",
  };

  return (
    <Badge className={cn(variants[status], className)}>
      {status}
    </Badge>
  );
};

export default StatusBadge;
