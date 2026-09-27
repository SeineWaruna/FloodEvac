import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MapPin, Clock, Droplets, Camera, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';

type Report = {
  id: string;
  location: string;
  waterLevel: string;
  description: string;
  timestamp: any;
};

export default function CommunityReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [newReport, setNewReport] = useState({ location: '', waterLevel: '0.1m', description: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
      setReports(docs);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReport.location || !newReport.description) return;
    setLoading(true);
    try {
      const BANGKOK_CENTER = { lat: 13.7563, lng: 100.5018 };
      await addDoc(collection(db, 'reports'), {
        ...newReport,
        timestamp: serverTimestamp(),
        // Mock coordinates for the report
        lat: BANGKOK_CENTER.lat + (Math.random() - 0.5) * 0.08,
        lng: BANGKOK_CENTER.lng + (Math.random() - 0.5) * 0.08,
      });
      setNewReport({ location: '', waterLevel: '0.1m', description: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm sticky top-24">
          <h2 className="text-2xl font-black mb-2">Report a Flood</h2>
          <p className="text-slate-500 text-sm mb-6">Your data helps AI refine local predictions and warns neighbors.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-slate-400 ml-1">Location</label>
              <div className="relative">
                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={newReport.location}
                  onChange={e => setNewReport(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Sukhumvit Soi 24"
                  className="w-full bg-slate-50 border-slate-200 rounded-xl pl-10 py-3 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-slate-400 ml-1">Water Level</label>
              <select 
                value={newReport.waterLevel}
                onChange={e => setNewReport(prev => ({ ...prev, waterLevel: e.target.value }))}
                className="w-full bg-slate-50 border-slate-200 rounded-xl py-3 focus:ring-blue-500"
              >
                <option value="0.1m">0.1m (Ankle deep)</option>
                <option value="0.3m">0.3m (Mid-calf)</option>
                <option value="0.5m">0.5m (Knee high)</option>
                <option value="1.0m+">1.0m+ (Waist or higher)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-slate-400 ml-1">Description</label>
              <textarea 
                value={newReport.description}
                onChange={e => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Details about traffic, safety..."
                className="w-full bg-slate-50 border-slate-200 rounded-xl py-3 focus:ring-blue-500 h-24"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              Submit Report
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black">Live Feed</h2>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold border border-green-100">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Real-time Updates
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {reports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 w-full md:w-32 h-32 bg-slate-100 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 border border-slate-200 border-dashed">
                  <Camera size={24} />
                  <span className="text-[10px] font-bold uppercase">No Image</span>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{report.location}</h3>
                      <div className="flex items-center gap-3 text-slate-400 text-xs mt-1">
                        <span className="flex items-center gap-1"><Clock size={12} /> {report.timestamp ? formatDistanceToNow(report.timestamp.toDate(), { addSuffix: true }) : 'Just now'}</span>
                        <span className="flex items-center gap-1 text-blue-500 font-bold"><Droplets size={12} /> Level: {report.waterLevel}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{report.description}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {reports.length === 0 && (
            <div className="py-20 text-center text-slate-400 space-y-2 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <MapPin size={40} className="mx-auto opacity-20" />
              <p className="font-medium">No reports in your area yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
