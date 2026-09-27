import { useState } from 'react';
import { Search, Zap, Loader2, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Prediction = {
  riskLevel: 'Low' | 'Medium' | 'High' | 'Extreme';
  timeframe: string;
  warnings: string[];
  supplies: string[];
  analysis: string;
};

export default function Predictor() {
  const [region, setRegion] = useState('Bangkok (Sukhumvit/Wattana)');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analyze-flood-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          region,
          weatherData: {
            rainfall_forecast: '120mm in next 48h',
            current_water_level: 'High (Chao Phraya River)',
            monsoon_status: 'Active Southwest Monsoon',
            historical_data: 'Matches 2011 early-onset patterns'
          }
        })
      });
      const data = await response.json();
      setPrediction(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const riskColors = {
    Low: 'text-green-600 bg-green-50 border-green-200',
    Medium: 'text-orange-600 bg-orange-50 border-orange-200',
    High: 'text-red-600 bg-red-50 border-red-200',
    Extreme: 'text-purple-600 bg-purple-50 border-purple-200',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
          DeepMind GraphCast Integration
        </div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Climate Predictor</h1>
        <p className="text-slate-500 text-lg max-w-xl mx-auto">
          Hyper-local flood forecasting for Southeast Asian cities using advanced neural weather models.
        </p>
      </div>

      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xl flex flex-col md:flex-row gap-2">
        <div className="flex-1 flex items-center gap-3 px-4 py-2">
          <Search className="text-slate-400" size={20} />
          <input 
            type="text" 
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="Enter region or district..."
            className="w-full bg-transparent border-none focus:ring-0 text-lg font-medium placeholder:text-slate-300"
          />
        </div>
        <button 
          onClick={handleAnalyze}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Zap size={20} fill="currentColor" />}
          {loading ? 'Analyzing...' : 'Run Simulation'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {prediction ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            <div className={`p-8 rounded-3xl border-2 ${riskColors[prediction.riskLevel]} flex flex-col md:flex-row gap-8 items-center`}>
              <div className="text-center md:text-left flex-1">
                <p className="text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-1">Status Report</p>
                <h2 className="text-5xl font-black mb-4">{prediction.riskLevel}</h2>
                <div className="flex items-center gap-2 font-bold opacity-80">
                  <TrendingUp size={20} />
                  Predicted Window: {prediction.timeframe}
                </div>
              </div>
              <div className="h-px md:h-24 md:w-px bg-current/20 w-full md:w-auto"></div>
              <div className="flex-1 space-y-4">
                <p className="font-medium leading-relaxed italic">"{prediction.analysis}"</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <AlertCircle size={20} className="text-red-500" /> Critical Warnings
                </h3>
                <ul className="space-y-3">
                  {prediction.warnings.map((w, i) => (
                    <li key={i} className="flex gap-3 text-slate-600 leading-snug">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0"></div>
                      {w}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-green-500" /> Prep Essentials
                </h3>
                <div className="flex flex-wrap gap-2">
                  {prediction.supplies.map((s, i) => (
                    <span key={i} className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm font-semibold border border-green-100">
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            </div>
          </motion.div>
        ) : !loading && (
          <div className="py-20 text-center space-y-4 border-2 border-dashed border-slate-200 rounded-3xl">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <Zap size={32} />
            </div>
            <p className="text-slate-400 font-medium">Initialize the model to generate a flood risk report.</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
