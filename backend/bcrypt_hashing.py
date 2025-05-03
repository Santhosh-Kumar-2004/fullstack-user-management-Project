from passlib.context import CryptContext

# 1. Create the hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 2. Suppose this is the password user typed
password = "hello123"

# 3. Hash the password
hashed_password = pwd_context.hash(password)

print("Original Password:", password)
print("Hashed Password:", hashed_password)

# 4. Later, to verify (like at login time):
is_correct = pwd_context.verify(password, hashed_password)

print("Password Verified:", is_correct)
