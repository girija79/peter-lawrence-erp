import { Routes, Route } from 'react-router-dom';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Clients from './pages/Clients';

import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

import Unauthorized from './pages/Unauthorized';
function App() {
  return (
    <Routes>

      {/* ==================== PUBLIC ROUTES ==================== */}

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />


      {/* ==================== PROTECTED ROUTES ==================== */}

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >

        {/* Dashboard - All Logged-in Users */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        {/* Users - Admin Only */}
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Users />
            </ProtectedRoute>
          }
        />

      </Route>

      <Route path="/clients" element={<Clients />} />


      {/* ==================== DEFAULT ROUTE ==================== */}

      <Route
        path="/"
        element={<Login />}
      />

    </Routes>
  );
}

export default App;