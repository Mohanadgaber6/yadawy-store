import os
import sys
import io
import time
import shutil
import json
import requests
from PIL import Image
import rembg

# Force UTF-8 and unbuffered output
os.environ["PYTHONUTF8"] = "1"
os.environ["PYTHONUNBUFFERED"] = "1"

def log(msg):
    print(msg, flush=True)

SECTIONS_CONFIG = [
    {
        "section_id": 1,
        "section_name": "Carpets",
        "section_slug": "carpets",
        "categories": [
            {
                "category_id": 1,
                "category_name": "Antique Rugs",
                "category_slug": "antique-rugs",
                "folder_id": "1MipS3XR9nDWIE3nUZnN4w9knltQQ7twi",
                "description": "Authentic antique handwoven rugs curated for timeless elegance.",
                "legacy_path": "./gdrive_raw/سكشن السجاد/انتيكات سجاد"
            },
            {
                "category_id": 2,
                "category_name": "Handmade Rugs - New",
                "category_slug": "handmade-rugs-new",
                "folder_id": "18jNi6RCAdGZ_noGivZckWQOwuK7dAAAE",
                "description": "Modern artisanal handwoven rugs crafted by master weavers.",
                "legacy_path": "./gdrive_raw/سكشن السجاد/سجاد يدوى ( جديد )"
            }
        ]
    },
    {
        "section_id": 2,
        "section_name": "Kilims",
        "section_slug": "kilims",
        "categories": [
            {
                "category_id": 3,
                "category_name": "Antique Kilims",
                "category_slug": "antique-kilims",
                "folder_id": "1mW8Be04RCMB3KmKB2zQZ_H1Kl45wUhSp",
                "description": "Rare, historic flatwoven kilims preserving cultural heritage.",
                "legacy_path": "./gdrive_raw/سكشن الكليم/انتيكات كليم"
            },
            {
                "category_id": 4,
                "category_name": "Tableaux / Wall Hangings",
                "category_slug": "tableaux-wall-hangings",
                "folder_id": "1jVLhQ9gftSpUUd_keuMQl7HFJtpzdgax",
                "description": "Artistic handwoven wall hangings and decorative kilim tableaux.",
                "legacy_path": "./gdrive_raw/سكشن الكليم/طابلوهات"
            },
            {
                "category_id": 5,
                "category_name": "Fine Wool Kilim",
                "category_slug": "fine-wool-kilim",
                "folder_id": "18T2gXsoQUzH1y1L1XUXBBIG-YxsyU-VA",
                "description": "Exquisite fine wool flatweaves with intricate geometric patterns.",
                "legacy_path": "./gdrive_raw/سكشن الكليم/كليم صوف رفيع"
            },
            {
                "category_id": 6,
                "category_name": "Patterned Wool Kilim",
                "category_slug": "patterned-wool-kilim",
                "folder_id": "1JE56T0RLYwdfAcOa6yNDt3veqg-gHZyD",
                "description": "Richly patterned 100% natural wool flatweaves.",
                "legacy_path": "./gdrive_raw/سكشن الكليم/كليم صوف مرسوم"
            },
            {
                "category_id": 7,
                "category_name": "New Zealand Wool Kilim",
                "category_slug": "new-zealand-wool-kilim",
                "folder_id": "1r1qmEKYKcP7SilYInYs_zp6Hz1lW0XBs",
                "description": "Ultra-soft premium New Zealand wool flatweaves with lasting durability.",
                "legacy_path": "./gdrive_raw/سكشن الكليم/كليم صوف نيوزلندي"
            },
            {
                "category_id": 8,
                "category_name": "Regular Cotton Kilim",
                "category_slug": "regular-cotton-kilim",
                "folder_id": "1lfyiytzKc7TpNbK2-_76bYNgxZJlswII",
                "description": "Lightweight, breathable pure cotton kilim rugs for versatile spaces.",
                "legacy_path": "./gdrive_raw/سكشن الكليم/كليم قطن عادي"
            },
            {
                "category_id": 9,
                "category_name": "Patterned Cotton & Wool Kilim",
                "category_slug": "patterned-cotton-wool-kilim",
                "folder_id": "1r72FIq1OBCVlqAuT4Yw0Epc4acPLXeCc",
                "description": "Master blend of crisp natural cotton and lustrous wool in artistic patterns.",
                "legacy_path": "./gdrive_raw/سكشن الكليم/كليم مرسوم قطن * صوف"
            }
        ]
    }
]

import gdown

RAW_DIR = os.path.abspath("./uploads/gdrive_raw")
PROD_IMG_DIR = os.path.abspath("./uploads/products")
os.makedirs(RAW_DIR, exist_ok=True)
os.makedirs(PROD_IMG_DIR, exist_ok=True)

session = requests.Session()

