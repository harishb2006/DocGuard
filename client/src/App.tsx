import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import UploadPage from './pages/UploadPage';
import ChatPage from './pages/ChatPage';
import DocumentsPage from './pages/DocumentsPage';

import AnalyticsPage from './pages/AnalyticsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Routes>
    </Router>
  );
}

export default App;