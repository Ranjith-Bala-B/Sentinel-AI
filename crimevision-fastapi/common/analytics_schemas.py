from typing import Optional
from pydantic import BaseModel

class CrimeRecordItem(BaseModel):
    crimeId: str
    firNumber: str
    district: str
    station: str
    crimeType: str
    dateTime: str
    status: str
    severityScore: int
    description: str
    offenderName: Optional[str] = None
    offenderIsRepeat: Optional[bool] = False

class LabeledCount(BaseModel):
    label: str
    count: int

class YearlyPoint(BaseModel):
    year: str
    count: int

class HourlyPoint(BaseModel):
    hour: str
    count: int

class SeasonalPoint(BaseModel):
    season: str
    count: int

class WeekdayPoint(BaseModel):
    day: str
    count: int

class AgeGroupPoint(BaseModel):
    ageGroup: str
    count: int

class GenderPoint(BaseModel):
    gender: str
    count: int

class CategoryPoint(BaseModel):
    category: str
    count: int

class DistrictComparisonPoint(BaseModel):
    district: str
    count: int

class StationComparisonPoint(BaseModel):
    station: str
    count: int

class CrimeAnalyticsResponse(BaseModel):
    records: list[CrimeRecordItem] = []
    monthlyTrend: list[LabeledCount]
    yearlyTrend: list[YearlyPoint]
    categoryBreakdown: list[CategoryPoint]
    timeOfDay: list[HourlyPoint]
    seasonal: list[SeasonalPoint]
    weekday: list[WeekdayPoint]
    victimByAge: list[AgeGroupPoint]
    victimByGender: list[GenderPoint]
    offenderByAge: list[AgeGroupPoint]
    repeatOffenderRate: float
    districtComparison: list[DistrictComparisonPoint]
    stationComparison: list[StationComparisonPoint]

