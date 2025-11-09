import { useState, useEffect, useMemo } from "react"; // 1. Import hooks
import Header from "@/components/shared/Header";
import Sidebar from "@/components/shared/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/shared/StatusBadge";
import { toast } from "sonner"; // 2. Use sonner toast
import { CheckCircle, Search, Calendar, User, Building, XCircle } from "lucide-react"; // 3. Import XCircle
import api from "@/api/api"; // 4. Import API utility

// 5. Define the full Booking type
type Booking = {
  id: number;
  event_title: string;
  hall: string;
  requester: string;
  start_time: string;
  end_time: string;
  status: string;
  faculty_approver: string | null;
  hod_approver: string | null;
  rejection_reason: string | null;
};

const AdminFinalApprovalPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // 6. State for real data
  const [pendingRequests, setPendingRequests] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 7. Fetch data on load
  useEffect(() => {
    const fetchAdminQueue = async () => {
      setIsLoading(true);
      try {
        // When logged in as ADMIN, this returns PENDING_ADMIN requests
        const response = await api.get<Booking[]>("/bookings/queue/");
        setPendingRequests(response.data);
      } catch (error) {
        console.error("Failed to fetch admin queue:", error);
        toast.error("Could not load pending requests.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminQueue();
  }, []);

  // 8. Filter real data
  const filteredRequests = useMemo(() => {
    return pendingRequests.filter(
      (request) =>
        request.event_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.requester.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.hall.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [pendingRequests, searchQuery]);

  // 9. Real Approve function
  const handleApprove = async (id: number, requestId: string) => {
    // Optimistic UI update
    setPendingRequests(prev => prev.filter(req => req.id !== id));
    
    try {
      await api.post(`/bookings/${id}/approve/`);
      toast.success(`Request ${requestId} has been approved successfully.`);
    } catch (error) {
      toast.error("Failed to approve request. It may have been modified.");
      // Re-fetch data to be safe
      api.get<Booking[]>("/bookings/queue/").then(res => setPendingRequests(res.data));
    }
  };
  
  // 10. Real Reject function
  const handleReject = async (id: number, requestId: string) => {
    setPendingRequests(prev => prev.filter(req => req.id !== id));
    try {
      await api.post(`/bookings/${id}/reject/`, { reason: "Final rejection by Admin." });
      toast.error(`Request ${requestId} has been rejected.`);
    } catch (error) {
      toast.error("Failed to reject request.");
      api.get<Booking[]>("/bookings/queue/").then(res => setPendingRequests(res.data));
    }
  };
  
  // 11. Helper to format date/time
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

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6 lg:p-8 animate-fade-in">
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Final Approval
            </h1>
            <p className="text-muted-foreground">
              Review and approve requests verified by HOD
            </p>
          </div>

          {/* 12. Stats cards (some are dynamic, some are mock) */}
          <div className="grid gap-6 md:grid-cols-3 mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Verification
                </CardTitle>
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{isLoading ? "..." : filteredRequests.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Awaiting final approval
                </p>
              </CardContent>
            </Card>
            <Card className="hover-lift" style={{ animationDelay: "0.2s" }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Approved Today (Mock)
                </CardTitle>
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">8</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Completed verifications
                </p>
              </CardContent>
            </Card>
            <Card className="hover-lift" style={{ animationDelay: "0.3s" }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  This Week (Mock)
                </CardTitle>
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">24</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total approvals
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by event, user name, or hall name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-scale-in" style={{ animationDelay: "0.5s" }}>
            <CardHeader>
              <CardTitle>Requests Pending Final Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Hall</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead>HOD</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* 13. Map over real, filtered data */}
                  {isLoading ? (
                    <TableRow><TableCell colSpan={8} className="text-center">Loading...</TableCell></TableRow>
                  ) : filteredRequests.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center">No requests found.</TableCell></TableRow>
                  ) : (
                    filteredRequests.map((request) => {
                      const { date, time } = formatDateTime(request.start_time, request.end_time);
                      return (
                        <TableRow key={request.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium">{request.event_title}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              {request.requester}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              {request.hall}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{date}</div>
                              <div className="text-xs text-muted-foreground">{time}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{request.faculty_approver || "N/A"}</TableCell>
                          <TableCell className="text-sm">{request.hod_approver || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                              {request.status.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(request.id, `REQ-${request.id}`)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(request.id, `REQ-${request.id}`)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default AdminFinalApprovalPage;