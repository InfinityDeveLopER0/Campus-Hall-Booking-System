import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Building2 } from "lucide-react";
import axios from "axios"; // <-- 1. Import axios

const LoginPage = () => {
  const navigate = useNavigate();
  // Your state variable 'universityId' will be sent as 'username'
  const [universityId, setUniversityId] = useState(""); 
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // --- 2. This is the new API call logic ---
    try {
      // We post to the new endpoint we created in the backend
      const response = await axios.post("http://127.0.0.1:8000/api/login/", {
        username: universityId, // <-- Send 'universityId' as the 'username' field
        password: password,
      });

      // The backend response.data will have { token, user_id, username, role }
      const { token, role, username } = response.data;

      // --- 3. Store the REAL data from the backend ---
      localStorage.setItem("authToken", token);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userName", username);

      toast.success("Login successful!");

      // --- 4. Navigate based on the REAL role from the backend ---
      // These roles (ADMIN, FACULTY, HOD, REQUESTER) come directly
      // from your Django database.
      if (role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (role === "FACULTY") {
        navigate("/faculty/dashboard");
      } else if (role === "HOD") {
        // Your old logic had "Approver", the backend role is "HOD"
        navigate("/approver/dashboard"); 
      } else {
        // Your old logic had "User", the backend role is "REQUESTER"
        navigate("/user/dashboard"); 
      }
    } catch (error) {
      // --- 5. Handle failed logins ---
      console.error("Login failed:", error);
      toast.error("Login failed. Please check your credentials.");
    } finally {
      // --- 6. Always stop loading ---
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Campus Hall Booking</CardTitle>
          <CardDescription>
            Sign in with your university credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="universityId">University ID</Label>
              <Input
                id="universityId"
                type="text"
                placeholder="Enter your university ID"
                value={universityId}
                onChange={(e) => setUniversityId(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;