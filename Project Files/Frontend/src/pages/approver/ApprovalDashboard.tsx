import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/shared/Header";
import Sidebar from "@/components/shared/Sidebar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, CheckCircle2, Clock, XCircle, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import api from "@/api/api"; 
import { toast } from "sonner"; 

type Booking = {
  id: number;
  event_title: string;
  hall: string;
  requester: string;
  start_time: string;
  end_time: string;
  status: string;
  rejection_reason: string | null;
};

type DashboardStats = {
  pending: number;
  approved: number;
  rejected: number;
};

const ApprovalDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats>({ pending: 0, approved: 0, rejected: 0 });
  const [pendingRequests, setPendingRequests] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [queueResponse, historyResponse] = await Promise.all([
          api.get<Booking[]>('/bookings/queue/'),
          api.get<Booking[]>('/bookings/history/')
        ]);

        const queueData = queueResponse.data;
        const historyData = historyResponse.data;

        // --- THIS IS THE CORRECTED LOGIC ---
        // "Approved" now means "in your history and not rejected"
        // This will count your 'PENDING_ADMIN' booking.
        const approvedCount = historyData.filter(
          (b) => b.status !== 'REJECTED' 
        ).length;
        
        const rejectedCount = historyData.filter(
          (b) => b.status === 'REJECTED'
        ).length;
        // --- END OF FIX ---

        setPendingRequests(queueData);
        setStats({
          pending: queueData.length,
          approved: approvedCount,
          rejected: rejectedCount,
        });

      } catch (error) {
        console.error("Failed to load HOD dashboard data:", error);
        toast.error("Could not load dashboard statistics.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // Runs once on page load

  // 8. Helper function to format date/time
  const formatDateTime = (isoStart: string, isoEnd: string) => {
    const startDate = new Date(isoStart);
    const endDate = new Date(isoEnd);
    const dateOptions = { year: "numeric", month: "2-digit", day: "2-digit" } as const;
    const timeOptions = { hour: "2-digit", minute: "2-digit", hour12: true } as const;
    return {
      date: startDate.toLocaleDateString(undefined, dateOptions),
      time: `${startDate.toLocaleTimeString(undefined, timeOptions)} - ${endDate.toLocaleTimeString(undefined, timeOptions)}`,
    };
  };
  
  // 9. Create the stats cards dynamically
  const statsCards = [
    {
      title: "Pending Approvals",
      value: isLoading ? "..." : stats.pending,
      icon: Clock,
      description: "Awaiting your review",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Forwarded / Approved", // Renamed for clarity
      value: isLoading ? "..." : stats.approved,
      icon: CheckCircle2,
      description: "Bookings you've acted on",
      color: "text-approved",
      bgColor: "bg-approved/10",
    },
    {
      title: "Total Rejected",
      value: isLoading ? "..." : stats.rejected,
      icon: XCircle,
      description: "Bookings you've rejected",
      color: "text-rejected",
      bgColor: "bg-rejected/10",
    },
    {
      title: "Total Reviewed",
      value: isLoading ? "..." : stats.approved + stats.rejected,
      icon: TrendingUp,
      description: "All requests you've acted on",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  // ... (rest of your return() code is unchanged) ...
  // ... it will now use the correct 'stats' values ...
  
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-foreground mb-2">HOD Approval Dashboard</h1>
            <p className="text-muted-foreground text-lg">Review and manage booking requests forwarded by faculty</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8 animate-fade-in-up">
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
          <div className="grid gap-6 md:grid-cols-2 mb-8 animate-scale-in">
            <Card className="cursor-pointer hover-lift group" onClick={() => navigate("/approver/pending")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl group-hover:text-primary transition-colors">
                  <div className="p-2 rounded-lg bg-pending/10 group-hover:bg-pending/20 transition-colors">
                    <Clock className="h-6 w-6 text-pending" />
                  </div>
                  Pending Requests
                </CardTitle>
                <CardDescription className="text-base">
                  Review {isLoading ? "..." : stats.pending} request(s) forwarded by faculty
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="cursor-pointer hover-lift group" onClick={() => navigate("/approver/history")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl group-hover:text-primary transition-colors">
                  <div className="p-2 rounded-lg bg-approved/10 group-hover:bg-approved/20 transition-colors">
                    <CheckCircle2 className="h-6 w-6 text-approved" />
                  </div>
                  Approval History
                </CardTitle>
                <CardDescription className="text-base">
                  View your past approval decisions and remarks
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Pending Requests Table */}
          <Card className="animate-fade-in-up">
            <CardHeader>
              <CardTitle className="text-2xl">Pending Requests</CardTitle>
              <CardDescription className="text-base">
                {isLoading ? "Loading..." : `${stats.pending} request(s) awaiting your approval`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold">Event Title</TableHead>
                      <TableHead className="font-semibold">Hall</TableHead>
                      <TableHead className="font-semibold">Submitted By</TableHead>
                      <TableHead className="font-semibold">Date & Time</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!isLoading && pendingRequests.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          You have no pending requests to review.
                        </TableCell>
                      </TableRow>
                    )}
                    {pendingRequests.map((request) => {
                      const { date, time } = formatDateTime(request.start_time, request.end_time);
                      return (
                        <TableRow key={request.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium">{request.event_title}</TableCell>
                          <TableCell>{request.hall}</TableCell>
                          <TableCell>{request.requester}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{date}</div>
                              <div className="text-muted-foreground">{time}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {request.status.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => navigate(`/approver/request/${request.id}`)}
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default ApprovalDashboard;