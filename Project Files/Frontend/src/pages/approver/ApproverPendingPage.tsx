import { useNavigate } from "react-router-dom";
import Header from "@/components/shared/Header";
import Sidebar from "@/components/shared/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
// Removed Select components, as we don't have priority
import { Eye, MessageSquare, Search, Clock } from "lucide-react";
import { useState, useEffect, useMemo } from "react"; // 1. Import hooks
import api from "@/api/api"; // 2. Import API utility
import { toast } from "sonner"; // 3. Import toast

// 4. Define our Booking type
type Booking = {
  id: number;
  event_title: string;
  hall: string;
  requester: string;
  start_time: string;
  end_time: string;
  status: string;
  faculty_approver: string | null; // This is our "Forwarded By"
  rejection_reason: string | null; // This is our "Remarks" (if rejected)
};

const ApproverPendingPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  // const [priorityFilter, setPriorityFilter] = useState("all"); // Removed priority

  // 5. State for real data
  const [pendingRequests, setPendingRequests] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 6. Fetch data on load
  useEffect(() => {
    const fetchPendingData = async () => {
      setIsLoading(true);
      try {
        // When logged in as HOD, this endpoint is correct!
        const response = await api.get<Booking[]>("/bookings/queue/");
        setPendingRequests(response.data);
      } catch (error) {
        console.error("Failed to fetch pending requests:", error);
        toast.error("Could not load your pending requests.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPendingData();
  }, []);

  // 7. Memoized filtering based on real data
  const filteredRequests = useMemo(() => {
    return pendingRequests.filter((request) => {
      return (
        request.event_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.hall.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requester.toLowerCase().includes(searchTerm.toLowerCase())
      );
      // Removed priority filter
    });
  }, [pendingRequests, searchTerm]);

  // 8. Helper to format date/time
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

  if (isLoading) {
     return ( // Basic loading state
       <div className="flex min-h-screen w-full flex-col bg-background">
         <Header />
         <div className="flex flex-1">
           <Sidebar />
           <main className="flex-1 p-6 lg:p-8">Loading...</main>
         </div>
       </div>
     );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-foreground mb-2">Pending Approvals</h1>
            <p className="text-muted-foreground text-lg">Review booking requests forwarded by faculty advisors</p>
          </div>

          {/* 9. Simplified Stats Card */}
          <div className="grid gap-4 md:grid-cols-4 mb-6 animate-fade-in-up">
            <Card className="hover-lift">
              <CardHeader className="pb-2">
                <CardDescription>Total Pending</CardDescription>
                <CardTitle className="text-3xl">{pendingRequests.length}</CardTitle>
              </CardHeader>
            </Card>
            {/* Removed other priority cards */}
          </div>

          {/* 10. Simplified Filters */}
          <Card className="mb-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <CardHeader>
              <CardTitle className="text-xl">Filter Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by event, hall, or submitter..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {/* Removed Priority Select */}
              </div>
            </CardContent>
          </Card>

          {/* Requests Table */}
          <Card className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <CardHeader>
              <CardTitle className="text-2xl">
                {filteredRequests.length} Request{filteredRequests.length !== 1 ? 's' : ''} Awaiting Review
              </CardTitle>
              <CardDescription className="text-base">
                Click on any request to view details and take action
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      {/* 11. Updated Table Headers */}
                      <TableHead className="font-semibold">Event Title</TableHead>
                      <TableHead className="font-semibold">Hall</TableHead>
                      <TableHead className="font-semibold">Submitted By</TableHead>
                      <TableHead className="font-semibold">Date & Time</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Faculty Remarks</TableHead>
                      <TableHead className="font-semibold">Forwarded By</TableHead>
                      <TableHead className="font-semibold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No pending requests found matching your filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      // 12. Map over real, filtered data
                      filteredRequests.map((request) => {
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
                            <TableCell className="max-w-xs">
                              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                {/* This will only show if faculty REJECTED. We'll fix this later. */}
                                <span className="line-clamp-2">{request.rejection_reason || "N/A"}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{request.faculty_approver || "N/A"}</TableCell>
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
                      })
                    )}
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

export default ApproverPendingPage;