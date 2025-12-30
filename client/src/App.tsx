
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import UploadPage from './pages/UploadPage';
import ChatPage from './pages/ChatPage';
import DocumentsPage from './pages/DocumentsPage';

import LoginPage from './pages/LoginPage';
import OrganizationSelectPage from './pages/OrganizationSelectPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/orgs"
            element={
              <ProtectedRoute>
                <OrganizationSelectPage />
              </ProtectedRoute>
            }
          />

          {/* Unified Dashboard Routes */}
          <Route
            path="/app/:orgId"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          >
            {/* Redirect root /app/:orgId to Chat */}
            <Route index element={<Navigate to="chat" replace />} />

            <Route path="chat" element={<ChatPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="upload" element={<UploadPage />} />
          </Route>

          {/* Legacy or Direct routes redirect to orgs */}
          <Route path="/chat" element={<Navigate to="/orgs" replace />} />
          <Route path="/upload" element={<Navigate to="/orgs" replace />} />
          <Route path="/documents" element={<Navigate to="/orgs" replace />} />
          <Route path="/analytics" element={<Navigate to="/orgs" replace />} />

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;