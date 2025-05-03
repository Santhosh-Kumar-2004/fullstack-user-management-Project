from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from app.engine.models import User
from passlib.context import CryptContext
from jose import JWTError, jwt #jose library is used for JSON Web Tokens
from datetime import datetime, timedelta
import datetime as dt
from app.helper.db_helper import get_db
from app.engine.models import User, CreateUser, UpdateUser, LoginUser
import os 
from dotenv import load_dotenv # = It searches in the current directory
from sqlalchemy.exc import SQLAlchemyError
import uuid

load_dotenv()

# creating the fastapi Router
router = APIRouter(prefix="/User_Management") #FastAPI that lets you create separate routers (mini apps).

#Crypto context is used to encode and decode the password securely
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto") #If later you change your hashing algorithm in the future (say from bcrypt to something else),it will automatically detect the older hash formats and still verify them.
# 1.    Takes password as input
# 2.    Adds some salt
# 3.    Runs heavy calculations repeatedly
# 4.    Gives a final unreadable string


SECRET_KEY = os.getenv("SECRET_KEY")

if SECRET_KEY is None:
    print("The env SECRET KEY is missing!")
    raise Exception("SECRET_KEY is missing in the environment!")

ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))


# Function to hash passwords
def hash_password(password: str) -> str: # this function promises to return a str
    return pwd_context.hash(password)

# Function to verify passwords
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Function to create a JWT token
def create_token(data: dict, expires_delta: timedelta | None = None): #----Creates and signs a JWT token using user data.
    to_encode = data.copy()
    expire = datetime.now(tz=dt.timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire}) #The exp field is added to the token to mark when it expires
    print("Creating token with payload:", to_encode)
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM) #JWT is a standard for securely transmitting information between parties as a JSON object it is usefull for authentication and authorization

# Function to decode and validate a JWT token
def decode_token(token: str): #---------------------------------------------Decodes and verifies the JWT token to retrieve the user data.
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"The PAYLOAD from the decode token func is: ", payload)
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
        
# 1.	JWT is split into Header, Payload, Signature
# 2.	Header and Payload are decoded from Base64
# 3.	Signature is verified using SECRET_KEY and ALGORITHM
# 4.	Expiration is checked
# 5.	Payload is returned if valid
    
# getting the User role and Current user details
async def get_current_user(  # --------------------This function extracts, verifies, and returns the currently logged-in user's info based on their token.
    authorization: str = Header(None), #It automatically reads & injects the Authorization header from the incoming HTTP request.
    db: Session = Depends(get_db)
): 
    
    """
    | Reads Authorization header |
    | Splits and extracts token | 
    | Decodes token |
    | Looks up user by email in the db | 
    | Checks if user is still logged in | 
    | Returns user info |
    """
    
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

    user = db.query(User).filter(User.email == email).first() #filters and the fetches the first result that matches the sub(email)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    if not user.is_logged_in: #it is bool, and it is used to check the user is logged in or not?? if not, then 401
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User is logged out. Please log in again."
        )


    return {
        "user_id": str(user.user_id),
        "name": user.name,
        "email": user.email,
        "role": user.role.value
    }

#Endpoint is to Get all The users from the database
@router.get("/") #---ADMIN #A decorator is a function that wraps another function below it and to add functionality or modify behavior.
async def get_all_users(
    db: Session = Depends(get_db), #It injects a database session, used to query your database.
    current_user: dict = Depends(get_current_user) #That function reads the Authorization header, decodes the token, and returns the logged-in user (as a dict).
):
    
    """
    This is the endpoints whihc is used to Get All the users from the database. 
    And it is only acccess to those who have the ADMIN role.
    """
    
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource, you need Admin Position!",
        )
        
    print("INSIDE GET ALL!!!")
    users = db.query(User).all() #This one line retrieves all the users
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
    
    try:
        user = db.query(User).filter(User.user_id == user_id).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return user

    except Exception as e:
        # Unexpected error - Internal Server Error
        print(f"Error retrieving user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Something went wrong while retrieving the user. Please try again later."
        )


