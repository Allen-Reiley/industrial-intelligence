from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

# We use TYPE_CHECKING to prevent circular imports at runtime
# while still allowing type checkers (like Mypy/Pyright) to see the Company class.
if TYPE_CHECKING:
    from .company import Company

class Department(SQLModel, table=True):
    """Public corporate contact points per department (POPIA Exempt)"""
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Foreign key to the company table
    company_id: int = Field(foreign_key="company.id")
    
    name: str = Field(index=True) # e.g., "Procurement", "Engineering"
    email: Optional[str] = None   # e.g., "tenders@company.co.za"
    phone: Optional[str] = None   # Department direct line
    head_of_dept_linkedin: Optional[str] = None # URL to public profile
    
    # Relationship definition
    # Using the string "Company" is critical here to avoid the 
    # 'failed to locate a name' error during mapper initialization.
    company: "Company" = Relationship(back_populates="departments")