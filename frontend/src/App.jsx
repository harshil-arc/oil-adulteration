import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import SplashOnboarding from './pages/SplashOnboarding';
import Login from './pages/Login';
import Home from './pages/Home';
import ScanFlow from './pages/ScanFlow';
import History from './pages/History';
import MapPage from './pages/MapPage';
import Profile from './pages/Profile';
import { AppProvider } from './context/AppContext';
import { PrivacySecurity, AboutApp, LearningCenter, ReportsList, DeveloperTools } from './pages/ProfileSubScreens';
import ScanDetail from './pages/ScanDetail';
import AuthLock from './components/AuthLock';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
      <Routes>
        {/* Fullscreen No-Layout Routes */}
        <Route path="/onboarding" element={<SplashOnboarding />} />
        <Route path="/login" element={<Login />} />
        
        {/* Main App Routes (with Bottom Nav Layout) */}
        <Route path="/*" element={
          <ProtectedRoute>
            <AuthLock>
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/home" replace />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/scan" element={<ScanFlow />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/scan/:id" element={<ScanDetail />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/privacy" element={<PrivacySecurity />} />
                  <Route path="/about" element={<AboutApp />} />
                  <Route path="/learning" element={<LearningCenter />} />
                  <Route path="/reports" element={<ReportsList />} />
                  <Route path="/developer" element={<DeveloperTools />} />
                </Routes>
              </Layout>
            </AuthLock>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
    </AppProvider>
  );
}
