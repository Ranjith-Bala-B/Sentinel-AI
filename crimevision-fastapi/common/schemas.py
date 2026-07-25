"""Pydantic request/response models shared across all functions."""
from typing import Any, Generic, Optional, TypeVar
from pydantic import BaseModel

T = TypeVar("T")

class ErrorPayload(BaseModel):
    message: str
    code: Optional[str] = None

class Envelope(BaseModel, Generic[T]):
    data: Optional[T] = None
    meta: Optional[dict[str, Any]] = None
    error: Optional[ErrorPayload] = None

    @classmethod
    def ok(cls, data: T, meta: Optional[dict[str, Any]] = None) -> "Envelope[T]":
        return cls(data=data, meta=meta, error=None)

    @classmethod
    def fail(cls, message: str, code: Optional[str] = None) -> "Envelope[T]":
        return cls(data=None, meta=None, error=ErrorPayload(message=message, code=code))

class KpiSummary(BaseModel):
    totalCrimes: int
    crimesThisMonth: int
    crimeRateChange: float
    activeInvestigations: int
    repeatOffenders: int
    highRiskDistricts: int
    activeAlerts: int

class CrimeCategoryPoint(BaseModel):
    category: str
    count: int

class DistrictRankPoint(BaseModel):
    district: str
    count: int
    riskLevel: str
    lowCount: int = 0
    moderateCount: int = 0
    highCount: int = 0
    criticalCount: int = 0
    openCount: int = 0
    pendingCount: int = 0
    solvedCount: int = 0
    closedCount: int = 0

class StationRankPoint(BaseModel):
    station: str
    district: str
    solvedRate: float
    caseload: int

class TrendPoint(BaseModel):
    label: str
    crimes: int
    solved: int

class FeedItem(BaseModel):
    id: str
    title: str
    district: str
    severity: str
    timestamp: str

class StatusPoint(BaseModel):
    status: str
    count: int
    percentage: float

class DashboardSummary(BaseModel):
    kpis: KpiSummary
    crimeByCategory: list[CrimeCategoryPoint]
    districtRanking: list[DistrictRankPoint]
    topStations: list[StationRankPoint]
    monthlyTrend: list[TrendPoint]
    feed: list[FeedItem]
    statusBreakdown: list[StatusPoint] = []

