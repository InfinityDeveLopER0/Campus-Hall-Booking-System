import { useState, useEffect } from "react"; // 1. Import useEffect
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Header from "@/components/shared/Header";
import Sidebar from "@/components/shared/Sidebar";
import api from "@/api/api"; // 2. Import API utility

// 3. Define a type for the Hall
type Hall = {
  id: number;
  name: string;
};

const BookingFormPage = () => {
  const navigate = useNavigate();
  const { hallId } = useParams();
  const [loading, setLoading] = useState(false);
  const [hall, setHall] = useState<Hall | null>(null); // 4. State for hall details

  const [formData, setFormData] = useState({
    eventTitle: "",
    eventDetails: "",
    date: "",
    startTime: "",
    endTime: "",
    // 5. Removed 'resources' as it's not in our backend model
  });
  
  // 6. Fetch the hall's name to display
  useEffect(() => {
    const fetchHallDetails = async () => {
      try {
        const response = await api.get<Hall>(`/halls/${hallId}/`);
        setHall(response.data);
      } catch (error) {
        console.error("Failed to fetch hall details:", error);
        toast.error("Could not load hall details. Please go back.");
      }
    };
    fetchHallDetails();
  }, [hallId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 7. Combine date and time into ISO-compatible strings
    // Django's DateTimeField can parse this format: YYYY-MM-DDTHH:MM
    const start_time = `${formData.date}T${formData.startTime}`;
    const end_time = `${formData.date}T${formData.endTime}`;

    // 8. Create the payload for the backend
    const payload = {
      event_title: formData.eventTitle,
      event_description: formData.eventDetails,
      start_time: start_time,
      end_time: end_time,
      hall_id: hallId, // The hallId from the URL
    };

    // 9. Real API call
    try {
      await api.post("/bookings/", payload);
      toast.success("Booking request submitted successfully!");
      navigate("/user/status"); // Navigate to the status page
    } catch (error: any) {
      console.error("Booking failed:", error);
      if (error.response && error.response.data) {
        // This will show validation errors from the backend
        // e.g., "This hall is already booked for this time."
        // We'll build this conflict check in the backend later.
        const errorMsg = Object.values(error.response.data).join(" ");
        toast.error(`Submission failed: ${errorMsg}`);
      } else {
        toast.error("Booking request failed. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-2xl">
            <Card>
              <CardHeader>
                {/* 10. Dynamic title */}
                <CardTitle>Book: {hall ? hall.name : "Loading..."}</CardTitle>
                <CardDescription>
                  Fill in the details for your event booking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="eventTitle">Event Title *</Label>
                    <Input
                      id="eventTitle"
                      name="eventTitle"
                      placeholder="Enter event title"
                      value={formData.eventTitle}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eventDetails">Event Details *</Label>
                    <Textarea
                      id="eventDetails"
                      name="eventDetails"
                      placeholder="Describe your event"
                      rows={4}
                      value={formData.eventDetails}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time *</Label>
                      <Input
                        id="startTime"
                        name="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time *</Label>
                      <Input
                        id="endTime"
                        name="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    {/* 11. Removed 'resources' field */}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate("/user/book")}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={loading}
                    >
                      {loading ? "Submitting..." : "Submit Request"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BookingFormPage;