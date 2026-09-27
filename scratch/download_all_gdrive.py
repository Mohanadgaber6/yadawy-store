import os
import sys
import io
import time
import re

os.environ["PYTHONUTF8"] = "1"

CATEGORIES = [
    # Section: Carpets
    {
        "section_en": "Carpets",
        "category_en": "Antique Rugs",
        "dir_name": "Antique Rugs",
        "folder_id": "1MipS3XR9nDWIE3nUZnN4w9knltQQ7twi"
    },
    {
        "section_en": "Carpets",
        "category_en": "Handmade Rugs - New",
        "dir_name": "Handmade Rugs - New",
        "folder_id": "18jNi6RCAdGZ_noGivZckWQOwuK7dAAAE"
    },
    # Section: Kilims
    {
        "section_en": "Kilims",
        "category_en": "Antique Kilims",
        "dir_name": "Antique Kilims",
        "folder_id": "1mW8Be04RCMB3KmKB2zQZ_H1Kl45wUhSp"
    },
    {
        "section_en": "Kilims",
        "category_en": "Tableaux / Wall Hangings",
        "dir_name": "Tableaux - Wall Hangings",
        "folder_id": "1jVLhQ9gftSpUUd_keuMQl7HFJtpzdgax"
    },
    {
        "section_en": "Kilims",
        "category_en": "Fine Wool Kilim",
        "dir_name": "Fine Wool Kilim",
        "folder_id": "18T2gXsoQUzH1y1L1XUXBBIG-YxsyU-VA"
    },
    {
        "section_en": "Kilims",
        "category_en": "Patterned Wool Kilim",
        "dir_name": "Patterned Wool Kilim",
        "folder_id": "1JE56T0RLYwdfAcOa6yNDt3veqg-gHZyD"
    },
    {
        "section_en": "Kilims",
        "category_en": "New Zealand Wool Kilim",
        "dir_name": "New Zealand Wool Kilim",
        "folder_id": "1r1qmEKYKcP7SilYInYs_zp6Hz1lW0XBs"
    },
    {
        "section_en": "Kilims",
        "category_en": "Regular Cotton Kilim",
        "dir_name": "Regular Cotton Kilim",
        "folder_id": "1lfyiytzKc7TpNbK2-_76bYNgxZJlswII"
    },
    {
        "section_en": "Kilims",
        "category_en": "Patterned Cotton & Wool Kilim",
        "dir_name": "Patterned Cotton & Wool Kilim",
        "folder_id": "1r72FIq1OBCVlqAuT4Yw0Epc4acPLXeCc"
    }
]

import gdown

base_raw = os.path.abspath("./gdrive_catalog_raw")
os.makedirs(base_raw, exist_ok=True)

for item in CATEGORIES:
    target_dir = os.path.join(base_raw, item["section_en"], item["dir_name"])
    os.makedirs(target_dir, exist_ok=True)
    print(f"\n========================================================")
    print(f"Downloading [{item['section_en']} -> {item['category_en']}]")
    print(f"Folder ID: {item['folder_id']}")
    print(f"Target: {target_dir}")
    print(f"========================================================")
    
    try:
        url = f"https://drive.google.com/drive/folders/{item['folder_id']}"
        gdown.download_folder(url=url, output=target_dir, quiet=False, use_cookies=False, resume=True)
        print(f"✅ Successfully downloaded {item['category_en']}")
    except Exception as e:
        print(f"⚠️ Error downloading {item['category_en']}: {e}")

print("\nAll category downloads completed!")
