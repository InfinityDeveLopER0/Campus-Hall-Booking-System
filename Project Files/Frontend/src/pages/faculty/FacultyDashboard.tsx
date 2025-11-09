import { useState, useEffect } from "react"; // 1. Import hooks
import { useNavigate } from "react-router-dom";
import Header from "@/components/shared/Header";
import Sidebar from "@/components/shared/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle, ArrowRight, FileText } from "lucide-react";
import api from "@/api/api"; // 2. Import our API utility
import { toast } from "sonner"; // 3. Import toast for errors

// 4. Define a simple type for the data we're fetching
type Booking = {
  id: number;
  status: string;
};

// 5. Define a type for our stats state
type DashboardStats = {
  pending: number;
  forwarded: number;
  rejected: number;
};

const FacultyDashboard = () => {
  const navigate = useNavigate();

  // 6. Set up state for loading and the real stats
  const [stats, setStats] = useState<DashboardStats>({ pending: 0, forwarded: 0, rejected: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // 7. Fetch all dashboard data on page load
  useEffect(() => {
    const fetchDashboardStats = async () => {
      setIsLoading(true);
      try {
        // We'll fetch the queue and history at the same time
        const [queueResponse, historyResponse] = await Promise.all([
          api.get<Booking[]>('/bookings/queue/'),
          api.get<Booking[]>('/bookings/history/')
        ]);

        const queueData = queueResponse.data;
        const historyData = historyResponse.data;

        // Process the data to get our counts
        const pendingCount = queueData.length;
        
        // "Forwarded" are all history items that were NOT rejected by this user
        const forwardedCount = historyData.filter(
          (booking) => booking.status !== 'REJECTED'
        ).length;
        
        // "Rejected" are all history items with the REJECTED status
        const rejectedCount = historyData.filter(
          (booking) => booking.status === 'REJECTED'
        ).length;

        setStats({
          pending: pendingCount,
          forwarded: forwardedCount,
          rejected: rejectedCount,
        });

      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        toast.error("Could not load dashboard statistics.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []); // Empty array means this runs once

  // 8. Create the stats array dynamically from our state
  const statsCards = [
    {
      title: "Pending Review",
      value: isLoading ? "..." : stats.pending,
      icon: Clock,
      description: "Awaiting your review",
      color: "text-pending",
      bgColor: "bg-pending/10",
    },
    {
      title: "Forwarded to HOD",
      value: isLoading ? "..." : stats.forwarded,
      icon: ArrowRight,
      description: "Sent for final approval",
      color: "text-approved",
      bgColor: "bg-approved/10",
    },
    {
      title: "Rejected",
      value: isLoading ? "..." : stats.rejected,
      icon: XCircle,
      description: "Declined requests",
      color: "text-rejected",
      bgColor: "bg-rejected/10",
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-foreground mb-2">Faculty Dashboard</h1>
            <p className="text-muted-foreground text-lg">Review booking requests and forward to HOD for approval</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid gap-6 md:grid-cols-3 mb-8 animate-fade-in-up">
            {/* 9. Map over the new dynamic statsCards array */}
            {statsCards.map((stat, index) => (
              <Card key={index} className="hover-lift" style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`${stat.bgColor} p-2 rounded-lg transition-transform group-hover:scale-110`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid gap-6 md:grid-cols-2 animate-scale-in">
            <Card className="cursor-pointer hover-lift group" onClick={() => navigate("/faculty/pending")}>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl group-hover:text-primary transition-colors">
                  <div className="p-2 rounded-lg bg-pending/10 group-hover:bg-pending/20 transition-colors">
                    <Clock className="h-6 w-6 text-pending" />
                  </div>
                  Pending Reviews
                </CardTitle>
                <CardDescription className="text-base">
                  Review and forward pending booking requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  size="lg" 
                  className="w-full"
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  {/* 10. Update button text to be dynamic */}
                  View Pending Requests ({isLoading ? "..." : stats.pending})
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover-lift group" onClick={() => navigate("/faculty/history")}>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl group-hover:text-primary transition-colors">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  Review History
                </CardTitle>
                <CardDescription className="text-base">
                  View your review decisions and forwarded requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full"
                >
                  View History
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FacultyDashboard;