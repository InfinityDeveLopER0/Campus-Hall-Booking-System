import { useState, useEffect } from "react"; // 1. Import hooks
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/shared/Header";
import Sidebar from "@/components/shared/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { CheckCircle2, XCircle, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea"; // 2. Import Textarea
import { Label } from "@/components/ui/label"; // 3. Import Label
import api from "@/api/api"; // 4. Import API utility

// 5. Define the Booking type (it has faculty_approver now)
type Booking = {
  id: number;
  event_title: string;
  event_description: string;
  hall: string;
  requester: string;
  start_time: string;
  end_time: string;
  status: string;
  faculty_approver: string | null; // The faculty who approved
  rejection_reason: string | null; // The faculty's remarks (if they rejected)
};

const RequestDetailView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null); // 6. State for booking
  const [hodRemarks, setHodRemarks] = useState(""); // 7. State for HOD's remarks

  // 8. Get user role
  const userRole = localStorage.getItem("userRole");

  // 9. Fetch the booking data
  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      try {
        const response = await api.get<Booking>(`/bookings/${id}/`);
        setBooking(response.data);
      } catch (error) {
        console.error("Failed to fetch booking:", error);
        toast.error("Could not load booking details.");
        navigate("/approver/pending");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id, navigate]);

  // 10. Real Approve API call
  const handleApprove = async () => {
    setLoading(true);
    try {
      await api.post(`/bookings/${id}/approve/`);
      toast.success("Request approved successfully!");
      navigate("/approver/dashboard");
    } catch (error) {
      console.error("Approval failed:", error);
      toast.error("An error occurred during approval.");
      setLoading(false);
    }
  };

  // 11. Real Reject API call
  const handleReject = async () => {
    if (!hodRemarks.trim()) {
      toast.error("Please add your remarks explaining the rejection");
      return;
    }
    setLoading(true);
    try {
      await api.post(`/bookings/${id}/reject/`, { reason: hodRemarks });
      toast.error("Request rejected");
      navigate("/approver/dashboard");
    } catch (error) {
      console.error("Rejection failed:", error);
      toast.error("An error occurred during rejection.");
      setLoading(false);
    }
  };

  if (loading || !booking) {
    return ( // Loading state
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6">Loading...</main>
        </div>
      </div>
    );
  }

  // 12. Check if HOD can take action
  const canTakeAction = userRole === 'HOD' && booking.status === 'PENDING_HOD';

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-3xl">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>HOD Review - Request Details</CardTitle>
                  <Badge variant="outline">{booking.status.replace(/_/g, ' ')}</Badge>
                </div>
                <CardDescription>
                  Review the booking request forwarded by faculty and take final action
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* 13. Faculty Remarks - now using real data */}
                <Alert className="border-approved bg-approved/10">
                  <MessageSquare className="h-5 w-5 text-approved" />
                  <AlertTitle className="text-approved font-semibold">
                    Faculty Recommendation
                  </AlertTitle>
                  <AlertDescription className="mt-2 space-y-2">
                    <p className="text-foreground">
                      {/* We show rejection_reason if faculty rejected, otherwise a default message */}
                      {booking.rejection_reason || "Faculty reviewed and forwarded for HOD approval."}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
                      <span>Forwarded by: <strong>{booking.faculty_approver || "N/A"}</strong></span>
                    </div>
                  </AlertDescription>
                </Alert>

                <div>
                  <h3 className="mb-4 text-lg font-semibold">Event Information</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="font-medium text-muted-foreground">Event Title:</span>
                      <span className="col-span-2">{booking.event_title}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="font-medium text-muted-foreground">Description:</span>
                      <span className="col-span-2">{booking.event_description}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="font-medium text-muted-foreground">Time:</span>
                      <span className="col-span-2">
                        {new Date(booking.start_time).toLocaleString()} - {new Date(booking.end_time).toLocaleString()}
                      </span>
                    </div>
                    {/* Removed Priority and Resources as they are not in our data model */}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-4 text-lg font-semibold">Hall Information</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="font-medium text-muted-foreground">Hall Name:</span>
                      <span className="col-span-2">{booking.hall}</span>
                    </div>
                    {/* Removed Capacity */}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-4 text-lg font-semibold">Requester Information</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="font-medium text-muted-foreground">Name:</span>
                      <span className="col-span-2">{booking.requester}</span>
                    </div>
                    {/* Removed Department, Email, Submitted On */}
                  </div>
                </div>

                <Separator />

                {/* 14. Show actions only if HOD can act */}
                {canTakeAction ? (
                  <>
                    <div>
                      <Label htmlFor="remarks" className="text-base font-semibold">
                        HOD Remarks <span className="text-destructive">*</span>
                      </Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Add your final remarks (Required for rejection)
                      </p>
                      <Textarea
                        id="remarks"
                        placeholder="Enter your remarks here..."
                        value={hodRemarks}
                        onChange={(e) => setHodRemarks(e.target.value)}
                        rows={4}
                        className="resize-none"
                      />
                    </div>
                    <Separator />
                    <div className="flex gap-4 pt-4">
                      <Button
                        variant="outline"
                        size="lg"
                        className="flex-1 gap-2 border-rejected text-rejected hover:bg-rejected hover:text-rejected-foreground"
                        onClick={handleReject}
                        disabled={loading || !hodRemarks.trim()} // Must provide remarks to reject
                      >
                        <XCircle className="h-5 w-5" />
                        Reject Request
                      </Button>
                      <Button
                        size="lg"
                        className="flex-1 gap-2 bg-approved hover:bg-approved/90"
                        onClick={handleApprove}
                        disabled={loading}
                      >
                        <CheckCircle2 className="h-5 w-5" />
                        Approve Request
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-base font-semibold text-center text-muted-foreground">
                    This request is no longer awaiting your action.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RequestDetailView;