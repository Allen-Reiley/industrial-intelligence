from typing import Optional
from sqlmodel import SQLModel, Field, Relationship

class Department(SQLModel, table=True):
    """Public corporate contact points per department (POPIA Exempt)"""
    id: Optional[int] = Field(default=None, primary_key=True)
    company_id: int = Field(foreign_key="company.id")
    
    name: str = Field(index=True) # e.g., "Procurement", "Engineering"
    email: Optional[str] = None   # e.g., "tenders@company.co.za"
    phone: Optional[str] = None   # Department direct line
    head_of_dept_linkedin: Optional[str] = None # URL to public profile
    
    company: "Company" = Relationship(back_populates="departments")