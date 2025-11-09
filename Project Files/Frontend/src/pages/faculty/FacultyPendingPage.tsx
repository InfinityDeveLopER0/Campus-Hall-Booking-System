import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; // 1. Import Link
import Header from "@/components/shared/Header";
import Sidebar from "@/components/shared/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/api"; // Make sure this path is correct

// --- 2. Define a type for our booking data ---
// This matches the data coming from our Django Serializer
type Booking = {
  id: number;
  event_title: string;
  hall: string; // This is a string (from StringRelatedField)
  requester: string; // This is a string (from ReadOnlyField)
  start_time: string; // ISO date string
  end_time: string; // ISO date string
  status: string;
};

const FacultyPendingPage = () => {
  const navigate = useNavigate();

  // --- 3. Type our useState hook ---
  const [pendingRequests, setPendingRequests] = useState<Booking[]>([]); // Use the Booking type
  const [isLoading, setIsLoading] = useState(true);

  // Data fetching logic (this was correct)
  useEffect(() => {
    const fetchPendingRequests = async () => {
      setIsLoading(true);
      try {
        const response = await api.get<Booking[]>("/bookings/queue/"); // Expect an array of Bookings
        setPendingRequests(response.data);
      } catch (error) {
        console.error("Failed to fetch pending requests:", error);
        toast.error("Could not load your pending requests.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingRequests();
  }, []); 

  // --- 4. This is the fix for your errors ---
  const formatDateTime = (isoStart: string, isoEnd: string) => {
    const startDate = new Date(isoStart);
    const endDate = new Date(isoEnd);

    // Add 'as const' to tell TypeScript these are literal types, not just strings
    const dateOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    } as const; // <-- FIX 1

    const timeOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    } as const; // <-- FIX 2

    return {
      date: startDate.toLocaleDateString(undefined, dateOptions),
      time: `${startDate.toLocaleTimeString(undefined, timeOptions)} - ${endDate.toLocaleTimeString(undefined, timeOptions)}`,
    };
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6">
            <h1 className="text-3xl font-bold">Loading pending requests...</h1>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Pending Requests</h1>
            <p className="text-muted-foreground">
              Review booking requests and forward to HOD for final approval
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Requests Awaiting Faculty Review</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <p className="text-muted-foreground">You have no pending requests to review.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Title</TableHead>
                      <TableHead>Hall</TableHead>
                      <TableHead>Submitted By</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRequests.map((request) => {
                      // Type safety! We know request is a Booking.
                      const { date, time } = formatDateTime(request.start_time, request.end_time);

                      return (
                        <TableRow key={request.id}>
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
                              {request.status.replace(/_/g, " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/faculty/request/${request.id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default FacultyPendingPage;