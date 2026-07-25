"""dashboard-service - Catalyst Advanced I/O function.

  GET /dashboard/summary  -> KPI cards + all chart series for the
                              command dashboard.
  GET /dashboard/feed     -> live intelligence feed only (polled more
                              frequently by the frontend than the
                              full summary).

Both endpoints read from tables pre-aggregated by the nightly
aggregation Cron job (see jobs/nightly-aggregation-job), so this
function stays a fast, cheap read path rather than computing
aggregates on every request.
"""
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))

from common.auth_guard import require_role, ALL_ROLES  # noqa: E402
from common.schemas import (  # noqa: E402
    Envelope,
    DashboardSummary,
    KpiSummary,
    CrimeCategoryPoint,
    DistrictRankPoint,
    StationRankPoint,
    TrendPoint,
    FeedItem,
)
from common.logger import get_logger  # noqa: E402

logger = get_logger("dashboard-service")


def _load_summary_from_data_store(request) -> DashboardSummary:
    """Reads the precomputed dashboard rows from Catalyst Data Store.

    Real implementation uses common.catalyst_client.zcql_query(...) against
    a `DashboardAggregates` table maintained by the nightly Cron job. Seeded
    here with representative values so the endpoint is runnable and testable
    before the aggregation job and Data Store tables are provisioned.
    """
    return DashboardSummary(
        kpis=KpiSummary(
            totalCrimes=48213,
            totalCrimesDelta=3.2,
            solvedCases=31820,
            solvedRate=66.0,
            pendingCases=16393,
            repeatOffenders=2140,
            highRiskDistricts=6,
            crimeGrowth=4.1,
            activeAlerts=14,
        ),
        crimeByCategory=[
            CrimeCategoryPoint(category="Theft", count=12840),
            CrimeCategoryPoint(category="Cybercrime", count=8320),
            CrimeCategoryPoint(category="Assault", count=6210),
            CrimeCategoryPoint(category="Burglary", count=5430),
            CrimeCategoryPoint(category="Vehicle theft", count=4980),
            CrimeCategoryPoint(category="Fraud", count=4310),
            CrimeCategoryPoint(category="Narcotics", count=3120),
            CrimeCategoryPoint(category="Others", count=3003),
        ],
        districtRanking=[
            DistrictRankPoint(district="Bengaluru Urban", count=14210, riskLevel="critical"),
            DistrictRankPoint(district="Mysuru", count=5340, riskLevel="high"),
            DistrictRankPoint(district="Ballari", count=4120, riskLevel="high"),
            DistrictRankPoint(district="Belagavi", count=3870, riskLevel="moderate"),
            DistrictRankPoint(district="Hubballi-Dharwad", count=3610, riskLevel="moderate"),
            DistrictRankPoint(district="Mangaluru", count=3120, riskLevel="moderate"),
            DistrictRankPoint(district="Kalaburagi", count=2740, riskLevel="low"),
            DistrictRankPoint(district="Tumakuru", count=2210, riskLevel="low"),
        ],
        topStations=[
            StationRankPoint(station="Whitefield PS", district="Bengaluru Urban", solvedRate=71, caseload=1840),
            StationRankPoint(station="Devanahalli PS", district="Bengaluru Urban", solvedRate=64, caseload=1210),
            StationRankPoint(station="Nazarbad PS", district="Mysuru", solvedRate=69, caseload=980),
            StationRankPoint(station="Ballari City PS", district="Ballari", solvedRate=58, caseload=1120),
            StationRankPoint(station="Hubballi Central PS", district="Hubballi-Dharwad", solvedRate=62, caseload=890),
        ],
        monthlyTrend=[
            TrendPoint(label="Jan", crimes=3820, solved=2410),
            TrendPoint(label="Feb", crimes=3610, solved=2380),
            TrendPoint(label="Mar", crimes=3990, solved=2510),
            TrendPoint(label="Apr", crimes=4120, solved=2690),
            TrendPoint(label="May", crimes=4380, solved=2840),
            TrendPoint(label="Jun", crimes=4290, solved=2910),
            TrendPoint(label="Jul", crimes=4510, solved=3020),
            TrendPoint(label="Aug", crimes=4460, solved=2980),
            TrendPoint(label="Sep", crimes=4610, solved=3110),
            TrendPoint(label="Oct", crimes=4780, solved=3240),
            TrendPoint(label="Nov", crimes=4920, solved=3360),
            TrendPoint(label="Dec", crimes=4720, solved=3380),
        ],
        feed=[
            FeedItem(id="f1", title="Crime spike detected - Whitefield sector", district="Bengaluru Urban", severity="high", timestamp="8 min ago"),
            FeedItem(id="f2", title="Repeat offender flagged in vehicle theft cluster", district="Mysuru", severity="critical", timestamp="24 min ago"),
            FeedItem(id="f3", title="New emerging crime pattern: OTP fraud", district="Ballari", severity="moderate", timestamp="51 min ago"),
            FeedItem(id="f4", title="Hotspot risk elevated near KR Market", district="Bengaluru Urban", severity="high", timestamp="1 hr ago"),
            FeedItem(id="f5", title="Case cluster resolved - narcotics ring", district="Kalaburagi", severity="low", timestamp="2 hr ago"),
        ],
    )


@require_role(ALL_ROLES)
def get_summary(request, response, user):
    summary = _load_summary_from_data_store(request)
    logger.info(f"dashboard summary served to user={user['user_id']}")
    response.set_status(200)
    response.send(Envelope.ok(summary.model_dump()).model_dump_json())


@require_role(ALL_ROLES)
def get_feed(request, response, user):
    summary = _load_summary_from_data_store(request)
    response.set_status(200)
    response.send(Envelope.ok([f.model_dump() for f in summary.feed]).model_dump_json())


def handler(request, response):
    path = request.get_path() if hasattr(request, "get_path") else "/dashboard/summary"
    if path.endswith("/feed"):
        return get_feed(request, response)
    return get_summary(request, response)
