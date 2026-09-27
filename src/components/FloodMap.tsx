import { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MapPin, Droplets, Clock, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { RoadPath, RiskCircle } from './MapOverlays';

interface Report {
  id: string;
  location: string;
  waterLevel: string;
  description: string;
  timestamp: any;
  lat?: number;
  lng?: number;
}

const REGION_CENTERS: Record<string, google.maps.LatLngLiteral> = {
  'Bangkok': { lat: 13.7563, lng: 100.5018 },
  'Ho Chi Minh City': { lat: 10.7626, lng: 106.6602 },
  'Manila': { lat: 14.5995, lng: 120.9842 },
  'Jakarta': { lat: -6.2088, lng: 106.8456 }
};

const SYSTEM_REPORTS: Report[] = [
  {
    id: 'sys-1',
    location: 'Chao Phraya River (Thon Buri)',
    waterLevel: '1.0m+',
    description: 'Critical water level. Embankment overtopping suspected.',
    timestamp: { toDate: () => new Date() },
    lat: 13.7465,
    lng: 100.4925
  },
  {
    id: 'sys-2',
    location: 'Sukhumvit Soi 24',
    waterLevel: '0.3m',
    description: 'Flash flooding after heavy downpour. Traffic slow.',
    timestamp: { toDate: () => new Date() },
    lat: 13.7337,
    lng: 100.5654
  },
  {
    id: 'sys-3',
    location: 'Ramkhamhaeng Rd',
    waterLevel: '0.5m',
    description: 'Pumping station at capacity. Expect rising water.',
    timestamp: { toDate: () => new Date() },
    lat: 13.7595,
    lng: 100.6186
  }
];

const CRITICAL_ROADS = [
  {
    name: 'Sukhumvit Road (Sector A)',
    path: [
      { lat: 13.7445, lng: 100.5401 },
      { lat: 13.7395, lng: 100.5501 },
      { lat: 13.7345, lng: 100.5601 },
      { lat: 13.7295, lng: 100.5701 },
    ],
    color: '#ef4444',
    severity: 'high'
  },
  {
    name: 'Rama IV Road',
    path: [
      { lat: 13.7225, lng: 100.5301 },
      { lat: 13.7185, lng: 100.5501 },
      { lat: 13.7145, lng: 100.5701 },
    ],
    color: '#f97316',
    severity: 'medium'
  },
  {
    name: 'Ratchadaphisek Rd',
    path: [
      { lat: 13.7645, lng: 100.5601 },
      { lat: 13.7545, lng: 100.5651 },
      { lat: 13.7445, lng: 100.5701 },
    ],
    color: '#ef4444',
    severity: 'high'
  }
];

export default function FloodMap({ region = 'Bangkok' }: { region?: string }) {
  const [reports, setReports] = useState<Report[]>(SYSTEM_REPORTS);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const center = REGION_CENTERS[region] || REGION_CENTERS['Bangkok'];

  useEffect(() => {
    const q = query(collection(db, 'reports'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const communityDocs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          lat: data.lat || (center.lat + (Math.random() - 0.5) * 0.05),
          lng: data.lng || (center.lng + (Math.random() - 0.5) * 0.05),
        } as Report;
      });
      setReports([...SYSTEM_REPORTS, ...communityDocs]);
    });
    return () => unsubscribe();
  }, [center]);

  return (
    <div className="w-full h-full rounded-3xl overflow-hidden bg-slate-100 relative">
      <APIProvider 
        apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        libraries={['marker']}
      >
        <Map
          center={center}
          defaultZoom={13}
          mapId="floodevac_main_v1"
          gestureHandling="greedy"
          disableDefaultUI={false}
          internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
        >
          {/* Road Overlays */}
          {CRITICAL_ROADS.map((road, i) => (
            <RoadPath 
              key={i} 
              path={road.path} 
              color={road.color} 
              weight={8} 
              opacity={0.6} 
            />
          ))}

          {/* Risk Zones (Circles) */}
          {reports.map((report) => (
            <RiskCircle 
              key={`circle-${report.id}`}
              center={{ lat: report.lat!, lng: report.lng! }}
              radius={report.waterLevel.includes('1.0m') ? 800 : 400}
              color={report.waterLevel.includes('1.0m') ? '#ef4444' : '#3b82f6'}
            />
          ))}

          {/* Markers */}
          {reports.map((report) => (
            <AdvancedMarker
              key={report.id}
              position={{ lat: report.lat!, lng: report.lng! }}
              onClick={() => setSelectedReport(report)}
            >
              <div className="relative group cursor-pointer">
                <div className={`flex items-center gap-1.5 p-1.5 pr-3 rounded-full border-2 border-white shadow-xl transition-all group-hover:scale-110 ${
                  report.waterLevel.includes('1.0m') ? 'bg-red-600 text-white' : 
                  report.waterLevel.includes('0.5m') ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white'
                }`}>
                  <div className="bg-white/20 p-1 rounded-full">
                    {report.waterLevel.includes('1.0m') ? <AlertTriangle size={14} /> : <Droplets size={14} />}
                  </div>
                  <span className="text-[10px] font-black whitespace-nowrap">{report.waterLevel}</span>
                </div>
              </div>
            </AdvancedMarker>
          ))}

          {selectedReport && (
            <InfoWindow
              position={{ lat: selectedReport.lat!, lng: selectedReport.lng! }}
              onCloseClick={() => setSelectedReport(null)}
            >
              <div className="p-3 max-w-[240px] space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 flex items-center gap-1 text-sm">
                    <MapPin size={14} className="text-blue-600" />
                    {selectedReport.location}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedReport.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Water Level</span>
                    <span className="text-xs font-black text-blue-600 uppercase">{selectedReport.waterLevel}</span>
                  </div>
                  <span className="text-slate-400 flex items-center gap-1 text-[10px]">
                    <Clock size={10} />
                    {selectedReport.timestamp?.toDate ? formatDistanceToNow(selectedReport.timestamp.toDate()) + ' ago' : 'Recent'}
                  </span>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
}

