import os
import sys
from PIL import Image
import rembg

os.environ["PYTHONUTF8"] = "1"

print("Initializing rembg session with u2net...")
session = rembg.new_session("u2net")
print("Session ready!")

def process_carpet_image(input_path, output_path, target_size=(1600, 1600), margin_ratio=0.08):
    print(f"Processing: {input_path}")
    orig_img = Image.open(input_path).convert("RGBA")
    
    # 1. Remove background using rembg u2net session
    no_bg = rembg.remove(orig_img, session=session)
    
    # 2. Find bounding box of carpet
    bbox = no_bg.getbbox()
    if not bbox:
        bbox = (0, 0, no_bg.width, no_bg.height)
    
    cropped_carpet = no_bg.crop(bbox)
    c_w, c_h = cropped_carpet.size
    
    # 3. Fit carpet into target canvas with margin
    avail_w = int(target_size[0] * (1.0 - 2 * margin_ratio))
    avail_h = int(target_size[1] * (1.0 - 2 * margin_ratio))
    
    scale = min(avail_w / c_w, avail_h / c_h)
    new_w = max(1, int(c_w * scale))
    new_h = max(1, int(c_h * scale))
    
    resized_carpet = cropped_carpet.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # 4. Create pure white background canvas (#FFFFFF)
    white_canvas = Image.new("RGB", target_size, (255, 255, 255))
    
    # 5. Center carpet on canvas
    pos_x = (target_size[0] - new_w) // 2
    pos_y = (target_size[1] - new_h) // 2
    
    # Paste using alpha channel
    white_canvas.paste(resized_carpet, (pos_x, pos_y), mask=resized_carpet.split()[3])
    
    # 6. Save output
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    white_canvas.save(output_path, "JPEG", quality=92, optimize=True)
    
    # Also save webp
    webp_path = os.path.splitext(output_path)[0] + ".webp"
    white_canvas.save(webp_path, "WEBP", quality=90)
    
    # Generate thumbnail 600x600
    thumb = white_canvas.resize((600, 600), Image.Resampling.LANCZOS)
    thumb_path = os.path.splitext(output_path)[0] + "_thumb.webp"
    thumb.save(thumb_path, "WEBP", quality=85)
    
    print(f"✅ Saved pure-white background: {output_path} and {webp_path}")
    return output_path, webp_path, thumb_path

sample_img = None
for root, dirs, files in os.walk("./gdrive_raw"):
    for f in files:
        if f.lower().endswith((".jpg", ".jpeg", ".png")):
            sample_img = os.path.join(root, f)
            break
    if sample_img:
        break

if sample_img:
    out_test = os.path.abspath("./uploads/test_white_bg.jpg")
    process_carpet_image(sample_img, out_test)
else:
    print("No sample image found.")
