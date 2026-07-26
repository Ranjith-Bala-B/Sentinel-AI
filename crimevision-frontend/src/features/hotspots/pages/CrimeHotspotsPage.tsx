import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { apiClient } from "@/shared/lib/api-client";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts";
import { Flame, Compass, BellRing, ClipboardCheck } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface HotspotData {
  id: number;
  name: string;
  lat: number;
  lng: number;
  crimeCount: number;
  riskLevel: string;
  recommendedAction: string;
  peakTime?: string;
  commonCrime?: string;
}

interface RiskDist {
  name: string;
  value: number;
  count: number;
}

export function CrimeHotspotsPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const circleGroupRef = useRef<L.LayerGroup | null>(null);

  // Load backend hotspot data using React Query for instant sync
  const { data: hotspots = [], isLoading: isHotspotsLoading } = useQuery<HotspotData[]>({
    queryKey: ["hotspots", "active"],
    queryFn: () => apiClient.get<HotspotData[]>("/hotspots/active"),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const { data: trendData = [], isLoading: isTrendLoading } = useQuery<{ label: string; cases: number }[]>({
    queryKey: ["hotspots", "trend"],
    queryFn: () => apiClient.get<{ label: string; cases: number }[]>("/hotspots/trend"),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const { data: distribution = [], isLoading: isDistLoading } = useQuery<RiskDist[]>({
    queryKey: ["hotspots", "distribution"],
    queryFn: () => apiClient.get<RiskDist[]>("/hotspots/distribution"),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const loading = isHotspotsLoading || isTrendLoading || isDistLoading;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false
    }).setView([12.9716, 77.5946], 11);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png").addTo(map);

    circleGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Plot Hotspot Circles
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = circleGroupRef.current;
    if (!map || !group || !hotspots.length) return;

    group.clearLayers();

    hotspots.forEach((h) => {
      // Glow parameters based on risk level
      const color = h.riskLevel === "High" ? "#EF4444" : h.riskLevel === "Medium" ? "#F59E0B" : "#10B981";
      
      // Outer glow circle
      const outerCircle = L.circle([h.lat, h.lng], {
        radius: 700 + h.crimeCount * 5,
        fillColor: color,
        fillOpacity: 0.15,
        color: color,
        weight: 1,
        dashArray: "4 4"
      });

      // Inner core circle
      const innerCircle = L.circle([h.lat, h.lng], {
        radius: 150,
        fillColor: color,
        fillOpacity: 0.75,
        color: "#FFFFFF",
        weight: 2
      });

      innerCircle.bindPopup(`
        <div style="font-family: Inter, sans-serif; font-size: 11.5px; width: 190px; line-height: 1.4;">
          <b style="color: #0F172A; font-size: 12px; display: block; margin-bottom: 4px;">🔥 ${h.name}</b>
          <div style="margin-bottom: 2px;"><b>Active Cases:</b> ${h.crimeCount}</div>
          <div style="margin-bottom: 2px;"><b>Risk Priority:</b> <span style="color: ${color}; font-weight: bold;">${h.riskLevel}</span></div>
          ${h.peakTime ? `<div style="margin-bottom: 2px;"><b>Peak Time:</b> ${h.peakTime}</div>` : ""}
          ${h.commonCrime ? `<div style="margin-bottom: 4px;"><b>Common Crime:</b> <span style="font-weight: bold; color: ${color};">${h.commonCrime}</span></div>` : ""}
          <div style="border-top: 1px solid #E2E8F0; padding-top: 4px; font-style: italic; color: #475569;"><b>Action:</b> ${h.recommendedAction}</div>
        </div>
      `);

      group.addLayer(outerCircle);
      group.addLayer(innerCircle);
    });

    // Fit map bounds
    try {
      const coords = hotspots.map(h => [h.lat, h.lng] as L.LatLngExpression);
      if (coords.length > 0) {
        map.fitBounds(L.latLngBounds(coords), { padding: [40, 40] });
      }
    } catch (e) {
      // ignore fit bounds errors
    }
  }, [hotspots]);

  // Donut chart colors
  const COLORS = {
    "High": "#EF4444",
    "Medium": "#F59E0B",
    "Low": "#10B981"
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="label-eyebrow">Hotspot Intelligence</p>
        <h1 className="mt-1 font-display text-xl font-semibold text-base-100">Crime Hotspot Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Map Container */}
        <div className="xl:col-span-2">
          <Card className="overflow-hidden shadow-glass border-base-800">
            <div className="flex items-center justify-between border-b border-base-800 bg-base-700/50 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-alert-red animate-pulse" />
                <span className="text-xs font-bold text-base-100 uppercase tracking-wider">Active Hotspots Spatial View</span>
              </div>
              <span className="text-[10px] bg-red-400/10 text-alert-red font-semibold px-2 py-0.5 rounded border border-red-400/20 uppercase tracking-wider">
                Patrol Directive Active
              </span>
            </div>
            <div className="h-[360px] w-full relative">
              <div ref={mapContainerRef} className="h-full w-full z-10" />
            </div>
          </Card>
        </div>

        {/* Sidebar - Active Hotspots List */}
        <div>
          <Card className="h-full shadow-glass border-base-800">
            <CardHeader className="border-b border-base-800 bg-base-700/50 py-3.5 px-5">
              <CardTitle className="text-xs font-bold text-base-100 flex items-center gap-2">
                <Flame className="h-4 w-4 text-alert-amber" />
                ACTIVE CRIME HOTSPOTS
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 px-3 overflow-y-auto max-h-[310px]">
              <div className="space-y-2.5">
                {loading ? (
                  <div className="text-xs text-base-500 p-4">Loading active hotspots...</div>
                ) : (
                  hotspots.map((h) => (
                    <div key={h.id} className="flex flex-col text-xs bg-base-850 border border-base-800 p-3.5 rounded-lg shadow-sm space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-base-100">{h.name}</p>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                          h.riskLevel === "High" 
                            ? "bg-red-500/10 text-red-500 border-red-500/20" 
                            : h.riskLevel === "Medium"
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        }`}>
                          {h.riskLevel}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-base-400">
                        <span>Cases: <b>{h.crimeCount}</b></span>
                        {h.peakTime && <span>Peak Time: <b>{h.peakTime}</b></span>}
                      </div>
                      {h.commonCrime && (
                        <div className="text-[10px] text-base-400 flex items-center justify-between border-t border-base-800/40 pt-1.5">
                          <span>Common Incident:</span>
                          <span className="font-extrabold text-signal-400">{h.commonCrime}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom panels: Trend, Distribution, and Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Trend Area Chart */}
        <Card className="shadow-glass border-base-800">
          <CardHeader className="py-3 px-5 border-b border-base-800 bg-base-700/50">
            <span className="text-[10px] font-extrabold text-base-100 uppercase tracking-wider flex items-center gap-2">
              <BellRing className="h-4 w-4 text-signal-500" />
              HOTSPOT CASE TIMELINE
            </span>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="cases" stroke="#EF4444" strokeWidth={2} dot={{ r: 3, strokeWidth: 1 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Risk Distribution Donut Chart */}
        <Card className="shadow-glass border-base-800">
          <CardHeader className="py-3 px-5 border-b border-base-800 bg-base-700/50">
            <span className="text-[10px] font-extrabold text-base-100 uppercase tracking-wider">
              RISK LEVEL DISTRIBUTION
            </span>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col items-center justify-center">
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={55}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {distribution.map((entry, index) => {
                      const color = COLORS[entry.name as keyof typeof COLORS] || "#CBD5E1";
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Donut Legend */}
            <div className="flex gap-4 text-[10px] font-semibold text-base-400 mt-2">
              {distribution.map((entry) => {
                const color = COLORS[entry.name as keyof typeof COLORS] || "#CBD5E1";
                return (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                    <span>{entry.name}: {entry.value}%</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recommended Actions Check list */}
        <Card className="shadow-glass border-base-800">
          <CardHeader className="py-3 px-5 border-b border-base-800 bg-base-700/50">
            <span className="text-[10px] font-extrabold text-base-100 uppercase tracking-wider flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-signal-500" />
              RECOMMENDED PATROL ACTIONS
            </span>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3.5 text-xs text-base-300">
              <div className="flex items-start gap-2.5">
                <input type="checkbox" defaultChecked className="mt-0.5 h-3.5 w-3.5 accent-signal-500" />
                <div>
                  <p className="font-bold text-base-200">Hebbal Main Road</p>
                  <p className="text-[10px] text-base-500 mt-0.5">Patrol hourly during evening hours (10PM-4AM).</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <input type="checkbox" defaultChecked className="mt-0.5 h-3.5 w-3.5 accent-signal-500" />
                <div>
                  <p className="font-bold text-base-200">Yelahanka Sector 4</p>
                  <p className="text-[10px] text-base-500 mt-0.5">Deploy night patrol beat team near warehouse block.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <input type="checkbox" className="mt-0.5 h-3.5 w-3.5 accent-signal-500" />
                <div>
                  <p className="font-bold text-base-200">Whitefield Circle</p>
                  <p className="text-[10px] text-base-500 mt-0.5">Deploy 2 police checkpoints near Tech Park main gate.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <input type="checkbox" className="mt-0.5 h-3.5 w-3.5 accent-signal-500" />
                <div>
                  <p className="font-bold text-base-200">Marathahalli Bridge Hub</p>
                  <p className="text-[10px] text-base-500 mt-0.5">Install 3 temporary high-definition CCTV security cameras.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
