from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware #Middleware = code that runs between the server receiving a request and sending a response
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
    allow_credentials=True, #Allow cookies, sessions, Authorization headers
    allow_methods=["*"], #Allow all HTTP methods
    allow_headers=["*"], #Allow any HTTP headers
)

app.include_router(users.router, tags=["users"]) #Tag used to group these endpoints in Swagger docs nicely

# if __name__ == "__main__": #using this line we can able to start the server like pyton main.py
#     uvicorn.run(app, port=8000)
