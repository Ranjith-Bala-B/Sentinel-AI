import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { apiClient } from "@/shared/lib/api-client";
import { Search, FileText, Share2, ClipboardList, Camera, FolderOpen, Video, Fingerprint } from "lucide-react";

interface CaseDetails {
  crimeId: string;
  fir: string;
  crimeType: string;
  date: string;
  status: string;
  station: string;
  district: string;
  victim: string;
  summary: string;
}

interface SimilarCase {
  fir: string;
  similarity: number;
  commonFeatures: string;
  lead: string;
}

interface Evidence {
  photos: number;
  documents: number;
  videos: number;
  fingerprints: number;
  other: number;
}

interface Lead {
  id: string;
  text: string;
  completed: boolean;
}

interface DecisionSupportResponse {
  caseDetails: CaseDetails;
  similarCases: SimilarCase[];
  evidence: Evidence;
  leads: Lead[];
}

export function InvestigatorDeskPage() {
  const [searchQuery, setSearchQuery] = useState("CR-2026-00001");
  const [caseSupport, setCaseSupport] = useState<DecisionSupportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [leadsState, setLeadsState] = useState<Lead[]>([]);

  const loadCaseData = async (targetId: string) => {
    try {
      setLoading(true);
      const data = await apiClient.get<DecisionSupportResponse>(`/investigator/case/${targetId}`);
      setCaseSupport(data);
      setLeadsState(data.leads);
    } catch (err) {
      console.error("Error loading investigator case support data", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadCaseData("CR-2026-00001");
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      loadCaseData(searchQuery.trim());
    }
  };

  const handleToggleLead = async (leadId: string, currentStatus: boolean) => {
    const updated = leadsState.map((l) => (l.id === leadId ? { ...l, completed: !currentStatus } : l));
    setLeadsState(updated);
    try {
      await apiClient.post("/investigator/leads/toggle", { leadId, completed: !currentStatus });
    } catch (err) {
      console.error("Error toggling lead", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="label-eyebrow">Decision Support Engine</p>
          <h1 className="mt-1 font-display text-xl font-semibold text-base-100">Investigator Decision Support Dashboard</h1>
        </div>

        {/* Case Search Form */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-base-500" />
            <input
              type="text"
              placeholder="Search Case ID (e.g. CR-2026-00001)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-8 pr-3 py-1.5 bg-base-850 border border-base-800 rounded-lg text-xs font-semibold text-base-100 focus:outline-none focus:ring-1 focus:ring-signal-500 shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-signal-500 text-white font-semibold text-xs rounded-lg hover:bg-signal-600 shadow-sm"
          >
            Search
          </button>
        </form>
      </div>

      {loading || !caseSupport ? (
        <div className="text-xs text-base-500 p-8 text-center bg-base-850 rounded-lg border border-base-800 shadow-glass">
          Retrieving decision support variables...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Left Panel: Case Summary */}
            <div className="xl:col-span-2">
              <Card className="h-full shadow-glass border-base-800 bg-base-850">
                <CardHeader className="py-3.5 px-5 border-b border-base-800 bg-base-700/50">
                  <span className="text-xs font-bold text-base-100 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="h-4 w-4 text-signal-500" />
                    CASE DETAILS SUMMARY: {caseSupport.caseDetails.crimeId}
                  </span>
                </CardHeader>
                <CardContent className="pt-5 space-y-4 text-xs">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-base-950 p-4 rounded-lg border border-base-800">
                    <div>
                      <p className="text-base-500 font-bold text-[9px] uppercase tracking-wider">FIR Number</p>
                      <p className="text-base-100 mt-1 font-semibold">{caseSupport.caseDetails.fir}</p>
                    </div>
                    <div>
                      <p className="text-base-500 font-bold text-[9px] uppercase tracking-wider">Crime Category</p>
                      <p className="text-base-100 mt-1 font-semibold">{caseSupport.caseDetails.crimeType}</p>
                    </div>
                    <div>
                      <p className="text-base-500 font-bold text-[9px] uppercase tracking-wider">Police Station / City</p>
                      <p className="text-base-100 mt-1 font-semibold leading-tight">
                        {caseSupport.caseDetails.station} ({caseSupport.caseDetails.district})
                      </p>
                    </div>
                    <div>
                      <p className="text-base-500 font-bold text-[9px] uppercase tracking-wider">Occurrence Date</p>
                      <p className="text-base-100 mt-1 font-semibold">{caseSupport.caseDetails.date}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-base-500 font-bold text-[9px] uppercase tracking-wider mb-1.5">Investigator Briefing</p>
                    <p className="text-base-300 leading-relaxed bg-base-950 p-3 rounded-lg border border-base-800 text-[11px] font-semibold">
                      {caseSupport.caseDetails.summary}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel: Similar Cases list */}
            <div>
              <Card className="h-full shadow-glass border-base-800 bg-base-850">
                <CardHeader className="py-3.5 px-5 border-b border-base-800 bg-base-700/50">
                  <span className="text-xs font-bold text-base-100 uppercase tracking-wider flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-signal-500" />
                    SIMILAR HISTORICAL CASES
                  </span>
                </CardHeader>
                <CardContent className="pt-4 space-y-3 max-h-[300px] overflow-y-auto">
                  {caseSupport.similarCases.map((sc, idx) => (
                    <div key={idx} className="bg-base-950 p-3 rounded-lg border border-base-800 shadow-sm text-xs space-y-2">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-base-100">FIR {sc.fir}</span>
                        <span className="text-[10px] bg-signal-500/10 text-signal-500 px-2 py-0.5 rounded border border-signal-500/20">
                          {sc.similarity}% Match
                        </span>
                      </div>
                      <p className="text-base-400 text-[10px] leading-relaxed">{sc.commonFeatures}</p>
                      <p className="text-[10px] text-signal-400 border-t border-base-800/60 pt-1.5 italic">
                        <b>Lead:</b> {sc.lead}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Evidence Summary Card */}
            <Card className="shadow-glass border-base-800 bg-base-850">
              <CardHeader className="py-3 px-5 border-b border-base-800 bg-base-700/50">
                <span className="text-[10px] font-extrabold text-base-100 uppercase tracking-wider">
                  COLLECTED CASE EVIDENCE
                </span>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="bg-base-950 p-3 rounded-lg border border-base-800 shadow-sm">
                    <Camera className="mx-auto h-4.5 w-4.5 text-blue-500 mb-1.5" />
                    <p className="font-extrabold text-base-100">{caseSupport.evidence.photos}</p>
                    <p className="text-[9px] text-base-500 uppercase font-bold mt-0.5">Photos</p>
                  </div>
                  <div className="bg-base-950 p-3 rounded-lg border border-base-800 shadow-sm">
                    <FolderOpen className="mx-auto h-4.5 w-4.5 text-amber-500 mb-1.5" />
                    <p className="font-extrabold text-base-100">{caseSupport.evidence.documents}</p>
                    <p className="text-[9px] text-base-500 uppercase font-bold mt-0.5">Files</p>
                  </div>
                  <div className="bg-base-950 p-3 rounded-lg border border-base-800 shadow-sm">
                    <Video className="mx-auto h-4.5 w-4.5 text-red-500 mb-1.5" />
                    <p className="font-extrabold text-base-100">{caseSupport.evidence.videos}</p>
                    <p className="text-[9px] text-base-500 uppercase font-bold mt-0.5">CCTV</p>
                  </div>
                  <div className="bg-base-950 p-3 rounded-lg border border-base-800 shadow-sm col-span-1.5">
                    <Fingerprint className="mx-auto h-4.5 w-4.5 text-teal-500 mb-1.5" />
                    <p className="font-extrabold text-base-100">{caseSupport.evidence.fingerprints}</p>
                    <p className="text-[9px] text-base-500 uppercase font-bold mt-0.5">Prints</p>
                  </div>
                  <div className="bg-base-950 p-3 rounded-lg border border-base-800 shadow-sm col-span-1.5">
                    <FileText className="mx-auto h-4.5 w-4.5 text-purple-500 mb-1.5" />
                    <p className="font-extrabold text-base-100">{caseSupport.evidence.other}</p>
                    <p className="text-[9px] text-base-500 uppercase font-bold mt-0.5">Other</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investigation Leads Checklist */}
            <Card className="shadow-glass border-base-800 bg-base-850 lg:col-span-2">
              <CardHeader className="py-3 px-5 border-b border-base-800 bg-base-700/50">
                <span className="text-[10px] font-extrabold text-base-100 uppercase tracking-wider flex items-center gap-2">
                  <ClipboardList className="h-4.5 w-4.5 text-signal-500" />
                  INVESTIGATION CHECKLIST LEADS
                </span>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3.5 text-xs text-base-300">
                  {leadsState.map((l) => (
                    <div key={l.id} className="flex items-start gap-3 bg-base-950 p-3 rounded-lg border border-base-800 shadow-sm">
                      <input
                        type="checkbox"
                        checked={l.completed}
                        onChange={() => handleToggleLead(l.id, l.completed)}
                        className="mt-0.5 h-4 w-4 accent-signal-500"
                      />
                      <span className={l.completed ? "line-through text-base-500 font-semibold" : "text-base-200 font-semibold"}>
                        {l.text}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
