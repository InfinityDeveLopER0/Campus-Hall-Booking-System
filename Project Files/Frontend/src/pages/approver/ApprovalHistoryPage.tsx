import { useState, useEffect } from "react"; // 1. Import hooks
import Header from "@/components/shared/Header";
import Sidebar from "@/components/shared/Sidebar";
import StatusBadge from "@/components/shared/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/api/api"; // 2. Import API utility
import { toast } from "sonner"; // 3. Import toast

// 4. Define the Booking type
type Booking = {
  id: number;
  event_title: string;
  hall: string;
  start_time: string;
  status: string;
  rejection_reason: string | null;
};

const ApprovalHistoryPage = () => {
  // 5. State for real data
  const [history, setHistory] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 6. Fetch history data
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const response = await api.get<Booking[]>("/bookings/history/");
        setHistory(response.data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
        toast.error("Could not load your review history.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []); // Runs once on page load

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Approval History</h1>
            <p className="text-muted-foreground">View all past approval decisions</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Past Approvals</CardTitle>
              <CardDescription>
                History of all requests you've reviewed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {/* 7. Updated table headers */}
                      <TableHead>Event Title</TableHead>
                      <TableHead>Hall Name</TableHead>
                      <TableHead>Event Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Your Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* 8. Handle Loading state */}
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          Loading history...
                        </TableCell>
                      </TableRow>
                    ) : history.length === 0 ? (
                      // 9. Handle Empty state
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          You have not reviewed any requests yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      // 10. Map over real history data
                      history.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.event_title}</TableCell>
                          <TableCell>{item.hall}</TableCell>
                          <TableCell>
                            {new Date(item.start_time).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={item.status as any} />
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {item.rejection_reason || "N/A (Approved)"}
                          </TableCell>
                        </TableRow>
                      ))
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

export default ApprovalHistoryPage;