import { useNavigate } from 'react-router-dom';
import NourishReliefApp from '../nourish-relief/App.jsx';
import '../nourish-relief/index.css';

export default function NourishRelief() {
  const navigate = useNavigate();
  return <NourishReliefApp forcedRole="donor" onBack={() => navigate('/home')} />;
}
