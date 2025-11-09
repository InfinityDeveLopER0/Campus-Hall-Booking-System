import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import LoginPage from "./pages/auth/LoginPage";
import UserDashboard from "./pages/user/UserDashboard";
import HallListingPage from "./pages/user/HallListingPage";
import BookingFormPage from "./pages/user/BookingFormPage";
import StatusTrackerPage from "./pages/user/StatusTrackerPage";
import ApprovalDashboard from "./pages/approver/ApprovalDashboard";
import ApproverPendingPage from "./pages/approver/ApproverPendingPage";
import RequestDetailView from "./pages/approver/RequestDetailView";
import ApprovalHistoryPage from "./pages/approver/ApprovalHistoryPage";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import FacultyPendingPage from "./pages/faculty/FacultyPendingPage";
import FacultyRequestDetailView from "./pages/faculty/FacultyRequestDetailView";
import FacultyHistoryPage from "./pages/faculty/FacultyHistoryPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminFinalApprovalPage from "./pages/admin/AdminFinalApprovalPage";
import HallManagementPage from "./pages/admin/HallManagementPage";
import UserManagementPage from "./pages/admin/UserManagementPage";
import ReportsPage from "./pages/admin/ReportsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* REQUESTER Routes */}
          <Route path="/user/dashboard" element={<ProtectedRoute allowedRoles={['REQUESTER']}><UserDashboard /></ProtectedRoute>} />
          <Route path="/user/book" element={<ProtectedRoute allowedRoles={['REQUESTER']}><HallListingPage /></ProtectedRoute>} />
          <Route path="/user/booking-form/:hallId" element={<ProtectedRoute allowedRoles={['REQUESTER']}><BookingFormPage /></ProtectedRoute>} />
          <Route path="/user/status" element={<ProtectedRoute allowedRoles={['REQUESTER']}><StatusTrackerPage /></ProtectedRoute>} />
          
          {/* HOD Routes */}
          <Route path="/approver/dashboard" element={<ProtectedRoute allowedRoles={['HOD']}><ApprovalDashboard /></ProtectedRoute>} />
          <Route path="/approver/pending" element={<ProtectedRoute allowedRoles={['HOD']}><ApproverPendingPage /></ProtectedRoute>} />
          <Route path="/approver/request/:id" element={<ProtectedRoute allowedRoles={['HOD']}><RequestDetailView /></ProtectedRoute>} />
          <Route path="/approver/history" element={<ProtectedRoute allowedRoles={['HOD']}><ApprovalHistoryPage /></ProtectedRoute>} />
          
          {/* 'FACULTY' Routes */}
          <Route path="/faculty/dashboard" element={<ProtectedRoute allowedRoles={['FACULTY']}><FacultyDashboard /></ProtectedRoute>} />
          <Route path="/faculty/pending" element={<ProtectedRoute allowedRoles={['FACULTY']}><FacultyPendingPage /></ProtectedRoute>} />
          <Route path="/faculty/request/:id" element={<ProtectedRoute allowedRoles={['FACULTY']}><FacultyRequestDetailView /></ProtectedRoute>} />
          <Route path="/faculty/history" element={<ProtectedRoute allowedRoles={['FACULTY']}><FacultyHistoryPage /></ProtectedRoute>} />
          
          {/* 'ADMIN' Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/final-approval" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminFinalApprovalPage /></ProtectedRoute>} />
          <Route path="/admin/halls" element={<ProtectedRoute allowedRoles={['ADMIN']}><HallManagementPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><UserManagementPage /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['ADMIN']}><ReportsPage /></ProtectedRoute>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
