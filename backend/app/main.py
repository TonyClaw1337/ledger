from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Numeric, ForeignKey, Enum, JSON, Date, text
from sqlalchemy.sql import func
from datetime import datetime, date
from typing import Optional, List
import os
import enum
from pydantic import BaseModel, Field
from decimal import Decimal
import sys
import asyncio

# Add core to path for tc_auth
sys.path.insert(0, '/app/core')

# Database setup
DATABASE_URL = os.getenv("LEDGER_DATABASE_URL", "postgresql+asyncpg://identity:identity@tc-postgres:5432/ledger")
engine = create_async_engine(DATABASE_URL)
async_session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

# Enums
class FrequencyEnum(enum.Enum):
    monthly = "monthly"
    yearly = "yearly"
    weekly = "weekly"

class TransactionTypeEnum(enum.Enum):
    expense = "expense"
    income = "income"

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(String, unique=True, index=True)  # OAuth sub
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    created_at = Column(DateTime, default=func.now())

class Income(Base):
    __tablename__ = "income"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    frequency = Column(Enum(FrequencyEnum), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    icon = Column(String)
    color = Column(String)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())

class BudgetItem(Base):
    __tablename__ = "budget_items"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    category_id = Column(Integer, ForeignKey("categories.id"))
    name = Column(String, nullable=False)
    amount_monthly = Column(Numeric(10, 2), nullable=False)
    is_fixed = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    notes = Column(String)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    budget_item_id = Column(Integer, ForeignKey("budget_items.id"), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"))
    amount = Column(Numeric(10, 2), nullable=False)
    date = Column(Date, nullable=False)
    description = Column(String, nullable=False)
    type = Column(Enum(TransactionTypeEnum), nullable=False)
    created_at = Column(DateTime, default=func.now())

class MonthlySnapshot(Base):
    __tablename__ = "monthly_snapshots"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    month = Column(Date, nullable=False)
    total_income = Column(Numeric(10, 2), nullable=False)
    total_expenses = Column(Numeric(10, 2), nullable=False)
    total_savings = Column(Numeric(10, 2), nullable=False)
    data_json = Column(JSON)
    created_at = Column(DateTime, default=func.now())

# Pydantic models for API
class IncomeCreate(BaseModel):
    name: str
    amount: Decimal
    frequency: FrequencyEnum

class IncomeResponse(BaseModel):
    id: int
    name: str
    amount: Decimal
    frequency: FrequencyEnum
    is_active: bool
    created_at: datetime
    updated_at: datetime

class CategoryCreate(BaseModel):
    name: str
    icon: Optional[str] = None
    color: Optional[str] = None
    sort_order: int = 0

class CategoryResponse(BaseModel):
    id: int
    name: str
    icon: Optional[str]
    color: Optional[str]
    sort_order: int
    created_at: datetime

class BudgetItemCreate(BaseModel):
    category_id: int
    name: str
    amount_monthly: Decimal
    is_fixed: bool = False
    notes: Optional[str] = None

class BudgetItemResponse(BaseModel):
    id: int
    category_id: int
    name: str
    amount_monthly: Decimal
    is_fixed: bool
    is_active: bool
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

class TransactionCreate(BaseModel):
    budget_item_id: Optional[int] = None
    category_id: int
    amount: Decimal
    date: date
    description: str
    type: TransactionTypeEnum

class TransactionResponse(BaseModel):
    id: int
    budget_item_id: Optional[int]
    category_id: int
    amount: Decimal
    date: date
    description: str
    type: TransactionTypeEnum
    created_at: datetime

# Database dependency
async def get_db() -> AsyncSession:
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()

# FastAPI app
app = FastAPI(title="LEDGER - Personal Finance Manager", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:9400"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# For now, simple auth check (will be replaced with OAuth)
async def get_current_user() -> dict:
    # TODO: Implement proper OAuth with tc_auth
    return {"id": 1, "external_id": "test-user", "name": "Test User", "email": "test@example.com"}

# Create database tables
async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
        # Create database if it doesn't exist
        try:
            await conn.execute(text("CREATE DATABASE ledger"))
        except:
            pass  # Database already exists

# API Routes
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "ledger"}

@app.get("/api/version")
async def version():
    return {"version": "1.0.0", "service": "ledger"}

@app.get("/api/dashboard")
async def get_dashboard(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # TODO: Implement dashboard data aggregation
    return {
        "total_income": 1024.00,
        "total_expenses": 966.00,
        "total_savings": 58.00,
        "budget_utilization": 94.3,
        "categories": []
    }

@app.get("/api/income", response_model=List[IncomeResponse])
async def get_income(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # TODO: Implement income retrieval
    return []

@app.post("/api/income", response_model=IncomeResponse)
async def create_income(income: IncomeCreate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # TODO: Implement income creation
    pass

@app.get("/api/categories", response_model=List[CategoryResponse])
async def get_categories(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # TODO: Implement category retrieval
    return []

@app.post("/api/categories", response_model=CategoryResponse)
async def create_category(category: CategoryCreate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # TODO: Implement category creation
    pass

@app.get("/api/budget", response_model=List[BudgetItemResponse])
async def get_budget(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # TODO: Implement budget retrieval
    return []

@app.post("/api/budget", response_model=BudgetItemResponse)
async def create_budget_item(budget_item: BudgetItemCreate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # TODO: Implement budget item creation
    pass

@app.get("/api/transactions", response_model=List[TransactionResponse])
async def get_transactions(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # TODO: Implement transaction retrieval
    return []

@app.post("/api/transactions", response_model=TransactionResponse)
async def create_transaction(transaction: TransactionCreate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # TODO: Implement transaction creation
    pass

@app.get("/api/reports")
async def get_reports(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # TODO: Implement reports
    return {"monthly_comparison": [], "category_trends": [], "savings_rate": 0}

# Startup event
@app.on_event("startup")
async def startup_event():
    await create_tables()

# Serve static files (frontend)
STATIC_DIR = "/app/static"

@app.get("/")
async def serve_frontend():
    return FileResponse(f"{STATIC_DIR}/index.html")

@app.get("/{path:path}")
async def serve_frontend_paths(path: str):
    from pathlib import Path as P
    file_path = P(f"{STATIC_DIR}/{path}")
    if file_path.exists() and file_path.is_file():
        return FileResponse(file_path)
    return FileResponse(f"{STATIC_DIR}/index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9400)