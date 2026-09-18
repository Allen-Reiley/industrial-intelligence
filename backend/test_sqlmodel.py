from sqlmodel import SQLModel, Field
from sqlalchemy import create_engine
import uuid

class Client(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class Visit(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    client_id: uuid.UUID = Field(foreign_key="client.id", ondelete="CASCADE")

engine = create_engine("sqlite:///:memory:")
SQLModel.metadata.create_all(engine)
print("Success!")
