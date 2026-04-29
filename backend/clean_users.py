"""
Clean all test users and reset the DB for a fresh start.
Keeps only users with a specific email if needed.
"""
from database import SessionLocal
import models

db = SessionLocal()

# Delete ALL unverified users to allow fresh registration
unverified = db.query(models.User).filter(models.User.email_verified == False).all()
print(f"Found {len(unverified)} unverified users - deleting...")
for u in unverified:
    print(f"  Deleting: {u.email}")
    db.delete(u)

db.commit()

# Show remaining users
remaining = db.query(models.User).all()
print(f"\nRemaining verified users: {len(remaining)}")
for u in remaining:
    print(f"  ID={u.id} | {u.email} | verified={u.email_verified}")

db.close()
print("\nDone. You can now register fresh with any email.")
