# backend/app/api/v1/tasks.py
import logging
import uuid
from typing import List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, or_, desc

from app.db import get_async_session
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.models.task import Task

logger = logging.getLogger("auraworks.tasks")
router = APIRouter()

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "todo"  # todo, in_progress, done
    priority: str = "medium"  # low, medium, high, urgent
    due_date: Optional[datetime] = None
    assigned_to_id: Optional[str] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    assigned_to_id: Optional[str] = None


@router.get("")
async def list_tasks(
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    """
    Lists tasks with RBAC scoping:
    - Admins see all tasks across the company.
    - Sales Reps see tasks created by or assigned to them.
    """
    if current_user.role == UserRole.ADMIN:
        stmt = select(Task).order_by(desc(Task.created_at))
    else:
        stmt = select(Task).where(
            or_(
                Task.created_by_id == current_user.id,
                Task.assigned_to_id == current_user.id
            )
        ).order_by(desc(Task.created_at))

    res = await session.execute(stmt)
    tasks = res.scalars().all()

    return [
        {
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "status": t.status,
            "priority": t.priority,
            "due_date": t.due_date.isoformat() if t.due_date else None,
            "assigned_to_id": t.assigned_to_id,
            "created_by_id": t.created_by_id,
            "created_at": t.created_at.isoformat(),
            "updated_at": t.updated_at.isoformat()
        }
        for t in tasks
    ]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_task(
    payload: TaskCreate,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    """
    Creates a new task.
    """
    if not payload.title.strip():
        raise HTTPException(status_code=400, detail="Task title cannot be empty")

    task_id = f"task_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)
    new_task = Task(
        id=task_id,
        title=payload.title.strip(),
        description=payload.description.strip() if payload.description else None,
        status=payload.status,
        priority=payload.priority,
        due_date=payload.due_date,
        assigned_to_id=payload.assigned_to_id,
        created_by_id=current_user.id,
        created_at=now,
        updated_at=now
    )
    session.add(new_task)
    await session.commit()
    await session.refresh(new_task)

    logger.info(f"User {current_user.email} created task '{new_task.title}' ({new_task.id})")
    return {
        "status": "success",
        "task": {
            "id": new_task.id,
            "title": new_task.title,
            "description": new_task.description,
            "status": new_task.status,
            "priority": new_task.priority,
            "due_date": new_task.due_date.isoformat() if new_task.due_date else None,
            "assigned_to_id": new_task.assigned_to_id,
            "created_by_id": new_task.created_by_id,
            "created_at": new_task.created_at.isoformat(),
            "updated_at": new_task.updated_at.isoformat()
        }
    }


@router.patch("/{task_id}")
async def update_task(
    task_id: str,
    payload: TaskUpdate,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    """
    Updates an existing task.
    Admins can update any task; Sales Reps can update tasks they created or are assigned to.
    """
    task = await session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if current_user.role != UserRole.ADMIN:
        if task.created_by_id != current_user.id and task.assigned_to_id != current_user.id:
            raise HTTPException(status_code=403, detail="Forbidden: You cannot modify this task")

    if payload.title is not None:
        task.title = payload.title.strip()
    if payload.description is not None:
        task.description = payload.description.strip()
    if payload.status is not None:
        task.status = payload.status
    if payload.priority is not None:
        task.priority = payload.priority
    if payload.due_date is not None:
        task.due_date = payload.due_date
    if payload.assigned_to_id is not None:
        task.assigned_to_id = payload.assigned_to_id

    task.updated_at = datetime.now(timezone.utc)
    session.add(task)
    await session.commit()
    await session.refresh(task)

    logger.info(f"User {current_user.email} updated task {task.id}")
    return {
        "status": "success",
        "task": {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "status": task.status,
            "priority": task.priority,
            "due_date": task.due_date.isoformat() if task.due_date else None,
            "assigned_to_id": task.assigned_to_id,
            "created_by_id": task.created_by_id,
            "created_at": task.created_at.isoformat(),
            "updated_at": task.updated_at.isoformat()
        }
    }


@router.delete("/{task_id}")
async def delete_task(
    task_id: str,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    """
    Deletes a task.
    Admins can delete any task; Sales Reps can only delete tasks they created.
    """
    task = await session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if current_user.role != UserRole.ADMIN and task.created_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: You can only delete tasks you created")

    await session.delete(task)
    await session.commit()

    logger.info(f"User {current_user.email} deleted task {task_id}")
    return {"status": "success", "message": "Task deleted successfully"}
