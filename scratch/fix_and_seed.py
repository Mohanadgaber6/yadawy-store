import os
import sys
import io
import time
import json
import requests
from PIL import Image
import rembg

os.environ["PYTHONUTF8"] = "1"
os.environ["PYTHONUNBUFFERED"] = "1"

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

def log(msg):
    print(msg, flush=True)

session = requests.Session()

def download_file_direct(file_id, dest_path, max_retries=4):
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 10000:
        return True
    
    URL = "https://docs.google.com/uc?export=download"
    for attempt in range(max_retries):
        try:
            r = session.get(URL, params={'id': file_id, 'confirm': 't'}, stream=True, timeout=60)
            if r.status_code == 200:
                with open(dest_path, "wb") as f:
                    for chunk in r.iter_content(65536):
                        if chunk:
                            f.write(chunk)
                log(f"   Downloaded: {os.path.basename(dest_path)} ({os.path.getsize(dest_path)} bytes)")
                return True
            else:
                log(f"   Attempt {attempt+1} failed ({r.status_code}) for {file_id}")
        except Exception as e:
            log(f"   Attempt {attempt+1} exception for {file_id}: {e}")
            time.sleep(2)
    return False

def main():
    json_path = os.path.abspath("./scratch/catalog_data.json")
    if not os.path.exists(json_path):
        log("catalog_data.json not ready yet.")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        catalog = json.load(f)

    log("Initializing rembg session...")
    rembg_session = rembg.new_session("u2net")
    log("rembg session ready.")

    RAW_DIR = os.path.abspath("./uploads/gdrive_raw")
    PROD_IMG_DIR = os.path.abspath("./uploads/products")

    total_prods = 0
    missing_prods = []

    for sec in catalog:
        for cat in sec["categories"]:
            for prod in cat["products"]:
                total_prods += 1
                if not prod["images"] or len(prod["images"]) == 0:
                    missing_prods.append((sec, cat, prod))

    log(f"Total catalog products: {total_prods}. Missing images: {len(missing_prods)}")

    import gdown
    # Fix any missing products
    for sec, cat, prod in missing_prods:
        log(f"Fixing Product #{prod['folder_number']} in {cat['name']}...")
        # Get drive files for this category
        try:
            files = gdown.download_folder(url=f"https://drive.google.com/drive/folders/{cat['folder_id'] if 'folder_id' in cat else ''}", skip_download=True, use_cookies=False, quiet=True)
        except Exception:
            files = []
        
        # Filter files for this product folder
        p_files = []
        for f_item in files:
            parts = f_item.path.replace('\\', '/').split('/')
            if len(parts) > 1 and parts[0] == str(prod['folder_number']):
                p_files.append(f_item)
        
        raw_group_dir = os.path.join(RAW_DIR, sec['slug'], cat['slug'], str(prod['folder_number']))
        os.makedirs(raw_group_dir, exist_ok=True)
        
        prod_images = []
        prod_videos = []
        
        for f_item in p_files:
            dest_path = os.path.join(raw_group_dir, os.path.basename(f_item.path))
            download_file_direct(f_item.id, dest_path)
            
            ext = os.path.splitext(f_item.path)[1].lower()
            if ext in [".mp4", ".mov", ".m4v"]:
                v_dest_rel = f"/uploads/products/vid_{prod['id']}_{len(prod_videos)}.mp4"
                v_dest_abs = os.path.join(PROD_IMG_DIR, f"vid_{prod['id']}_{len(prod_videos)}.mp4")
                if not os.path.exists(v_dest_abs):
                    import shutil
                    shutil.copy2(dest_path, v_dest_abs)
                prod_videos.append(v_dest_rel)
            elif ext in [".jpg", ".jpeg", ".png", ".webp"]:
                img_dest_rel = f"/uploads/products/prod_{prod['id']}_{len(prod_images)}.webp"
                thumb_dest_rel = f"/uploads/products/prod_{prod['id']}_{len(prod_images)}_thumb.webp"
                img_dest_abs = os.path.join(PROD_IMG_DIR, f"prod_{prod['id']}_{len(prod_images)}.webp")
                thumb_dest_abs = os.path.join(PROD_IMG_DIR, f"prod_{prod['id']}_{len(prod_images)}_thumb.webp")
                
                try:
                    orig_img = Image.open(dest_path).convert("RGBA")
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
                    white_canvas.save(img_dest_abs, "WEBP", quality=92)
                    thumb = white_canvas.resize((600, 600), Image.Resampling.LANCZOS)
                    thumb.save(thumb_dest_abs, "WEBP", quality=85)
                    
                    prod_images.append({
                        "image_path": img_dest_rel,
                        "thumbnail_path": thumb_dest_rel,
                        "display_order": len(prod_images),
                        "is_primary": 1 if len(prod_images) == 0 else 0
                    })
                    log(f"   Processed white background for {os.path.basename(dest_path)}")
                except Exception as e:
                    log(f"   Error processing image {dest_path}: {e}")

        prod["images"] = prod_images
        if prod_videos:
            prod["videos"] = prod_videos

    # Save updated json
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)
    log("Updated catalog_data.json successfully.")

if __name__ == "__main__":
    main()
