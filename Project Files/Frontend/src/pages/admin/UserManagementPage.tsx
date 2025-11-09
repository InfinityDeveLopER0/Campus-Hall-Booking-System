import { useState, useEffect, useMemo } from "react";
import Header from "@/components/shared/Header";
import Sidebar from "@/components/shared/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Pencil } from "lucide-react";
import api from "@/api/api";
import { toast } from "sonner";

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
};

const UserManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await api.get<User[]>("/users/");
        setUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error("Could not load user list.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN": return "bg-primary text-primary-foreground";
      case "HOD": return "bg-approved text-approved-foreground";
      case "FACULTY": return "bg-yellow-500 text-yellow-900";
      default: return "bg-secondary text-secondary-foreground"; // REQUESTER
    }
  };

  const handleAddUser = () => {
    window.open('http://127.0.0.1:8000/admin/booking_api/user/add/', '_blank');
  };
  
  // --- NEW FUNCTION FOR EDIT ---
  const handleEditUser = (userId: number) => {
    // Dynamically creates the correct admin URL for the user
    window.open(`http://127.0.0.1:8000/admin/booking_api/user/${userId}/change/`, '_blank');
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground">Manage user accounts and roles</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>
                    {isLoading ? "Loading..." : `${filteredUsers.length} registered users`}
                  </CardDescription>
                </div>
                <Button className="gap-2" onClick={handleAddUser}>
                  <UserPlus className="h-4 w-4" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name (Username)</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                       <TableRow>
                         <TableCell colSpan={4} className="text-center">Loading users...</TableCell>
                       </TableRow>
                    ) : filteredUsers.length === 0 ? (
                       <TableRow>
                         <TableCell colSpan={4} className="text-center">No users found.</TableCell>
                       </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge className={getRoleBadgeColor(user.role)}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {/* --- THIS BUTTON IS NOW FIXED --- */}
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleEditUser(user.id)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
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

export default UserManagementPage;