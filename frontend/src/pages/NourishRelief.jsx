// NourishRelief — integrated food donation feature
// Re-exports the standalone NourishRelief App built in Google AI Studio.
import NourishReliefApp from '../nourish-relief/App.jsx';
import '../nourish-relief/index.css';

export default function NourishRelief() {
  return <NourishReliefApp forcedRole="donor" />;
}
