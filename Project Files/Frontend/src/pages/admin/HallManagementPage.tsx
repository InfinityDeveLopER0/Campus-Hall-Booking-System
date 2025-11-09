import { useState, useEffect } from "react"; // 1. Import hooks
import Header from "@/components/shared/Header";
import Sidebar from "@/components/shared/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import api from "@/api/api"; // 2. Import API utility

// 3. Define the Hall type from our backend
type Hall = {
  id: number;
  name: string;
  capacity: number;
  location: string;
  amenities: string | null;
  image: string | null;
};

// 4. Define the state for the new hall form
type NewHallState = {
  name: string;
  capacity: string; // Keep as string for form input
  location: string;
  amenities: string;
};

const HallManagementPage = () => {
  // 5. State for real data
  const [halls, setHalls] = useState<Hall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newHall, setNewHall] = useState<NewHallState>({
    name: "",
    capacity: "",
    location: "", // Added location
    amenities: "", // Renamed from facilities
  });

  // 6. Fetch all halls on page load
  useEffect(() => {
    const fetchHalls = async () => {
      setIsLoading(true);
      try {
        const response = await api.get<Hall[]>("/halls/");
        setHalls(response.data);
      } catch (error) {
        console.error("Failed to fetch halls:", error);
        toast.error("Could not load halls list.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchHalls();
  }, []);

  // 7. Handle form input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewHall({
      ...newHall,
      [e.target.name]: e.target.value,
    });
  };

  // 8. Real API call to add a hall
  const handleAddHall = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      ...newHall,
      capacity: parseInt(newHall.capacity) || 0, // Convert capacity to number
    };

    try {
      const response = await api.post<Hall>("/halls/", payload);
      setHalls([...halls, response.data]); // Add new hall to the list
      setNewHall({ name: "", capacity: "", location: "", amenities: "" }); // Clear form
      toast.success("Hall added successfully!");
    } catch (error: any) {
      console.error("Failed to add hall:", error);
      const errorMsg = error.response?.data?.name?.[0] || "Please check your input.";
      toast.error(`Failed to add hall: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 9. Real API call to delete a hall
  const handleDeleteHall = async (id: number) => {
    // Optimistic UI update: remove from list immediately
    const originalHalls = [...halls];
    setHalls(halls.filter(hall => hall.id !== id));

    try {
      await api.delete(`/halls/${id}/`);
      toast.success("Hall deleted successfully!");
    } catch (error) {
      console.error("Failed to delete hall:", error);
      toast.error("Failed to delete hall. Please try again.");
      setHalls(originalHalls); // Revert UI if delete fails
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Hall Management</h1>
            <p className="text-muted-foreground">Create, edit, and manage campus halls</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Hall
                </CardTitle>
                <CardDescription>Add a new hall to the system</CardDescription>
              </CardHeader>
              <CardContent>
                {/* 10. Form now uses real state and handler */}
                <form onSubmit={handleAddHall} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Hall Name</Label>
                    <Input
                      id="name"
                      name="name" // Use 'name' for handleChange
                      value={newHall.name}
                      onChange={handleChange}
                      placeholder="e.g., Main Auditorium"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      name="capacity" // Use 'name' for handleChange
                      type="number"
                      value={newHall.capacity}
                      onChange={handleChange}
                      placeholder="e.g., 500"
                      required
                    />
                  </div>
                  {/* 11. Added Location Field */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location" // Use 'name' for handleChange
                      value={newHall.location}
                      onChange={handleChange}
                      placeholder="e.g., Engineering Block, 1st Floor"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    {/* 12. Changed to Amenities */}
                    <Label htmlFor="amenities">Amenities</Label>
                    <Input
                      id="amenities"
                      name="amenities" // Use 'name' for handleChange
                      value={newHall.amenities}
                      onChange={handleChange}
                      placeholder="e.g., WiFi, Projector, AC"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Adding Hall..." : "Add Hall"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Halls</CardTitle>
                <CardDescription>Manage all registered halls</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* 13. Handle Loading/Empty States */}
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                        </TableRow>
                      ) : halls.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">No halls found.</TableCell>
                        </TableRow>
                      ) : (
                        // 14. Map over real halls state
                        halls.map((hall) => (
                          <TableRow key={hall.id}>
                            <TableCell className="font-medium">{hall.name}</TableCell>
                            <TableCell>{hall.capacity}</TableCell>
                            <TableCell>{hall.location}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" disabled>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-rejected hover:bg-rejected hover:text-rejected-foreground"
                                  onClick={() => handleDeleteHall(hall.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HallManagementPage;