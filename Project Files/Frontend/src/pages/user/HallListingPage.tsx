import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Header from "@/components/shared/Header";
import Sidebar from "@/components/shared/Sidebar";
import { Users, Wifi, Monitor, Mic, Calendar as CalendarIcon, Wind, ClipboardPen } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import api from "@/api/api";
import { toast } from "sonner";

// 1. Define the Hall type from our backend
type Hall = {
  id: number;
  name: string;
  capacity: number;
  location: string;
  amenities: string | null;
  image: string | null; // <-- The image URL from the backend
};



const HallListingPage = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const [halls, setHalls] = useState<Hall[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHalls = async () => {
      setIsLoading(true);
      try {
        const response = await api.get<Hall[]>("/halls/");
        setHalls(response.data);
      } catch (error) {
        console.error("Failed to fetch halls:", error);
        toast.error("Could not load available halls.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchHalls();
  }, []);

  const getFacilityIcon = (facility: string) => {
    const facilityLower = facility.trim().toLowerCase();
    switch (facilityLower) {
      case "wifi": return <Wifi className="h-4 w-4" />;
      case "projector": return <Monitor className="h-4 w-4" />;
      case "sound system": return <Mic className="h-4 w-4" />;
      case "whiteboard": return <ClipboardPen className="h-4 w-4" />;
      case "ac": return <Wind className="h-4 w-4" />;
      default: return null;
    }
  };
  
  if (isLoading) {
     return (
       <div className="flex min-h-screen w-full flex-col bg-background">
         <Header />
         <div className="flex flex-1">
           <Sidebar />
           <main className="flex-1 p-6 lg:p-8">Loading halls...</main>
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Available Halls</h1>
            <p className="text-muted-foreground">Browse and select a hall for your event</p>
          </div>

          <div className="mb-6 flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <p className="text-sm text-muted-foreground">
              {selectedDate ? `Showing halls for ${format(selectedDate, "PPP")}` : "Select a date to check availability"}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {halls.map((hall) => {
              const facilities = hall.amenities ? hall.amenities.split(',').map(f => f.trim()) : [];
              
              // 3. Construct the full image URL.
              // If hall.image is null, provide a placeholder.
             const imageUrl = hall.image 
                ? hall.image 
                : "https://via.placeholder.com/400x250.png?text=No+Image";

              return (
                <Card key={hall.id} className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
                  <div className="relative h-48 w-full overflow-hidden">
                    <img 
                      src={imageUrl} // <-- 4. Use the real image URL
                      alt={hall.name}
                      className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle>{hall.name}</CardTitle>
                      {/* We're correctly not showing availability here */}
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Capacity: {hall.capacity} people
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Facilities:</p>
                      <div className="flex flex-wrap gap-2">
                        {facilities.length > 0 ? facilities.map((facility) => (
                          <div
                            key={facility}
                            className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs"
                          >
                            {getFacilityIcon(facility)}
                            {facility}
                          </div>
                        )) : (
                          <p className="text-xs text-muted-foreground">No facilities listed.</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(`/user/booking-form/${hall.id}`)}
                    >
                      Book Hall
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </main>
      </div>
    </div>
  );
};

export default HallListingPage;