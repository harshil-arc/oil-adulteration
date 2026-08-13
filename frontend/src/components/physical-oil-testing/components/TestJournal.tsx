import React, { useState } from 'react';
import { 
  BookmarkCheck, 
  Trash2, 
  Printer, 
  Download, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FlaskConical,
  Clock,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { TestRecord } from '../types';

interface TestJournalProps {
  records: TestRecord[];
  onDeleteRecord: (id: string) => void;
  onClearAllRecords: () => void;
  onLaunchLab: (testId: string) => void;
}

export const TestJournal: React.FC<TestJournalProps> = ({
  records,
  onDeleteRecord,
  onClearAllRecords,
  onLaunchLab,
}) => {
  const [filterOutcome, setFilterOutcome] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredRecords = records.filter((rec) => {
    const matchesFilter = filterOutcome === 'All' || rec.outcome === filterOutcome;
    const matchesSearch = 
      rec.oilType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.testTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec.brandName && rec.brandName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rec.notes && rec.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handlePrintJournal = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `PureOil_Test_Journal_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-amber-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Lab History</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            My Home Test Journal
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Saved records of physical oil tests performed in your kitchen with findings, dates, and safety outcomes.
          </p>
        </div>

        {records.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrintJournal}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-300 cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-300 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={onClearAllRecords}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-rose-200 cursor-pointer shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Log</span>
            </button>
          </div>
        )}
      </div>

      {records.length > 0 && (
        /* Filters toolbar */
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by oil, brand, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-xs text-slate-900 pl-9 pr-3 py-2 rounded-xl focus:outline-hidden focus:border-amber-500 shadow-2xs"
            />
          </div>

          <div className="flex gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['All', 'PURE', 'SUSPECT', 'ADULTERATED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterOutcome(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  filterOutcome === status
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Record Cards */}
      {filteredRecords.length > 0 ? (
        <div className="space-y-3">
          {filteredRecords.map((rec) => {
            const isPure = rec.outcome === 'PURE';
            const isSuspect = rec.outcome === 'SUSPECT';
            return (
              <div
                key={rec.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1 ${
                      isPure
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : isSuspect
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {isPure ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-rose-700" />
                      )}
                      {rec.outcome}
                    </span>

                    <span className="text-xs font-bold text-slate-900">
                      {rec.oilType} {rec.brandName ? `• Brand: ${rec.brandName}` : ''}
                    </span>

                    <span className="text-[11px] text-slate-500 font-mono font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(rec.timestamp).toLocaleDateString()} at {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="text-sm font-extrabold text-amber-900">
                    {rec.testTitle}
                  </h4>

                  {rec.selectedOptionLabel && (
                    <p className="text-xs text-slate-700">
                      <strong className="text-slate-900">Observation:</strong> {rec.selectedOptionLabel}
                    </p>
                  )}

                  {rec.notes && (
                    <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <strong className="text-slate-900">Notes:</strong> {rec.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                  <button
                    onClick={() => onLaunchLab(rec.testId)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 border border-slate-300 cursor-pointer shadow-2xs"
                  >
                    <span>Re-test</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDeleteRecord(rec.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 cursor-pointer"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3 shadow-xs">
          <BookmarkCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-black text-slate-900">No Test Records Found</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Whenever you run a test in the Virtual Lab and complete your inspection, click "Save in My Journal" to maintain a permanent record of batch quality.
          </p>
        </div>
      )}
    </div>
  );
};
