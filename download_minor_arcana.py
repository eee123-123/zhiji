#!/usr/bin/env python3
"""
下载56张小阿尔卡那 (Minor Arcana) 韦特塔罗牌面图片
源：Wikimedia Commons - Rider-Waite-Smith tarot deck (1909, public domain)
保存路径与 getCardImagePath() 对应: {suit}-{number}.jpg
使用 curl 下载（urllib 被 Wikimedia 403 拒绝）
"""
import os
import subprocess
import time

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "cards")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 花色映射: (本地文件前缀, Wikimedia文件前缀)
SUITS = [
    ("wands", "Wands"),       # 权杖
    ("cups", "Cups"),         # 圣杯
    ("swords", "Swords"),     # 宝剑
    ("pentacles", "Pents"),   # 星币
]

SUIT_NAMES = {"wands": "权杖", "cups": "圣杯", "swords": "宝剑", "pentacles": "星币"}
BASE_URL = "https://commons.wikimedia.org/wiki/Special:FilePath"

def download_with_curl(url: str, filepath: str, max_retries: int = 5) -> bool:
    """使用 curl 下载图片，带重试"""
    if os.path.exists(filepath) and os.path.getsize(filepath) > 1000:
        print(f"  [跳过] {os.path.basename(filepath)} 已存在 ({os.path.getsize(filepath)//1024}KB)")
        return True

    for attempt in range(max_retries):
        try:
            result = subprocess.run(
                ["curl", "-sL", "-o", filepath, "-w", "%{http_code}",
                 "--max-redirs", "10", "--retry", "2", "--retry-delay", "2",
                 "--connect-timeout", "15", "--max-time", "60",
                 url],
                capture_output=True, text=True, timeout=90
            )
            http_code = result.stdout.strip()
            
            if os.path.exists(filepath) and os.path.getsize(filepath) > 1000:
                size_kb = os.path.getsize(filepath) // 1024
                print(f"  [成功] {os.path.basename(filepath)} ({size_kb}KB)")
                return True
            else:
                # 文件不存在或太小
                if os.path.exists(filepath):
                    os.remove(filepath)
                if attempt < max_retries - 1:
                    wait = (attempt + 1) * 2
                    print(f"  [重试{attempt+1}] {os.path.basename(filepath)} HTTP={http_code} (等待{wait}s)")
                    time.sleep(wait)
                else:
                    print(f"  [失败] {os.path.basename(filepath)} HTTP={http_code}")
                    return False
        except Exception as e:
            if attempt < max_retries - 1:
                wait = (attempt + 1) * 2
                print(f"  [重试{attempt+1}] {os.path.basename(filepath)} - {e} (等待{wait}s)")
                time.sleep(wait)
            else:
                print(f"  [失败] {os.path.basename(filepath)} - {e}")
                return False
    return False

def resize_image(filepath: str, width: int = 350) -> bool:
    """使用 sips 缩放图片宽度"""
    try:
        result = subprocess.run(
            ["sips", "--resampleWidth", str(width), filepath],
            capture_output=True, text=True, timeout=10
        )
        return result.returncode == 0
    except Exception:
        return False

def main():
    success_count = 0
    fail_count = 0
    failed_cards = []

    print("=" * 60)
    print("下载小阿尔卡那 56 张 (Minor Arcana)")
    print("源: Wikimedia Commons - RWS Tarot (Public Domain)")
    print("=" * 60)

    for suit_local, suit_wiki in SUITS:
        print(f"\n--- {SUIT_NAMES[suit_local]} ({suit_local}) 14张 ---")

        for num in range(1, 15):
            local_name = f"{suit_local}-{str(num).zfill(2)}.jpg"
            filepath = os.path.join(OUTPUT_DIR, local_name)
            wiki_name = f"{suit_wiki}{str(num).zfill(2)}.jpg"
            url = f"{BASE_URL}/{wiki_name}"

            if download_with_curl(url, filepath):
                success_count += 1
            else:
                fail_count += 1
                failed_cards.append(local_name)

            time.sleep(0.5)

    print(f"\n{'=' * 60}")
    print(f"下载完成: 成功 {success_count}, 失败 {fail_count}, 总计 {success_count + fail_count}")

    if failed_cards:
        print(f"\n失败列表:")
        for name in failed_cards:
            print(f"  - {name}")

    # 缩放图片
    if success_count > 0:
        print(f"\n--- 缩放图片至 350px 宽 ---")
        resized = 0
        for suit_local, _ in SUITS:
            for num in range(1, 15):
                fp = os.path.join(OUTPUT_DIR, f"{suit_local}-{str(num).zfill(2)}.jpg")
                if os.path.exists(fp) and os.path.getsize(fp) > 1000:
                    if resize_image(fp):
                        resized += 1
        print(f"缩放完成: {resized} 张")

    # 最终验证
    print(f"\n--- 最终验证 ---")
    all_ok = True
    for suit_local, _ in SUITS:
        for num in range(1, 15):
            fp = os.path.join(OUTPUT_DIR, f"{suit_local}-{str(num).zfill(2)}.jpg")
            if not os.path.exists(fp):
                print(f"  [缺失] {suit_local}-{str(num).zfill(2)}.jpg")
                all_ok = False
            elif os.path.getsize(fp) < 1000:
                print(f"  [异常] {suit_local}-{str(num).zfill(2)}.jpg (文件太小)")
                all_ok = False

    if all_ok:
        print("  ✅ 全部 56 张小阿尔卡那图片就位!")
    else:
        print("  ⚠️  部分图片缺失或异常，请检查上方日志")

if __name__ == "__main__":
    main()
