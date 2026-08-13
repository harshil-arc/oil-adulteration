import React, { useState, useEffect } from 'react';
import { Header } from '../components/oilwise/Header';
import { HealthQuestionnaire } from '../components/oilwise/HealthQuestionnaire';
import { RecommendationResults } from '../components/oilwise/RecommendationResults';
import { OilDirectory } from '../components/oilwise/OilDirectory';
import { OilComparison } from '../components/oilwise/OilComparison';
import { SmokePointGuide } from '../components/oilwise/SmokePointGuide';
import { HouseholdCalculator } from '../components/oilwise/HouseholdCalculator';
import { calculateOilRecommendations } from '../utils/recommendationEngine';
import { AlertCircle } from 'lucide-react';

export default function OilWise() {
  const [activeTab, setActiveTab] = useState('recommender');
  
  const [userProfile, setUserProfile] = useState({
    selectedConditions: ['cholesterol', 'heart_disease'],
    cookingHabits: ['indian_tadka', 'saute_low'],
    ageGroup: 'Adult (18-59 yrs)',
    weightKg: 70,
    activityLevel: 'moderate',
    householdMembers: 4,
    customNotes: ''
  });

  const [recommendation, setRecommendation] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [compareOilIds, setCompareOilIds] = useState(['evoo', 'mustard_oil', 'rice_bran_oil']);

  // Compute initial recommendation on mount
  useEffect(() => {
    const initialRec = calculateOilRecommendations(userProfile);
    setRecommendation(initialRec);
  }, []);

  const handleProfileSubmit = async (profile, runAi) => {
    setUserProfile(profile);
    const calculated = calculateOilRecommendations(profile);
    setRecommendation(calculated);
    setAiError(null);

    if (runAi) {
      setIsLoadingAi(true);
      try {
        const response = await fetch('/api/recommend-oils', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conditions: profile.selectedConditions,
            cookingHabits: profile.cookingHabits,
            age: profile.ageGroup,
            weight: profile.weightKg,
            activityLevel: profile.activityLevel,
            customNotes: profile.customNotes
          })
        });

        const resData = await response.json();
        if (resData.success && resData.data) {
          setAiResult(resData.data);
        } else {
          setAiError(resData.error || 'Failed to fetch AI analysis.');
        }
      } catch (err) {
        console.error('AI call failed:', err);
        setAiError('Unable to connect to AI server. Showing standard recommendation.');
      } finally {
        setIsLoadingAi(false);
      }
    }
  };

  const handleCompareFromDirectory = (oilIds) => {
    setCompareOilIds(oilIds);
    setActiveTab('comparison');
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="w-full bg-[#faf8f5] text-slate-800 flex flex-col font-sans selection:bg-amber-200 pb-28 sm:pb-24">
      
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onPrintReport={handlePrintReport}
        hasRecommendations={!!recommendation}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Error Alert if AI fails */}
        {aiError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{aiError}</span>
            </div>
            <button
              onClick={() => setAiError(null)}
              className="text-rose-700 underline font-semibold text-[11px] cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab 1: Health Recommender */}
        {activeTab === 'recommender' && (
          <div className="space-y-8">
            
            {/* Questionnaire Input */}
            <HealthQuestionnaire
              onCalculate={handleProfileSubmit}
              isLoadingAi={isLoadingAi}
              initialProfile={userProfile}
            />

            {/* Recommendation Results Display */}
            {recommendation && (
              <RecommendationResults
                recommendation={recommendation}
                aiResult={aiResult}
                profile={userProfile}
                onModifyProfile={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                onCompareOils={handleCompareFromDirectory}
              />
            )}

          </div>
        )}

        {/* Tab 2: Oil Directory */}
        {activeTab === 'explorer' && (
          <OilDirectory onCompareOils={handleCompareFromDirectory} />
        )}

        {/* Tab 3: Oil Comparison */}
        {activeTab === 'comparison' && (
          <OilComparison initialOilIds={compareOilIds} />
        )}

        {/* Tab 4: Smoke Point Guide */}
        {activeTab === 'smokepoint' && (
          <SmokePointGuide />
        )}

        {/* Tab 5: Household Intake Calculator */}
        {activeTab === 'calculator' && (
          <HouseholdCalculator />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-8 mt-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center text-white text-xs font-bold font-serif">
              O
            </div>
            <span className="font-bold text-slate-800 font-serif">OilWise Recommender</span>
            <span>— Edible Oil Health & Quantity Advisor</span>
          </div>

          <p className="text-[11px] text-slate-400 text-center sm:text-right max-w-md">
            Medical Disclaimer: OilWise provides nutritional science guidance for general wellness. Always consult your personal physician or registered dietitian for specialized therapeutic diets.
          </p>
        </div>
      </footer>

    </div>
  );
}
