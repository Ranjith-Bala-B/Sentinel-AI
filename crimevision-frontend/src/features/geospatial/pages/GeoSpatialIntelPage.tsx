import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/shared/components/ui/card";
import { apiClient } from "@/shared/lib/api-client";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { MapPin, BarChart3, ShieldAlert, ShieldCheck } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

interface MapPinData {
  crimeId: string;
  crimeType: string;
  district: string;
  station: string;
  status: string;
  severityScore: number;
  severity?: string;
  weight?: number;
  lat: number;
  lng: number;
  date?: string;
  dateTime?: string;
}

interface DistrictStats {
  district: string;
  totalCrimes: number;
  sparkline: number[];
  topStations: { station: string; count: number }[];
}

const KARNATAKA_DISTRICTS = [
  "Bagalkote",
  "Ballari",
  "Belagavi",
  "Bengaluru Rural",
  "Bengaluru Urban",
  "Bidar",
  "Chamarajanagara",
  "Chikkaballapura",
  "Chikkamagaluru",
  "Chitradurga",
  "Dakshina Kannada",
  "Davanagere",
  "Dharwad",
  "Gadag",
  "Hassan",
  "Haveri",
  "Kalaburagi",
  "Kodagu",
  "Kolar",
  "Koppal",
  "Mandya",
  "Mysuru",
  "Raichur",
  "Ramanagara",
  "Shivamogga",
  "Tumakuru",
  "Udupi",
  "Uttara Kannada",
  "Vijayapura",
  "Vijayanagara",
  "Yadgir"
];

const DISTRICT_CENTERS: Record<string, [number, number]> = {
  "Bagalkote": [16.1813, 75.6958],
  "Ballari": [15.1394, 76.9214],
  "Belagavi": [15.8497, 74.4977],
  "Bengaluru Rural": [13.2084, 77.7082],
  "Bengaluru Urban": [12.9716, 77.5946],
  "Bidar": [17.9104, 77.5199],
  "Chamarajanagara": [11.9261, 76.9402],
  "Chikkaballapura": [13.4324, 77.7285],
  "Chikkamagaluru": [13.3161, 75.7720],
  "Chitradurga": [14.2251, 76.4005],
  "Dakshina Kannada": [12.9141, 74.8560],
  "Davanagere": [14.4644, 75.9218],
  "Dharwad": [15.4589, 75.0078],
  "Gadag": [15.4379, 75.6418],
  "Hassan": [13.0072, 76.1026],
  "Haveri": [14.7958, 75.3993],
  "Kalaburagi": [17.3297, 76.8343],
  "Kodagu": [12.4244, 75.7397],
  "Kolar": [13.1368, 78.1292],
  "Koppal": [15.3478, 76.1553],
  "Mandya": [12.5218, 76.8951],
  "Mysuru": [12.2958, 76.6394],
  "Raichur": [16.2076, 77.3623],
  "Ramanagara": [12.7256, 77.2811],
  "Shivamogga": [13.9299, 75.5681],
  "Tumakuru": [13.3379, 77.1173],
  "Udupi": [13.3409, 74.7421],
  "Uttara Kannada": [14.8185, 74.1303],
  "Vijayapura": [16.8302, 75.7100],
  "Vijayanagara": [15.2689, 76.3909],
  "Yadgir": [16.7649, 77.1377]
};

