
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminDrivers from './pages/AdminDrivers';
import AdminAddDriver from './pages/AdminAddDriver';
import AdminDocuments from './pages/AdminDocuments';
import AdminAddDocument from './pages/AdminAddDocument';
import AdminLayout from './components/AdminLayout';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <Routes>
              {/* Admin Login */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Protected Admin Routes */}
              <Route element={<ProtectedAdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/drivers" element={<AdminDrivers />} />
                  <Route path="/admin/drivers/add" element={<AdminAddDriver />} />
                  <Route path="/admin/documents" element={<AdminDocuments />} />
                  <Route path="/admin/documents/add" element={<AdminAddDocument />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/admin/login" replace />} />
            </Routes>
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  )
}

export default App