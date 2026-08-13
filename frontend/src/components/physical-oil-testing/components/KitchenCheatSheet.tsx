import React from 'react';
import { 
  Printer, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  FlaskConical, 
  FileText,
  Flame,
  Snowflake,
  FileSpreadsheet,
  Droplets,
  FlaskRound
} from 'lucide-react';
import { OIL_TESTS } from '../data/oilTestsData';

export const KitchenCheatSheet: React.FC = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Printable Reference Guide</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Kitchen Oil Purity Cheat Sheet
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Quick zero-device reference card for physical testing before daily cooking. Print and stick on your refrigerator!
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs shrink-0 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Printable Sheet Body */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-slate-900 shadow-xs space-y-6 print:bg-white print:text-black print:border-none print:p-0">
        
        {/* Print Header */}
        <div className="border-b border-slate-200 print:border-black pb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-amber-600 print:text-black" />
              <h2 className="text-xl font-black tracking-tight text-slate-900 print:text-black">
                PureOil: Home Physical Testing Quick Reference
              </h2>
            </div>
            <p className="text-xs text-slate-500 print:text-gray-700 mt-0.5">
              FSSAI DART Standardized Kitchen Screening Protocols (Zero Laboratory Devices Required)
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-400 print:text-gray-600 font-bold">
            Version 2.4 • Keep in Kitchen
          </span>
        </div>

        {/* 5 Core Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {OIL_TESTS.map((test, index) => (
            <div
              key={test.id}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 print:bg-gray-50 print:border-gray-300 print:text-black space-y-2.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-black text-slate-900 print:text-black flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-900 print:bg-gray-200 text-[10px] flex items-center justify-center font-mono font-bold">
                      {index + 1}
                    </span>
                    {test.title}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 print:text-gray-600 font-bold">
                    ⏱️ {test.estimatedDuration.split(' ')[0]}
                  </span>
                </div>

                <p className="text-[11px] text-slate-700 print:text-gray-800 leading-snug">
                  <strong className="text-slate-900">Tools:</strong> {test.requiredTools.map((t) => t.name).join(', ')}
                </p>

                <div className="mt-2 text-[11px] text-slate-700 print:text-gray-800 space-y-1">
                  <strong className="text-slate-900">Procedure:</strong>
                  <ol className="list-decimal list-inside space-y-0.5 text-[10px] text-slate-600 print:text-gray-700">
                    {test.steps.slice(0, 3).map((st) => (
                      <li key={st.stepNumber} className="line-clamp-1">
                        <strong>{st.title}:</strong> {st.instructions}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Observation split */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 print:border-gray-300 text-[10px]">
                <div className="p-2 rounded-lg bg-emerald-50 print:bg-emerald-50 text-emerald-950 print:text-emerald-900 border border-emerald-200 print:border-emerald-200">
                  <strong className="block text-emerald-800 print:text-emerald-800 font-bold mb-0.5">✅ Pure Signs:</strong>
                  <span className="leading-tight line-clamp-3 font-medium">{test.pureObservation.title}</span>
                </div>
                <div className="p-2 rounded-lg bg-rose-50 print:bg-rose-50 text-rose-950 print:text-rose-900 border border-rose-200 print:border-rose-200">
                  <strong className="block text-rose-800 print:text-rose-800 font-bold mb-0.5">❌ Adulterated:</strong>
                  <span className="leading-tight line-clamp-3 font-medium">{test.adulteratedObservation.title}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Emergency Footnote */}
        <div className="p-3 rounded-xl bg-amber-50 print:bg-amber-50 border border-amber-200 print:border-amber-200 text-xs text-amber-950 print:text-amber-900 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 print:text-amber-800 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Adulteration Hazard Warning:</strong> If any mustard oil sample turns pink/red in the acid test or yields acrid choking smoke during mild heating, discard immediately. Report suspicious loose oil batches to the National Food Safety Authority (FSSAI toll-free 1800-112-100).
          </p>
        </div>
      </div>
    </div>
  );
};
