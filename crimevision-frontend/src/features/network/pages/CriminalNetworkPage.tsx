import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { apiClient } from "@/shared/lib/api-client";
import { Users, Filter, GitFork, Info } from "lucide-react";

interface NodeData {
  id: string;
  label: string;
  type: "gang" | "accused" | "victim" | "location" | "vehicle" | "crime";
}

interface EdgeData {
  id: string;
  source: string;
  target: string;
  label: string;
  weight: number;
}

interface GraphResponse {
  nodes: NodeData[];
  edges: EdgeData[];
  summary: {
    totalPersons: number;
    totalGangs: number;
    totalConnections: number;
    highRiskGroups: number;
  };
}

export function CriminalNetworkPage() {
  const [networkType, setNetworkType] = useState("All");
  const [depth, setDepth] = useState(2);
  const [graphData, setGraphData] = useState<GraphResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Fetch network data
  useEffect(() => {
    async function loadNetwork() {
      try {
        setLoading(true);
        const data = await apiClient.get<GraphResponse>(`/networks/graph?networkType=${networkType}&depth=${depth}`);
        setGraphData(data);
        // Default select core node if available
        const gang = data.nodes.find(n => n.type === "gang");
        if (gang) setSelectedNode(gang);
      } catch (err) {
        console.error("Error loading criminal network", err);
      } finally {
        setLoading(false);
      }
    }
    loadNetwork();
  }, [networkType, depth]);

  // Compute fixed clean symmetrical layout coordinates for the nodes inside 760x420 SVG
  const getNodeCoordinates = (nodes: NodeData[]) => {
    const coords: Record<string, { x: number; y: number }> = {};
    const center = { x: 380, y: 210 };
    
    // Core node: Gang A
    const gangNode = nodes.find(n => n.type === "gang");
    if (gangNode) {
      coords[gangNode.id] = center;
    }
    
    // Inner Ring: Suspects / Accused
    const suspects = nodes.filter(n => n.type === "accused");
    suspects.forEach((s, idx) => {
      const angle = (idx * 2 * Math.PI) / suspects.length;
      coords[s.id] = {
        x: center.x + 110 * Math.cos(angle),
        y: center.y + 110 * Math.sin(angle)
      };
    });
    
    // Outer Ring: Crimes, Vehicles, Locations, Victims
    const outers = nodes.filter(n => n.type !== "gang" && n.type !== "accused");
    outers.forEach((o, idx) => {
      const angle = (idx * 2 * Math.PI) / outers.length;
      coords[o.id] = {
        x: center.x + 230 * Math.cos(angle),
        y: center.y + 230 * Math.sin(angle)
      };
    });
    
    // Fallback coordinates for any miscellaneous node
    nodes.forEach(n => {
      if (!coords[n.id]) {
        coords[n.id] = {
          x: center.x + randomInt(-100, 100),
          y: center.y + randomInt(-100, 100)
        };
      }
    });
    
    return coords;
  };
  
  const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

  const nodeCoords = graphData ? getNodeCoordinates(graphData.nodes) : {};

  // Check if a node is linked to the currently selected or hovered node
  const isAdjacent = (nodeId: string) => {
    if (!graphData) return false;
    const focusId = hoveredNode || selectedNode?.id;
    if (!focusId) return true;
    if (nodeId === focusId) return true;
    
    return graphData.edges.some(e => 
      (e.source === focusId && e.target === nodeId) ||
      (e.target === focusId && e.source === nodeId)
    );
  };

  const getEdgeOpacity = (edge: EdgeData) => {
    const focusId = hoveredNode || selectedNode?.id;
    if (!focusId) return 0.6;
    if (edge.source === focusId || edge.target === focusId) return 0.9;
    return 0.15;
  };

  const getNodeColor = (type: string) => {
    const colors = {
      gang: "#EF4444",      // Red
      accused: "#2563EB",   // Blue
      victim: "#10B981",    // Green
      location: "#14B8A6",  // Teal
      vehicle: "#8B5CF6",   // Purple
      crime: "#F59E0B"      // Orange
    };
    return colors[type as keyof typeof colors] || "#64748B";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="label-eyebrow">Intelligence Graphs</p>
          <h1 className="mt-1 font-display text-xl font-semibold text-base-100">Criminal Network Dashboard</h1>
        </div>

        {/* Graph Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-base-500" />
            <label className="text-xs font-bold text-base-400">Node Type:</label>
            <select
              value={networkType}
              onChange={(e) => setNetworkType(e.target.value)}
              className="rounded-lg border border-base-800 bg-base-850 px-3 py-1.5 text-xs font-semibold text-base-200 focus:outline-none focus:ring-1 focus:ring-signal-500 shadow-sm"
            >
              <option value="All">All Entities</option>
              <option value="gang">Gangs</option>
              <option value="accused">Accused</option>
              <option value="vehicle">Vehicles</option>
              <option value="location">Locations</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-base-400">Depth:</label>
            <select
              value={depth}
              onChange={(e) => setDepth(Number(e.target.value))}
              className="rounded-lg border border-base-800 bg-base-850 px-3 py-1.5 text-xs font-semibold text-base-200 focus:outline-none focus:ring-1 focus:ring-signal-500 shadow-sm"
            >
              <option value={1}>1 Level</option>
              <option value={2}>2 Levels</option>
              <option value={3}>3 Levels</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        {/* Main Network Graph SVG Container */}
        <div className="xl:col-span-3">
          <Card className="overflow-hidden shadow-glass border-base-800 bg-base-850">
            <div className="flex items-center justify-between border-b border-base-800 bg-base-700/50 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <GitFork className="h-4 w-4 text-signal-500" />
                <span className="text-xs font-bold text-base-100 uppercase tracking-wider">Karnataka Syndicate Link Analysis</span>
              </div>
              <span className="text-[10px] bg-red-400/10 text-alert-red font-semibold px-2 py-0.5 rounded border border-red-400/20">
                Interactive Graph Model
              </span>
            </div>
            <div className="relative h-[430px] w-full bg-base-750/30 overflow-hidden">
              {loading ? (
                <div className="h-full flex items-center justify-center text-xs text-base-500">
                  Compiling network linkages...
                </div>
              ) : graphData ? (
                <svg className="h-full w-full select-none" viewBox="0 0 760 420">
                  {/* Grid overlay background */}
                  <rect width="760" height="420" fill="url(#gridPattern)" className="opacity-40" />
                  <defs>
                    <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" strokeWidth="0.5" />
                    </pattern>
                  </defs>

                  {/* Edges Link Lines */}
                  {graphData.edges.map((e) => {
                    const sourceCoord = nodeCoords[e.source];
                    const targetCoord = nodeCoords[e.target];
                    if (!sourceCoord || !targetCoord) return null;
                    
                    const isFocus = (hoveredNode || selectedNode?.id) 
                      ? (e.source === (hoveredNode || selectedNode?.id) || e.target === (hoveredNode || selectedNode?.id))
                      : true;

                    return (
                      <g key={e.id}>
                        {/* Core Line */}
                        <line
                          x1={sourceCoord.x}
                          y1={sourceCoord.y}
                          x2={targetCoord.x}
                          y2={targetCoord.y}
                          stroke={isFocus ? "#0F3DA3" : "#CBD5E1"}
                          strokeWidth={isFocus ? 2.5 : 1}
                          opacity={getEdgeOpacity(e)}
                          className="transition-all duration-300"
                        />
                        {/* Link text label on center of line */}
                        {isFocus && (
                          <text
                            x={(sourceCoord.x + targetCoord.x) / 2}
                            y={(sourceCoord.y + targetCoord.y) / 2 - 4}
                            fontSize="8"
                            fontWeight="bold"
                            textAnchor="middle"
                            fill="#0F3DA3"
                            className="bg-white px-1"
                          >
                            {e.label}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Nodes Circles */}
                  {graphData.nodes.map((n) => {
                    const coord = nodeCoords[n.id];
                    if (!coord) return null;

                    const isDimmed = (hoveredNode || selectedNode?.id) && !isAdjacent(n.id);
                    const isSelected = selectedNode?.id === n.id;
                    const color = getNodeColor(n.type);

                    return (
                      <g
                        key={n.id}
                        transform={`translate(${coord.x}, ${coord.y})`}
                        className="cursor-pointer transition-all duration-300"
                        onClick={() => setSelectedNode(n)}
                        onMouseEnter={() => setHoveredNode(n.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                        opacity={isDimmed ? 0.25 : 1}
                      >
                        <circle
                          r={n.type === "gang" ? 18 : 12}
                          fill={color}
                          stroke="#FFFFFF"
                          strokeWidth={isSelected ? 3 : 1.5}
                          className="shadow-md hover:scale-115 transition-transform duration-200"
                        />
                        <text
                          y={n.type === "gang" ? 30 : 22}
                          textAnchor="middle"
                          fontSize="9"
                          fontWeight="bold"
                          fill="#0F172A"
                        >
                          {n.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-base-500">
                  No network data compiled.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar - Node inspector details */}
        <div>
          <Card className="h-full shadow-glass border-base-800 bg-base-850">
            <CardHeader className="border-b border-base-800 bg-base-700/50 py-3.5 px-5">
              <CardTitle className="text-xs font-bold text-base-100 flex items-center gap-2">
                <Info className="h-4 w-4 text-signal-500" />
                ENTITY DETECTOR
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              {selectedNode ? (
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] px-2 py-0.5 rounded font-extrabold uppercase border"
                      style={{ 
                        backgroundColor: `${getNodeColor(selectedNode.type)}15`,
                        color: getNodeColor(selectedNode.type),
                        borderColor: `${getNodeColor(selectedNode.type)}30`
                      }}
                    >
                      {selectedNode.type}
                    </span>
                    <h3 className="text-lg font-bold text-base-100 mt-2">{selectedNode.label}</h3>
                  </div>

                  <div className="border-t border-base-800 pt-3 space-y-2 text-xs">
                    <p className="text-base-500 font-semibold uppercase tracking-wider text-[9px]">Association Details</p>
                    {selectedNode.type === "gang" && (
                      <p className="text-base-300 leading-relaxed">
                        This syndicate coordinates burglaries and vehicle thefts. Multiple active accused are connected to this gang ring.
                      </p>
                    )}
                    {selectedNode.type === "accused" && (
                      <p className="text-base-300 leading-relaxed">
                        Suspect linked to multiple active FIRs. Modus Operandi matches Gang A coordinated activities.
                      </p>
                    )}
                    {selectedNode.type === "crime" && (
                      <p className="text-base-300 leading-relaxed">
                        Active FIR case details. Investigation points to accomplice linkages.
                      </p>
                    )}
                    {selectedNode.type === "vehicle" && (
                      <p className="text-base-300 leading-relaxed">
                        Vehicle used for escape. Linked to getaway route coordinates.
                      </p>
                    )}
                    {selectedNode.type === "location" && (
                      <p className="text-base-300 leading-relaxed">
                        Geospatial coordinate node where syndicate members operated or were arrested.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-base-500 leading-relaxed">
                  Click on any node in the syndicate graph to inspect details, adjacent members, and case linkages.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Syndicate Statistics Row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Total syndicate persons", value: "1,348", icon: <Users className="h-4 w-4" /> },
          { label: "Tracked active gangs", value: "86", icon: <GitFork className="h-4 w-4" /> },
          { label: "Interconnected links", value: "2,346", icon: <GitFork className="h-4 w-4" /> },
          { label: "High risk syndicates", value: "23", icon: <Users className="h-4 w-4" /> }
        ].map((stat, idx) => (
          <Card key={idx} className="p-4 border-base-800 shadow-glass">
            <div className="flex items-center justify-between">
              <span className="label-eyebrow text-[10px]">{stat.label}</span>
              <span className="rounded-md bg-signal-500/10 p-1.5 text-signal-500">{stat.icon}</span>
            </div>
            <p className="mt-3 font-display text-xl font-extrabold text-base-100">{stat.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
