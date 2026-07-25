"""Pydantic models for crime-service's /crimes/trends response, matching
the frontend's CrimeAnalyticsResponse type exactly
(crimevision-frontend/src/features/crime-analytics/types/crime-analytics.types.ts).
"""
from pydantic import BaseModel


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


class CrimeAnalyticsResponse(BaseModel):
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
