from fastapi import APIRouter, Depends, HTTPException, status, Header
from pydantic import BaseModel
from sqlalchemy import UUID
from sqlalchemy.orm import Session
from app.engine.models import User
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import datetime as dt
import base64
from app.helper.db_helper import get_db
from app.engine.models import User, CreateUser, UpdateUser, LoginUser
import os 
from dotenv import load_dotenv
from sqlalchemy.exc import SQLAlchemyError
import uuid

load_dotenv()

# creating the fastapi Router
router = APIRouter(prefix="/User_Management")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))


# Function to hash passwords
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Function to verify passwords
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Function to create a JWT token
def create_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.now(tz=dt.timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    print("Creating token with payload:", to_encode)
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Function to decode and validate a JWT token
def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
# getting the User role and Current user details
async def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization.split(" ")[1]
    payload = decode_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    print("Decoded token payload:", payload)


    email = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload invalid (missing sub)",
        )

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return {
        "user_id": str(user.user_id),
        "name": user.name,
        "email": user.email,
        "role": user.role.value
    }

#Endpoint is to Get all The users from the database
@router.get("/") #---ADMIN
async def get_all_users(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    This is the endpoints whihc is used to Get All the users from the database.
    """
    
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource, you need Admin Position!",
        )
        
    print("INSIDE GET ALL!!!")
    users = db.query(User).all()
    print(f"Currently available user are: {users}") 
    
    return users

@router.get("/{user_id}") #---ADMIN, USER
async def get_user_by_id(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    This endpoint is used to get a user by their id.
    """
    
    user = db.query(User).filter(User.user_id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return user


#the endpoint ius uysed to add the NEW user to the database
@router.post("/register", response_model=dict) #---ADMIN, USER
async def register_user(
    user: CreateUser,
    db: Session = Depends(get_db)
):
    """
    This endpoint is used to register a new user.
    """
    
    if not (user.name and user.email and user.password):
        raise HTTPException(
            status_code=400, 
            detail="Missing required fields1"
        )
        
    # existing_user = db.query(User.email)
    
    # if existing_user:
    #     raise HTTPException(status_code=400, detail="Username already registered.")
        
    print(f"Received requested with data: {user}")\
        
    existing_user = db.query(User).filter(
        (User.email == user.email) | (User.name == user.name)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User with this email or name already exists"
        )
    
    # Hash the password before storing it
    hashed_password = hash_password(user.password)
    user.password = hashed_password
    
    try:
        new_user = User(
            user_id=uuid.uuid4(),
            name=user.name, 
            email=user.email, 
            password=user.password,
            role=user.role,
            # created_at=datetime.now(tz=dt.timezone.utc),
            # updated_at=datetime.now(tz=dt.timezone.utc)
        )

        db.add(new_user)
        db.commit()
        # db.refresh(new_user)
        
        print("One User Got Added Successfulyy", new_user)
        
    except SQLAlchemyError as e:
        db.rollback()
        print(f"Error when adding the User: {e}")
        
    if not new_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user."
        )
        
    return { "item": {
        "user_id": new_user.user_id,
        "name": user.name,
        "email": user.email,
        "password": user.password,
    },
        "message": "User registered successfully"
    }
    
#This endpoint is used to login an Existing Usrr
@router.post("/login", response_model=dict) #---ADMIN, USER
async def login_user(
    login_data: LoginUser,
    db: Session = Depends(get_db),
):
    """
    This endpoint is used to login an existing user.
    """
    user = db.query(User).filter(User.email == login_data.email).first()

    if not user or not verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    print(f"USER {user.name} is logged in successfully")

    access_token = create_token(data={
        "sub": user.email,
        "name": user.name,
        "user_id": str(user.user_id),
        "role": user.role.value,
    })
    
    print(f"THE LOGIN DATA IS{decode_token(access_token)}")

    return {"access_token": access_token, "token_type": "bearer"}

# this endpoint is used to update one user by he's user_id in the database
@router.put("/{user_id}") #---ADMIN, USER
def update_one_item(
    user: UpdateUser, 
    user_id: str, 
    db: Session = Depends(get_db)
):
    print(f"Received request to update user with ID: {user_id}")
    if not (user.email and user.password):
        raise HTTPException(status_code=400, detail="Missing required fields22")
    
    db_user = db.query(User).filter(User.user_id == user_id).first()
    print(f"THE SELECTED USER TO UPDATE IS: {db_user}")
    
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    for key, value in user.model_dump().items(): 
        setattr(db_user, key, value)
        
    db.commit()
    db.refresh(db_user)
    
    return {
        "detail": "Item Updated Successfulyy."
    }

#the endpoint is used to delete an User in the database using the user id.
@router.delete("/{user_id}") #---ADMIN, USER
def delete_item(
    user_id: str, 
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(User.user_id == user_id).first()
    
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(db_user)
    db.commit()
    
    return {
        "detail": "Item deleted Successfulyy."
    }
