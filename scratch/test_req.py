import os
import sys
import re
import requests
import json

os.environ["PYTHONUTF8"] = "1"

# Let's inspect Google Drive folder using requests
def get_folder_items(folder_id):
    url = f"https://drive.google.com/drive/folders/{folder_id}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    r = requests.get(url, headers=headers)
    return r.text

print("Testing requests...")
text = get_folder_items("1JjYazBkpPRiPQ69hMQN0NrS05o6a3cOi")
print(f"Fetched {len(text)} chars from root folder")
