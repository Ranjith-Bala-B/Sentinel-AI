import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { FileText, Download, Printer, Database, Settings2, CheckCircle2, RefreshCw } from "lucide-react";
import { jsPDF } from "jspdf";
import { useDashboardSummary } from "@/features/dashboard/hooks/useDashboardSummary";

export function ReportsPage() {
  const { data: dashboardData, isLoading: isDashboardLoading, isError } = useDashboardSummary();

  const [reportType, setReportType] = useState("executive");
  const [format, setFormat] = useState("pdf");
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastDownloaded, setLastDownloaded] = useState<string | null>(null);

  // Extract dynamic dashboard metrics
  const totalCrimes = dashboardData?.kpis.totalCrimes ?? 0;
  const crimesThisMonth = dashboardData?.kpis.crimesThisMonth ?? 0;
  const crimeRateChange = dashboardData?.kpis.crimeRateChange ?? 0;
  const activeInvestigations = dashboardData?.kpis.activeInvestigations ?? 0;
  const repeatOffenders = dashboardData?.kpis.repeatOffenders ?? 0;
  const highRiskDistricts = dashboardData?.kpis.highRiskDistricts ?? 0;
  const activeAlerts = dashboardData?.kpis.activeAlerts ?? 0;

  // Solved cases from breakdown or district query
  const solvedCases = dashboardData?.statusBreakdown?.find(
    (s) => s.status.toLowerCase() === "solved"
  )?.count ?? 0;

  const clearanceRate = totalCrimes > 0
    ? ((solvedCases / totalCrimes) * 100).toFixed(1)
    : "0.0";

  const topDistrictObj = dashboardData?.districtRanking?.[0];
  const topDistrictText = topDistrictObj
    ? `${topDistrictObj.district} (${topDistrictObj.count} cases)`
    : "None Recorded";

  const categories = dashboardData?.crimeByCategory ?? [];
  const districtRankings = dashboardData?.districtRanking ?? [];
  const topStations = dashboardData?.topStations ?? [];
  const monthlyTrend = dashboardData?.monthlyTrend ?? [];
  const statusBreakdown = dashboardData?.statusBreakdown ?? [];

  const mockPastReports = [
    { name: "Executive Intelligence Summary Q2.pdf", size: "4.8 MB", date: "2026-07-10", type: "PDF" },
    { name: "Repeat Offenders Modus Operandi Dossier.pdf", size: "12.4 MB", date: "2026-07-08", type: "PDF" },
    { name: "Syndicate Links Network Graph.xlsx", size: "1.2 MB", date: "2026-07-05", type: "XLS" },
    { name: "Karnataka Crime Heatmap Spatial.json", size: "240 KB", date: "2026-06-28", type: "JSON" }
  ];

  const triggerDownload = (fileName: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setLastDownloaded(fileName);
    setTimeout(() => setLastDownloaded(null), 4000);
  };

  const generatePdfReport = (title: string, filenamePrefix: string, timestamp: string) => {
    const doc = new jsPDF();
    
    // Header Banner
    doc.setFillColor(15, 23, 42); // base-900 dark slate
    doc.rect(0, 0, 210, 32, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text("KARNATAKA STATE POLICE", 14, 15);
    
    doc.setFontSize(9.5);
    doc.setTextColor(147, 197, 253); // blue-300
    doc.text("CRIMEVISION AI SYSTEM - OFFICIAL INTELLIGENCE DOSSIER", 14, 24);
    
    // Title & Line
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(title.toUpperCase(), 14, 45);
    
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(14, 49, 196, 49);
    
    // Metadata Block
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text("GENERATED TIMESTAMP:", 14, 57);
    doc.setFont("helvetica", "normal");
    doc.text(new Date().toLocaleString() + " IST", 65, 57);
    
    doc.setFont("helvetica", "bold");
    doc.text("ISSUING AUTHORITY:", 14, 63);
    doc.setFont("helvetica", "normal");
    doc.text("Director General of Police, Karnataka State", 65, 63);
    
    doc.setFont("helvetica", "bold");
    doc.text("CLASSIFICATION LEVEL:", 14, 69);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(225, 29, 72);
    doc.text("CONFIDENTIAL - LAW ENFORCEMENT RESTRICTED", 65, 69);
    
    // Section 1: Executive Metrics (Live Dashboard Synced)
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("1. STATEWIDE CRIME KPIS & ANALYTICAL METRICS", 14, 82);
    
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 86, 182, 45, "F");
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, 86, 182, 45, "S");
    
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("Total Registered Incidents:", 18, 94);
    doc.setFont("helvetica", "normal");
    doc.text(`${totalCrimes.toLocaleString()} cases`, 80, 94);
    
    doc.setFont("helvetica", "bold");
    doc.text("Solved / Cleared Cases:", 18, 101);
    doc.setFont("helvetica", "normal");
    doc.text(`${solvedCases.toLocaleString()} cases (${clearanceRate}% clearance rate)`, 80, 101);
    
    doc.setFont("helvetica", "bold");
    doc.text("Active Investigations:", 18, 108);
    doc.setFont("helvetica", "normal");
    doc.text(`${activeInvestigations.toLocaleString()} active cases`, 80, 108);

    doc.setFont("helvetica", "bold");
    doc.text("Tracked Repeat Offenders:", 18, 115);
    doc.setFont("helvetica", "normal");
    doc.text(`${repeatOffenders.toLocaleString()} individuals with MO profiles`, 80, 115);

    doc.setFont("helvetica", "bold");
    doc.text("Critical Risk Jurisdiction:", 18, 122);
    doc.setTextColor(225, 29, 72);
    doc.text(topDistrictText, 80, 122);
    
    // Section 2: Strategic AI Recommendations
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("2. STRATEGIC AI DISPATCH & PATROL RECOMMENDATIONS", 14, 140);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    
    const topCatName = categories[0]?.category || "Property & Theft";
    const topDistName = topDistrictObj?.district || "High-density Urban Beats";
    const points = [
      `- Deploy targeted night patrolling beats to high caseload sectors in ${topDistName}.`,
      `- Expand active CCTV surveillance & crime monitoring in top category: ${topCatName}.`,
      `- Maintain strict MO surveillance on ${repeatOffenders} flagged repeat offenders state-wide.`,
      `- Utilize AI predictive hotspot risk maps for dynamic beat reallocation during peak crime hours.`
    ];
    
    let y = 148;
    points.forEach((pt) => {
      doc.text(pt, 18, y);
      y += 7;
    });

    // Section 3: Distribution Breakdown
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("3. TOP CRIME CATEGORIES & DISTRICT CASINGS", 14, 182);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);

    if (categories.length > 0) {
      let catY = 190;
      categories.slice(0, 5).forEach((cat, index) => {
        const pct = totalCrimes > 0 ? ((cat.count / totalCrimes) * 100).toFixed(1) : "0.0";
        doc.text(
          `${index + 1}. ${cat.category.padEnd(26, " ")} : ${cat.count.toLocaleString()} cases (${pct}% of total caseload)`,
          18,
          catY
        );
        catY += 7;
      });
    } else {
      doc.text("No registered crime category records in database.", 18, 190);
    }

    // Section 4: District & Station Caseload Metrics
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("4. TOP DISTRICT & POLICE STATION CASELOADS", 14, 232);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);

    if (districtRankings.length > 0) {
      const distSummary = districtRankings
        .slice(0, 3)
        .map((d) => `${d.district} (${d.count} cases, ${d.riskLevel} risk)`)
        .join("; ");
      doc.text(`High-Risk Districts : ${distSummary}`, 18, 240);
    } else {
      doc.text("High-Risk Districts : None recorded", 18, 240);
    }

    if (topStations.length > 0) {
      const stationSummary = topStations
        .slice(0, 3)
        .map((s) => `${s.station} [${s.district}] (${s.caseload} cases, ${s.solvedRate}% solved)`)
        .join("; ");
      doc.text(`Key Police Stations : ${stationSummary}`, 18, 247);
    }

    // Footer Signoff
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 270, 196, 270);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("State Crime Records Bureau (SCRB) • Karnataka State Police • CrimeVision AI Platform", 14, 277);
    
    const fileName = `${filenamePrefix}_report_${timestamp}.pdf`;
    doc.save(fileName);
    setLastDownloaded(fileName);
    setTimeout(() => setLastDownloaded(null), 4000);
  };

  const downloadArchive = (report: typeof mockPastReports[0]) => {
    const timestamp = new Date().toISOString().split("T")[0];
    if (report.type === "PDF" || report.name.endsWith(".pdf")) {
      generatePdfReport(report.name.replace(/\.pdf$/i, ""), "archive", timestamp);
    } else if (report.type === "XLS" || report.name.endsWith(".xlsx")) {
      const csvLines = [
        `CRIMEVISION AI - OFFICIAL INTELLIGENCE ARCHIVE DOSSIER`,
        `Archive File,"${report.name}"`,
        `Archive Date,"${report.date}"`,
        `File Size,"${report.size}"`,
        `Jurisdiction,"Karnataka State Police"`,
        `Generated Date,"${timestamp}"`,
        ``,
        `1. OVERVIEW KPI SUMMARY (DASHBOARD SYNCED)`,
        `Metric,Value`,
        `Total Registered Incidents,${totalCrimes}`,
        `Crimes This Month,${crimesThisMonth}`,
        `Solved / Cleared Cases,${solvedCases}`,
        `Clearance Rate,"${clearanceRate}%"`,
        `Active Investigations,${activeInvestigations}`,
        `Tracked Repeat Offenders,${repeatOffenders}`,
        `High Risk Districts Count,${highRiskDistricts}`,
        `Top High-Risk District,"${topDistrictObj?.district || "N/A"}"`,
        ``,
        `2. CRIME CATEGORIES BREAKDOWN`,
        `Category,Caseload,Percentage`,
        ...categories.map(
          (c) =>
            `"${c.category}",${c.count},"${totalCrimes > 0 ? ((c.count / totalCrimes) * 100).toFixed(1) : 0}%"`
        ),
      ];
      triggerDownload(report.name.replace(/\.xlsx$/i, ".csv"), csvLines.join("\n"), "text/csv");
    } else {
      const sampleData = {
        title: report.name,
        generatedDate: timestamp,
        fileSize: report.size,
        organization: "Karnataka State Police - CrimeVision AI System",
        analytics: {
          totalCrimesRecorded: totalCrimes,
          solvedCases,
          clearanceRate: `${clearanceRate}%`,
          activeInvestigations,
          repeatOffenders,
          highRiskDistricts,
          topDistrict: topDistrictText,
        },
        crimeByCategory: categories,
        districtRanking: districtRankings,
        topStations,
        status: "Verified Official Archives Log"
      };
      triggerDownload(report.name, JSON.stringify(sampleData, null, 2), "application/json");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (generating) return;

    setGenerating(true);
    setProgress(10);
    
    // Simulate compilation progress
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setGenerating(false);
            setProgress(0);

            // Generate content based on report focus and format
            const timestamp = new Date().toISOString().split("T")[0];
            const typeTitles: Record<string, string> = {
              executive: "State Executive Intelligence Summary",
              hotspots: "Active Hotspots Spatial Patrol Guide",
              network: "Gang Syndicate Connectivity Dossier",
              offenders: "Repeat Offenders MO Activity Report",
              predictive: "AI Risk Forecasting Metric Tables",
            };

            const title = typeTitles[reportType] || "CrimeVision Intelligence Report";

            if (format === "json") {
              const payload = {
                reportTitle: title,
                generatedAt: new Date().toISOString(),
                jurisdiction: "Karnataka State Police - CrimeVision AI System",
                analytics: {
                  totalCrimesRecorded: totalCrimes,
                  crimesThisMonth,
                  crimeRateChange: `${crimeRateChange}%`,
                  solvedCases,
                  clearanceRate: `${clearanceRate}%`,
                  activeInvestigations,
                  repeatOffendersCount: repeatOffenders,
                  highRiskDistrictsCount: highRiskDistricts,
                  activeAlertsCount: activeAlerts,
                  topCrimeCategory: categories[0]
                    ? `${categories[0].category} (${categories[0].count} cases)`
                    : "N/A",
                  topDistrict: topDistrictText,
                },
                crimeByCategory: categories,
                districtRanking: districtRankings,
                topStations,
                statusBreakdown,
                monthlyTrend,
                aiInsights: `Statewide total crime caseload stands at ${totalCrimes.toLocaleString()} cases with a ${clearanceRate}% clearance rate (${solvedCases.toLocaleString()} solved cases). Top risk area identified is ${topDistrictText}.`
              };
              triggerDownload(`${reportType}_report_${timestamp}.json`, JSON.stringify(payload, null, 2), "application/json");
            } else if (format === "xlsx") {
              const csvLines = [
                `CRIMEVISION AI - OFFICIAL INTELLIGENCE DOSSIER`,
                `Report Title,"${title}"`,
                `Jurisdiction,"Karnataka State Police"`,
                `Generated Date,"${timestamp}"`,
                ``,
                `1. STATEWIDE OVERVIEW KPIS`,
                `Metric,Value`,
                `Total Registered Incidents,${totalCrimes}`,
                `Crimes This Month,${crimesThisMonth}`,
                `Crime Rate Change,"${crimeRateChange}%"`,
                `Solved / Cleared Cases,${solvedCases}`,
                `Clearance Rate,"${clearanceRate}%"`,
                `Active Investigations,${activeInvestigations}`,
                `Tracked Repeat Offenders,${repeatOffenders}`,
                `High Risk Districts Count,${highRiskDistricts}`,
                `Active System Alerts,${activeAlerts}`,
                `Primary High Risk District,"${topDistrictObj?.district || 'N/A'}"`,
                ``,
                `2. CRIME CATEGORY BREAKDOWN`,
                `Category,Caseload,Percentage`,
                ...categories.map(
                  (c) =>
                    `"${c.category}",${c.count},"${totalCrimes > 0 ? ((c.count / totalCrimes) * 100).toFixed(1) : 0}%"`
                ),
                ``,
                `3. DISTRICT RANKING & CASELOAD`,
                `District,Caseload,Risk Level,Open Cases,Pending Cases,Solved Cases,Closed Cases`,
                ...districtRankings.map(
                  (d) =>
                    `"${d.district}",${d.count},"${d.riskLevel}",${d.openCount || 0},${d.pendingCount || 0},${d.solvedCount || 0},${d.closedCount || 0}`
                ),
                ``,
                `4. TOP POLICE STATIONS`,
                `Police Station,District,Caseload,Solved Rate`,
                ...topStations.map(
                  (s) => `"${s.station}","${s.district}",${s.caseload},"${s.solvedRate}%"`
                ),
              ];
              triggerDownload(`${reportType}_report_${timestamp}.csv`, csvLines.join("\n"), "text/csv");
            } else {
              generatePdfReport(title, reportType, timestamp);
            }

          }, 300);
          return 100;
        }
        return prev + 20;
      });
    }, 120);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="label-eyebrow">Export Workspace</p>
        <h1 className="mt-1 font-display text-xl font-semibold text-base-100">Reports Generation Workspace</h1>
      </div>

      {lastDownloaded && (
        <div className="flex items-center gap-2 p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Report <strong>{lastDownloaded}</strong> generated and downloaded successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left Columns - Form configuration */}
        <div className="xl:col-span-2">
          <Card className="shadow-glass border-base-800 bg-base-850">
            <CardHeader className="py-3.5 px-5 border-b border-base-800 bg-base-700/50 flex flex-row items-center justify-between">
              <span className="text-xs font-bold text-base-100 uppercase tracking-wider flex items-center gap-2">
                <Settings2 className="h-4.5 w-4.5 text-signal-500" />
                REPORT COMPILATION PARAMETERS
              </span>
              <div className="flex items-center gap-2 text-[11px] font-medium text-base-400">
                {isDashboardLoading ? (
                  <span className="flex items-center gap-1 text-amber-400">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Syncing Dashboard...
                  </span>
                ) : isError ? (
                  <span className="text-rose-400">Dashboard Offline (Using Mocks)</span>
                ) : (
                  <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-full text-[10px]">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    Synced with Dashboard ({totalCrimes.toLocaleString()} cases)
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleGenerate} className="space-y-5 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-base-500 uppercase tracking-wider mb-2 block">Report Focus</label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="w-full rounded-lg border border-base-800 bg-base-950 px-3 py-2 text-xs font-semibold text-base-200 focus:outline-none focus:ring-1 focus:ring-signal-500"
                    >
                      <option value="executive">State Executive Intelligence Summary</option>
                      <option value="hotspots">Active Hotspots Spatial Patrol Guide</option>
                      <option value="network">Gang Syndicate Connectivity Dossier</option>
                      <option value="offenders">Repeat Offenders MO Activity Report</option>
                      <option value="predictive">AI Risk Forecasting Metric Tables</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-base-500 uppercase tracking-wider mb-2 block">Export Format</label>
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      className="w-full rounded-lg border border-base-800 bg-base-950 px-3 py-2 text-xs font-semibold text-base-200 focus:outline-none focus:ring-1 focus:ring-signal-500"
                    >
                      <option value="pdf">Adobe PDF Document (.pdf)</option>
                      <option value="xlsx">Microsoft Excel Spreadsheet (.csv / .xlsx)</option>
                      <option value="json">Raw Analytical JSON Payload (.json)</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-base-800 pt-4">
                  <p className="text-[10px] font-bold text-base-500 uppercase tracking-wider mb-3">Include Additional Fields</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-base-200">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="h-3.5 w-3.5 accent-signal-500" />
                      <span>Victim Demographics</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="h-3.5 w-3.5 accent-signal-500" />
                      <span>CCTV Evidence Log</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="h-3.5 w-3.5 accent-signal-500" />
                      <span>Sociological Coefficients</span>
                    </label>
                  </div>
                </div>

                {generating && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-signal-500">
                      <span>Compiling MySQL dataset & AI insights...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-base-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-signal-500 h-full transition-all duration-150" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 border-t border-base-800 pt-4">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-4 py-2 border border-base-800 hover:bg-base-750/30 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 text-base-200"
                  >
                    <Printer className="h-4 w-4" />
                    Print
                  </button>
                  <button
                    type="submit"
                    disabled={generating}
                    className="px-4 py-2 bg-signal-500 hover:bg-signal-600 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Database className="h-4 w-4" />
                    {generating ? "Compiling..." : "Generate & Download Report"}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Columns - Past archives list */}
        <div>
          <Card className="h-full shadow-glass border-base-800 bg-base-850">
            <CardHeader className="py-3.5 px-5 border-b border-base-800 bg-base-700/50">
              <span className="text-xs font-bold text-base-100 uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4 text-signal-500" />
                COMPILED ARCHIVES
              </span>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {mockPastReports.map((r, idx) => (
                <div key={idx} className="bg-base-950 p-3 rounded-lg border border-base-800 flex items-center justify-between text-xs shadow-sm">
                  <div>
                    <p className="font-bold text-base-200 leading-tight">{r.name}</p>
                    <p className="text-[10px] text-base-500 mt-1 font-semibold">
                      Generated: {r.date} | Size: {r.size}
                    </p>
                  </div>
                  <button
                    onClick={() => downloadArchive(r)}
                    className="p-1.5 hover:bg-base-800 text-base-400 hover:text-signal-500 rounded transition-colors"
                    title={`Download ${r.name}`}
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

