
import { BrowserRouter, Routes, Route } from "react-router-dom"

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
        <Routes>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/drivers" element={<AdminDrivers />} />
            <Route path="/admin/drivers/add" element={<AdminAddDriver />} />
            <Route path="/admin/documents" element={<AdminDocuments />} />
            <Route path="/admin/documents/add" element={<AdminAddDocument />} />
          </Route>
        </Routes>
      </BrowserRouter>

    </div>
  )
}

export default App