def download_file_direct(file_id, dest_path):
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 1000:
        return True
    
    URL = "https://docs.google.com/uc?export=download"
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
            log(f"   Download failed for {file_id}: status {r.status_code}")
            return False
    except Exception as e:
        log(f"   Download exception {file_id}: {e}")
        return False

# Initialize rembg session once
log("Initializing rembg AI session...")
rembg_session = rembg.new_session("u2net")
log("✅ rembg AI session ready.")

def process_product_image_white_bg(input_path, output_webp_path, output_thumb_path, target_size=(1600, 1600), margin_ratio=0.08):
    try:
        orig_img = Image.open(input_path).convert("RGBA")
        
        # 1. Background removal using rembg session
        no_bg = rembg.remove(orig_img, session=rembg_session)
        
        # 2. Get exact carpet bounding box
        bbox = no_bg.getbbox()
        if not bbox:
            bbox = (0, 0, no_bg.width, no_bg.height)
            
        cropped = no_bg.crop(bbox)
        c_w, c_h = cropped.size
        
        # 3. Uniform margin on pure white canvas
        avail_w = int(target_size[0] * (1.0 - 2 * margin_ratio))
        avail_h = int(target_size[1] * (1.0 - 2 * margin_ratio))
        scale = min(avail_w / c_w, avail_h / c_h)
        new_w = max(1, int(c_w * scale))
        new_h = max(1, int(c_h * scale))
        
        resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # 4. Pure White Canvas #FFFFFF
        white_canvas = Image.new("RGB", target_size, (255, 255, 255))
        pos_x = (target_size[0] - new_w) // 2
        pos_y = (target_size[1] - new_h) // 2
        
        # 5. Composite using alpha mask (preserves original colors, fringes, tassels)
        white_canvas.paste(resized, (pos_x, pos_y), mask=resized.split()[3])
        
        # 6. Save High Quality WebP master
        os.makedirs(os.path.dirname(output_webp_path), exist_ok=True)
        white_canvas.save(output_webp_path, "WEBP", quality=92)
        
        # 7. Save Thumbnail 600x600 WebP
        thumb = white_canvas.resize((600, 600), Image.Resampling.LANCZOS)
        os.makedirs(os.path.dirname(output_thumb_path), exist_ok=True)
        thumb.save(output_thumb_path, "WEBP", quality=85)
        
        return True
    except Exception as e:
        log(f"   ⚠️ Error processing image {input_path}: {e}")
        return False

