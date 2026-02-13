from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db import get_session
from app.models.client import Client, ClientCreate, ClientPublic

router = APIRouter()

@router.post("/", response_model=ClientPublic)
def create_client(client_in: ClientCreate, session: Session = Depends(get_session)):
    db_client = Client.model_validate(client_in) # or Client.from_orm(client_in)
    session.add(db_client)
    session.commit()
    session.refresh(db_client)
    return db_client