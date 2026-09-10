import { Routes, Route } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Clients from "./pages/Clients";
import Lawyers from "./pages/Lawyers";
import Cases from "./pages/Cases";
import Appointments from "./pages/Appointments";

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
      </Route>

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
          <ProtectedRoute allowedRoles={["admin"]}>
            <Cases />
          </ProtectedRoute>
        }
      />

      <Route
        path="/appointments"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Appointments />
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
