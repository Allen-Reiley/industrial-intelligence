#!/usr/bin/env python3
"""
AuraWorks Industrial Intelligence - Lead Recovery CLI Engine
Dispatches targeted recovery emails to prospects who registered through public forms
but encountered a broken/404 calendar booking link.
"""

import sys
import os
import asyncio
import argparse
from uuid import UUID

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db import async_session_maker
from app.services.email import recover_prospect_leads
from app.core.config import settings


async def main():
    parser = argparse.ArgumentParser(
        description="Recover unbooked AuraWorks leads affected by broken calendar link."
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Simulate execution without sending actual emails."
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Include all prospects, even those marked 'call_booked'."
    )
    parser.add_argument(
        "--link",
        type=str,
        default=getattr(settings, "BOOKING_LINK", None) or settings.CALENDLY_LINK or "https://cal.com/reitumetse-sethabela/30min",
        help="Custom calendar booking link (defaults to settings.BOOKING_LINK / cal.com)."
    )
    parser.add_argument(
        "--client-id",
        type=str,
        default=None,
        help="Optional tenant client_id UUID to restrict recovery to."
    )
    parser.add_argument(
        "--days",
        type=int,
        default=None,
        help="Only target leads registered in the last N days (e.g. --days 14)."
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Maximum number of candidate leads to process."
    )

    args = parser.parse_args()

    client_uuid = None
    if args.client_id:
        try:
            client_uuid = UUID(args.client_id)
        except ValueError:
            print(f"❌ Error: Invalid UUID format for --client-id: {args.client_id}")
            sys.exit(1)

    print("\n" + "=" * 60)
    print("🚀 AuraWorks Industrial Intelligence: Lead Recovery Engine")
    print("=" * 60)
    print(f"Mode:          {'DRY RUN (No emails dispatched)' if args.dry_run else 'LIVE DISPATCH'}")
    print(f"Target Link:   {args.link}")
    print(f"Only Unbooked: {not args.all}")
    if args.days:
        print(f"Window:        Last {args.days} days")
    if client_uuid:
        print(f"Client Filter: {client_uuid}")
    if args.limit:
        print(f"Limit:         {args.limit}")
    print("=" * 60 + "\n")

    if not async_session_maker:
        print("❌ Database engine offline. Please check DATABASE_URL.")
        sys.exit(1)

    async with async_session_maker() as session:
        result = await recover_prospect_leads(
            session=session,
            booking_link=args.link,
            client_id=client_uuid,
            only_unbooked=not args.all,
            dry_run=args.dry_run,
            days_back=args.days,
            limit=args.limit
        )

    print("📊 Execution Summary:")
    print(f"   • Total Candidates Found: {result['total_candidates']}")
    print(f"   • Successfully Sent:     {result['sent']}")
    print(f"   • Failed:                {result['failed']}")
    print(f"   • Skipped:               {result['skipped']}")
    print("-" * 60)

    if result["details"]:
        print("\n📋 Lead Details:")
        for idx, item in enumerate(result["details"], 1):
            name_str = f" ({item.get('name')})" if item.get('name') else ""
            status_str = item.get('status', 'unknown').upper()
            extra = f" - {item['reason']}" if item.get('reason') else (f" - {item['error']}" if item.get('error') else "")
            print(f"   {idx}. [{status_str}] {item.get('email')}{name_str}{extra}")
    print("\n✅ Lead recovery run finished.\n")


if __name__ == "__main__":
    asyncio.run(main())
