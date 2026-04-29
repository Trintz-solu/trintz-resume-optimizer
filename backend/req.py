import requests
res = requests.post('http://127.0.0.1:8000/api/analyze', files={'resume': ('test.txt', 'dummy content')}, data={'job_description': 'test'})
print(res.status_code, res.text)
