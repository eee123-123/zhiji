#!/usr/bin/env python3
"""
从 GitHub 下载完整 78 张 RWS 韦特塔罗牌图片（公共领域）
源：seven102161/elaine-tarot-cards (Rider-Waite-Smith, 1909, public domain)
命名匹配 getCardImagePath() 逻辑
"""
import os
import ssl
import urllib.request
import time

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "public", "cards")
BASE_URL = "https://raw.githubusercontent.com/seven102161/elaine-tarot-cards/main/cards"

# SSL context (skip verification for environments with cert issues)
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Mapping: (source_filename, target_filename)
# Major Arcana: ar00-ar21 → 0.jpg-21.jpg
CARDS = []
for i in range(22):
    CARDS.append((f"ar{i:02d}.jpg", f"{i}.jpg"))

# Minor Arcana mapping
# suit_prefix: (source_prefix, target_suit)
SUITS = [
    ("wa", "wands"),
    ("cu", "cups"),
    ("sw", "swords"),
    ("pe", "pentacles"),
]

for src_prefix, target_suit in SUITS:
    # Ace (number=1)
    CARDS.append((f"{src_prefix}ac.jpg", f"{target_suit}-01.jpg"))
    # 2-10
    for n in range(2, 11):
        CARDS.append((f"{src_prefix}{n:02d}.jpg", f"{target_suit}-{n:02d}.jpg"))
    # Page (number=11)
    CARDS.append((f"{src_prefix}pa.jpg", f"{target_suit}-11.jpg"))
    # Knight (number=12)
    CARDS.append((f"{src_prefix}kn.jpg", f"{target_suit}-12.jpg"))
    # Queen (number=13)
    CARDS.append((f"{src_prefix}qu.jpg", f"{target_suit}-13.jpg"))
    # King (number=14)
    CARDS.append((f"{src_prefix}ki.jpg", f"{target_suit}-14.jpg"))


def download_image(src_name: str, target_name: str) -> bool:
    filepath = os.path.join(OUTPUT_DIR, target_name)
    url = f"{BASE_URL}/{src_name}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=20, context=ctx) as resp:
            data = resp.read()
            if len(data) < 5000:
                print(f"  [WARN] {target_name} too small ({len(data)} bytes), might be invalid")
                return False
            # Verify JPEG header
            if data[:2] != b'\xff\xd8':
                print(f"  [FAIL] {target_name} not a valid JPEG")
                return False
            with open(filepath, "wb") as f:
                f.write(data)
            print(f"  [OK] {target_name} ({len(data)//1024}KB)")
            return True
    except Exception as e:
        print(f"  [FAIL] {target_name} - {e}")
        return False


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Clean existing card files
    print("=== Cleaning existing card files ===")
    for f in os.listdir(OUTPUT_DIR):
        if f.endswith(('.jpg', '.png')):
            os.remove(os.path.join(OUTPUT_DIR, f))
            
    print(f"\n=== Downloading {len(CARDS)} cards ===\n")
    
    success = 0
    fail = 0
    
    for src_name, target_name in CARDS:
        if download_image(src_name, target_name):
            success += 1
        else:
            fail += 1
        time.sleep(0.1)  # Be nice to GitHub
    
    print(f"\n=== Done ===")
    print(f"Success: {success}, Failed: {fail}, Total: {success + fail}")
    
    if fail > 0:
        print("\nWARNING: Some downloads failed!")
    else:
        print("\nAll 78 cards downloaded successfully!")


if __name__ == "__main__":
    main()
