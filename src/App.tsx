import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Predictor from './pages/Predictor';
import PrepGuide from './pages/PrepGuide';
import CommunityReports from './pages/CommunityReports';
import Navbar from './components/Navbar';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/predictor" element={<Predictor />} />
            <Route path="/prep" element={<PrepGuide />} />
            <Route path="/reports" element={<CommunityReports />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
