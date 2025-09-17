import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from app.services.embedding_service import _process_embedding_task
from app.core.config import settings
from agents.embedding_agent.state import InputState, Category
from app.core.constant import DEFAULT_RSS_FEEDS

logger = logging.getLogger(__name__)

# Global scheduler instance
scheduler = AsyncIOScheduler()


async def scheduled_embedding_task():
    """Scheduled task that runs every 12 hours to process embeddings"""
    logger.info("Starting scheduled embedding task")

    try:
        # Use default RSS feeds
        default_feeds = DEFAULT_RSS_FEEDS

        # Create InputState objects for each feed
        states = []
        for feed in default_feeds:
            # Convert string category to Category enum
            category = getattr(Category, feed["category"], Category.OTHER)
            states.append(
                InputState(
                    rss_feed_url=feed["url"],
                    num_articles=feed["num_articles"],
                    category=category,
                )
            )

        # Process embeddings
        results = await _process_embedding_task(states)

        logger.info(
            f"Scheduled embedding task completed. Processed {len(results)} results"
        )

    except Exception as e:
        logger.error(f"Error in scheduled embedding task: {e}")


def start_scheduler():
    """Start the scheduler with cron jobs"""
    if not settings.ENABLE_SCHEDULER:
        logger.info("Scheduler is disabled in configuration")
        return

    try:
        # Add the scheduled embedding task to run every configured hours
        cron_hours = settings.EMBEDDING_CRON_HOURS
        scheduler.add_job(
            scheduled_embedding_task,
            trigger=CronTrigger(hour=f"*/{cron_hours}"),  # Every N hours
            id="embedding_task",
            name="Scheduled Article Embedding",
            replace_existing=True,
        )

        # Start the scheduler
        scheduler.start()
        logger.info(
            f"Scheduler started successfully. Embedding task scheduled every {cron_hours} hours"
        )

    except Exception as e:
        logger.error(f"Error starting scheduler: {e}")


def stop_scheduler():
    """Stop the scheduler"""
    try:
        scheduler.shutdown()
        logger.info("Scheduler stopped successfully")
    except Exception as e:
        logger.error(f"Error stopping scheduler: {e}")


def get_scheduler_status():
    """Get the status of scheduled jobs"""
    jobs = scheduler.get_jobs()
    return {
        "scheduler_running": scheduler.running,
        "jobs": [
            {
                "id": job.id,
                "name": job.name,
                "next_run": (
                    job.next_run_time.isoformat() if job.next_run_time else None
                ),
                "trigger": str(job.trigger),
            }
            for job in jobs
        ],
    }
