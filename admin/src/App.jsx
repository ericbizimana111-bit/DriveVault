
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import AdminDashboard from './pages/AdminDashboard';
import AdminDrivers from './pages/AdminDrivers';
import AdminAddDriver from './pages/AdminAddDriver';
import AdminDocuments from './pages/AdminDocuments';
import AdminAddDocument from './pages/AdminAddDocument';
import AdminLayout from './components/AdminLayout';

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <Routes>
              <Route element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="drivers" element={<AdminDrivers />} />
                <Route path="drivers/add" element={<AdminAddDriver />} />
                <Route path="documents" element={<AdminDocuments />} />
                <Route path="documents/add" element={<AdminAddDocument />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  )
}

export default App