import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import SplashOnboarding from './pages/SplashOnboarding';
import Login from './pages/Login';
import Home from './pages/Home';
import ScanFlow from './pages/ScanFlow';
import History from './pages/History';
import MapPage from './pages/MapPage';
import Profile from './pages/Profile';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Fullscreen No-Layout Routes */}
        <Route path="/onboarding" element={<SplashOnboarding />} />
        <Route path="/login" element={<Login />} />
        
        {/* Main App Routes (with Bottom Nav Layout) */}
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/onboarding" replace />} />
              <Route path="/home" element={<Home />} />
              <Route path="/scan" element={<ScanFlow />} />
              <Route path="/history" element={<History />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
  );
}
