import { useState, useEffect } from "react"; // 1. Import hooks
import Header from "@/components/shared/Header";
import Sidebar from "@/components/shared/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/shared/StatusBadge";
import { toast } from "sonner"; // 2. Import toast
import api from "@/api/api"; // 3. Import API utility

// 4. Define the Booking type
type Booking = {
  id: number;
  event_title: string;
  hall: string;
  requester: string;
  status: string;
  rejection_reason: string | null; // This is our "Remarks" field
};

const FacultyHistoryPage = () => {
  // 5. Add state for loading and real data
  const [historyData, setHistoryData] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 6. Fetch data from the new endpoint
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const response = await api.get<Booking[]>("/bookings/history/");
        setHistoryData(response.data);
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
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Review History</h1>
            <p className="text-muted-foreground">
              View all booking requests you have reviewed as Faculty
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Past Faculty Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {/* 7. Add Loading and Empty states */}
              {isLoading ? (
                <p>Loading history...</p>
              ) : historyData.length === 0 ? (
                <p>You have not reviewed any requests yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      {/* 8. Updated headers to match our real data */}
                      <TableHead>Event Title</TableHead>
                      <TableHead>Hall</TableHead>
                      <TableHead>Submitted By</TableHead>
                      <TableHead>Final Status</TableHead>
                      <TableHead>Your Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* 9. Map over real historyData */}
                    {historyData.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.event_title}</TableCell>
                        <TableCell>{record.hall}</TableCell>
                        <TableCell>{record.requester}</TableCell>
                        <TableCell>
                          <StatusBadge status={record.status as any} />
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                          {/* We use rejection_reason as the remarks */}
                          {record.rejection_reason || "N/A (Approved)"}
                        </TableCell>
                      </TableRow>
                    ))}
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

export default FacultyHistoryPage;