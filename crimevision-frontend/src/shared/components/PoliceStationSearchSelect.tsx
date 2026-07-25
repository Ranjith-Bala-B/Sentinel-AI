import { useState, useMemo, useRef, useEffect } from "react";
import { Search, Building2, MapPin, Check, ChevronDown, X, Shield } from "lucide-react";
import { KARNATAKA_POLICE_STATIONS, PoliceStationItem } from "@/shared/data/karnatakaPoliceStations";

interface PoliceStationSearchSelectProps {
  value: string;
  onChange: (stationName: string, districtName: string) => void;
  selectedDistrict?: string;
  required?: boolean;
}

export function PoliceStationSearchSelect({
  value,
  onChange,
  selectedDistrict,
  required = false,
}: PoliceStationSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState<string>("ALL");
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync initial district filter if selectedDistrict is passed
  useEffect(() => {
    if (selectedDistrict && selectedDistrict !== "ALL") {
      setDistrictFilter(selectedDistrict);
    }
  }, [selectedDistrict]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter 906 stations by search query & district filter
  const filteredStations = useMemo(() => {
    return KARNATAKA_POLICE_STATIONS.filter((item) => {
      // District filter match
      if (districtFilter !== "ALL" && item.district.toLowerCase() !== districtFilter.toLowerCase()) {
        return false;
      }
      // Search query match
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        item.name.toLowerCase().includes(q) ||
        item.district.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, districtFilter]);

  const handleSelect = (item: PoliceStationItem) => {
    onChange(item.name, item.district);
    setIsOpen(false);
  };

  const selectedItem = KARNATAKA_POLICE_STATIONS.find(
    (s) => s.name.toLowerCase() === value.toLowerCase()
  );

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Search Input Trigger Box */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full cursor-pointer rounded-lg border border-base-800 bg-base-950 px-3 py-2 text-xs flex items-center justify-between shadow-sm hover:border-base-700 transition-colors focus:ring-1 focus:ring-signal-500"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <Building2 className="h-4 w-4 text-signal-500 shrink-0" />
          {value ? (
            <div className="truncate">
              <span className="font-bold text-base-100">{value}</span>
              {selectedItem && (
                <span className="text-[10px] text-base-400 ml-2 font-semibold">
                  ({selectedItem.district})
                </span>
              )}
            </div>
          ) : (
            <span className="text-base-500 font-medium truncate">
              Select or search police station (906 stations available)...
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("", selectedDistrict || "");
              }}
              className="p-0.5 hover:bg-base-800 rounded text-base-400 hover:text-base-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <ChevronDown className={`h-4 w-4 text-base-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </div>

      {/* Hidden input for native HTML form validation if required */}
      {required && (
        <input
          type="text"
          value={value}
          onChange={() => {}}
          required
          tabIndex={-1}
          className="opacity-0 absolute inset-0 pointer-events-none h-0 w-0"
        />
      )}

      {/* Dropdown Popup Overlay */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-base-900 border border-base-750 rounded-xl shadow-2xl overflow-hidden animate-in fade-in duration-150">
          {/* Header & Instant Search Box */}
          <div className="p-3 border-b border-base-800 bg-base-950/80 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-base-400">
              <span className="flex items-center gap-1.5 text-signal-400">
                <Shield className="h-3.5 w-3.5" />
                Karnataka PS Directory (906 Total)
              </span>
              <span>{filteredStations.length} Matching</span>
            </div>

            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-base-400" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search station by name, district, or type (e.g. Hebbal, Manipal, CEN)..."
                className="w-full pl-9 pr-8 py-1.5 text-xs bg-base-900 border border-base-800 rounded-lg text-base-100 placeholder-base-500 focus:outline-none focus:border-signal-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-base-400 hover:text-base-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Quick District Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[10px]">
              <button
                type="button"
                onClick={() => setDistrictFilter("ALL")}
                className={`px-2 py-0.5 rounded-full font-bold transition-colors whitespace-nowrap ${
                  districtFilter === "ALL"
                    ? "bg-signal-500 text-white"
                    : "bg-base-800 text-base-300 hover:bg-base-750"
                }`}
              >
                All Districts (906)
              </button>
              {selectedDistrict && selectedDistrict !== "ALL" && (
                <button
                  type="button"
                  onClick={() => setDistrictFilter(selectedDistrict)}
                  className={`px-2 py-0.5 rounded-full font-bold transition-colors whitespace-nowrap ${
                    districtFilter === selectedDistrict
                      ? "bg-signal-500 text-white"
                      : "bg-base-800 text-base-300 hover:bg-base-750"
                  }`}
                >
                  {selectedDistrict} Only
                </button>
              )}
              {districtFilter !== "ALL" && districtFilter !== selectedDistrict && (
                <button
                  type="button"
                  onClick={() => setDistrictFilter(districtFilter)}
                  className="px-2 py-0.5 rounded-full font-bold bg-signal-500 text-white whitespace-nowrap"
                >
                  Filter: {districtFilter}
                </button>
              )}
            </div>
          </div>

          {/* Station Results List (Max Height Scrollable) */}
          <div className="max-h-64 overflow-y-auto divide-y divide-base-800/40 text-xs">
            {filteredStations.length === 0 ? (
              <div className="p-4 text-center text-base-500 font-medium">
                No police station found matching "{searchQuery}"
              </div>
            ) : (
              filteredStations.map((item) => {
                const isSelected = item.name.toLowerCase() === value.toLowerCase();
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={`p-2.5 px-3 cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected
                        ? "bg-signal-500/15 text-signal-400 font-bold"
                        : "hover:bg-base-800/60 text-base-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <MapPin className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-signal-400" : "text-base-400"}`} />
                      <div className="truncate">
                        <p className="font-semibold leading-tight text-base-100">{item.name}</p>
                        <p className="text-[10px] text-base-400 font-normal">
                          {item.district} District • {item.type}
                        </p>
                      </div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-signal-400 shrink-0 ml-2" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
