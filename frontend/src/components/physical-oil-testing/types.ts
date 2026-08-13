export type TestOutcome = 'PURE' | 'SUSPECT' | 'ADULTERATED' | 'INCONCLUSIVE';

export interface TestTool {
  name: string;
  kitchenAlternative?: string;
  isHousehold: boolean;
}

export interface TestStep {
  stepNumber: number;
  title: string;
  instructions: string;
  tip?: string;
  timeSeconds?: number;
  timerLabel?: string;
  caution?: string;
}

export interface ObservationDetail {
  title: string;
  description: string;
  visualBadge: string;
  keyTraits: string[];
  scientificReason: string;
  dangerLevel?: 'Safe' | 'Low Risk' | 'High Risk' | 'Toxic';
}

export interface SimulatorOption {
  id: string;
  label: string;
  description: string;
  outcome: TestOutcome;
  visualEffect: string;
  explanation: string;
}

export interface OilTest {
  id: string;
  title: string;
  subtitle: string;
  category: 'Freezing & Cooling' | 'Thermal & Smoke' | 'Surface & Absorption' | 'Chemical & Dye' | 'Sensory & Touch';
  targetOils: string[];
  adulterantsDetected: string[];
  difficulty: 'Very Easy' | 'Easy' | 'Moderate';
  estimatedDuration: string;
  durationSeconds: number;
  is100PercentHousehold: boolean;
  requiredTools: TestTool[];
  safetyWarning?: string;
  steps: TestStep[];
  pureObservation: ObservationDetail;
  adulteratedObservation: ObservationDetail;
  scientificMechanism: string;
  fssaiRef?: string;
  simulatorOptions: SimulatorOption[];
}

export interface OilProfile {
  id: string;
  name: string;
  hindiName?: string;
  commonColor: string;
  iconColor: string;
  smokePointPure: string;
  naturalConsistency: string;
  primaryAdulterants: {
    name: string;
    whyUsed: string;
    healthHazard: string;
    severity: 'Mild' | 'Dangerous' | 'Severe / Fatal';
  }[];
  bestTests: string[]; // test IDs
  pureHallmarks: string[];
  spoilageVsAdulteration: string;
}

export interface TestRecord {
  id: string;
  timestamp: number;
  oilType: string;
  brandName?: string;
  testId: string;
  testTitle: string;
  outcome: TestOutcome;
  selectedOptionLabel?: string;
  notes?: string;
  visualFinding?: string;
}

export interface AdulterantHazard {
  id: string;
  name: string;
  chemicalFormulaOrNature: string;
  commonlyFoundIn: string[];
  healthImpacts: string[];
  symptomsOfToxicity: string[];
  quickDetectionMethod: string;
  legalStatus: string;
}

export interface DiagnosticResult {
  riskLevel: 'SAFE' | 'SUSPICIOUS' | 'HIGH_RISK_ADULTERATED';
  summary: string;
  potentialAdulterants: string[];
  recommendedActions: string[];
  scientificExplanation: string;
}
