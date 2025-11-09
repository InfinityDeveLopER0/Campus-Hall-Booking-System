import { useState, useEffect } from "react"; // 1. Import hooks
import Header from "@/components/shared/Header";
import Sidebar from "@/components/shared/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import api from "@/api/api"; // 2. Import API utility
import { toast } from "sonner"; // 3. Import toast

// 4. Define our data types
type Booking = {
  id: number;
  hall: string;
  status: string;
};

type Hall = {
  id: number;
  name: string;
};

// 5. Define a type for our stats
type ReportStats = {
  totalBookings: number;
  approvalRate: number;
};

// --- Mock Data for Charts We Can't Build Yet ---
const eventTypeData = [
  { name: "Workshops", value: 35 },
  { name: "Conferences", value: 25 },
  { name: "Seminars", value: 20 },
  { name: "Meetings", value: 15 },
  { name: "Cultural", value: 5 },
];
const COLORS = ["hsl(220, 70%, 45%)", "hsl(142, 76%, 36%)", "hsl(43, 96%, 56%)", "hsl(0, 84%, 60%)", "hsl(220, 13%, 18%)"];
// --- End of Mock Data ---


const ReportsPage = () => {
  // 6. State for our real data
  const [hallUsageData, setHallUsageData] = useState<{ name: string; bookings: number }[]>([]);
  const [stats, setStats] = useState<ReportStats>({ totalBookings: 0, approvalRate: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // 7. Fetch all data on load
  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true);
      try {
        // Fetch all bookings and all halls
        const [bookingsRes, hallsRes] = await Promise.all([
          api.get<Booking[]>('/bookings/'),
          api.get<Hall[]>('/halls/')
        ]);

        const allBookings = bookingsRes.data;
        const allHalls = hallsRes.data;

        // --- Process Data ---
        
        // 1. Calculate Stats Cards
        const total = allBookings.length;
        const approved = allBookings.filter(b => b.status === 'APPROVED').length;
        const rejected = allBookings.filter(b => b.status === 'REJECTED').length;
        const totalDecided = approved + rejected;
        const rate = totalDecided > 0 ? Math.round((approved / totalDecided) * 100) : 0;
        
        setStats({ totalBookings: total, approvalRate: rate });

        // 2. Calculate Hall Usage (Bar Chart)
        // Count bookings for each hall
        const hallCounts: { [key: string]: number } = {};
        for (const booking of allBookings) {
          hallCounts[booking.hall] = (hallCounts[booking.hall] || 0) + 1;
        }

        // Map counts to the chart format, ensuring all halls are listed
        const usageData = allHalls.map(hall => ({
          name: hall.name,
          bookings: hallCounts[hall.name] || 0 // Default to 0 if no bookings
        }));
        
        setHallUsageData(usageData);

        // 3. Inform user about mocked data
        toast.info("Event Type, Avg. Response Time, and Peak Day are mock data. Backend model needs updating for these features.");

      } catch (error) {
        console.error("Failed to fetch report data:", error);
        toast.error("Could not load report data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, []); // Runs once on page load

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-muted-foreground">Hall usage statistics and event analytics</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Hall Utilization</CardTitle>
                <CardDescription>Number of bookings per hall this month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  {/* 8. Bar Chart now uses real data */}
                  <BarChart data={hallUsageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="bookings" fill="hsl(220, 70%, 45%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Type Distribution (Mock Data)</CardTitle>
                <CardDescription>Breakdown of events by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  {/* 9. Pie Chart is still using mock data */}
                  <PieChart>
                    <Pie
                      data={eventTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {eventTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {/* 10. Stat card now uses real data */}
                <div className="text-2xl font-bold">{isLoading ? "..." : stats.totalBookings}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
              </CardHeader>
              <CardContent>
                {/* 11. Stat card now uses real data */}
                <div className="text-2xl font-bold">{isLoading ? "..." : `${stats.approvalRate}%`}</div>
                <p className="text-xs text-muted-foreground">+2% from last month</p>
              </CardContent>
            </Card>

            {/* 12. These cards are still mock data */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.4h</div>
                <p className="text-xs text-muted-foreground">-0.5h from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Peak Usage Day</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Friday</div>
                <p className="text-xs text-muted-foreground">35 bookings/week</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportsPage;