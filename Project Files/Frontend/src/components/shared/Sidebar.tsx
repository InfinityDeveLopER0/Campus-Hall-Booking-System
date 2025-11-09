import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  CalendarPlus, 
  ListChecks, 
  CheckCircle, 
  History,
  Building2,
  Users,
  BarChart3,
  ClipboardCheck
} from "lucide-react";
import { cn } from "@/lib/utils";


const Sidebar = () => {
  const userRole = localStorage.getItem("userRole") || "REQUESTER";

  const navItems = {
    REQUESTER: [
      { to: "/user/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/user/book", icon: CalendarPlus, label: "Book Hall" },
      { to: "/user/status", icon: ListChecks, label: "Track Status" },
    ],
    FACULTY: [
      { to: "/faculty/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/faculty/pending", icon: CheckCircle, label: "Pending Approvals" },
      { to: "/faculty/history", icon: History, label: "View History" },
    ],
    HOD: [
      { to: "/approver/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/approver/pending", icon: CheckCircle, label: "Pending Approvals" },
      { to: "/approver/history", icon: History, label: "View History" },
    ],
    ADMIN: [
      { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/admin/final-approval", icon: ClipboardCheck, label: "Final Approval" },
      { to: "/admin/halls", icon: Building2, label: "Hall Management" },
      { to: "/admin/users", icon: Users, label: "User Management" },
      { to: "/admin/reports", icon: BarChart3, label: "Reports" },
    ],
  };

  const links = navItems[userRole as keyof typeof navItems] || navItems.REQUESTER;

  return (
    <aside className="w-64 border-r bg-sidebar">
      <nav className="flex flex-col gap-1 p-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )
            }
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
