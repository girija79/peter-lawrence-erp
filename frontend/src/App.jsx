import { Routes, Route } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Clients from "./pages/Clients";
import Lawyers from "./pages/Lawyers";
import Cases from "./pages/Cases";
import Appointments from "./pages/Appointments";
import Documents from "./pages/Documents";
import Billing from "./pages/Billing";
import Vendors from "./pages/Vendors";
import ClientPayments from "./pages/ClientPayments";
import Receipt from "./pages/Receipt";
import Employees from "./pages/Employees";
import HR from "./pages/HR";
import Career from "./pages/Career";
import Attendance from "./pages/Attendance";
import Leave from "./pages/Leave";
import PettyCash from "./pages/PettyCash";
import Payroll from "./pages/Payroll";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import CmsPages from "./pages/CmsPages";
import CmsServices from "./pages/CmsServices";
import CmsPosts from "./pages/CmsPosts";
import CmsInquiries from "./pages/CmsInquiries";
import MyProfile from "./pages/MyProfile";

import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import Unauthorized from "./pages/Unauthorized";

function App() {
  return (
    <Routes>
      {/* =====================================================
          PUBLIC ROUTES
          ===================================================== */}

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* =====================================================
          PROTECTED APPLICATION
          ===================================================== */}

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* -------------------------------------------------
            DASHBOARD
            Available to all authenticated users
            ------------------------------------------------- */}

        <Route path="/dashboard" element={<Dashboard />} />

        {/* -------------------------------------------------
            CLIENTS
            Admin + Lawyer + Client
            ------------------------------------------------- */}

        <Route
          path="/clients"
          element={
            <ProtectedRoute allowedRoles={["admin", "lawyer", "client"]}>
              <Clients />
            </ProtectedRoute>
          }
        />

        {/* -------------------------------------------------
            USERS
            Admin only
            ------------------------------------------------- */}

        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Users />
            </ProtectedRoute>
          }
        />

        {/* -------------------------------------------------
            NOTIFICATIONS
            Available to all authenticated users
            ------------------------------------------------- */}

        <Route path="/notifications" element={<Notifications />} />
      </Route>

      {/* =====================================================
          ADMIN ROUTES
          ===================================================== */}

      <Route
        path="/lawyers"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Lawyers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cases"
        element={
          <ProtectedRoute allowedRoles={["admin", "lawyer"]}>
            <Cases />
          </ProtectedRoute>
        }
      />

      <Route
        path="/appointments"
        element={
          <ProtectedRoute allowedRoles={["admin", "lawyer"]}>
            <Appointments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/documents"
        element={
          <ProtectedRoute allowedRoles={["admin", "lawyer"]}>
            <Documents />
          </ProtectedRoute>
        }
      />

      <Route
        path="/billing"
        element={
          <ProtectedRoute allowedRoles={["admin", "accountant"]}>
            <Billing />
          </ProtectedRoute>
        }
      />

      <Route
        path="/client-payments"
        element={
          <ProtectedRoute allowedRoles={["admin", "accountant"]}>
            <ClientPayments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/receipts/:id"
        element={
          <ProtectedRoute allowedRoles={["admin", "accountant"]}>
            <Receipt />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Employees />
          </ProtectedRoute>
        }
      />

      <Route
        path="/hr"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <HR />
          </ProtectedRoute>
        }
      />

      <Route
        path="/career"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Career />
          </ProtectedRoute>
        }
      />

      <Route
        path="/attendance"
        element={
          <ProtectedRoute allowedRoles={["admin" , "employee"]}>
            <Attendance />
          </ProtectedRoute>
        }
      />

      <Route
        path="/leave"
        element={
          <ProtectedRoute allowedRoles={["admin"  , "employee"]}>
            <Leave />
          </ProtectedRoute>
        }
      />

      <Route
        path="/petty-cash"
        element={
          <ProtectedRoute allowedRoles={["admin", "accountant"]}>
            <PettyCash />
          </ProtectedRoute>
        }
      />

      <Route
        path="/payroll"
        element={
          <ProtectedRoute allowedRoles={["admin", "accountant", "employee"]}>
            <Payroll />
          </ProtectedRoute>
        }
      />

      <Route
        path="/vendors"
        element={
          <ProtectedRoute allowedRoles={["admin", "accountant"]}>
            <Vendors />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Reports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cms-pages"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <CmsPages />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cms-services"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <CmsServices />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cms-posts"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <CmsPosts />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cms-inquiries"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <CmsInquiries />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <MyProfile />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          DEFAULT ROUTE
          ===================================================== */}

      <Route path="/" element={<Login />} />
    </Routes>
  );
}

export default App;
