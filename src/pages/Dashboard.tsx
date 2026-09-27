import { AlertTriangle, CloudRain, Thermometer, Wind, Car, Phone, Zap, TrendingUp, MapPin, AlertCircle, ChevronRight, Globe, Map as MapIcon, Calendar, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import RainfallChart from '../components/RainfallChart';
import FloodMap from '../components/FloodMap';

interface Analysis {
  riskLevel: string;
  tenDayForecast: { day: string; risk: string; notes: string }[];
  evacuationPlan: string;
  highRiskRoads: string[];
  supplies: string[];
  analysis: string;
}

export default function Dashboard() {
  const [selectedRegion, setSelectedRegion] = useState({ country: 'Thailand', province: 'Bangkok' });
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);

  const countries = ['Thailand', 'Vietnam', 'Philippines', 'Indonesia'];
  const provinces = {
    'Thailand': ['Bangkok', 'Nonthaburi', 'Pathum Thani', 'Samut Prakan'],
    'Vietnam': ['Ho Chi Minh City', 'Hanoi', 'Da Nang'],
    'Philippines': ['Manila', 'Cebu', 'Davao'],
    'Indonesia': ['Jakarta', 'Surabaya', 'Bandung']
  };

  useEffect(() => {
    fetchAnalysis();
  }, [selectedRegion]);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analyze-flood-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          region: `${selectedRegion.province}, ${selectedRegion.country}`,
          weatherData: { currentPrecip: 45, humidity: 88, pressure: 1008 } 
        }),
      });
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const roadAlerts = [
    { road: 'Sukhumvit Soi 24', status: 'Flooded (0.3m)', severity: 'medium' },
    { road: 'Rama IV Road', status: 'Heavy Congestion / Water on Road', severity: 'high' },
    { road: 'Thon Buri Embankment', status: 'Critical - Water Seepage', severity: 'extreme' },
    { road: 'Ramkhamhaeng Soi 12', status: 'Minor Flooding', severity: 'low' },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* 1. TOP MARQUEE ALERT BAR */}
      <div className="bg-slate-900 text-white overflow-hidden rounded-2xl h-12 flex items-center relative">
        <div className="absolute left-0 top-0 bottom-0 px-4 bg-red-600 flex items-center gap-2 z-10 shadow-lg">
          <AlertCircle size={18} className="animate-pulse" />
          <span className="font-black text-xs uppercase tracking-widest whitespace-nowrap">Live Alerts</span>
        </div>
        <div className="flex animate-marquee whitespace-nowrap items-center gap-12 pl-40">
          {roadAlerts.map((alert, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="font-bold text-blue-400">{alert.road}:</span>
              <span className="text-slate-300">{alert.status}</span>
              <div className={cn("w-2 h-2 rounded-full", 
                alert.severity === 'high' ? 'bg-red-500' : 
                alert.severity === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
              )}></div>
            </div>
          ))}
        </div>
      </div>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <MapIcon className="text-white" size={24} />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">FloodEvac Command</h1>
          </div>
          <p className="text-slate-500 font-medium ml-1">Predictive Evacuation & Situation Command</p>
        </div>

        {/* REGION SELECTOR */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl shadow-sm border border-slate-200">
            <Globe size={16} className="text-slate-400" />
            <select 
              value={selectedRegion.country}
              onChange={(e) => {
                const country = e.target.value as keyof typeof provinces;
                setSelectedRegion({ country, province: provinces[country][0] });
              }}
              className="text-sm font-bold bg-transparent border-none focus:ring-0 p-0 pr-6"
            >
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl shadow-sm border border-slate-200">
            <MapPin size={16} className="text-slate-400" />
            <select 
              value={selectedRegion.province}
              onChange={(e) => setSelectedRegion(prev => ({ ...prev, province: e.target.value }))}
              className="text-sm font-bold bg-transparent border-none focus:ring-0 p-0 pr-6"
            >
              {provinces[selectedRegion.country as keyof typeof provinces].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Map & Road Matrix */}
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-white p-2 rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden relative group">
            <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
              <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200 shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-800">Situation: {selectedRegion.province}</span>
                </div>
              </div>
            </div>
            <div className="h-[650px] w-full">
              <FloodMap region={selectedRegion.province} />
            </div>
          </section>

          {/* Road Impact Matrix */}
          <section className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                 <Car size={24} className="text-blue-600" /> Evacuation Route Status
               </h3>
               <button className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-widest">Report Hazard</button>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {roadAlerts.map((alert, i) => (
                 <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between group hover:border-blue-200 hover:bg-white transition-all">
                   <div className="space-y-1">
                     <p className="font-bold text-slate-800">{alert.road}</p>
                     <p className="text-xs text-slate-500">Last updated: 14m ago</p>
                   </div>
                   <div className={cn("px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter", 
                     alert.severity === 'extreme' ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 
                     alert.severity === 'high' ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 
                     'bg-blue-600 text-white shadow-lg shadow-blue-200'
                   )}>
                     {alert.status}
                   </div>
                 </div>
               ))}
             </div>
          </section>
        </div>

        {/* Right Column: AI Analysis & 10-Day Prediction */}
        <div className="lg:col-span-4 space-y-8">
          {/* AI Intelligence Card */}
          <section className={cn(
            "rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl transition-all duration-500",
            loading ? "bg-slate-800 animate-pulse" : "bg-slate-900 shadow-blue-500/10"
          )}>
            <div className="relative z-10 space-y-8">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                  <Zap size={14} fill="currentColor" /> Neural Evac Plan
                </div>
                {analysis?.riskLevel && (
                  <span className={cn("text-xs font-black uppercase px-3 py-1 rounded-full", 
                    analysis.riskLevel === 'Extreme' ? 'bg-red-600' : 'bg-orange-500'
                  )}>
                    {analysis.riskLevel} Risk
                  </span>
                )}
              </div>

              {loading ? (
                <div className="space-y-4">
                  <div className="h-8 bg-white/10 rounded-lg w-3/4"></div>
                  <div className="h-20 bg-white/10 rounded-lg"></div>
                </div>
              ) : analysis ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-black mb-2">Decision Insight</h2>
                    <p className="text-slate-400 text-sm leading-relaxed italic">"{analysis.analysis}"</p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Evacuation Steps</h4>
                    <p className="text-sm leading-relaxed">{analysis.evacuationPlan}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {analysis.highRiskRoads?.slice(0, 3).map((road, i) => (
                      <span key={i} className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-[10px] font-bold">
                        Avoid {road}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-slate-400">Select a region to generate analysis.</p>
              )}

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-5 rounded-[1.5rem] font-black flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-600/30">
                Generate Full Evac Report <ChevronRight size={20} />
              </button>
            </div>
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-600/20 blur-[100px] rounded-full"></div>
          </section>

          {/* 10-DAY EVACUATION FORECAST (Horizontal Scroll) */}
          <section className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 flex items-center gap-2">
                <Calendar size={24} className="text-blue-600" /> 10-Day Evacuation Outlook
              </h3>
              <Info size={16} className="text-slate-300" />
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="min-w-[180px] h-32 bg-slate-50 rounded-2xl animate-pulse flex-shrink-0"></div>
                ))
              ) : analysis?.tenDayForecast ? (
                analysis.tenDayForecast.map((forecast, i) => (
                  <div key={i} className="min-w-[180px] p-5 rounded-2xl border border-slate-50 bg-slate-50/50 flex flex-col justify-between group hover:bg-white hover:shadow-lg transition-all flex-shrink-0 border-b-4 border-b-transparent hover:border-b-blue-500">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex flex-col items-center justify-center shadow-sm">
                        <span className="text-[10px] font-black text-slate-400 leading-none">Day</span>
                        <span className="text-sm font-black text-slate-900">{i + 1}</span>
                      </div>
                      <div className={cn("w-3 h-3 rounded-full", 
                        forecast.risk === 'Extreme' ? 'bg-red-500 shadow-lg shadow-red-200 animate-pulse' :
                        forecast.risk === 'High' ? 'bg-orange-500 shadow-lg shadow-orange-200' :
                        'bg-blue-400 shadow-lg shadow-blue-100'
                      )}></div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-black text-slate-800">{forecast.risk} Risk</p>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{forecast.notes}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full text-center py-12">
                  <Calendar size={32} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-xs text-slate-400 font-medium">Select a region to load forecast</p>
                </div>
              )}
            </div>
          </section>

          {/* Rainfall Data */}
          <section className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-black text-slate-900 flex items-center gap-2">
              <TrendingUp size={24} className="text-blue-600" /> Precipitation Flux
            </h3>
            <div className="bg-slate-50 rounded-2xl p-4">
              <RainfallChart />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}



