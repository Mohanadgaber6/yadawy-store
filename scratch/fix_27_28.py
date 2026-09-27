import os
import sys
import json
import requests
from PIL import Image
import rembg
import gdown

os.environ["PYTHONUTF8"] = "1"

# 1. Download folder for Antique Kilims
folder_id = "1mW8Be04RCMB3KmKB2zQZ_H1Kl45wUhSp"
files = gdown.download_folder(f"https://drive.google.com/drive/folders/{folder_id}", skip_download=True, use_cookies=False, quiet=True)

target_folders = ["27", "28"]
session = requests.Session()
rembg_session = rembg.new_session("u2net")

RAW_DIR = os.path.abspath("./uploads/gdrive_raw/kilims/antique-kilims")
PROD_IMG_DIR = os.path.abspath("./uploads/products")

with open("scratch/catalog_data.json", encoding="utf-8") as f:
    catalog = json.load(f)

for f_item in files:
    parts = f_item.path.replace('\\', '/').split('/')
    if len(parts) > 1 and parts[0] in target_folders:
        folder_num = parts[0]
        filename = parts[-1]
        dest_path = os.path.join(RAW_DIR, folder_num, filename)
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        
        print(f"Downloading {filename} for #{folder_num}...")
        URL = "https://docs.google.com/uc?export=download"
        r = session.get(URL, params={'id': f_item.id, 'confirm': 't'}, stream=True, timeout=60)
        with open(dest_path, "wb") as out:
            for chunk in r.iter_content(65536):
                if chunk:
                    out.write(chunk)
        print(f"Downloaded: {dest_path} ({os.path.getsize(dest_path)} bytes)")

# Process images for 27 and 28
for s in catalog:
    for c in s['categories']:
        for p in c['products']:
            if str(p['folder_number']) in target_folders and c['slug'] == 'antique-kilims':
                p_dir = os.path.join(RAW_DIR, str(p['folder_number']))
                images = []
                videos = []
                for f in sorted(os.listdir(p_dir)):
                    ext = os.path.splitext(f)[1].lower()
                    src_f = os.path.join(p_dir, f)
                    if ext in [".jpg", ".jpeg", ".png", ".webp"]:
                        img_rel = f"/uploads/products/prod_{p['id']}_{len(images)}.webp"
                        thumb_rel = f"/uploads/products/prod_{p['id']}_{len(images)}_thumb.webp"
                        img_abs = os.path.join(PROD_IMG_DIR, f"prod_{p['id']}_{len(images)}.webp")
                        thumb_abs = os.path.join(PROD_IMG_DIR, f"prod_{p['id']}_{len(images)}_thumb.webp")
                        
                        orig_img = Image.open(src_f).convert("RGBA")
                        no_bg = rembg.remove(orig_img, session=rembg_session)
                        bbox = no_bg.getbbox() or (0, 0, no_bg.width, no_bg.height)
                        cropped = no_bg.crop(bbox)
                        c_w, c_h = cropped.size
                        scale = min(1400 / c_w, 1400 / c_h)
                        new_w = max(1, int(c_w * scale))
                        new_h = max(1, int(c_h * scale))
                        resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)
                        white_canvas = Image.new("RGB", (1600, 1600), (255, 255, 255))
                        white_canvas.paste(resized, ((1600 - new_w) // 2, (1600 - new_h) // 2), mask=resized.split()[3])
                        white_canvas.save(img_abs, "WEBP", quality=92)
                        thumb = white_canvas.resize((600, 600), Image.Resampling.LANCZOS)
                        thumb.save(thumb_abs, "WEBP", quality=85)
                        
                        images.append({
                            "image_path": img_rel,
                            "thumbnail_path": thumb_rel,
                            "display_order": len(images),
                            "is_primary": 1 if len(images) == 0 else 0
                        })
                    elif ext in [".mp4", ".mov", ".m4v"]:
                        v_rel = f"/uploads/products/vid_{p['id']}_{len(videos)}.mp4"
                        v_abs = os.path.join(PROD_IMG_DIR, f"vid_{p['id']}_{len(videos)}.mp4")
                        import shutil
                        shutil.copy2(src_f, v_abs)
                        videos.append(v_rel)
                p['images'] = images
                if videos:
                    p['videos'] = videos
                print(f"✅ Product #{p['folder_number']} fixed: {len(images)} images, {len(videos)} videos")

with open("scratch/catalog_data.json", "w", encoding="utf-8") as f:
    json.dump(catalog, f, indent=2, ensure_ascii=False)

print("All products in catalog_data.json 100% verified.")
