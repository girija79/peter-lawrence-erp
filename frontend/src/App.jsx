import { Routes, Route } from "react-router-dom";

// =========================
// AUTH PAGES
// =========================
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// =========================
// MAIN PAGES
// =========================
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

// =========================
// CMS
// =========================
import CmsPages from "./pages/CmsPages";
import CmsServices from "./pages/CmsServices";
import CmsPosts from "./pages/CmsPosts";
import CmsInquiries from "./pages/CmsInquiries";

// =========================
// EMPLOYEE / HR
// =========================
import MyProfile from "./pages/MyProfile";
import EmployeePayments from "./pages/EmployeePayments";
import LeaveBalance from "./pages/LeaveBalance";
import Performance from "./pages/Performance";
import Communication from "./pages/Communication";

// =========================
// ROUTING / LAYOUT
// =========================
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
          DashboardLayout is available to every authenticated user
          ===================================================== */}

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* =================================================
            DASHBOARD
            All 6 roles
            ================================================= */}

        <Route path="/dashboard" element={<Dashboard />} />

        {/* =================================================
            CLIENTS
            Admin + Lawyer + Accountant + Client
            ================================================= */}

        <Route
          path="/clients"
          element={
            <ProtectedRoute
              allowedRoles={["admin", "lawyer", "accountant", "client"]}
            >
              <Clients />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            USERS
            Admin only
            ================================================= */}

        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Users />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            NOTIFICATIONS
            All authenticated users
            ================================================= */}

        <Route path="/notifications" element={<Notifications />} />
      </Route>

      {/* =====================================================
          LEGAL MANAGEMENT
          ===================================================== */}

      {/* Lawyers */}
      <Route
        path="/lawyers"
        element={
          <ProtectedRoute allowedRoles={["admin", "lawyer"]}>
            <Lawyers />
          </ProtectedRoute>
        }
      />

      {/* Cases */}
      <Route
        path="/cases"
        element={
          <ProtectedRoute allowedRoles={["admin", "lawyer", "client"]}>
            <Cases />
          </ProtectedRoute>
        }
      />

      {/* Appointments */}
      <Route
        path="/appointments"
        element={
          <ProtectedRoute allowedRoles={["admin", "lawyer", "client"]}>
            <Appointments />
          </ProtectedRoute>
        }
      />

      {/* Documents */}
      <Route
        path="/documents"
        element={
          <ProtectedRoute
            allowedRoles={["admin", "lawyer", "hr", "employee", "client"]}
          >
            <Documents />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          FINANCE
          ===================================================== */}

      {/* Billing */}
      <Route
        path="/billing"
        element={
          <ProtectedRoute allowedRoles={["admin", "accountant"]}>
            <Billing />
          </ProtectedRoute>
        }
      />

      {/* Client Payments */}
      <Route
        path="/client-payments"
        element={
          <ProtectedRoute allowedRoles={["admin", "accountant", "client"]}>
            <ClientPayments />
          </ProtectedRoute>
        }
      />

      {/* Receipt Details */}
      <Route
        path="/receipts/:id"
        element={
          <ProtectedRoute allowedRoles={["admin", "accountant"]}>
            <Receipt />
          </ProtectedRoute>
        }
      />

      {/* Vendors */}
      <Route
        path="/vendors"
        element={
          <ProtectedRoute allowedRoles={["admin", "accountant"]}>
            <Vendors />
          </ProtectedRoute>
        }
      />

      {/* Petty Cash */}
      <Route
        path="/petty-cash"
        element={
          <ProtectedRoute allowedRoles={["admin", "accountant"]}>
            <PettyCash />
          </ProtectedRoute>
        }
      />

      {/* Payroll */}
      <Route
        path="/payroll"
        element={
          <ProtectedRoute allowedRoles={["admin", "accountant", "employee"]}>
            <Payroll />
          </ProtectedRoute>
        }
      />

      {/* Employee Payments */}
      <Route
        path="/employee-payments"
        element={
          <ProtectedRoute allowedRoles={["admin", "accountant", "employee"]}>
            <EmployeePayments />
          </ProtectedRoute>
        }
      />

      {/* Reports */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Reports />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          EMPLOYEE & HR MANAGEMENT
          ===================================================== */}

      {/* Employees
          Admin + HR
          HR can manage employee information,
          but Employees.jsx restricts sensitive actions.
      */}
      <Route
        path="/employees"
        element={
          <ProtectedRoute allowedRoles={["admin", "hr"]}>
            <Employees />
          </ProtectedRoute>
        }
      />

      {/* HR Management
          Admin + HR
      */}
      <Route
        path="/hr"
        element={
          <ProtectedRoute allowedRoles={["admin", "hr"]}>
            <HR />
          </ProtectedRoute>
        }
      />

      {/* Attendance
          Admin + HR + Employee
      */}
      <Route
        path="/attendance"
        element={
          <ProtectedRoute allowedRoles={["admin", "hr", "employee"]}>
            <Attendance />
          </ProtectedRoute>
        }
      />

      {/* Leave
          Admin + HR + Employee
      */}
      <Route
        path="/leave"
        element={
          <ProtectedRoute allowedRoles={["admin", "hr", "employee"]}>
            <Leave />
          </ProtectedRoute>
        }
      />

      {/* Leave Balance
          Admin + HR + Employee
      */}
      <Route
        path="/leave-balance"
        element={
          <ProtectedRoute allowedRoles={["admin", "hr", "employee"]}>
            <LeaveBalance />
          </ProtectedRoute>
        }
      />

      {/* Performance
          Admin + HR + Employee
      */}
      <Route
        path="/performance"
        element={
          <ProtectedRoute allowedRoles={["admin", "hr", "employee"]}>
            <Performance />
          </ProtectedRoute>
        }
      />

      {/* Career Portal
          Admin + HR
      */}
      <Route
        path="/career"
        element={
          <ProtectedRoute allowedRoles={["admin", "hr"]}>
            <Career />
          </ProtectedRoute>
        }
      />

      {/* Employee Profile
          Employee only
      */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <MyProfile />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          COMMUNICATION
          All 6 roles
          ===================================================== */}

      <Route
        path="/communication"
        element={
          <ProtectedRoute
            allowedRoles={[
              "admin",
              "hr",
              "lawyer",
              "accountant",
              "employee",
              "client",
            ]}
          >
            <Communication />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          CMS
          Admin only
          ===================================================== */}

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

      {/* =====================================================
          DEFAULT ROUTE
          ===================================================== */}

      <Route path="/" element={<Login />} />
    </Routes>
  );
}

export default App;
