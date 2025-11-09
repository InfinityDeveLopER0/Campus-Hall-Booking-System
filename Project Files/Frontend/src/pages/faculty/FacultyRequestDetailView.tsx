import { useState, useEffect } from "react"; // 1. Added useEffect
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/shared/Header";
import Sidebar from "@/components/shared/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowRight, XCircle } from "lucide-react";
import api from "@/api/api"; // 2. Import our API utility
import { Badge } from "@/components/ui/badge"; // 3. Added Badge for status

// 4. Define the type for our booking data
type Booking = {
  id: number;
  event_title: string;
  event_description: string;
  hall: string;
  requester: string;
  start_time: string;
  end_time: string;
  status: string;
  created_at: string; // Assuming we add this to the serializer
};

const FacultyRequestDetailView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null); // 5. State for the booking

  // 6. Get user role from localStorage
  const userRole = localStorage.getItem("userRole");

  // 7. Fetch the booking data from the API
  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      try {
        const response = await api.get<Booking>(`/bookings/${id}/`);
        setBooking(response.data);
      } catch (error) {
        console.error("Failed to fetch booking:", error);
        toast.error("Could not load booking details.");
        navigate("/faculty/pending");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id, navigate]);

  // 8. Real API call for Approving (Forwarding)
  const handleApprove = async () => {
    setLoading(true);
    try {
      await api.post(`/bookings/${id}/approve/`);
      toast.success("Request forwarded to HOD for approval!");
      navigate("/faculty/pending"); // Navigate back to the queue
    } catch (error) {
      console.error("Approval failed:", error);
      toast.error("An error occurred during approval.");
      setLoading(false);
    }
  };

  // 9. Real API call for Rejecting
  const handleReject = async () => {
    if (!remarks.trim()) {
      toast.error("Please add remarks explaining the rejection");
      return;
    }

    setLoading(true);
    try {
      // Send the remarks as the 'reason'
      await api.post(`/bookings/${id}/reject/`, { reason: remarks });
      toast.error("Request rejected");
      navigate("/faculty/pending"); // Navigate back to the queue
    } catch (error) {
      console.error("Rejection failed:", error);
      toast.error("An error occurred during rejection.");
      setLoading(false);
    }
  };
  
  // 10. Show loading screen
  if (loading || !booking) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6">
            <h1 className="text-3xl font-bold">Loading...</h1>
          </main>
        </div>
      </div>
    );
  }

  // 11. Check if action can be taken
  const canTakeAction = userRole === 'FACULTY' && booking.status === 'PENDING_FACULTY';

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
                  <div>
                    <CardTitle>Faculty Review - Request Details</CardTitle>
                    <CardDescription>
                      Review the booking request and forward to HOD or reject
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{booking.status.replace(/_/g, ' ')}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
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
                        {new Date(booking.start_time).toLocaleString()} to {new Date(booking.end_time).toLocaleString()}
                      </span>
                    </div>
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
                    {/* Fields like Capacity and Resources are not in our serializer */}
                    {/* We can add them later by nesting the HallSerializer */}
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
                    {/* Fields like Department and Email are not in our serializer */}
                    {/* We can add them later by nesting the UserSerializer */}
                  </div>
                </div>

                <Separator />

                {/* 12. Conditionally show this whole section */}
                {canTakeAction ? (
                  <>
                    <div>
                      <Label htmlFor="remarks" className="text-base font-semibold">
                        Faculty Remarks <span className="text-destructive">*</span>
                      </Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Add your comments or recommendations for the HOD
                      </p>
                      <Textarea
                        id="remarks"
                        placeholder="Enter your remarks here (Required for rejection)"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
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
                        disabled={loading || !remarks.trim()} // Only disable if no remarks
                      >
                        <XCircle className="h-5 w-5" />
                        Reject Request
                      </Button>
                      <Button
                        size="lg"
                        className="flex-1 gap-2 bg-approved hover:bg-approved/90"
                        onClick={handleApprove}
                        disabled={loading} // No remark needed to approve
                      >
                        <ArrowRight className="h-5 w-5" />
                        Forward to HOD
                      </Button>
                    </div>
                  </>
                ) : (
                  <div>
                    <p className="text-base font-semibold text-center text-muted-foreground">
                      This request is no longer awaiting your action.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FacultyRequestDetailView;