import os
import sys
import io
import time
import re
import json
import requests
from PIL import Image
import rembg

# Force UTF-8 environment
os.environ["PYTHONUTF8"] = "1"
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

SECTIONS_DATA = [
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
                "description": "Authentic antique handwoven rugs curated for timeless elegance."
            },
            {
                "category_id": 2,
                "category_name": "Handmade Rugs - New",
                "category_slug": "handmade-rugs-new",
                "folder_id": "18jNi6RCAdGZ_noGivZckWQOwuK7dAAAE",
                "description": "Modern artisanal handwoven rugs crafted by master weavers."
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
                "description": "Rare, historic flatwoven kilims preserving cultural heritage."
            },
            {
                "category_id": 4,
                "category_name": "Tableaux / Wall Hangings",
                "category_slug": "tableaux-wall-hangings",
                "folder_id": "1jVLhQ9gftSpUUd_keuMQl7HFJtpzdgax",
                "description": "Artistic handwoven wall hangings and decorative kilim tableaux."
            },
            {
                "category_id": 5,
                "category_name": "Fine Wool Kilim",
                "category_slug": "fine-wool-kilim",
                "folder_id": "18T2gXsoQUzH1y1L1XUXBBIG-YxsyU-VA",
                "description": "Exquisite fine wool flatweaves with intricate geometric patterns."
            },
            {
                "category_id": 6,
                "category_name": "Patterned Wool Kilim",
                "category_slug": "patterned-wool-kilim",
                "folder_id": "1JE56T0RLYwdfAcOa6yNDt3veqg-gHZyD",
                "description": "Richly patterned 100% natural wool flatweaves."
            },
            {
                "category_id": 7,
                "category_name": "New Zealand Wool Kilim",
                "category_slug": "new-zealand-wool-kilim",
                "folder_id": "1r1qmEKYKcP7SilYInYs_zp6Hz1lW0XBs",
                "description": "Ultra-soft premium New Zealand wool flatweaves with lasting durability."
            },
            {
                "category_id": 8,
                "category_name": "Regular Cotton Kilim",
                "category_slug": "regular-cotton-kilim",
                "folder_id": "1lfyiytzKc7TpNbK2-_76bYNgxZJlswII",
                "description": "Lightweight, breathable pure cotton kilim rugs for versatile spaces."
            },
            {
                "category_id": 9,
                "category_name": "Patterned Cotton & Wool Kilim",
                "category_slug": "patterned-cotton-wool-kilim",
                "folder_id": "1r72FIq1OBCVlqAuT4Yw0Epc4acPLXeCc",
                "description": "Master blend of crisp natural cotton and lustrous wool in artistic patterns."
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
            return True
        else:
            print(f"Failed direct download {file_id}: status {r.status_code}")
            return False
    except Exception as e:
        print(f"Download exception {file_id}: {e}")
        return False

def process_product_image_white_bg(input_path, output_webp_path, output_thumb_path, target_size=(1600, 1600), margin_ratio=0.08):
    try:
        orig_img = Image.open(input_path).convert("RGBA")
        
        # Background removal
        no_bg = rembg.remove(orig_img)
        
        bbox = no_bg.getbbox()
        if not bbox:
            bbox = (0, 0, no_bg.width, no_bg.height)
            
        cropped = no_bg.crop(bbox)
        c_w, c_h = cropped.size
        
        # Determine canvas scale
        avail_w = int(target_size[0] * (1.0 - 2 * margin_ratio))
        avail_h = int(target_size[1] * (1.0 - 2 * margin_ratio))
        scale = min(avail_w / c_w, avail_h / c_h)
        new_w = max(1, int(c_w * scale))
        new_h = max(1, int(c_h * scale))
        
        resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # Pure White Canvas (#FFFFFF)
        white_canvas = Image.new("RGB", target_size, (255, 255, 255))
        pos_x = (target_size[0] - new_w) // 2
        pos_y = (target_size[1] - new_h) // 2
        
        # Paste with alpha mask
        white_canvas.paste(resized, (pos_x, pos_y), mask=resized.split()[3])
        
        # Save master WebP
        os.makedirs(os.path.dirname(output_webp_path), exist_ok=True)
        white_canvas.save(output_webp_path, "WEBP", quality=92)
        
        # Save Thumbnail 600x600 WebP
        thumb = white_canvas.resize((600, 600), Image.Resampling.LANCZOS)
        os.makedirs(os.path.dirname(output_thumb_path), exist_ok=True)
        thumb.save(output_thumb_path, "WEBP", quality=85)
        
        return True
    except Exception as e:
        print(f"Error processing image {input_path}: {e}")
        return False

def main():
    catalog_result = []
    product_counter = 1
    
    for sec in SECTIONS_DATA:
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
            
            print(f"\n=======================================================")
            print(f"Fetching metadata for [{sec['section_name']} -> {cat['category_name']}]")
            print(f"Folder ID: {cat['folder_id']}")
            print(f"=======================================================")
            
            try:
                gdrive_files = gdown.download_folder(
                    url=f"https://drive.google.com/drive/folders/{cat['folder_id']}",
                    skip_download=True,
                    use_cookies=False,
                    quiet=True
                )
            except Exception as e:
                print(f"Error listing folder {cat['category_name']}: {e}")
                gdrive_files = []
            
            # Group files by product folder (e.g. '33', '2', '35', etc.)
            product_groups = {}
            for item in gdrive_files:
                parts = item.path.replace('\\', '/').split('/')
                # Filter out folder metadata items or zero length names
                filename = parts[-1]
                if not filename or '.' not in filename:
                    continue
                
                # Product group name is folder name
                group_name = parts[0] if len(parts) > 1 else "default"
                if group_name not in product_groups:
                    product_groups[group_name] = []
                
                product_groups[group_name].append({
                    "id": item.id,
                    "filename": filename,
                    "rel_path": item.path
                })
            
            print(f"Found {len(product_groups)} product groups in {cat['category_name']}")
            
            # Process each product group
            for group_name, files in sorted(product_groups.items(), key=lambda x: x[0]):
                prod_slug = f"{cat['category_slug']}-{group_name.lower().replace(' ', '-')}"
                prod_title = f"{cat['category_name']} #{group_name}"
                
                raw_group_dir = os.path.join(RAW_DIR, sec['section_slug'], cat['category_slug'], group_name)
                
                prod_images = []
                prod_videos = []
                
                # Download all files in group
                for f_idx, f_item in enumerate(files):
                    dest_path = os.path.join(raw_group_dir, f_item["filename"])
                    print(f"Downloading {f_item['filename']} for Product #{group_name}...")
                    success = download_file_direct(f_item["id"], dest_path)
                    if not success:
                        # Try fallback from gdrive_raw if already downloaded
                        continue
                    
                    ext = os.path.splitext(f_item["filename"])[1].lower()
                    if ext in [".mp4", ".mov", ".m4v"]:
                        # Video file
                        video_dest_rel = f"/uploads/products/vid_{product_counter}_{f_idx}.mp4"
                        video_dest_abs = os.path.join(PROD_IMG_DIR, f"vid_{product_counter}_{f_idx}.mp4")
                        if not os.path.exists(video_dest_abs) or os.path.getsize(video_dest_abs) == 0:
                            import shutil
                            shutil.copy2(dest_path, video_dest_abs)
                        prod_videos.append(video_dest_rel)
                    elif ext in [".jpg", ".jpeg", ".png", ".webp"]:
                        # Process image with white background
                        img_dest_rel = f"/uploads/products/prod_{product_counter}_{f_idx}.webp"
                        thumb_dest_rel = f"/uploads/products/prod_{product_counter}_{f_idx}_thumb.webp"
                        
                        img_dest_abs = os.path.join(PROD_IMG_DIR, f"prod_{product_counter}_{f_idx}.webp")
                        thumb_dest_abs = os.path.join(PROD_IMG_DIR, f"prod_{product_counter}_{f_idx}_thumb.webp")
                        
                        if not os.path.exists(img_dest_abs):
                            print(f"Processing white background for {f_item['filename']}...")
                            process_product_image_white_bg(dest_path, img_dest_abs, thumb_dest_abs)
                        
                        prod_images.append({
                            "image_path": img_dest_rel,
                            "thumbnail_path": thumb_dest_rel,
                            "display_order": f_idx,
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
                    product_counter += 1
            
            sec_info["categories"].append(cat_info)
        
        catalog_result.append(sec_info)
    
    # Save full catalog json
    json_path = os.path.abspath("./scratch/catalog_data.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(catalog_result, f, indent=2, ensure_ascii=False)
    
    total_prods = sum(len(c["products"]) for s in catalog_result for c in s["categories"])
    print(f"\n🎉 Process completed! Generated {total_prods} products across 2 sections and 9 categories.")
    print(f"Saved catalog metadata to: {json_path}")

if __name__ == "__main__":
    main()
