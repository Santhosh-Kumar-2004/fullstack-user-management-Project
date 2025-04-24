import uuid
from sqlalchemy import (
    Column,
    String,
    Text,
    Boolean,
    Numeric,
    Enum,
    ForeignKey,
    CheckConstraint,
    TIMESTAMP,
    func
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, declarative_base
from pydantic import BaseModel
from typing import List
import enum
from sqlalchemy import Enum
from typing import Optional

Base = declarative_base()

class UserRole(enum.Enum):
    admin = "admin"
    user = "user"
    
# users table
class User(Base):
    __tablename__ = "users"
    
    user_id = Column(primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(100), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.user)
    is_logged_in = Column(Boolean, default=False)
    
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
    

class CreateUser(BaseModel):    
    name: str | None = None
    email: str
    password: str
    role: Optional[UserRole] = UserRole.user
    # is_logged_in: Optional[is_logged_in]
    
class LoginUser(BaseModel):
    email: str
    password: str
    
class UpdateUser(BaseModel):    
    name: str 
    email: str 
    password: str
    
