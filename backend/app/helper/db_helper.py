from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
import os 
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
# test_string = os.getenv("VAR_TEST")

engine = create_engine(
    DATABASE_URL,
    echo=True,             # Log SQL queries to the console
    pool_size=30,          # Max number of connections in the pool
    max_overflow=20,        # Additional connections allowed beyond the pool size
)

# print(test_string)

SessionLocal = sessionmaker(bind=engine)

def get_db():
    db = SessionLocal() 
    try:
        yield db  

    finally:
        db.close() 