#the endpoint ius used to add the NEW user to the database
@router.post("/register", response_model=dict) #---ADMIN, USER
async def register_user(
    user: CreateUser, #Request body & f-APIL auto fettches it to py model
    db: Session = Depends(get_db)
):
    
    """
    Validates the user input.
    Checks if the user already exists in the database.
    Hashes the password before storing it.
    Creates the new user in the database.
    Generates a JWT token for the newly registered user.
    Returns the JWT token and the newly created user's details in the response.
    """
    
    if not (user.name and user.email and user.password):
        raise HTTPException(
            status_code=400, 
            detail="Missing required fields1"
        )
        
    print(f"Received requested with data: {user}")\
        
    existing_user = db.query(User).filter(
        (User.email == user.email) | (User.name == user.name)
    ).first()

    if existing_user:
        if existing_user.email == user.email:
            raise HTTPException(
                status_code=409,
                detail="User with this email already exists"
            )
        elif existing_user.name == user.name:
            raise HTTPException(
                status_code=409,
                detail="User with this name already exists"
            )

    
    # Hashing the password before storing it
    hashed_password = hash_password(user.password)
    user_password = hashed_password
    
    try:
        new_user = User(
            user_id=uuid.uuid4(),
            name=user.name, 
            email=user.email, 
            password=user_password,
            role=user.role,
        )

        db.add(new_user)
        db.commit()
        
        print("One User Got Added Successfulyy", new_user)
        
        
        
    except SQLAlchemyError as e:
        db.rollback()
        print(f"Error when adding the User: {e}")
        
    if not new_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user."
        )
        
    # access_token = create_token(data={
    #         "sub": new_user.email,
    #         "name": new_user.name,
    #         "user_id": str(new_user.user_id),
    #         "role": new_user.role.value,
    #     })
    # print("🔴 Token created:", decode_token(access_token))
    
    return { 
        # "access_token": access_token, 
        "token_type": "bearer", #when you're returning "token_type": "bearer", you're saying that the token you're generating is a bearer token, and it will be included in future HTTP requests as part of the Authorization header
        
        "user": {
        "user_id": new_user.user_id,
        "name": user.name,
        "email": user.email,
        "password": user_password,
    }}
    
#This endpoint is used to login an Existing Usrr
@router.post("/login", response_model=dict)
async def login_user(
    login_data: LoginUser, 
    db: Session = Depends(get_db)
):
    """
    This endpoint is used to Login a existing user using only email and password.
    """
    
    user = db.query(User).filter(User.email == login_data.email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Email or Password",
        )

    print("User found:", user.email)
    print("Plain password from login:", login_data.password)
    print("Hashed password from DB:", user.password)

    if not verify_password(login_data.password, user.password):
        print("Password verification failed!")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    print("🤢 Password verified!")
    
    user.is_logged_in = True
    db.commit()

    access_token = create_token(data={
        "sub": user.email,
        "name": user.name,
        "user_id": str(user.user_id),
        "role": user.role.value,
    })

    print("😶‍🌫️ Token created:", decode_token(access_token))

    return {"access_token": access_token, "token_type": "bearer"} #bearer == holding


# this endpoint is used to update one user by he's user_id in the database
@router.put("/{user_id}")  # ---ADMIN, USER
def update_one_user(
    user: UpdateUser,  # name, emial, pass
    user_id: str, 
    db: Session = Depends(get_db)
):
    
    """
    This endpoint is used to Update an existing users credentials.
    """
    
    print(f"Received request to update user with ID: {user_id}")
    
    if not (user.email or user.password or user.name):
        raise HTTPException(status_code=400, detail="At least one field must be provided.")
    
    try:

        db_user = db.query(User).filter(User.user_id == user_id).first()
        print(f"THE SELECTED USER TO UPDATE IS: {db_user}")

        if db_user is None:
            raise HTTPException(status_code=404, detail="User not found")

        # Hashing the new password
        hashed_password = hash_password(user.password)

        db_user.name = user.name
        db_user.email = user.email
        db_user.password = hashed_password

        db.commit()
        db.refresh(db_user)

        return {
            "detail": "User updated successfully"
        }
    
    except Exception as e:
        # Unexpected error - Internal Server Error
        print(f"Error when Updating user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Something went wrong while Updating the user. Please try again later."
        )


#the endpoint is used to delete an User in the database using the user id.
@router.delete("/{user_id}") #--- USER
def delete_user(
    user_id: str, 
    db: Session = Depends(get_db)
):
    """
    This endpoint is used to Delete a existing user { Hard Core Delete }.
    """
    
    try:
        db_user = db.query(User).filter(User.user_id == user_id).first()

        if db_user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        db.delete(db_user)
        db.commit()

        return {"detail": "Item deleted successfully."}
    
    except Exception as e:
        # Unexpected error - Internal Server Error
        print(f"Error deleting user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Something went wrong while deleting the user. Please try again later."
        )

#the endpoint is used to logout an User and making the is_logged_in is equal to False.
@router.post("/logout")
def logout_user(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    This endpoint is used to Logout a existing user and then can login with the same credentials.
    """
    # That's okay for logout — it's an "action" rather than a "resource update".
    # ending the session — so POST fits better.
    # Summary: PUT = resource updates, POST = actions. Logout is an action.
    
    user = db.query(User).filter(User.email == current_user["email"]).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_logged_in = False
    db.commit()

    return {"message": "Logged out successfully"}

