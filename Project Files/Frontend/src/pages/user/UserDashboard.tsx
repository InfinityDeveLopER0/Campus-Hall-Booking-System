import { useState, useEffect } from "react"; // 1. Import hooks
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarPlus, ListChecks, Clock, CheckCircle2, XCircle } from "lucide-react";
import Header from "@/components/shared/Header";
import Sidebar from "@/components/shared/Sidebar";
import api from "@/api/api"; // 2. Import API utility
import { toast } from "sonner"; // 3. Import toast

// 4. Define the Booking type
type Booking = {
  id: number;
  status: string;
  // We only need the status for this page
};

// 5. Define the type for our stats
type DashboardStats = {
  pending: number;
  approved: number;
  rejected: number;
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "User";

  // 6. Set up state for loading and stats
  const [stats, setStats] = useState<DashboardStats>({ pending: 0, approved: 0, rejected: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // 7. Fetch all of the user's bookings
  useEffect(() => {
    const fetchUserStats = async () => {
      setIsLoading(true);
      try {
        // This endpoint automatically returns *only* this user's bookings
        const response = await api.get<Booking[]>('/bookings/');
        const userBookings = response.data;

        // Process the bookings to get counts
        let pending = 0;
        let approved = 0;
        let rejected = 0;

        userBookings.forEach(booking => {
          if (booking.status === 'APPROVED') {
            approved++;
          } else if (booking.status === 'REJECTED') {
            rejected++;
          } else {
            // Anything else (PENDING_FACULTY, PENDING_HOD, etc.) is 'Pending'
            pending++;
          }
        });

        setStats({ pending, approved, rejected });

      } catch (error) {
        console.error("Failed to load user dashboard data:", error);
        toast.error("Could not load your dashboard statistics.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStats();
  }, []); // Runs once on page load

  // 8. Create the stats array dynamically
  const statsCards = [
    { 
      label: "Pending Bookings", 
      value: isLoading ? "..." : stats.pending, 
      icon: Clock, 
      color: "text-pending" 
    },
    { 
      label: "Approved Bookings", 
      value: isLoading ? "..." : stats.approved, 
      icon: CheckCircle2, 
      color: "text-approved" 
    },
    { 
      label: "Rejected Bookings", 
      value: isLoading ? "..." : stats.rejected, 
      icon: XCircle, 
      color: "text-rejected" 
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-foreground mb-2">Welcome, {userName}!</h1>
            <p className="text-muted-foreground text-lg">Manage your hall bookings and track their status</p>
          </div>

          <div className="mb-8 grid gap-6 md:grid-cols-3 animate-fade-in-up">
            {/* 9. Map over the dynamic stats cards */}
            {statsCards.map((stat, index) => (
              <Card key={stat.label} className="hover-lift" style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                  <div className={`p-2 rounded-lg bg-${stat.color.replace('text-', '')}/10`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:gap-8 animate-scale-in">
            <Card className="border-primary/20 hover-lift cursor-pointer group" onClick={() => navigate("/user/book")}>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl group-hover:text-primary transition-colors">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <CalendarPlus className="h-6 w-6 text-primary" />
                  </div>
                  New Booking
                </CardTitle>
                <CardDescription className="text-base">
                  Book a hall for your upcoming event
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full"
                  size="lg"
                >
                  Book a Hall
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary/20 hover-lift cursor-pointer group" onClick={() => navigate("/user/status")}>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl group-hover:text-primary transition-colors">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <ListChecks className="h-6 w-6 text-primary" />
                  </div>
                  Track Status
                </CardTitle>
                <CardDescription className="text-base">
                  View and track all your booking requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  size="lg"
                >
                  View My Bookings
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;