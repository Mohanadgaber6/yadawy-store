import os
import sys
import io

# Force UTF-8 stdout/stderr on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import gdown

url = "https://drive.google.com/drive/folders/1JjYazBkpPRiPQ69hMQN0NrS05o6a3cOi"
output_dir = os.path.abspath("./gdrive_raw")
os.makedirs(output_dir, exist_ok=True)

print(f"Starting download to {output_dir}...")
gdown.download_folder(url=url, output=output_dir, quiet=False, use_cookies=False)
print("Download complete.")
