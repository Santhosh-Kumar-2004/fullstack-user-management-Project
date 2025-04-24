from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# from routers import users
from app.routers import users
import uvicorn

app = FastAPI(
    title="Simple user Management",
    description="A simple user management system using FastAPI",
    version="0.1.0",
)

origins = [
    "http://localhost:5173",
]

# Allow Cross Origins for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, tags=["users"])

if __name__ == "__main__": #using this line we can able to start the server like pyton main.py
    uvicorn.run(app, port=8000)

# @app.get("/")
# def get_all_users():
#     return {"message": "Hello, World!"}