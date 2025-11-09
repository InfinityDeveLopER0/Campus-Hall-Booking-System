import Header from "@/components/shared/Header";
import Sidebar from "@/components/shared/Sidebar";
import StatusBadge from "@/components/shared/StatusBadge";
import ApprovalFlowchart from "@/components/shared/ApprovalFlowchart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react"; // 1. Import hooks
import api from "@/api/api"; // 2. Import API utility
import { toast } from "sonner"; // 3. Import toast

// 4. Define the complete Booking type from our API
type Booking = {
  id: number;
  event_title: string;
  hall: string;
  start_time: string;
  end_time: string;
  status: string;
  requester: string;
  faculty_approver: string | null;
  hod_approver: string | null;
  admin_approver: string | null;
  rejection_reason: string | null;
};

const StatusTrackerPage = () => {
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  
  // 5. State for real data
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const toggleRow = (id: number) => {
    setExpandedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  // 6. Fetch all bookings for this user
  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        // This endpoint automatically returns *only* this user's bookings
        const response = await api.get<Booking[]>("/bookings/");
        setBookings(response.data);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
        toast.error("Could not load your booking history.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, []); // Runs once on page load

  // 7. Helper function to format date/time
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

  // 8. Helper function to determine who the "current approver" is
  const getCurrentApprover = (booking: Booking): string => {
    switch (booking.status) {
      case 'PENDING_FACULTY':
        return "Faculty";
      case 'PENDING_HOD':
        return "HOD";
      case 'PENDING_ADMIN':
        return "Admin";
      case 'APPROVED':
        return booking.admin_approver || "System";
      case 'REJECTED':
        // Show the name of whoever rejected it
        return booking.admin_approver || booking.hod_approver || booking.faculty_approver || 'System';
      default:
        return "N/A";
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Track Booking Status</h1>
            <p className="text-muted-foreground">View all your booking requests and their current status</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>My Bookings</CardTitle>
              <CardDescription>
                A complete list of all your hall booking requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Title</TableHead>
                      <TableHead>Hall Name</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Current Stage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* 9. Handle Loading state */}
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          Loading your bookings...
                        </TableCell>
                      </TableRow>
                    ) : bookings.length === 0 ? (
                      // 10. Handle Empty state
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          You have not made any bookings yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      // 11. Map over real bookings data
                      bookings.map((booking) => {
                        const { date, time } = formatDateTime(booking.start_time, booking.end_time);
                        const currentApprover = getCurrentApprover(booking);

                        return (
                          <Collapsible
                            key={booking.id}
                            open={expandedRows.includes(booking.id)}
                            onOpenChange={() => toggleRow(booking.id)}
                            asChild
                          >
                            <>
                              <TableRow className="cursor-pointer hover:bg-muted/50">
                                <TableCell className="font-medium">{booking.event_title}</TableCell>
                                <TableCell>{booking.hall}</TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <div>{date}</div>
                                    <div className="text-muted-foreground">{time}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <StatusBadge status={booking.status as any} />
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  <div className="flex items-center justify-between">
                                    <span>{currentApprover}</span>
                                    <CollapsibleTrigger asChild>
                                      <ChevronDown
                                        className={`w-4 h-4 ml-2 transition-transform ${
                                          expandedRows.includes(booking.id) ? "rotate-180" : ""
                                        }`}
                                      />
                                    </CollapsibleTrigger>
                                  </div>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell colSpan={5} className="p-0">
                                  <CollapsibleContent>
                                    <div className="bg-accent/30 border-t border-border">
                                      {/* 12. Pass real data to the flowchart */}
                                      <ApprovalFlowchart 
                                        currentApprover={currentApprover} 
                                        status={booking.status as any}
                                      />
                                    </div>
                                  </CollapsibleContent>
                                </TableCell>
                              </TableRow>
                            </>
                          </Collapsible>
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

export default StatusTrackerPage;