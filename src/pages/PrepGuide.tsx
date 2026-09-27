import { ShieldCheck, Car, Home, Package, Droplets } from 'lucide-react';

const sections = [
  {
    title: 'Vehicle Protection',
    icon: Car,
    items: [
      'Move cars to multi-story parking garages (e.g., EmQuartier, Central World).',
      'If garage is unavailable, move to high-ground bridges in designated areas.',
      'Check insurance coverage for "natural disaster" or "water damage".',
      'Seal exhaust pipe with heavy plastic and tape if vehicle remains.'
    ]
  },
  {
    title: 'Home & Property',
    icon: Home,
    items: [
      'Install sandbags at least 3 layers high at all entry points.',
      'Move electrical appliances and sockets above 1.5 meters from floor.',
      'Clear gutters and neighborhood drainage pipes of debris.',
      'Document property condition with photos for insurance claims.'
    ]
  },
  {
    title: 'Essential Supplies',
    icon: Package,
    items: [
      '3 days of bottled drinking water (min 3L per person/day).',
      'Non-perishable food (canned goods, dried noodles, snacks).',
      'Emergency power bank (20,000mAh+) for mobile devices.',
      'First-aid kit with medicine for fever, diarrhea, and wounds.'
    ]
  }
];

export default function PrepGuide() {
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="space-y-4">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Readiness Protocol</h1>
        <p className="text-lg text-slate-500">A comprehensive checklist to minimize damage and ensure safety during peak monsoon flooding.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {sections.map((section, idx) => (
          <section key={idx} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 bg-slate-50 border-b flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600">
                <section.icon size={28} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">{section.title}</h2>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {section.items.map((item, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="w-6 h-6 rounded-full border-2 border-slate-200 flex-shrink-0 flex items-center justify-center group-hover:border-blue-500 transition-colors">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <p className="text-slate-600 leading-relaxed pt-0.5">{item}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="bg-blue-600 rounded-3xl p-10 text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-blue-200">
        <div className="space-y-4 flex-1">
          <h2 className="text-3xl font-black">Need Emergency Assistance?</h2>
          <p className="text-blue-100 font-medium">Contact the Department of Disaster Prevention and Mitigation (DDPM) or the Bangkok Emergency Medical Service.</p>
          <div className="flex flex-wrap gap-4 pt-2">
            <a href="tel:1784" className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-full font-bold transition-colors flex items-center gap-2">
              <Droplets size={18} /> Call 1784 (DDPM)
            </a>
            <a href="tel:1669" className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-full font-bold transition-colors flex items-center gap-2">
              <ShieldCheck size={18} /> Call 1669 (EMS)
            </a>
          </div>
        </div>
        <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center">
          <ShieldCheck size={80} className="text-white/20" />
        </div>
      </div>
    </div>
  );
}
