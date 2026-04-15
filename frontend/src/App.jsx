import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import SplashOnboarding from './pages/SplashOnboarding';
import Login from './pages/Login';
import Home from './pages/Home';
import ScanFlow from './pages/ScanFlow'; // Kept as backup or delete
import QRLanding from './pages/QRLanding';
import BluetoothScan from './pages/scan/Bluetooth';
import LocalRouter from './pages/scan/LocalRouter';
import CloudSync from './pages/scan/CloudSync';
import Readings from './pages/scan/Readings';
import SelectOil from './pages/scan/SelectOil';
import Analysis from './pages/scan/Analysis';
import Calibrate from './pages/scan/Calibrate';
import History from './pages/History';
import MapPage from './pages/MapPage';
import Profile from './pages/Profile';
import { AppProvider } from './context/AppContext';
import { ReportsList, DeveloperTools } from './pages/ProfileSubScreens';
import PrivacySecurity from './pages/PrivacySecurity';
import AboutDashboard from './pages/AboutDashboard';
import LearningCenter from './pages/LearningCenter';
import QRGenerator from './pages/QRGenerator';
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
                  <Route path="/scan" element={<QRLanding />} />
                  <Route path="/scan/bluetooth" element={<BluetoothScan />} />
                  <Route path="/scan/local" element={<LocalRouter />} />
                  <Route path="/scan/cloud" element={<CloudSync />} />
                  <Route path="/scan/readings" element={<Readings />} />
                  <Route path="/scan/readings/calibrate" element={<Calibrate />} />
                  <Route path="/scan/readings/select-oil" element={<SelectOil />} />
                  <Route path="/scan/readings/analysis" element={<Analysis />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/scan/:id" element={<ScanDetail />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/privacy" element={<PrivacySecurity />} />
                  <Route path="/privacy-security" element={<PrivacySecurity />} />
                  <Route path="/about" element={<AboutDashboard />} />
                  <Route path="/learning" element={<LearningCenter />} />
                  <Route path="/reports" element={<ReportsList />} />
                  <Route path="/developer" element={<DeveloperTools />} />
                  <Route path="/developer/qr" element={<QRGenerator />} />
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
