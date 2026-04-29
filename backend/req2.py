import requests, sqlite3
from jose import jwt
from datetime import datetime, timedelta, timezone
token = jwt.encode({'sub': '1', 'exp': datetime.now(timezone.utc) + timedelta(minutes=60)}, 'change-this-to-a-random-32-char-string-in-production', algorithm='HS256')
res = requests.post('http://127.0.0.1:8000/api/analyze', headers={'Authorization': 'Bearer ' + token}, files={'resume': ('test.pdf', b'%PDF-1.4 dummy')}, data={'job_description': 'test'})
print(res.status_code, res.text)
