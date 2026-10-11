# backend/app/api/v1/calendar.py
import logging
import uuid
from typing import List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, desc

from app.db import get_async_session
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.models.calendar import CalendarEvent

logger = logging.getLogger("auraworks.calendar")
router = APIRouter()

class CalendarEventCreate(BaseModel):
    title: str
    start_time: datetime
    end_time: Optional[datetime] = None
    all_day: bool = False
    category: str = "primary"

class CalendarEventUpdate(BaseModel):
    title: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    all_day: Optional[bool] = None
    category: Optional[str] = None


@router.get("/events")
async def list_calendar_events(
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    """
    Returns calendar events.
    Admins and Sales Reps can view company calendar events.
    """
    stmt = select(CalendarEvent).order_by(CalendarEvent.start_time.asc())
    res = await session.execute(stmt)
    events = res.scalars().all()

    return [
        {
            "id": evt.id,
            "title": evt.title,
            "start": evt.start_time.isoformat(),
            "end": evt.end_time.isoformat() if evt.end_time else None,
            "allDay": evt.all_day,
            "extendedProps": {
                "category": evt.category,
                "user_id": evt.user_id
            }
        }
        for evt in events
    ]


@router.post("/events", status_code=status.HTTP_201_CREATED)
async def create_calendar_event(
    payload: CalendarEventCreate,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    """
    Creates a new calendar event attributed to the current authenticated user.
    """
    if not payload.title.strip():
        raise HTTPException(status_code=400, detail="Event title cannot be empty")

    event_id = f"evt_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)
    new_event = CalendarEvent(
        id=event_id,
        title=payload.title.strip(),
        start_time=payload.start_time,
        end_time=payload.end_time,
        all_day=payload.all_day,
        category=payload.category,
        user_id=current_user.id,
        created_at=now,
        updated_at=now
    )
    session.add(new_event)
    await session.commit()
    await session.refresh(new_event)

    logger.info(f"User {current_user.email} created calendar event '{new_event.title}' ({new_event.id})")
    return {
        "status": "success",
        "event": {
            "id": new_event.id,
            "title": new_event.title,
            "start": new_event.start_time.isoformat(),
            "end": new_event.end_time.isoformat() if new_event.end_time else None,
            "allDay": new_event.all_day,
            "extendedProps": {
                "category": new_event.category,
                "user_id": new_event.user_id
            }
        }
    }


@router.put("/events/{event_id}")
async def update_calendar_event(
    event_id: str,
    payload: CalendarEventUpdate,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    """
    Updates a calendar event.
    RBAC: Admins can update any event. Sales reps can only update self-created events.
    """
    event = await session.get(CalendarEvent, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if current_user.role != UserRole.ADMIN and event.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: You can only edit your own calendar events")

    if payload.title is not None:
        event.title = payload.title.strip()
    if payload.start_time is not None:
        event.start_time = payload.start_time
    if payload.end_time is not None:
        event.end_time = payload.end_time
    if payload.all_day is not None:
        event.all_day = payload.all_day
    if payload.category is not None:
        event.category = payload.category

    event.updated_at = datetime.now(timezone.utc)
    session.add(event)
    await session.commit()
    await session.refresh(event)

    logger.info(f"User {current_user.email} updated calendar event {event.id}")
    return {
        "status": "success",
        "event": {
            "id": event.id,
            "title": event.title,
            "start": event.start_time.isoformat(),
            "end": event.end_time.isoformat() if event.end_time else None,
            "allDay": event.all_day,
            "extendedProps": {
                "category": event.category,
                "user_id": event.user_id
            }
        }
    }


@router.delete("/events/{event_id}")
async def delete_calendar_event(
    event_id: str,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    """
    Deletes a calendar event.
    RBAC: Admins can delete any event. Sales reps can only delete self-created events.
    """
    event = await session.get(CalendarEvent, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if current_user.role != UserRole.ADMIN and event.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: You can only delete your own calendar events")

    await session.delete(event)
    await session.commit()

    logger.info(f"User {current_user.email} deleted calendar event {event_id}")
    return {"status": "success", "message": "Event deleted successfully"}
