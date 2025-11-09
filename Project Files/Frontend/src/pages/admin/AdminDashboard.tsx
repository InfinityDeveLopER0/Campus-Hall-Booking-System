import { useState, useEffect } from "react"; // 1. Import hooks
import { useNavigate } from "react-router-dom";
import Header from "@/components/shared/Header";
import Sidebar from "@/components/shared/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, BarChart3, CalendarDays, Clock } from "lucide-react"; // 2. Added Clock icon
import api from "@/api/api"; // 3. Import API utility
import { toast } from "sonner"; // 4. Import toast

// 5. Define minimal types for our data
type Hall = { id: number };
type User = { id: number };
type Booking = {
  id: number;
  status: string;
};

// 6. Define a type for our stats state
type DashboardStats = {
  halls: number;
  users: number;
  bookings: number;
  pending: number;
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  // 7. State for stats and loading
  const [stats, setStats] = useState<DashboardStats>({ halls: 0, users: 0, bookings: 0, pending: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // 8. Fetch all dashboard data
  useEffect(() => {
    const fetchAdminStats = async () => {
      setIsLoading(true);
      try {
        // Fetch all three endpoints at the same time
        const [hallsResponse, usersResponse, bookingsResponse] = await Promise.all([
          api.get<Hall[]>('/halls/'),
          api.get<User[]>('/users/'),
          api.get<Booking[]>('/bookings/') // Admin sees all bookings
        ]);

        const hallsCount = hallsResponse.data.length;
        const usersCount = usersResponse.data.length;
        const bookingsData = bookingsResponse.data;

        // Process booking data
        const totalBookings = bookingsData.length;
        const pendingBookings = bookingsData.filter(
          (b) => b.status.startsWith('PENDING_')
        ).length;

        setStats({
          halls: hallsCount,
          users: usersCount,
          bookings: totalBookings,
          pending: pendingBookings,
        });

      } catch (error) {
        console.error("Failed to load admin dashboard data:", error);
        toast.error("Could not load dashboard statistics.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAdminStats();
  }, []); // Runs once on page load

  // 9. Create the stats cards array dynamically
  const statsCards = [
    { 
      label: "Total Halls", 
      value: isLoading ? "..." : stats.halls, 
      icon: Building2, 
      color: "text-primary" 
    },
    { 
      label: "Registered Users", 
      value: isLoading ? "..." : stats.users, 
      icon: Users, 
      color: "text-primary" 
    },
    { 
      label: "Total Bookings", 
      value: isLoading ? "..." : stats.bookings, 
      icon: CalendarDays, 
      color: "text-primary" 
    },
    { 
      label: "Pending Approvals", 
      value: isLoading ? "..." : stats.pending, 
      icon: Clock, // Changed icon
      color: "text-pending" 
    },
  ];

  // This part of your code was already perfect
  const quickActions = [
    {
      title: "Hall Management",
      description: "Add, edit, or remove halls",
      icon: Building2,
      action: () => navigate("/admin/halls"),
    },
    {
      title: "User Management",
      description: "Manage user accounts and roles",
      icon: Users,
      action: () => navigate("/admin/users"),
    },
    {
      title: "Reports & Analytics",
      description: "View usage statistics and reports",
      icon: BarChart3,
      action: () => navigate("/admin/reports"),
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground text-lg">Manage halls, users, and system settings</p>
          </div>

          <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-fade-in-up">
            {/* 10. Map over the new dynamic statsCards */}
            {statsCards.map((stat, index) => (
              <Card key={stat.label} className="hover-lift" style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                  <div className={`p-2 rounded-lg ${stat.color === 'text-pending' ? 'bg-pending/10' : 'bg-primary/10'}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <h2 className="mb-6 text-2xl font-semibold">Quick Actions</h2>
            <div className="grid gap-6 md:grid-cols-3 animate-scale-in">
              {quickActions.map((action, index) => (
                <Card 
                  key={action.title} 
                  className="hover-lift cursor-pointer group" 
                  onClick={action.action}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl group-hover:text-primary transition-colors">
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <action.icon className="h-6 w-6 text-primary" />
                      </div>
                      {action.title}
                    </CardTitle>
                    <CardDescription className="text-base">{action.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" size="lg">
                      Manage
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;