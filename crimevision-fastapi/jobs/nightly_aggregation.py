import time
from common.logger import get_logger

logger = get_logger("nightly-aggregation")

def run_aggregation():
    logger.info("Starting nightly aggregation job...")
    # TODO: Connect to DB and compute dashboard aggregates
    time.sleep(2)
    logger.info("Nightly aggregation completed successfully.")

if __name__ == "__main__":
    run_aggregation()
