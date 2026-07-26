import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { apiClient } from "@/shared/lib/api-client";
import { ClipboardCheck, ShieldCheck, MapPin, UserPlus, HelpCircle } from "lucide-react";
import { PoliceStationSearchSelect } from "@/shared/components/PoliceStationSearchSelect";

const KARNATAKA_DISTRICTS = [
  "Bagalkote",
  "Ballari",
  "Belagavi",
  "Bengaluru Rural",
  "Bengaluru Urban",
  "Bidar",
  "Chamarajanagar",
  "Chikkaballapur",
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

export function RegisterCrimePage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    fir_number: "",
    crime_type: "Theft",
    date_time: new Date().toISOString().slice(0, 16), // current local time format for datetime-local
    district: "Bengaluru Urban",
    police_station: "",
    status: "open",
    severity_score: 50,
    description: "",
    victim_age: "",
    victim_gender: "Male",
    victim_employment: "Employed",
    victim_education: "Under Graduate",
    urbanization: "Urban",
    population_density: "",
    offender_name: "",
    offender_age: "",
    offender_is_repeat: false,
    modus_operandi: "",
    weapons_used: "",
    target_place: "",
    escape_method: ""
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const payload = {
        ...formData,
        victim_age: formData.victim_age ? parseInt(formData.victim_age) : null,
        population_density: formData.population_density ? parseInt(formData.population_density) : null,
        offender_age: formData.offender_age ? parseInt(formData.offender_age) : null,
        severity_score: parseInt(formData.severity_score.toString())
      };

      const response = await apiClient.post<{ crimeId: string; firNumber: string; status: string }>(
        "/crimes/register",
        payload
      );

      // Invalidate all query caches so Dashboard and Analytics update instantly
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["crime-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["geospatial"] });
      queryClient.invalidateQueries({ queryKey: ["hotspots"] });
      queryClient.invalidateQueries({ queryKey: ["networks"] });

      setSuccessMsg(`Case registered successfully! Assigned Case ID: ${response.crimeId}`);
      // Reset form
      setFormData({
        fir_number: "",
        crime_type: "Theft",
        date_time: new Date().toISOString().slice(0, 16),
        district: "Bengaluru Urban",
        police_station: "",
        status: "open",
        severity_score: 50,
        description: "",
        victim_age: "",
        victim_gender: "Male",
        victim_employment: "Employed",
        victim_education: "Under Graduate",
        urbanization: "Urban",
        population_density: "",
        offender_name: "",
        offender_age: "",
        offender_is_repeat: false,
        modus_operandi: "",
        weapons_used: "",
        target_place: "",
        escape_method: ""
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to register the case. Please verify connection and inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="label-eyebrow">Data Entry Workspace</p>
        <h1 className="mt-1 font-display text-xl font-semibold text-base-100">KSP Incident Registration Portal</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Banner messages */}
        {successMsg && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-bold flex items-center gap-2">
            <HelpCircle className="h-4 w-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Main Case Info */}
          <div className="xl:col-span-2 space-y-6">
            <Card className="shadow-glass border-base-800 bg-base-850">
              <CardHeader className="py-3.5 px-5 border-b border-base-800 bg-base-700/50">
                <span className="text-xs font-bold text-base-100 uppercase tracking-wider flex items-center gap-2">
                  <ClipboardCheck className="h-4.5 w-4.5 text-signal-500" />
                  CASE IDENTITY & CORE DETAILS
                </span>
              </CardHeader>
              <CardContent className="pt-6 space-y-4 text-xs text-base-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-base-500 uppercase tracking-wider mb-1.5 block">
                      FIR Number *
                    </label>
                    <input
                      type="text"
                      name="fir_number"
                      required
                      placeholder="e.g. 248/2026"
                      value={formData.fir_number}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-base-800 bg-base-950 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-signal-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-base-500 uppercase tracking-wider mb-1.5 block">
                      Crime Category *
                    </label>
                    <select
                      name="crime_type"
                      value={formData.crime_type}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-base-800 bg-base-950 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-signal-500"
                    >
                      <option value="Theft">Theft</option>
                      <option value="Cybercrime">Cybercrime</option>
                      <option value="Assault">Assault</option>
                      <option value="Burglary">Burglary</option>
                      <option value="Vehicle theft">Vehicle theft</option>
                      <option value="Fraud">Fraud</option>
                      <option value="Narcotics">Narcotics</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-base-500 uppercase tracking-wider mb-1.5 block">
                      Date & Time of Occurrence *
                    </label>
                    <input
                      type="datetime-local"
                      name="date_time"
                      required
                      value={formData.date_time}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-base-800 bg-base-950 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-signal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-base-800 pt-4">
                  <div>
                    <label className="text-[10px] font-bold text-base-500 uppercase tracking-wider mb-1.5 block">
                      District Jurisdiction *
                    </label>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-base-800 bg-base-950 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-signal-500"
                    >
                      {KARNATAKA_DISTRICTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-[10px] font-bold text-base-500 uppercase tracking-wider block">
                        Police Station (Search 906 PS) *
                      </label>
                    </div>
                    <PoliceStationSearchSelect
                      value={formData.police_station}
                      selectedDistrict={formData.district}
                      required
                      onChange={(stationName, districtName) => {
                        setFormData((prev) => ({
                          ...prev,
                          police_station: stationName,
                          district: districtName || prev.district,
                        }));
                      }}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-base-500 uppercase tracking-wider mb-1.5 block">
                      Investigation Status *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-base-800 bg-base-950 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-signal-500"
                    >
                      <option value="open">Open</option>
                      <option value="pending">Pending</option>
                      <option value="solved">Solved</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-base-800 pt-4">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[10px] font-bold text-base-500 uppercase tracking-wider">
                      Severity Rating Score ({formData.severity_score}/100)
                    </label>
                  </div>
                  <input
                    type="range"
                    name="severity_score"
                    min="1"
                    max="100"
                    value={formData.severity_score}
                    onChange={handleChange}
                    className="w-full h-1.5 bg-base-800 rounded-lg appearance-none cursor-pointer accent-signal-500"
                  />
                </div>

                <div className="border-t border-base-800 pt-4">
                  <label className="text-[10px] font-bold text-base-500 uppercase tracking-wider mb-1.5 block">
                    Case Narrative & Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    placeholder="Enter case summary narrative details..."
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-base-800 bg-base-950 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-signal-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Demographics & Sociological details */}
            <Card className="shadow-glass border-base-800 bg-base-850">
              <CardHeader className="py-3.5 px-5 border-b border-base-800 bg-base-700/50">
                <span className="text-xs font-bold text-base-100 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="h-4.5 w-4.5 text-signal-500" />
                  SOCIODEMOGRAPHIC INDICATORS
                </span>
              </CardHeader>
              <CardContent className="pt-6 space-y-4 text-xs text-base-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-base-500 uppercase tracking-wider mb-1.5 block">
                      Victim Age
                    </label>
                    <input
                      type="number"
                      name="victim_age"
                      placeholder="e.g. 34"
                      value={formData.victim_age}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-base-800 bg-base-950 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-signal-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-base-500 uppercase tracking-wider mb-1.5 block">
                      Victim Gender
                    </label>
                    <select
                      name="victim_gender"
                      value={formData.victim_gender}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-base-800 bg-base-950 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-signal-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-base-500 uppercase tracking-wider mb-1.5 block">
                      Victim Employment
                    </label>
                    <select
                      name="victim_employment"
                      value={formData.victim_employment}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-base-800 bg-base-950 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-signal-500"
                    >
                      <option value="Employed">Employed</option>
                      <option value="Unemployed">Unemployed</option>
                      <option value="Student">Student</option>
                      <option value="Business owner">Business owner</option>
                      <option value="Home Maker">Home Maker</option>
                      <option value="Retired">Retired</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-base-500 uppercase tracking-wider mb-1.5 block">
                      Victim Education
                    </label>
                    <select
                      name="victim_education"
                      value={formData.victim_education}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-base-800 bg-base-950 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-signal-500"
                    >
                      <option value="High School">High School</option>
                      <option value="Under Graduate">Under Graduate</option>
                      <option value="Post Graduate">Post Graduate</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Illiterate">Illiterate</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-base-800 pt-4">
                  <div>
                    <label className="text-[10px] font-bold text-base-500 uppercase tracking-wider mb-1.5 block">
                      Urbanization Profile
                    </label>
                    <select
                      name="urbanization"
                      value={formData.urbanization}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-base-800 bg-base-950 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-signal-500"
                    >
                      <option value="Urban">Urban</option>
                      <option value="Semi-Urban">Semi-Urban</option>
                      <option value="Rural">Rural</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-base-500 uppercase tracking-wider mb-1.5 block">
                      Local Population Density (ppl/sq km)
                    </label>
                    <input
                      type="number"
                      name="population_density"
                      placeholder="e.g. 750"
                      value={formData.population_density}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-base-800 bg-base-950 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-signal-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Offender & MO section */}
          <div>
            <Card className="h-full shadow-glass border-base-800 bg-base-850">
              <CardHeader className="py-3.5 px-5 border-b border-base-800 bg-base-700/50">
                <span className="text-xs font-bold text-base-100 uppercase tracking-wider flex items-center gap-2">
                  <UserPlus className="h-4.5 w-4.5 text-signal-500" />
                  ACCUSED PROFILE & MO
                </span>
              </CardHeader>
              <CardContent className="pt-6 space-y-4 text-xs text-base-200">
                <div>
                  <label className="text-[10px] font-bold text-base-500 uppercase tracking-wider mb-1.5 block">
                    Accused Name
                  </label>
                  <input
                    type="text"
                    name="offender_name"
                    placeholder="e.g. Ramesh B"
                    value={formData.offender_name}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-base-800 bg-base-950 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-signal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-base-500 uppercase tracking-wider mb-1.5 block">
                      Accused Age
                    </label>
                    <input
                      type="number"
                      name="offender_age"
                      placeholder="e.g. 28"
                      value={formData.offender_age}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-base-800 bg-base-950 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-signal-500"
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 font-bold text-base-300 cursor-pointer">
                      <input
                        type="checkbox"
                        name="offender_is_repeat"
                        checked={formData.offender_is_repeat}
                        onChange={handleChange}
                        className="h-4 w-4 accent-signal-500"
                      />
                      <span>Repeat Offender</span>
                    </label>
                  </div>
                </div>

                <div className="border-t border-base-800 pt-4">
                  <label className="text-[10px] font-bold text-base-500 uppercase tracking-wider mb-1.5 block">
                    Modus Operandi (MO)
                  </label>
                  <textarea
                    name="modus_operandi"
                    rows={2}
                    placeholder="Break in MO details..."
                    value={formData.modus_operandi}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-base-800 bg-base-950 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-signal-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-base-500 uppercase tracking-wider mb-1.5 block">
                    Weapons Used
                  </label>
                  <input
                    type="text"
                    name="weapons_used"
                    placeholder="e.g. Iron Rod"
                    value={formData.weapons_used}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-base-800 bg-base-950 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-signal-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-base-500 uppercase tracking-wider mb-1.5 block">
                    Target Establishment
                  </label>
                  <input
                    type="text"
                    name="target_place"
                    placeholder="e.g. Residential Villa"
                    value={formData.target_place}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-base-800 bg-base-950 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-signal-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-base-500 uppercase tracking-wider mb-1.5 block">
                    Escape Vehicle/Method
                  </label>
                  <input
                    type="text"
                    name="escape_method"
                    placeholder="e.g. Stolen Two Wheeler"
                    value={formData.escape_method}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-base-800 bg-base-950 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-signal-500"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-8 py-3 bg-signal-500 text-white font-extrabold text-xs uppercase tracking-widest rounded-lg hover:bg-signal-600 disabled:opacity-50 transition-all shadow-md shrink-0"
          >
            {loading ? "Registering in SQLite Ledger..." : "Register KSP Case Record"}
          </button>
        </div>
      </form>
    </div>
  );
}
