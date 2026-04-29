from database import SessionLocal
import models

db = SessionLocal()
users = db.query(models.User).all()
print("All users in DB:")
for u in users:
    token_status = "HAS_TOKEN" if u.verification_token else "NO_TOKEN"
    print(f"  ID={u.id} | {u.email} | verified={u.email_verified} | {token_status} | plan={u.plan}")
db.close()
