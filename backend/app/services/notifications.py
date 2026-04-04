import httpx
from app.core.config import settings

async def post_to_slack(lead_data: dict):
    if not settings.SLACK_WEBHOOK_URL:
        return

    payload = {
        "text": f"🚀 *New Lead Captured*\n*Company:* {lead_data.get('company')}\n*Industry:* {lead_data.get('industry')}\n*Avg. Price:* {lead_data.get('avg_price')}"
    }
    
    async with httpx.AsyncClient() as client:
        await client.post(settings.SLACK_WEBHOOK_URL, json=payload)