def sync_and_build_catalog():
    catalog_result = []
    product_counter = 1
    
    # 1. First, copy any legacy files from gdrive_raw if they exist
    for sec in SECTIONS_CONFIG:
        for cat in sec["categories"]:
            leg = cat.get("legacy_path")
            if leg and os.path.exists(leg):
                for p_group in os.listdir(leg):
                    p_group_dir = os.path.join(leg, p_group)
                    if os.path.isdir(p_group_dir):
                        dest_group_dir = os.path.join(RAW_DIR, sec["section_slug"], cat["category_slug"], p_group)
                        os.makedirs(dest_group_dir, exist_ok=True)
                        for f in os.listdir(p_group_dir):
                            src_f = os.path.join(p_group_dir, f)
                            dst_f = os.path.join(dest_group_dir, f)
                            if not os.path.exists(dst_f):
                                shutil.copy2(src_f, dst_f)
    
    # 2. Fetch metadata from Drive for every category and download any missing files
    for sec in SECTIONS_CONFIG:
        sec_info = {
            "id": sec["section_id"],
            "name": sec["section_name"],
            "slug": sec["section_slug"],
            "categories": []
        }
        
        for cat in sec["categories"]:
            cat_info = {
                "id": cat["category_id"],
                "section_id": sec["section_id"],
                "name": cat["category_name"],
                "slug": cat["category_slug"],
                "description": cat["description"],
                "products": []
            }
            
            log(f"\n=======================================================")
            log(f"Processing Category: {sec['section_name']} -> {cat['category_name']}")
            log(f"Folder ID: {cat['folder_id']}")
            log(f"=======================================================")
            
            # Fetch drive files
            try:
                gdrive_files = gdown.download_folder(
                    url=f"https://drive.google.com/drive/folders/{cat['folder_id']}",
                    skip_download=True,
                    use_cookies=False,
                    quiet=True
                )
            except Exception as e:
                log(f"Warning: could not fetch drive index: {e}")
                gdrive_files = []
            
            product_groups = {}
            for item in gdrive_files:
                parts = item.path.replace('\\', '/').split('/')
                filename = parts[-1]
                if not filename or '.' not in filename:
                    continue
                group_name = parts[0] if len(parts) > 1 else "default"
                if group_name not in product_groups:
                    product_groups[group_name] = []
                product_groups[group_name].append({
                    "id": item.id,
                    "filename": filename
                })
            
            # Also check local RAW_DIR for any local product folders
            local_cat_dir = os.path.join(RAW_DIR, sec["section_slug"], cat["category_slug"])
            if os.path.exists(local_cat_dir):
                for p_folder in os.listdir(local_cat_dir):
                    p_dir = os.path.join(local_cat_dir, p_folder)
                    if os.path.isdir(p_dir) and p_folder not in product_groups:
                        product_groups[p_folder] = []
                        for f in os.listdir(p_dir):
                            if '.' in f:
                                product_groups[p_folder].append({
                                    "id": None,
                                    "filename": f
                                })
            
            log(f"Category '{cat['category_name']}': {len(product_groups)} product groups.")
            
            # Process each product group
            for group_name in sorted(product_groups.keys(), key=lambda x: (int(x) if x.isdigit() else 999, x)):
                files = product_groups[group_name]
                prod_slug = f"{cat['category_slug']}-{group_name.lower().replace(' ', '-')}"
                prod_title = f"{cat['category_name']} #{group_name}"
                
                raw_group_dir = os.path.join(RAW_DIR, sec['section_slug'], cat['category_slug'], group_name)
                os.makedirs(raw_group_dir, exist_ok=True)
                
                prod_images = []
                prod_videos = []
                
                # Download missing files
                for f_idx, f_item in enumerate(files):
                    dest_path = os.path.join(raw_group_dir, f_item["filename"])
                    if not os.path.exists(dest_path) and f_item["id"]:
                        log(f"Downloading {f_item['filename']} for Product #{group_name}...")
                        download_file_direct(f_item["id"], dest_path)
                
                # Now scan raw_group_dir for all actual downloaded files
                actual_files = sorted(os.listdir(raw_group_dir))
                
                # Separate images and videos
                image_files = [f for f in actual_files if os.path.splitext(f)[1].lower() in [".jpg", ".jpeg", ".png", ".webp"]]
                video_files = [f for f in actual_files if os.path.splitext(f)[1].lower() in [".mp4", ".mov", ".m4v"]]
                
                # Process videos
                for v_idx, v_name in enumerate(video_files):
                    v_src = os.path.join(raw_group_dir, v_name)
                    v_dest_rel = f"/uploads/products/vid_{product_counter}_{v_idx}.mp4"
                    v_dest_abs = os.path.join(PROD_IMG_DIR, f"vid_{product_counter}_{v_idx}.mp4")
                    if not os.path.exists(v_dest_abs):
                        shutil.copy2(v_src, v_dest_abs)
                    prod_videos.append(v_dest_rel)
                
                # Process images with white background
                for i_idx, i_name in enumerate(image_files):
                    i_src = os.path.join(raw_group_dir, i_name)
                    img_dest_rel = f"/uploads/products/prod_{product_counter}_{i_idx}.webp"
                    thumb_dest_rel = f"/uploads/products/prod_{product_counter}_{i_idx}_thumb.webp"
                    
                    img_dest_abs = os.path.join(PROD_IMG_DIR, f"prod_{product_counter}_{i_idx}.webp")
                    thumb_dest_abs = os.path.join(PROD_IMG_DIR, f"prod_{product_counter}_{i_idx}_thumb.webp")
                    
                    if not os.path.exists(img_dest_abs):
                        log(f"Processing white background: Product #{group_name} image {i_name}...")
                        success = process_product_image_white_bg(i_src, img_dest_abs, thumb_dest_abs)
                    else:
                        success = True
                    
                    if success:
                        prod_images.append({
                            "image_path": img_dest_rel,
                            "thumbnail_path": thumb_dest_rel,
                            "display_order": i_idx,
                            "is_primary": 1 if len(prod_images) == 0 else 0
                        })
                
                if prod_images or prod_videos:
                    product_data = {
                        "id": product_counter,
                        "name": prod_title,
                        "slug": prod_slug,
                        "category_id": cat["category_id"],
                        "section_id": sec["section_id"],
                        "folder_number": group_name,
                        "images": prod_images,
                        "videos": prod_videos,
                        "short_description": f"Authentic handwoven {cat['category_name'].lower()} piece #{group_name}.",
                        "full_description": f"Handcrafted with authentic heritage techniques, this unique {cat['category_name'].lower()} piece #{group_name} showcases master artistry, natural fibers, and timeless design."
                    }
                    cat_info["products"].append(product_data)
                    log(f"✅ Product #{group_name} ready: {len(prod_images)} images, {len(prod_videos)} videos")
                    product_counter += 1
            
            sec_info["categories"].append(cat_info)
        
        catalog_result.append(sec_info)
    
    # Save master catalog json
    json_path = os.path.abspath("./scratch/catalog_data.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(catalog_result, f, indent=2, ensure_ascii=False)
    
    total_prods = sum(len(c["products"]) for s in catalog_result for c in s["categories"])
    log(f"\n=======================================================")
    log(f"🎉 SUCCESS! Total authentic products processed: {total_prods}")
    log(f"JSON metadata written to: {json_path}")
    log(f"=======================================================")

if __name__ == "__main__":
    sync_and_build_catalog()
