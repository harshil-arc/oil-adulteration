import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { InteractiveLab } from './components/InteractiveLab';
import { TestDirectory } from './components/TestDirectory';
import { OilEncyclopedia } from './components/OilEncyclopedia';
import { SymptomChecker } from './components/SymptomChecker';
import { HealthHazards } from './components/HealthHazards';
import { TestJournal } from './components/TestJournal';
import { KitchenCheatSheet } from './components/KitchenCheatSheet';
import { AiChemistChatModal } from './components/AiChemistChatModal';
import { TestRecord } from './types';
import { 
  ShieldAlert, 
  FlaskConical, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Droplets,
  HeartPulse
} from 'lucide-react';

export default function PureOilApp() {
  const [activeTab, setActiveTab] = useState<string>('lab');
  const [labSelectedTestId, setLabSelectedTestId] = useState<string>('freezing_test');
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [testRecords, setTestRecords] = useState<TestRecord[]>([]);

  // Load test records from localStorage on initial render
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pureoil_records');
      if (saved) {
        setTestRecords(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load local storage records:', e);
    }
  }, []);

  // Save records to localStorage
  const handleSaveRecord = (recordData: Omit<TestRecord, 'id' | 'timestamp'>) => {
    const newRecord: TestRecord = {
      ...recordData,
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    };
    const updated = [newRecord, ...testRecords];
    setTestRecords(updated);
    try {
      localStorage.setItem('pureoil_records', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save record to local storage:', e);
    }
  };

  const handleDeleteRecord = (id: string) => {
    const updated = testRecords.filter((r) => r.id !== id);
    setTestRecords(updated);
    try {
      localStorage.setItem('pureoil_records', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to delete record from local storage:', e);
    }
  };

  const handleClearAllRecords = () => {
    if (window.confirm('Are you sure you want to clear all test records from your journal?')) {
      setTestRecords([]);
      try {
        localStorage.removeItem('pureoil_records');
      } catch (e) {
        console.warn('Failed to clear records:', e);
      }
    }
  };

  const handleSelectTestAndLaunchLab = (testId: string) => {
    setLabSelectedTestId(testId);
    setActiveTab('lab');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        savedLogsCount={testRecords.length}
      />

      {/* Notice Banner */}
      <div className="bg-amber-50 border-b border-amber-200/80 py-2.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-amber-900">
          <div className="flex items-center gap-1.5 font-bold">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Public Health Advisory:</span>
          </div>
          <span className="text-slate-700">
            Recent market seizures found Mustard Oil blended with Metanil Yellow dye and cheap palm oil. Test your kitchen stock with our 2-minute zero-device physical checks.
          </span>
          <button
            onClick={() => handleSelectTestAndLaunchLab('yellow_mustard_dye_test')}
            className="text-amber-700 font-extrabold underline hover:text-amber-800 shrink-0 cursor-pointer ml-1"
          >
            Run Mustard Dye Test →
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'lab' && (
          <InteractiveLab
            initialTestId={labSelectedTestId}
            onSaveRecord={handleSaveRecord}
            onOpenAiModal={() => setIsAiModalOpen(true)}
            onSelectTest={setLabSelectedTestId}
          />
        )}

        {activeTab === 'directory' && (
          <TestDirectory
            onSelectTest={handleSelectTestAndLaunchLab}
            onOpenAiModal={() => setIsAiModalOpen(true)}
          />
        )}

        {activeTab === 'profiles' && (
          <OilEncyclopedia
            onSelectTest={handleSelectTestAndLaunchLab}
          />
        )}

        {activeTab === 'diagnostics' && (
          <SymptomChecker
            onSelectTest={handleSelectTestAndLaunchLab}
          />
        )}

        {activeTab === 'hazards' && (
          <HealthHazards
            onSelectTest={handleSelectTestAndLaunchLab}
          />
        )}

        {activeTab === 'journal' && (
          <TestJournal
            records={testRecords}
            onDeleteRecord={handleDeleteRecord}
            onClearAllRecords={handleClearAllRecords}
            onLaunchLab={handleSelectTestAndLaunchLab}
          />
        )}

        {activeTab === 'cheatsheet' && (
          <KitchenCheatSheet />
        )}
      </main>

      {/* Floating AI Assistant Quick Trigger */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          id="floating-ai-chemist-btn"
          onClick={() => setIsAiModalOpen(true)}
          className="group px-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl shadow-xl shadow-amber-500/25 flex items-center gap-2.5 font-bold text-xs transition-all hover:scale-105 border border-amber-400 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-slate-950 animate-bounce" />
          <span>Ask AI Food Chemist</span>
        </button>
      </div>

      {/* AI Chemist Modal */}
      <AiChemistChatModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 text-center text-xs text-slate-500 space-y-2">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-slate-800">PureOil Educational Food Testing Initiative</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>FSSAI DART Protocols</span>
            <span>•</span>
            <span>Zero-Device Testing</span>
            <span>•</span>
            <span>Consumer Awareness</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 max-w-2xl mx-auto pt-2">
          Disclaimer: These home tests are rapid physical screening methods. For formal regulatory enforcement or legal disputes, samples must be analyzed by an NABL-accredited food testing laboratory.
        </p>
      </footer>
    </div>
  );
}
