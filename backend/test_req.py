import urllib.request, json, urllib.error
req = urllib.request.Request('http://127.0.0.1:8000/api/analyze', method='POST')
req.add_header('Content-Type', 'multipart/form-data; boundary=---boundary')
data = b'---boundary\r\nContent-Disposition: form-data; name="job_description"\r\n\r\ntest\r\n---boundary\r\nContent-Disposition: form-data; name="resume"; filename="test.txt"\r\nContent-Type: text/plain\r\n\r\ntest resume text\r\n---boundary--\r\n'
req.data = data
try:
    urllib.request.urlopen(req)
except urllib.error.HTTPError as e:
    print(e.code, e.read().decode())
