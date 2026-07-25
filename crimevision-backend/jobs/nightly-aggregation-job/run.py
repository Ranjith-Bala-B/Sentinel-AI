"""Nightly aggregation job (Catalyst Cron, 02:00 IST daily).

Reads raw Crimes / Victims / Offenders rows via ZCQL, computes the
KPI summary, monthly trend, category distribution, district ranking,
and top-station tables consumed by dashboard-service, then writes the
results back into a single DashboardAggregates row so the dashboard
API stays a fast read with no on-request aggregation.
"""
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))

from common.logger import get_logger  # noqa: E402

logger = get_logger("nightly-aggregation-job")


def run(request=None):
    logger.info("Starting nightly dashboard aggregation")
    # TODO:
    #  1. zcql_query(request, "SELECT ... FROM Crimes WHERE date_time >= ...")
    #  2. compute KPIs / trend / category / district / station aggregates in pandas
    #  3. upsert into DashboardAggregates table via Data Store insert/update API
    logger.info("Nightly dashboard aggregation complete")


if __name__ == "__main__":
    run()
