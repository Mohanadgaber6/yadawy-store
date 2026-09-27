import os
import sys
import requests

target_dir = os.path.expanduser(r"~\.rembg\models\u2net")
os.makedirs(target_dir, exist_ok=True)
model_path = os.path.join(target_dir, "u2net.onnx")

url = "https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net.onnx"
print(f"Downloading {url} to {model_path}...")
r = requests.get(url, stream=True)
total_size = int(r.headers.get('content-length', 0))
downloaded = 0
with open(model_path, "wb") as f:
    for chunk in r.iter_content(chunk_size=2*1024*1024):
        if chunk:
            f.write(chunk)
            downloaded += len(chunk)
            print(f"Downloaded {downloaded / (1024*1024):.1f} MB / {total_size / (1024*1024):.1f} MB", flush=True)

print(f"✅ Model downloaded: {os.path.getsize(model_path)} bytes")
