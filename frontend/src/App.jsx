
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Driver Pages
import DriverDashboard from './pages/DriverDashboard';
import DriverDocuments from './pages/DriverDocuments';
import DriverProfile from './pages/DriverProfile';

// Layout
import PublicLayout from './components/PublicLayout';
import DriverLayout from './components/DriverLayout';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Route>

            {/* Driver Routes */}
            <Route element={<ProtectedRoute role="user" />}>
              <Route element={<DriverLayout />}>
                <Route path="/driver-dashboard" element={<DriverDashboard />} />
                <Route path="/my-documents" element={<DriverDocuments />} />
                <Route path="/profile" element={<DriverProfile />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <ToastContainer position="top-right" autoClose={3000} />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