export function GeoSpatialIntelPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts");
  const [selectedStation, setSelectedStation] = useState("All Stations");
  const [viewMode, setViewMode] = useState<"pins" | "heat" | "density">("heat");
  const [districtsList] = useState<string[]>(["All Districts", ...KARNATAKA_DISTRICTS]);

  // 1. Fetch map pins & heatmap via React Query for live auto-syncing
  const { data: pins = [], isLoading: isPinsLoading } = useQuery<MapPinData[]>({
    queryKey: ["geospatial", "map"],
    queryFn: () => apiClient.get<MapPinData[]>("/geospatial/map"),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  // 2. Fetch district stats via React Query
  const { data: districtStats, isLoading: isStatsLoading } = useQuery<DistrictStats>({
    queryKey: ["geospatial", "district", selectedDistrict],
    queryFn: () => apiClient.get<DistrictStats>(`/geospatial/district/${selectedDistrict}`),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  // Reset selected station when district changes
  useEffect(() => {
    setSelectedStation("All Stations");
  }, [selectedDistrict]);

  // 3. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Default center Karnataka
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false
    }).setView([14.5, 75.8], 7);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19
    }).addTo(map);

    markersGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 4. Filter and Plot Map Layers (Pins, Heatmap, or Density Overlay)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = markersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    const filteredPins = pins.filter((p) => {
      if (!p.lat || !p.lng) return false;
      if (selectedDistrict !== "All Districts" && p.district !== selectedDistrict) return false;
      if (selectedStation !== "All Stations" && p.station !== selectedStation) return false;
      return true;
    });

    if (viewMode === "heat") {
      // Heat Map View using leaflet.heat plugin
      if (filteredPins.length > 0) {
        const heatPoints: Array<[number, number, number]> = filteredPins.map((p) => [
          p.lat,
          p.lng,
          p.weight || Math.max(1.0, (p.severityScore || 50) / 20.0)
        ]);

        const heatLayer = L.heatLayer(heatPoints, {
          radius: 25,
          blur: 15,
          maxZoom: 15,
          minOpacity: 0.4,
          gradient: {
            0.2: "#3B82F6", // Low risk blue
            0.4: "#10B981", // Moderate green
            0.6: "#F59E0B", // High orange
            0.8: "#EF4444", // Critical red
            1.0: "#991B1B"  // Extreme dark red
          }
        });

        group.addLayer(heatLayer);

        // Also add small interactive marker clusters over heatmap
        filteredPins.forEach((pin) => {
          const marker = L.circleMarker([pin.lat, pin.lng], {
            radius: 5,
            fillColor: "#EF4444",
            color: "#FFFFFF",
            weight: 1,
            fillOpacity: 0.8
          });

          marker.bindPopup(`
            <div style="font-family: Inter, sans-serif; font-size: 11px; width: 165px; line-height: 1.4;">
              <b style="color: #0F172A; font-size: 12px; display: block; margin-bottom: 4px;">🔥 ${pin.crimeType}</b>
              <div style="margin-bottom: 2px;"><b>ID:</b> ${pin.crimeId}</div>
              <div style="margin-bottom: 2px;"><b>Station:</b> ${pin.station}</div>
              <div style="margin-bottom: 2px;"><b>District:</b> ${pin.district}</div>
              <div style="margin-bottom: 2px;"><b>Severity:</b> <span style="color: #EF4444; font-weight: bold;">${pin.severityScore}/100</span></div>
              <div><b>Status:</b> <span style="text-transform: uppercase; font-weight: 600;">${pin.status}</span></div>
            </div>
          `);
          group.addLayer(marker);
        });
      }
    } else if (viewMode === "density") {
      // Density View: Draw larger color-coded overlays at district centers
      const districts = Array.from(new Set(pins.map(p => p.district))).filter(Boolean);
      districts.forEach((dist) => {
        const center = DISTRICT_CENTERS[dist];
        if (!center) return;

        const distPins = pins.filter(p => p.district === dist);
        const count = distPins.length;
        if (count === 0) return;

        let color = "#10B981"; // Low (green)
        let riskLabel = "Low Risk";
        if (count >= 15 || dist === "Bengaluru Urban") {
          color = "#EF4444"; // Critical (red)
          riskLabel = "Critical Density";
        } else if (count >= 8 || dist === "Mysuru" || dist === "Ballari") {
          color = "#F59E0B"; // High (orange)
          riskLabel = "High Density";
        } else if (count >= 4) {
          color = "#EAB308"; // Moderate (yellow)
          riskLabel = "Moderate Density";
        }

        const radius = Math.min(50, 15 + count * 1.5);

        const circle = L.circleMarker(center, {
          radius: radius,
          fillColor: color,
          color: color,
          weight: 2,
          opacity: 0.45,
          fillOpacity: 0.45
        });

        circle.bindPopup(`
          <div style="font-family: Inter, sans-serif; font-size: 11px; width: 160px; line-height: 1.4;">
            <b style="color: #0F172A; font-size: 12px; display: block; margin-bottom: 4px;">${dist}</b>
            <div style="margin-bottom: 2px;"><b>Risk Category:</b> <span style="color: ${color}; font-weight: bold;">${riskLabel}</span></div>
            <div><b>Total Cases Plotted:</b> <b>${count}</b></div>
          </div>
        `);

        group.addLayer(circle);
      });
    } else {
      // Pin View: Plot individual case markers
      filteredPins.forEach((pin) => {
        let color = "#3B82F6"; // Low (blue)
        if (pin.severityScore > 75) color = "#EF4444"; // Critical red
        else if (pin.severityScore > 50) color = "#F59E0B"; // High orange
        else if (pin.severityScore > 30) color = "#EAB308"; // Moderate yellow

        const circle = L.circleMarker([pin.lat, pin.lng], {
          radius: 8,
          fillColor: color,
          color: "#FFFFFF",
          weight: 1.5,
          opacity: 0.85,
          fillOpacity: 0.75
        });

        circle.bindPopup(`
          <div style="font-family: Inter, sans-serif; font-size: 11px; width: 165px; line-height: 1.4;">
            <b style="color: #0F172A; font-size: 12px; display: block; margin-bottom: 4px;">${pin.crimeType}</b>
            <div style="margin-bottom: 2px;"><b>ID:</b> ${pin.crimeId}</div>
            <div style="margin-bottom: 2px;"><b>Station:</b> ${pin.station}</div>
            <div style="margin-bottom: 2px;"><b>Severity:</b> <span style="color: ${color}; font-weight: bold;">${pin.severityScore}/100</span></div>
            <div><b>Status:</b> <span style="text-transform: uppercase; font-weight: 600;">${pin.status}</span></div>
          </div>
        `);

        group.addLayer(circle);
      });
    }

    // Zoom/Center dynamically based on filters
    if (selectedDistrict !== "All Districts") {
      const center = DISTRICT_CENTERS[selectedDistrict];
      if (center) {
        if (selectedStation !== "All Stations") {
          const stationPin = filteredPins.find(p => p.station === selectedStation);
          if (stationPin && stationPin.lat && stationPin.lng) {
            map.setView([stationPin.lat, stationPin.lng], 13);
          } else {
            map.setView(center, 12);
          }
        } else {
          map.setView(center, 10);
        }
      }
    } else {
      try {
        const coords = filteredPins.map(p => [p.lat, p.lng] as L.LatLngExpression);
        if (coords.length > 0) {
          const bounds = L.latLngBounds(coords);
          map.fitBounds(bounds, { padding: [30, 30] });
        }
      } catch (e) {}
    }
  }, [pins, viewMode, selectedDistrict, selectedStation]);

  // Unique stations for selected district
  const stationsList = selectedDistrict === "All Districts"
    ? []
    : Array.from(new Set(pins.filter(p => p.district === selectedDistrict).map(p => p.station))).filter(Boolean);

  const sparklineData = districtStats?.sparkline?.map((val, idx) => ({
    name: idx.toString(),
    val
  })) || [];

  const loading = isPinsLoading || isStatsLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="label-eyebrow">Geographic Intelligence</p>
          <h1 className="mt-1 font-display text-xl font-semibold text-base-100">GIS Heat Map & Spatial Analytics</h1>
        </div>
        
        {/* Selection panel / drill downs */}
        <div className="flex flex-wrap items-center gap-3">
          {/* District drill-down */}
          <div className="flex items-center gap-1.5">
            <label className="text-[10px] font-bold text-base-400 uppercase tracking-wider">District:</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="rounded-lg border border-base-800 bg-base-850 px-3 py-1.5 text-xs font-semibold text-base-200 focus:outline-none focus:ring-1 focus:ring-signal-500 shadow-sm"
            >
              {districtsList.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Police Station drill-down */}
          {selectedDistrict !== "All Districts" && (
            <div className="flex items-center gap-1.5">
              <label className="text-[10px] font-bold text-base-400 uppercase tracking-wider">Station:</label>
              <select
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
                className="rounded-lg border border-base-800 bg-base-850 px-3 py-1.5 text-xs font-semibold text-base-200 focus:outline-none focus:ring-1 focus:ring-signal-500 shadow-sm"
              >
                <option value="All Stations">All Stations</option>
                {stationsList.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {/* Map view mode toggle (heat vs pins vs density map) */}
          <div className="flex rounded-lg bg-base-900/60 p-1 border border-base-800">
            <button
              onClick={() => setViewMode("heat")}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${viewMode === "heat" ? "bg-signal-500/15 text-signal-300" : "text-base-400 hover:text-base-200"}`}
            >
              Heat Map
            </button>
            <button
              onClick={() => setViewMode("pins")}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${viewMode === "pins" ? "bg-signal-500/15 text-signal-300" : "text-base-400 hover:text-base-200"}`}
            >
              Pin View
            </button>
            <button
              onClick={() => setViewMode("density")}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${viewMode === "density" ? "bg-signal-500/15 text-signal-300" : "text-base-400 hover:text-base-200"}`}
            >
              Density Map
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Leaflet Map Block */}
        <div className="xl:col-span-2 space-y-4">
          <Card className="relative overflow-hidden shadow-glass border-base-800">
            <div className="flex items-center justify-between border-b border-base-800 bg-base-700/50 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-signal-500" />
                <span className="text-xs font-bold text-base-100 uppercase tracking-wider">Karnataka Live Spatial Map</span>
              </div>
              <span className="text-[10px] bg-signal-400/10 text-signal-500 font-semibold px-2 py-0.5 rounded border border-signal-400/20">
                {viewMode === "heat" ? "Leaflet Heat Intensity Layer" : viewMode === "pins" ? "GIS Incidents Plotted" : "Crime Hotspot Density"}
              </span>
            </div>
            <div className="relative h-[480px] w-full">
              <div ref={mapContainerRef} className="h-full w-full z-10" />
              
              {/* Density Map Legend Overlay */}
              <div className="absolute bottom-4 left-4 z-20 bg-base-950/95 border border-base-800 p-3.5 rounded-lg shadow-md text-[10px] w-40 font-semibold backdrop-blur-sm">
                <p className="text-base-100 font-bold mb-1.5 border-b border-base-800 pb-1">Heat Map Gradient</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
                    <span>Critical Severity (75+)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <span>High Severity (50-74)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                    <span>Moderate Severity (30-49)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                    <span>Low Severity (&lt;30)</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar stats panel */}
        <div className="space-y-6">
          <Card className="shadow-glass border-base-800">
            <div className="border-b border-base-800 bg-base-700/50 py-3.5 px-5">
              <span className="text-xs font-bold text-base-100 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-signal-500" />
                {selectedDistrict === "All Districts" ? "STATEWIDE OVERVIEW" : `${selectedDistrict.toUpperCase()} VIEW`}
              </span>
            </div>
            <CardContent className="pt-5 space-y-4">
              <div>
                <p className="text-[10px] font-bold text-base-500 uppercase tracking-wider">Total Crimes</p>
                <h3 className="text-3xl font-extrabold text-base-50 mt-1">
                  {loading ? "..." : (districtStats?.totalCrimes.toLocaleString() ?? "0")}
                </h3>
              </div>

              {!loading && districtStats && districtStats.totalCrimes === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 px-4 text-center border border-emerald-500/10 bg-emerald-500/5 rounded-xl">
                  <ShieldCheck className="h-8 w-8 mb-2 text-emerald-500" />
                  <span className="font-semibold text-emerald-400 text-xs">No Crimes Reported</span>
                  <p className="text-[10px] text-base-400 mt-1">
                    There are no recorded crime incidents in this district jurisdiction.
                  </p>
                </div>
              ) : (
                <>
                  {/* Caseload sparkline */}
                  <div>
                    <p className="text-[10px] font-bold text-base-500 uppercase tracking-wider mb-2">Caseload Frequency Trend</p>
                    <div className="h-16 w-full">
                      {!loading && sparklineData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={sparklineData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                            <defs>
                              <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#2563EB" stopOpacity={0.2} />
                                <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="val" stroke="#2563EB" strokeWidth={1.5} fill="url(#sparklineGrad)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs text-base-500">Loading trend...</div>
                      )}
                    </div>
                  </div>

                  {/* Police stations details list */}
                  <div className="border-t border-base-800 pt-4">
                    <p className="text-[10px] font-bold text-base-500 uppercase tracking-wider mb-2.5">
                      {selectedDistrict === "All Districts" ? "Top Police Stations ( caseload )" : "Stations Breakdown"}
                    </p>
                    <div className="space-y-2">
                      {loading ? (
                        <div className="text-xs text-base-500">Loading stations...</div>
                      ) : (
                        districtStats?.topStations && districtStats.topStations.length > 0 ? (
                          districtStats.topStations.map((s, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs bg-base-950 p-2.5 rounded-lg border border-base-800 shadow-sm">
                              <span className="font-semibold text-base-200">{s.station}</span>
                              <span className="font-extrabold text-signal-500 bg-signal-500/5 border border-signal-500/10 px-2.5 py-0.5 rounded">
                                {s.count} cases
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-base-500">No station breakdown available</div>
                        )
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-signal-500/5 border-signal-500/20 text-xs shadow-glass">
            <div className="py-3 px-5 border-b border-signal-500/10 bg-signal-500/10 flex items-center gap-2 font-bold text-signal-600">
              <ShieldAlert className="h-4 w-4" />
              <span>Heatmap & GIS Guidelines</span>
            </div>
            <CardContent className="pt-4">
              <p className="text-base-300 leading-relaxed">
                Toggle **Heat Map** to visualize live spatial density intensity. Filter by **District** to center on specific regions, or select a **Police Station** to automatically zoom in on exact incident markers.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
