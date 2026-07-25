import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Search, FileText, Calendar, MapPin, Eye, CheckCircle2, X, User, Clock, AlertTriangle, Trash2 } from "lucide-react";
import type { CrimeRecord } from "@/features/crime-analytics/types/crime-analytics.types";
import { crimeAnalyticsApi } from "@/features/crime-analytics/api/crime-analytics.api";

interface CrimeRecordsTableProps {
  records: CrimeRecord[];
}

export function CrimeRecordsTable({ records: initialRecords }: CrimeRecordsTableProps) {
  const queryClient = useQueryClient();
  const [records, setRecords] = useState<CrimeRecord[]>(initialRecords);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<CrimeRecord | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  useEffect(() => {
    setRecords(initialRecords);
  }, [initialRecords]);

  const filtered = records.filter((r) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      r.crimeId.toLowerCase().includes(q) ||
      r.firNumber.toLowerCase().includes(q) ||
      r.district.toLowerCase().includes(q) ||
      r.station.toLowerCase().includes(q) ||
      r.crimeType.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q) ||
      (r.offenderName && r.offenderName.toLowerCase().includes(q))
    );
  });

  async function handleDeleteCrime(crimeId: string) {
    if (!window.confirm(`Are you sure you want to delete crime record ${crimeId}?`)) return;
    setDeletingId(crimeId);
    try {
      await crimeAnalyticsApi.deleteCrime(crimeId);
      setRecords((prev) => prev.filter((rec) => rec.crimeId !== crimeId));
      if (selectedRecord && selectedRecord.crimeId === crimeId) {
        setSelectedRecord(null);
      }
      setStatusMessage({ text: `Crime record ${crimeId} deleted successfully` });
      setTimeout(() => setStatusMessage(null), 3000);

      queryClient.invalidateQueries({ queryKey: ["crime-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (err) {
      console.error("Failed to delete crime:", err);
      setStatusMessage({ text: "Failed to delete crime record on server", isError: true });
      setTimeout(() => setStatusMessage(null), 4000);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleStatusChange(crimeId: string, newStatus: string) {
    setUpdatingId(crimeId);
    try {
      await crimeAnalyticsApi.updateStatus(crimeId, newStatus);
      
      setRecords((prev) =>
        prev.map((rec) => (rec.crimeId === crimeId ? { ...rec, status: newStatus } : rec))
      );
      if (selectedRecord && selectedRecord.crimeId === crimeId) {
        setSelectedRecord((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      
      setStatusMessage({ text: `Case status updated to "${newStatus.toUpperCase()}"` });
      setTimeout(() => setStatusMessage(null), 3000);

      // Invalidate all related analytical query caches so dashboards update immediately
      queryClient.invalidateQueries({ queryKey: ["crime-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (err) {
      console.error("Failed to update status:", err);
      setStatusMessage({ text: "Failed to update case status on backend", isError: true });
      setTimeout(() => setStatusMessage(null), 4000);
    } finally {
      setUpdatingId(null);
    }
  }

  function getStatusStyle(status: string) {
    const s = status.toLowerCase();
    if (s === "solved" || s === "closed") {
      return "bg-emerald-100 text-emerald-950 border-emerald-300 font-bold";
    }
    if (s === "pending") {
      return "bg-amber-100 text-amber-950 border-amber-300 font-bold";
    }
    return "bg-blue-100 text-blue-950 border-blue-300 font-bold";
  }

  function getSeverityBadge(score: number) {
    if (score >= 75) {
      return (
        <span className="inline-flex items-center rounded-md bg-rose-100 text-rose-950 group-hover:bg-rose-500/30 group-hover:text-rose-200 group-hover:border-rose-400/40 px-2 py-0.5 text-xs font-bold border border-rose-300">
          {score} (High)
        </span>
      );
    }
    if (score >= 45) {
      return (
        <span className="inline-flex items-center rounded-md bg-amber-100 text-amber-950 group-hover:bg-amber-500/30 group-hover:text-amber-200 group-hover:border-amber-400/40 px-2 py-0.5 text-xs font-bold border border-amber-300">
          {score} (Med)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-md bg-emerald-100 text-emerald-950 group-hover:bg-emerald-500/30 group-hover:text-emerald-200 group-hover:border-emerald-400/40 px-2 py-0.5 text-xs font-bold border border-emerald-300">
        {score} (Low)
      </span>
    );
  }

  return (
    <Card className="p-0 overflow-hidden shadow-sm border border-slate-300 bg-white">
      {/* Royal Blue Header (Same as sidebar menu bar) */}
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-blue-900 bg-base-900 text-white p-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/20 text-blue-200 border border-blue-400/30">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              Filtered Crime Records
              {filtered.length > 5 && (
                <span className="text-[11px] font-bold bg-blue-500/25 text-blue-200 border border-blue-400/30 px-2 py-0.5 rounded-full">
                  Scrollable (5+ cases)
                </span>
              )}
            </CardTitle>
            <p className="text-xs text-blue-200 font-medium">
              Found <span className="font-bold text-white">{filtered.length}</span> recorded incidents matching active filters
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {statusMessage && (
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded border flex items-center gap-1 ${
                statusMessage.isError
                  ? "text-rose-300 bg-rose-500/20 border-rose-400/40"
                  : "text-emerald-300 bg-emerald-500/20 border-emerald-400/40"
              }`}
            >
              {statusMessage.isError ? (
                <AlertTriangle className="h-3.5 w-3.5 text-rose-300" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
              )}
              {statusMessage.text}
            </span>
          )}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-200" />
            <Input
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-9 text-xs bg-blue-950/60 text-white placeholder:text-blue-200/70 border-blue-700/50 focus:border-blue-300"
            />
          </div>
        </div>
      </CardHeader>

      {/* Table */}
      <CardContent className="p-0">
        <div className={`overflow-x-auto ${filtered.length > 5 ? "max-h-[350px] overflow-y-auto" : ""}`}>
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-base-900 text-white font-bold uppercase tracking-wider text-[11px] border-b border-blue-900 sticky top-0 z-10 shadow-sm">

              <tr>
                <th className="px-4 py-3 text-white">Case ID / FIR</th>
                <th className="px-4 py-3 text-white">Location</th>
                <th className="px-4 py-3 text-white">Crime Type</th>
                <th className="px-4 py-3 text-white">Date & Time</th>
                <th className="px-4 py-3 text-white">Status</th>
                <th className="px-4 py-3 text-white">Severity</th>
                <th className="px-4 py-3 text-white">Details / Suspect</th>
                <th className="px-4 py-3 text-right text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-600 font-medium">
                    No matching records found for "{searchTerm}".
                  </td>
                </tr>
              ) : (
                filtered.map((record) => (
                  <tr
                    key={record.crimeId}
                    className="group hover:bg-base-900 hover:text-white transition-colors duration-150 border-b border-slate-200"
                  >
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 group-hover:text-white text-xs">{record.crimeId}</div>
                      <div className="text-[11px] text-slate-600 group-hover:text-blue-200 font-mono">FIR: {record.firNumber}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 font-semibold text-slate-900 group-hover:text-white text-xs">
                        <MapPin className="h-3.5 w-3.5 text-blue-600 group-hover:text-blue-200 shrink-0" />
                        {record.district}
                      </div>
                      <div className="text-[11px] text-slate-600 group-hover:text-blue-200 pl-4.5 font-normal">{record.station}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-900 group-hover:bg-blue-500/30 group-hover:text-white border border-blue-200 group-hover:border-blue-400/40 px-2.5 py-0.5 text-xs font-bold">
                        {record.crimeType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 group-hover:text-white">
                      <div className="flex items-center gap-1.5 font-medium text-xs">
                        <Calendar className="h-3.5 w-3.5 text-slate-500 group-hover:text-blue-200 shrink-0" />
                        {record.dateTime ? record.dateTime.split("T")[0] : "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={record.status}
                        disabled={updatingId === record.crimeId}
                        onChange={(e) => handleStatusChange(record.crimeId, e.target.value)}
                        className={`text-xs font-bold rounded-full px-2.5 py-1 border capitalize focus:outline-none cursor-pointer group-hover:bg-blue-950 group-hover:text-white group-hover:border-blue-700 ${getStatusStyle(
                          record.status
                        )}`}
                      >
                        <option value="open" className="bg-base-900 text-white">Open</option>
                        <option value="pending" className="bg-base-900 text-white">Pending</option>
                        <option value="solved" className="bg-base-900 text-white">Solved</option>
                        <option value="closed" className="bg-base-900 text-white">Closed</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">{getSeverityBadge(record.severityScore)}</td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="truncate text-slate-800 group-hover:text-white font-medium text-xs">{record.description}</div>
                      {record.offenderName && (
                        <div className="text-[11px] text-slate-600 group-hover:text-blue-200 truncate font-normal">
                          Suspect: <span className="text-slate-950 group-hover:text-white font-bold">{record.offenderName}</span>
                          {record.offenderIsRepeat && <span className="ml-1 text-rose-700 group-hover:text-rose-300 font-bold">(Repeat)</span>}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setSelectedRecord(record)}
                          className="h-8 px-2.5 text-xs font-semibold text-slate-800 group-hover:text-white bg-slate-100 group-hover:bg-blue-950 border border-slate-300 group-hover:border-blue-700"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1 text-slate-600 group-hover:text-blue-200" />
                          Details
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={deletingId === record.crimeId}
                          onClick={() => handleDeleteCrime(record.crimeId)}
                          className="h-8 px-2.5 text-xs font-semibold text-rose-700 group-hover:text-rose-200 bg-rose-50 group-hover:bg-rose-950/80 border border-rose-200 group-hover:border-rose-800 hover:bg-rose-100"
                          title="Delete crime record"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1 text-rose-600 group-hover:text-rose-300" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      {/* Complaint Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-900 space-y-5 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-950">Case Details: {selectedRecord.crimeId}</h2>
                    <span className="text-xs font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-300 font-bold">
                      FIR: {selectedRecord.firNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Karnataka State Police Digital Incident Complaint Record</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Top Quick Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-base-900 text-white p-4 rounded-xl border border-blue-900">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-200">Case Status:</span>
                <select
                  value={selectedRecord.status}
                  onChange={(e) => handleStatusChange(selectedRecord.crimeId, e.target.value)}
                  className="text-xs font-bold rounded-lg px-3 py-1 bg-blue-950 text-white border border-blue-700 capitalize focus:outline-none cursor-pointer"
                >
                  <option value="open" className="bg-base-900 text-white">Open</option>
                  <option value="pending" className="bg-base-900 text-white">Pending</option>
                  <option value="solved" className="bg-base-900 text-white">Solved</option>
                  <option value="closed" className="bg-base-900 text-white">Closed</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-200">Category:</span>
                <span className="text-xs font-bold bg-blue-500/20 text-white px-3 py-1 rounded-full border border-blue-400/30">
                  {selectedRecord.crimeType}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-200">Severity Score:</span>
                <span className="text-xs font-bold bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded border border-amber-400/40">
                  {selectedRecord.severityScore} / 100
                </span>
              </div>
            </div>

            {/* Location & Time Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-base-900 text-white border border-blue-900 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-200">
                  <MapPin className="h-3.5 w-3.5 text-blue-300" /> Jurisdiction & Location
                </div>
                <div className="text-base font-bold text-white">{selectedRecord.district} District</div>
                <div className="text-xs text-blue-200 font-medium">{selectedRecord.station}</div>
              </div>

              <div className="p-4 rounded-xl bg-base-900 text-white border border-blue-900 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-200">
                  <Clock className="h-3.5 w-3.5 text-blue-300" /> Registration Date & Time
                </div>
                <div className="text-base font-bold text-white">
                  {selectedRecord.dateTime ? selectedRecord.dateTime.replace("T", " at ") : "N/A"}
                </div>
                <div className="text-xs text-blue-200">Official IST Logged Timestamp</div>
              </div>
            </div>

            {/* Full Complaint Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Full Complaint Statement</label>
              <div className="p-4 rounded-xl bg-base-900 text-white border border-blue-900 text-xs font-medium leading-relaxed">
                {selectedRecord.description || "No description provided."}
              </div>
            </div>

            {/* Suspect & Modus Operandi Section */}
            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                  <User className="h-4 w-4 text-amber-700" /> Suspect & Modus Operandi
                </div>
                {selectedRecord.offenderIsRepeat && (
                  <span className="text-[11px] font-bold bg-rose-100 text-rose-900 px-2 py-0.5 rounded border border-rose-300">
                    Flagged Repeat Offender
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-600 block font-medium">Accused / Suspect Name:</span>
                  <span className="font-bold text-slate-950">{selectedRecord.offenderName || "Unidentified / Under Investigation"}</span>
                </div>
                <div>
                  <span className="text-slate-600 block font-medium">Modus Operandi:</span>
                  <span className="font-bold text-slate-950">{selectedRecord.modusOperandi || "Standard category pattern"}</span>
                </div>
                <div>
                  <span className="text-slate-600 block font-medium">Weapons Used:</span>
                  <span className="font-bold text-slate-950">{selectedRecord.weaponsUsed || "None reported"}</span>
                </div>
                <div>
                  <span className="text-slate-600 block font-medium">Target Location:</span>
                  <span className="font-bold text-slate-950">{selectedRecord.targetPlace || "Public area / Residence"}</span>
                </div>
              </div>
            </div>

            {/* Victim & Demographic Details */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-base-900 text-white p-4 rounded-xl border border-blue-900">
              <div>
                <span className="text-blue-200 block font-semibold">Victim Age Group:</span>
                <span className="font-bold text-white text-sm">{selectedRecord.victimAgeGroup || "31-45"}</span>
              </div>
              <div>
                <span className="text-blue-200 block font-semibold">Victim Gender:</span>
                <span className="font-bold text-white text-sm">{selectedRecord.victimGender || "Male"}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
              <Button
                variant="secondary"
                onClick={() => setSelectedRecord(null)}
                className="text-xs font-bold text-white bg-base-900 hover:bg-blue-900 border border-blue-800 px-5 py-2.5 shadow-sm"
              >
                Close Window
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
